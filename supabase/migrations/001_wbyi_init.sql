-- We Build Your Ideas: schema on the shared Supabase project.
-- Every table is prefixed wbyi_ and has RLS on. The anon role can SELECT public idea rows and
-- closed rounds, nothing else. Every write goes through a SECURITY DEFINER function that checks
-- the server key held in wbyi_secrets, so the anon key on its own cannot write anything.

create table if not exists wbyi_secrets (
  key text primary key,
  value text not null
);
alter table wbyi_secrets enable row level security;

create table if not exists wbyi_ideas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  author_name text,
  round_end timestamptz not null,
  status text not null default 'open'
    check (status in ('open', 'hidden', 'winner', 'building', 'built', 'removed')),
  vote_count integer not null default 0,
  built_url text,
  built_summary text,
  built_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wbyi_ideas_round_idx on wbyi_ideas (round_end, vote_count desc);
create index if not exists wbyi_ideas_status_idx on wbyi_ideas (status);
alter table wbyi_ideas enable row level security;

create table if not exists wbyi_idea_private (
  idea_id uuid primary key references wbyi_ideas (id) on delete cascade,
  email text not null,
  ip_hash text,
  manage_token text not null unique,
  updates_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists wbyi_idea_private_ip_idx on wbyi_idea_private (ip_hash, created_at);
create index if not exists wbyi_idea_private_email_idx on wbyi_idea_private (email);
alter table wbyi_idea_private enable row level security;

create table if not exists wbyi_votes (
  idea_id uuid not null references wbyi_ideas (id) on delete cascade,
  voter_id uuid not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  primary key (idea_id, voter_id)
);
create index if not exists wbyi_votes_ip_idx on wbyi_votes (idea_id, ip_hash);
create index if not exists wbyi_votes_voter_idx on wbyi_votes (voter_id);
create index if not exists wbyi_votes_recent_idx on wbyi_votes (ip_hash, created_at);
alter table wbyi_votes enable row level security;

create table if not exists wbyi_rounds (
  round_end timestamptz primary key,
  winner_idea_id uuid references wbyi_ideas (id) on delete set null,
  idea_count integer not null default 0,
  vote_count integer not null default 0,
  closed_at timestamptz not null default now(),
  notified_at timestamptz,
  digest_sent_at timestamptz
);
alter table wbyi_rounds enable row level security;

create table if not exists wbyi_previews (
  id text primary key,
  ip_hash text,
  name text not null,
  dump text not null,
  site jsonb not null,
  layout text not null,
  accent text not null,
  edits_used integer not null default 0,
  domain text,
  email text,
  plan text,
  status text not null default 'preview'
    check (status in ('preview', 'requested', 'paid', 'live', 'closed')),
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wbyi_previews_ip_idx on wbyi_previews (ip_hash, created_at);
alter table wbyi_previews enable row level security;

create table if not exists wbyi_leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('go_live', 'contact')),
  name text,
  email text not null,
  message text,
  preview_id text references wbyi_previews (id) on delete set null,
  plan text,
  domain text,
  ip_hash text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists wbyi_leads_ip_idx on wbyi_leads (ip_hash, created_at);
alter table wbyi_leads enable row level security;

create table if not exists wbyi_subscribers (
  email text primary key,
  token text not null unique,
  source text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table wbyi_subscribers enable row level security;

create table if not exists wbyi_lookups (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists wbyi_lookups_idx on wbyi_lookups (ip_hash, created_at);
alter table wbyi_lookups enable row level security;

-- Public read policies. Policies have no IF NOT EXISTS, so recreate them.
drop policy if exists wbyi_ideas_public_read on wbyi_ideas;
create policy wbyi_ideas_public_read on wbyi_ideas
  for select to anon
  using (status in ('open', 'winner', 'building', 'built'));

drop policy if exists wbyi_rounds_public_read on wbyi_rounds;
create policy wbyi_rounds_public_read on wbyi_rounds
  for select to anon
  using (true);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function wbyi_check_key(p_key text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_key is null or not exists (select 1 from wbyi_secrets s where s.key = 'server' and s.value = p_key) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;
revoke execute on function wbyi_check_key(text) from public, anon, authenticated;

-- Voting closes every Sunday at 20:00 UK time. The round an instant belongs to is the first
-- Sunday 20:00 (Europe/London) strictly after it.
create or replace function wbyi_round_end(p_at timestamptz default now()) returns timestamptz
language sql stable as $$
  with l as (
    select (p_at at time zone 'Europe/London') as local_ts
  ), c as (
    select local_ts, date_trunc('week', local_ts) + interval '6 days 20 hours' as close_local from l
  )
  select (case when local_ts >= close_local then close_local + interval '7 days' else close_local end)
         at time zone 'Europe/London'
  from c
$$;

-- ---------------------------------------------------------------------------
-- Ideas and votes
-- ---------------------------------------------------------------------------

create or replace function wbyi_submit_idea(
  p_key text, p_title text, p_description text, p_category text, p_author_name text,
  p_email text, p_ip_hash text, p_updates boolean
) returns table (idea_id uuid, idea_slug text, token text, closes_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
  v_desc text := btrim(coalesce(p_description, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := nullif(btrim(left(regexp_replace(coalesce(p_author_name, ''), '\s+', ' ', 'g'), 40)), '');
  v_round timestamptz := wbyi_round_end(now());
  v_base text;
  v_slug text;
  v_id uuid;
  v_token text := encode(gen_random_bytes(18), 'hex');
begin
  perform wbyi_check_key(p_key);
  if char_length(v_title) < 4 or char_length(v_title) > 80 then raise exception 'title_length'; end if;
  if char_length(v_desc) < 20 or char_length(v_desc) > 1200 then raise exception 'description_length'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'email_invalid'; end if;
  if p_category not in ('website', 'app', 'tool', 'business', 'community', 'other') then
    raise exception 'category_invalid';
  end if;
  if (select count(*) from wbyi_idea_private p
      where p.ip_hash = p_ip_hash and p.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'rate_limited';
  end if;
  if (select count(*) from wbyi_idea_private p join wbyi_ideas i on i.id = p.idea_id
      where p.email = v_email and i.round_end = v_round and i.status <> 'removed') >= 3 then
    raise exception 'round_limit';
  end if;

  v_base := trim(both '-' from left(regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'), 60));
  if v_base = '' then v_base := 'idea'; end if;
  v_slug := v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 5);

  insert into wbyi_ideas (slug, title, description, category, author_name, round_end)
  values (v_slug, v_title, v_desc, p_category, v_name, v_round)
  returning id into v_id;

  insert into wbyi_idea_private (idea_id, email, ip_hash, manage_token, updates_opt_in)
  values (v_id, v_email, p_ip_hash, v_token, coalesce(p_updates, false));

  if coalesce(p_updates, false) then
    insert into wbyi_subscribers (email, token, source)
    values (v_email, encode(gen_random_bytes(18), 'hex'), 'idea')
    on conflict (email) do update set unsubscribed_at = null;
  end if;

  return query select v_id, v_slug, v_token, v_round;
end $$;

create or replace function wbyi_toggle_vote(p_key text, p_idea_id uuid, p_voter_id uuid, p_ip_hash text)
returns table (voted boolean, votes integer, error text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_status text;
  v_round timestamptz;
  v_count integer;
  v_deleted integer;
begin
  perform wbyi_check_key(p_key);
  select i.status, i.round_end, i.vote_count into v_status, v_round, v_count
  from wbyi_ideas i where i.id = p_idea_id for update;
  if v_status is null then
    return query select false, 0, 'not_found'::text; return;
  end if;
  if v_status <> 'open' or v_round <= now() then
    return query select false, v_count, 'closed'::text; return;
  end if;

  delete from wbyi_votes v where v.idea_id = p_idea_id and v.voter_id = p_voter_id;
  get diagnostics v_deleted = row_count;
  if v_deleted > 0 then
    update wbyi_ideas i set vote_count = greatest(i.vote_count - 1, 0) where i.id = p_idea_id
    returning i.vote_count into v_count;
    return query select false, v_count, null::text; return;
  end if;

  if (select count(*) from wbyi_votes v where v.idea_id = p_idea_id and v.ip_hash = p_ip_hash) >= 5 then
    return query select false, v_count, 'ip_limit'::text; return;
  end if;
  if (select count(*) from wbyi_votes v where v.ip_hash = p_ip_hash and v.created_at > now() - interval '1 hour') >= 60 then
    return query select false, v_count, 'slow_down'::text; return;
  end if;

  insert into wbyi_votes (idea_id, voter_id, ip_hash) values (p_idea_id, p_voter_id, p_ip_hash);
  update wbyi_ideas i set vote_count = i.vote_count + 1 where i.id = p_idea_id
  returning i.vote_count into v_count;
  return query select true, v_count, null::text;
end $$;

create or replace function wbyi_my_votes(p_key text, p_voter_id uuid)
returns table (voted_idea_id uuid)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query select v.idea_id from wbyi_votes v where v.voter_id = p_voter_id;
end $$;

-- Closes every finished round that has no wbyi_rounds row yet and picks its winner:
-- the open idea with the most votes (at least one), earliest submission breaking a tie.
create or replace function wbyi_close_rounds(p_key text)
returns table (
  closed_round timestamptz, winner_id uuid, winner_slug text, winner_title text,
  winner_votes integer, winner_email text, winner_name text, ideas integer, votes integer
)
language plpgsql security definer set search_path = public, extensions as $$
declare
  r record;
  v_id uuid;
  v_slug text;
  v_title text;
  v_votes integer;
  v_email text;
  v_name text;
begin
  perform wbyi_check_key(p_key);
  for r in
    select i.round_end as re, count(*)::int as n, coalesce(sum(i.vote_count), 0)::int as v
    from wbyi_ideas i
    where i.round_end <= now()
      and i.status in ('open', 'winner', 'building', 'built')
      and not exists (select 1 from wbyi_rounds x where x.round_end = i.round_end)
    group by i.round_end
    order by i.round_end
  loop
    v_id := null; v_slug := null; v_title := null; v_votes := null; v_email := null; v_name := null;
    select i.id, i.slug, i.title, i.vote_count, p.email, i.author_name
    into v_id, v_slug, v_title, v_votes, v_email, v_name
    from wbyi_ideas i join wbyi_idea_private p on p.idea_id = i.id
    where i.round_end = r.re and i.status = 'open' and i.vote_count >= 1
    order by i.vote_count desc, i.created_at asc
    limit 1;

    insert into wbyi_rounds (round_end, winner_idea_id, idea_count, vote_count)
    values (r.re, v_id, r.n, r.v);
    if v_id is not null then
      update wbyi_ideas i set status = 'winner' where i.id = v_id;
    end if;
    return query select r.re, v_id, v_slug, v_title, v_votes, v_email, v_name, r.n, r.v;
  end loop;
end $$;

create or replace function wbyi_mark_round(p_key text, p_round_end timestamptz, p_field text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  if p_field = 'notified' then
    update wbyi_rounds set notified_at = now() where round_end = p_round_end;
  elsif p_field = 'digest' then
    update wbyi_rounds set digest_sent_at = now() where round_end = p_round_end;
  end if;
end $$;

-- Rounds closed but not yet emailed (used by the weekly cron, so a failed send retries next run).
create or replace function wbyi_pending_rounds(p_key text)
returns table (
  round_end timestamptz, winner_id uuid, winner_slug text, winner_title text, winner_votes integer,
  winner_email text, winner_name text, idea_count integer, vote_count integer,
  notified_at timestamptz, digest_sent_at timestamptz
)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query
  select r.round_end, i.id, i.slug, i.title, i.vote_count, p.email, i.author_name,
         r.idea_count, r.vote_count, r.notified_at, r.digest_sent_at
  from wbyi_rounds r
  left join wbyi_ideas i on i.id = r.winner_idea_id
  left join wbyi_idea_private p on p.idea_id = i.id
  where r.notified_at is null or r.digest_sent_at is null
  order by r.round_end;
end $$;

-- Idea authors manage their own idea through the private token emailed to them.
create or replace function wbyi_manage_get(p_key text, p_token text)
returns table (id uuid, slug text, title text, status text, vote_count integer, round_end timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query
  select i.id, i.slug, i.title, i.status, i.vote_count, i.round_end
  from wbyi_idea_private p join wbyi_ideas i on i.id = p.idea_id
  where p.manage_token = p_token;
end $$;

create or replace function wbyi_manage_remove(p_key text, p_token text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  perform wbyi_check_key(p_key);
  select p.idea_id into v_id from wbyi_idea_private p join wbyi_ideas i on i.id = p.idea_id
  where p.manage_token = p_token and i.status in ('open', 'hidden');
  if v_id is null then return false; end if;
  update wbyi_ideas set status = 'removed' where id = v_id;
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- Instant website previews and go-live requests
-- ---------------------------------------------------------------------------

create or replace function wbyi_create_preview(
  p_key text, p_id text, p_ip_hash text, p_name text, p_dump text, p_site jsonb, p_layout text, p_accent text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  if (select count(*) from wbyi_previews w
      where w.ip_hash = p_ip_hash and w.created_at > now() - interval '24 hours') >= 12 then
    raise exception 'rate_limited';
  end if;
  insert into wbyi_previews (id, ip_hash, name, dump, site, layout, accent)
  values (p_id, p_ip_hash, left(p_name, 80), left(p_dump, 2000), p_site, p_layout, p_accent);
end $$;

create or replace function wbyi_get_preview(p_key text, p_id text)
returns table (
  id text, name text, dump text, site jsonb, layout text, accent text, edits_used integer,
  domain text, email text, plan text, status text, created_at timestamptz
)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query
  select w.id, w.name, w.dump, w.site, w.layout, w.accent, w.edits_used, w.domain, w.email, w.plan, w.status, w.created_at
  from wbyi_previews w where w.id = p_id;
end $$;

-- Style changes (layout, colour) are free. A change to the words counts as one of three free edits.
create or replace function wbyi_update_preview(
  p_key text, p_id text, p_site jsonb, p_layout text, p_accent text, p_max_edits integer
) returns table (edits_used integer, error text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_site jsonb;
  v_edits integer;
  v_status text;
begin
  perform wbyi_check_key(p_key);
  select w.site, w.edits_used, w.status into v_site, v_edits, v_status
  from wbyi_previews w where w.id = p_id for update;
  if v_site is null then return query select 0, 'not_found'::text; return; end if;
  if v_status <> 'preview' then return query select v_edits, 'locked_status'::text; return; end if;
  if p_site is distinct from v_site then
    if v_edits >= p_max_edits then return query select v_edits, 'no_edits_left'::text; return; end if;
    v_edits := v_edits + 1;
  end if;
  update wbyi_previews w
  set site = p_site, layout = p_layout, accent = p_accent, edits_used = v_edits, updated_at = now()
  where w.id = p_id;
  return query select v_edits, null::text;
end $$;

create or replace function wbyi_set_preview_domain(p_key text, p_id text, p_domain text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_previews set domain = left(lower(p_domain), 80), updated_at = now() where id = p_id;
end $$;

create or replace function wbyi_request_live(
  p_key text, p_preview_id text, p_email text, p_name text, p_plan text, p_domain text,
  p_message text, p_ip_hash text
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  perform wbyi_check_key(p_key);
  if lower(btrim(coalesce(p_email, ''))) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'email_invalid';
  end if;
  if (select count(*) from wbyi_leads l
      where l.ip_hash = p_ip_hash and l.created_at > now() - interval '24 hours') >= 6 then
    raise exception 'rate_limited';
  end if;
  insert into wbyi_leads (kind, name, email, message, preview_id, plan, domain, ip_hash)
  values ('go_live', left(p_name, 80), lower(btrim(p_email)), left(p_message, 2000), p_preview_id, p_plan,
          left(lower(p_domain), 80), p_ip_hash)
  returning id into v_id;
  if p_preview_id is not null then
    update wbyi_previews
    set email = lower(btrim(p_email)), plan = p_plan, domain = coalesce(left(lower(p_domain), 80), domain),
        status = case when status = 'preview' then 'requested' else status end, updated_at = now()
    where id = p_preview_id;
  end if;
  return v_id;
end $$;

create or replace function wbyi_mark_paid(p_key text, p_preview_id text, p_session_id text, p_plan text, p_email text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_previews
  set status = 'paid', stripe_session_id = p_session_id, plan = coalesce(p_plan, plan),
      email = coalesce(lower(p_email), email), updated_at = now()
  where id = p_preview_id;
end $$;

create or replace function wbyi_contact(p_key text, p_name text, p_email text, p_message text, p_ip_hash text)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  perform wbyi_check_key(p_key);
  if lower(btrim(coalesce(p_email, ''))) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'email_invalid';
  end if;
  if char_length(btrim(coalesce(p_message, ''))) < 5 then raise exception 'message_length'; end if;
  if (select count(*) from wbyi_leads l
      where l.ip_hash = p_ip_hash and l.created_at > now() - interval '24 hours') >= 6 then
    raise exception 'rate_limited';
  end if;
  insert into wbyi_leads (kind, name, email, message, ip_hash)
  values ('contact', left(p_name, 80), lower(btrim(p_email)), left(p_message, 4000), p_ip_hash)
  returning id into v_id;
  return v_id;
end $$;

create or replace function wbyi_rdap_allow(p_key text, p_ip_hash text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  if (select count(*) from wbyi_lookups l
      where l.ip_hash = p_ip_hash and l.created_at > now() - interval '24 hours') >= 40 then
    return false;
  end if;
  insert into wbyi_lookups (ip_hash) values (p_ip_hash);
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- Weekly email list
-- ---------------------------------------------------------------------------

create or replace function wbyi_subscribe(p_key text, p_email text, p_source text)
returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_token text;
begin
  perform wbyi_check_key(p_key);
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'email_invalid'; end if;
  insert into wbyi_subscribers (email, token, source)
  values (v_email, encode(gen_random_bytes(18), 'hex'), left(p_source, 40))
  on conflict (email) do update set unsubscribed_at = null
  returning token into v_token;
  return v_token;
end $$;

create or replace function wbyi_unsubscribe(p_key text, p_token text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_subscribers set unsubscribed_at = now() where token = p_token and unsubscribed_at is null;
  return found;
end $$;

create or replace function wbyi_digest_recipients(p_key text)
returns table (email text, token text)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query select s.email, s.token from wbyi_subscribers s where s.unsubscribed_at is null;
end $$;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

create or replace function wbyi_admin_ideas(p_key text, p_limit integer default 300)
returns table (
  id uuid, slug text, title text, description text, category text, author_name text,
  round_end timestamptz, status text, vote_count integer, built_url text, built_summary text,
  created_at timestamptz, email text, ip_hash text
)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query
  select i.id, i.slug, i.title, i.description, i.category, i.author_name, i.round_end, i.status,
         i.vote_count, i.built_url, i.built_summary, i.created_at, p.email, p.ip_hash
  from wbyi_ideas i left join wbyi_idea_private p on p.idea_id = i.id
  order by i.created_at desc
  limit p_limit;
end $$;

create or replace function wbyi_admin_set_idea(
  p_key text, p_id uuid, p_status text, p_built_url text, p_built_summary text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_ideas
  set status = coalesce(p_status, status),
      built_url = coalesce(p_built_url, built_url),
      built_summary = coalesce(p_built_summary, built_summary),
      built_at = case when p_status = 'built' and built_at is null then now() else built_at end
  where id = p_id;
  -- Keep the round record in step when a winner is changed by hand.
  if p_status = 'winner' then
    update wbyi_rounds r set winner_idea_id = p_id
    where r.round_end = (select i.round_end from wbyi_ideas i where i.id = p_id);
  end if;
end $$;

create or replace function wbyi_admin_overview(p_key text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v json;
begin
  perform wbyi_check_key(p_key);
  select json_build_object(
    'leads', coalesce((select json_agg(l order by l.created_at desc) from (
      select id, kind, name, email, message, preview_id, plan, domain, handled, created_at
      from wbyi_leads order by created_at desc limit 200) l), '[]'::json),
    'previews', coalesce((select json_agg(w order by w.created_at desc) from (
      select id, name, layout, accent, edits_used, domain, email, plan, status, created_at
      from wbyi_previews order by created_at desc limit 200) w), '[]'::json),
    'rounds', coalesce((select json_agg(r order by r.round_end desc) from (
      select round_end, winner_idea_id, idea_count, vote_count, notified_at, digest_sent_at
      from wbyi_rounds order by round_end desc limit 52) r), '[]'::json),
    'subscribers', (select count(*) from wbyi_subscribers where unsubscribed_at is null),
    'votes_7d', (select count(*) from wbyi_votes where created_at > now() - interval '7 days'),
    'previews_7d', (select count(*) from wbyi_previews where created_at > now() - interval '7 days')
  ) into v;
  return v;
end $$;

create or replace function wbyi_admin_mark_lead(p_key text, p_id uuid, p_handled boolean)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_leads set handled = p_handled where id = p_id;
end $$;

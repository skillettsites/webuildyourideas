-- Ideas can also come from comments on our TikTok videos. Their TikTok likes count as votes:
-- score = site votes + TikTok likes, and the weekly winner is picked on score.

alter table wbyi_ideas add column if not exists source text not null default 'site';
alter table wbyi_ideas add column if not exists tiktok_likes integer not null default 0;
alter table wbyi_ideas add column if not exists tiktok_handle text;
alter table wbyi_ideas add column if not exists tiktok_url text;
alter table wbyi_ideas add column if not exists score integer generated always as (vote_count + tiktok_likes) stored;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'wbyi_ideas_source_check') then
    alter table wbyi_ideas add constraint wbyi_ideas_source_check check (source in ('site', 'tiktok'));
  end if;
end $$;

create index if not exists wbyi_ideas_round_score_idx on wbyi_ideas (round_end, score desc);

-- TikTok ideas have no email; the winner is contacted on TikTok.
alter table wbyi_idea_private alter column email drop not null;

-- Winner = highest score (at least 1), earliest idea on a tie. TikTok ideas have no private row,
-- so the join is a left join.
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
    select i.round_end as re, count(*)::int as n, coalesce(sum(i.score), 0)::int as v
    from wbyi_ideas i
    where i.round_end <= now()
      and i.status in ('open', 'winner', 'building', 'built')
      and not exists (select 1 from wbyi_rounds x where x.round_end = i.round_end)
    group by i.round_end
    order by i.round_end
  loop
    v_id := null; v_slug := null; v_title := null; v_votes := null; v_email := null; v_name := null;
    select i.id, i.slug, i.title, i.score, p.email,
           case when i.source = 'tiktok' then '@' || i.tiktok_handle else i.author_name end
    into v_id, v_slug, v_title, v_votes, v_email, v_name
    from wbyi_ideas i left join wbyi_idea_private p on p.idea_id = i.id
    where i.round_end = r.re and i.status = 'open' and i.score >= 1
    order by i.score desc, i.created_at asc
    limit 1;

    insert into wbyi_rounds (round_end, winner_idea_id, idea_count, vote_count)
    values (r.re, v_id, r.n, r.v);
    if v_id is not null then
      update wbyi_ideas i set status = 'winner' where i.id = v_id;
    end if;
    return query select r.re, v_id, v_slug, v_title, v_votes, v_email, v_name, r.n, r.v;
  end loop;
end $$;

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
  select r.round_end, i.id, i.slug, i.title, i.score, p.email,
         case when i.source = 'tiktok' then '@' || i.tiktok_handle else i.author_name end,
         r.idea_count, r.vote_count, r.notified_at, r.digest_sent_at
  from wbyi_rounds r
  left join wbyi_ideas i on i.id = r.winner_idea_id
  left join wbyi_idea_private p on p.idea_id = i.id
  where r.notified_at is null or r.digest_sent_at is null
  order by r.round_end;
end $$;

-- Admin: add a TikTok comment as an idea in the current round.
create or replace function wbyi_admin_add_tiktok(
  p_key text, p_title text, p_description text, p_category text, p_handle text, p_likes integer, p_url text
) returns table (idea_id uuid, idea_slug text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
  v_handle text := nullif(regexp_replace(btrim(coalesce(p_handle, '')), '^@+', ''), '');
  v_base text;
  v_slug text;
  v_id uuid;
begin
  perform wbyi_check_key(p_key);
  if char_length(v_title) < 3 or char_length(v_title) > 80 then raise exception 'title_length'; end if;
  if p_category not in ('website', 'app', 'tool', 'business', 'community', 'other') then raise exception 'category_invalid'; end if;
  v_base := trim(both '-' from left(regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'), 60));
  if v_base = '' then v_base := 'idea'; end if;
  v_slug := v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 5);
  insert into wbyi_ideas (slug, title, description, category, author_name, round_end, source, tiktok_likes, tiktok_handle, tiktok_url)
  values (v_slug, v_title, left(btrim(coalesce(p_description, v_title)), 1200), p_category, v_handle, wbyi_round_end(now()),
          'tiktok', greatest(coalesce(p_likes, 0), 0), left(v_handle, 40), left(nullif(btrim(coalesce(p_url, '')), ''), 300))
  returning id into v_id;
  return query select v_id, v_slug;
end $$;

create or replace function wbyi_admin_set_tiktok_likes(p_key text, p_id uuid, p_likes integer)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  update wbyi_ideas set tiktok_likes = greatest(coalesce(p_likes, 0), 0) where id = p_id and source = 'tiktok';
end $$;

-- Admin list now includes the TikTok fields. The return type changes, so drop and recreate.
drop function if exists wbyi_admin_ideas(text, integer);
create function wbyi_admin_ideas(p_key text, p_limit integer default 300)
returns table (
  id uuid, slug text, title text, description text, category text, author_name text,
  round_end timestamptz, status text, vote_count integer, built_url text, built_summary text,
  created_at timestamptz, email text, ip_hash text, source text, tiktok_likes integer,
  tiktok_handle text, tiktok_url text, score integer
)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform wbyi_check_key(p_key);
  return query
  select i.id, i.slug, i.title, i.description, i.category, i.author_name, i.round_end, i.status,
         i.vote_count, i.built_url, i.built_summary, i.created_at, p.email, p.ip_hash, i.source,
         i.tiktok_likes, i.tiktok_handle, i.tiktok_url, i.score
  from wbyi_ideas i left join wbyi_idea_private p on p.idea_id = i.id
  order by i.created_at desc
  limit p_limit;
end $$;

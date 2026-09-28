-- Retention promised in the privacy policy: previews that never went live are deleted after
-- 12 months, and rate-limit lookups after 7 days.
create or replace function wbyi_purge_old(p_key text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_previews integer;
  v_lookups integer;
begin
  perform wbyi_check_key(p_key);
  delete from wbyi_previews w
  where w.status = 'preview' and w.updated_at < now() - interval '12 months'
    and not exists (select 1 from wbyi_leads l where l.preview_id = w.id);
  get diagnostics v_previews = row_count;
  delete from wbyi_lookups where created_at < now() - interval '7 days';
  get diagnostics v_lookups = row_count;
  return json_build_object('previews', v_previews, 'lookups', v_lookups);
end $$;

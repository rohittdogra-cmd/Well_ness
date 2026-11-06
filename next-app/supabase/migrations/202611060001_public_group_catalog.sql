begin;
-- Only group descriptions and aggregate counts are public. Member IDs, posts,
-- profiles and all join/write operations retain their existing access rules.
create function public.list_public_groups() returns jsonb
language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(g order by name),'[]'::jsonb) from (
  select id,slug,name,description,category,
    (select count(*) from group_members m where m.group_id=groups.id) as member_count
  from groups
 ) g;
$$;
revoke all on function public.list_public_groups() from public;
grant execute on function public.list_public_groups() to anon,authenticated;
commit;

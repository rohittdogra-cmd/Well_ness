begin;
-- Keep account emails out of public/member profile projections. Read Auth only
-- through this caller-checked administrator RPC, including unfinished signups.
create function public.admin_registered_members(
 p_search text default '', p_offset integer default 0,
 p_limit integer default 20, p_incomplete_only boolean default false,
 p_user uuid default null
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_offset is null or p_offset < 0 or p_limit is null or p_limit < 1 or p_limit > 100 then
  raise exception 'Invalid page bounds';
 end if;
 if char_length(coalesce(p_search,'')) > 320 then raise exception 'Search is too long'; end if;
 with matches as materialized (
  select u.id, coalesce(p.name,'') as name, u.email,
   u.created_at, u.email_confirmed_at,
   public.profile_is_complete(u.id) as profile_complete
  from auth.users u left join public.profiles p on p.id=u.id
  where (p_user is null or u.id=p_user)
   and (not coalesce(p_incomplete_only,false) or not public.profile_is_complete(u.id))
   -- Literal substring search: %, _ and backslash have no wildcard meaning.
   and (coalesce(trim(p_search),'')='' or
    strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0 or
    strpos(lower(coalesce(p.name,'')),lower(trim(p_search)))>0)
 ), page as (
  select * from matches order by created_at desc nulls last,id
  limit p_limit offset p_offset
 )
 select jsonb_build_object('rows',coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc nulls last,id) from page),'[]'::jsonb),
  'total',(select count(*) from matches)) into result;
 return result;
end $$;
revoke all on function public.admin_registered_members(text,integer,integer,boolean,uuid) from public,anon,authenticated;
grant execute on function public.admin_registered_members(text,integer,integer,boolean,uuid) to authenticated;
commit;

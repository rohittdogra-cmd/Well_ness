-- Hardening pass: closes the write paths that had no rate limit, replaces the
-- two client-side query shapes that could not be expressed safely or at scale,
-- and gives moderation a way back.
--
-- Everything here is either a `create or replace` of an existing function (so
-- existing grants survive) or a brand-new function that is revoked from
-- `public,anon` before being granted to `authenticated` at the bottom.
begin;

-- ── Bounded, parameterised reads ───────────────────────────────────────────
-- Escapes the LIKE metacharacters so a search term is matched literally.
-- Without this, typing `%` in the directory box returns every group.
create or replace function public.escape_like(p_text text)
returns text language sql immutable set search_path=public as $$
  select replace(replace(replace(coalesce(p_text, ''), '\', '\\'), '%', '\%'), '_', '\_')
$$;

-- The browser used to build these itself:
--   * group search interpolated user input straight into a PostgREST `or()`
--     filter, where a comma or a bracket breaks or rewrites the filter;
--   * "my sessions" collected up to 500 ids and sent them back as `id=in.(...)`,
--     which is roughly 19 KB of query string and 414s at the edge;
--   * the session roster had no ceiling at all.
-- Each of those becomes a function with a real cursor or a real bound.

create function public.search_groups(
  p_search text default null,
  p_category text default null,
  p_joined boolean default false,
  p_limit integer default 24,
  p_offset integer default 0
) returns setof public.group_summaries
  language sql stable security invoker set search_path=public as $$
  select g.*
  from public.group_summaries g
  where public.require_user() is not null
    -- The term is a bound parameter, never filter syntax, so a comma or a
    -- bracket in it is just text. It is also escaped, so `%` and `_` match
    -- themselves instead of standing in for any run of characters.
    and (coalesce(nullif(left(p_search, 100), ''), '') = ''
         or g.name ilike '%' || public.escape_like(left(p_search, 100)) || '%'
         or g.description ilike '%' || public.escape_like(left(p_search, 100)) || '%')
    and (p_category is null or g.category = p_category)
    and (not coalesce(p_joined, false) or g.joined)
  order by g.name, g.id
  limit least(greatest(coalesce(p_limit, 24), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0)
$$;

create function public.session_summaries_page(
  p_type text default null,
  p_upcoming boolean default false,
  p_before_date timestamptz default null,
  p_before_id bigint default null,
  p_limit integer default 200
) returns setof public.session_summaries
  language sql stable security invoker set search_path=public as $$
  select s.*
  from public.session_summaries s
  where public.require_user() is not null
    and (p_type is null or s.program_type = p_type)
    -- now() is the database clock, so "upcoming" no longer depends on the
    -- caller's clock being right.
    and (not coalesce(p_upcoming, false) or s.date_time >= now())
    and (p_before_date is null
         or (s.date_time, s.id) > (p_before_date, p_before_id))
  order by s.date_time, s.id
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
$$;

create function public.session_roster(p_session bigint, p_limit integer default 500)
  returns table(user_id uuid)
  language sql stable security invoker set search_path=public as $$
  select m.user_id
  from public.session_members m
  where public.require_user() is not null
    and m.session_id = p_session
  order by m.user_id
  limit least(greatest(coalesce(p_limit, 500), 1), 500)
$$;

create function public.my_sessions(
  p_before_date timestamptz default null,
  p_before_id bigint default null,
  p_limit integer default 200
) returns setof public.session_summaries
  language sql stable security invoker set search_path=public as $$
  select s.*
  from public.session_summaries s
  where public.require_user() is not null
    and (s.creator = auth.uid()
         or exists (select 1 from public.session_members m
                    where m.session_id = s.id and m.user_id = auth.uid()))
    and (p_before_date is null
         or (s.date_time, s.id) > (p_before_date, p_before_id))
  order by s.date_time, s.id
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
$$;

-- ── Write paths that had no ceiling ────────────────────────────────────────
-- `create_group`, `publish_post` and `submit_contact_request` were already
-- rate limited. These four insert a distinct row per call, so nothing above
-- them could stop a script looping on them and growing a table without bound.
--
-- `react_post` is deliberately left alone: it is idempotent on (post, user),
-- so one member can add at most one row per post. It is already self-limiting
-- and a ceiling there would only break legitimate use.

create or replace function public.toggle_group(p_group bigint,p_join boolean) returns void
language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,5));
 if p_join then
  if (select count(*) from group_members where user_id=u and created_at>now()-interval '1 hour')>=50 then raise exception 'You are joining groups too quickly'; end if;
  insert into group_members(group_id,user_id) values(p_group,u) on conflict do nothing;
 else delete from group_members where group_id=p_group and user_id=u; end if;
end $$;

create or replace function public.send_direct_message(p_connection bigint,p_body text) returns bigint
language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); c connections; mid bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,3));
 select * into c from connections where id=p_connection for update;
 if not found or c.status<>'accepted' or u not in(c.requester,c.recipient) then raise exception 'An accepted connection is required'; end if;
 if (select count(*) from direct_messages where sender=u and created_at>now()-interval '1 minute')>=30 then raise exception 'You are sending messages too quickly'; end if;
 insert into direct_messages(connection_id,sender,body) values(c.id,u,trim(p_body)) returning id into mid;
 return mid;
end $$;

create or replace function public.apply_provider(p_type text,p_name text,p_description text) returns bigint
language plpgsql security definer set search_path=public as $$
declare pid bigint; u uuid:=require_user(); begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,6));
 if p_type not in ('psychologist','sportsCompany') then raise exception 'Choose an available provider type'; end if;
 if (select count(*) from providers where applicant=u and created_at>now()-interval '30 days')>=5 then raise exception 'You already have 5 applications in review. Please wait before applying again.'; end if;
 insert into providers(applicant,name,description,provider_type) values(u,p_name,p_description,p_type) returning id into pid; return pid;
end $$;

create or replace function public.create_session(p_title text,p_description text,p_type text,p_date timestamptz,p_capacity integer,p_space text default null,p_location text default null) returns bigint
language plpgsql security definer set search_path=public as $$
declare sid bigint; u uuid:=require_user(); begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,2));
 if p_type not in ('boxCricket','socialGathering','exercise','pickleball','taskAllocation','tennis','badminton','meetup') then raise exception 'Choose an available program'; end if;
 if p_date<=now() then raise exception 'Choose a future date'; end if;
 if (select count(*) from sessions where creator=u and created_at>now()-interval '1 day')>=20 then raise exception 'You can create up to 20 sessions per day'; end if;
 insert into sessions(creator,title,description,program_type,date_time,max_participants,space_name,location) values(u,trim(p_title),p_description,p_type,p_date,p_capacity,p_space,p_location) returning id into sid;
 insert into session_members values(sid,u); return sid;
end $$;

-- ── Moderation can be undone ───────────────────────────────────────────────
-- `moderate_post` could only ever set hidden=true, and `get_reports` only
-- returns unresolved reports, so a post hidden by mistake disappeared from the
-- queue with no way back to it.
create function public.restore_post(p_post bigint) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 update posts set hidden=false where id=p_post;
 if not found then raise exception 'No such conversation'; end if;
end $$;

create function public.get_hidden_posts() returns jsonb
language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 return coalesce((select jsonb_agg(x) from (
  select p.id,p.body,p.hidden,p.created_at,r.id as report_id,r.reason
  from posts p left join lateral (
   select id,reason from reports where post_id=p.id order by created_at limit 1
  ) r on true
  where p.hidden order by p.created_at desc limit 100
 ) x),'[]'::jsonb);
end $$;

-- ── Directory search that can use an index ─────────────────────────────────
-- `position(... in lower(name))` is a substring scan that `profiles_name` can
-- never serve, so the member directory read the whole table on every keystroke.
-- The trigram index is optional: embedded Postgres in the test suite may not
-- carry the extension, and the query stays correct without it.
do $$ begin
  create extension if not exists pg_trgm;
exception when others then
  raise notice 'pg_trgm is unavailable; find_members will scan profiles';
end $$;

do $$
declare ext_schema text;
begin
  select n.nspname into ext_schema
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';
  if ext_schema is not null then
    execute format('create index if not exists profiles_name_trgm on public.profiles using gin (name %I.gin_trgm_ops)', ext_schema);
  end if;
end $$;

create or replace function public.find_members(p_search text default '',p_offset integer default 0)
returns table(id uuid,name text,avatar integer,bio text,interests text[]) language plpgsql stable security definer set search_path=public as $$
begin
 perform require_user();
 return query select p.id,p.name,p.avatar,p.bio,p.interests from profiles p
 where p.id<>auth.uid() and char_length(trim(p.name))>=2
 and (coalesce(left(p_search,100),'')='' or p.name ilike '%'||public.escape_like(left(p_search,100))||'%')
 order by p.name,p.id limit 30 offset greatest(coalesce(p_offset,0),0);
end $$;

-- ── Administrator aggregates ───────────────────────────────────────────────
-- One grouped pass each side instead of two correlated subqueries per profile.
create or replace function public.admin_user_profiles() returns jsonb
language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 return coalesce((
  select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,
    'sessions_created',coalesce(c.n,0),
    'sessions_joined',coalesce(j.n,0))
   order by lower(p.name))
  from profiles p
  left join (select creator,count(*)::bigint n from sessions group by 1) c on c.creator=p.id
  left join (select user_id,count(*)::bigint n from session_members group by 1) j on j.user_id=p.id
  where char_length(trim(p.name))>0
 ),'[]'::jsonb);
end $$;

-- ── Supporting index ───────────────────────────────────────────────────────
-- The unread badge counts rows where read=false; the existing
-- notifications_user(user_id, created_at desc) does not cover that predicate.
create index if not exists notifications_unread
  on public.notifications(user_id) where read=false;

-- ── Grants ─────────────────────────────────────────────────────────────────
-- New functions default to PUBLIC execute, which for a security definer
-- function is an open door. Revoke before granting.
revoke execute on function public.search_groups(text,text,boolean,integer,integer),
  public.session_summaries_page(text,boolean,timestamptz,bigint,integer),
  public.session_roster(bigint,integer),
  public.my_sessions(timestamptz,bigint,integer),
  public.restore_post(bigint),
  public.get_hidden_posts(),
  public.escape_like(text)
from public,anon;
grant execute on function public.search_groups(text,text,boolean,integer,integer),
  public.session_summaries_page(text,boolean,timestamptz,bigint,integer),
  public.session_roster(bigint,integer),
  public.my_sessions(timestamptz,bigint,integer),
  public.restore_post(bigint),
  public.get_hidden_posts(),
  public.escape_like(text)
to authenticated;

-- The four read functions above are security *invoker*, so they run with the
-- caller's privileges and can be held to the same row-level security as the
-- tables underneath. That means they call `require_user()` as `authenticated`
-- rather than as the owner, and migration 1 revoked execute on it from PUBLIC.
-- Re-granting it is safe: it either returns the caller's own uuid or raises.
grant execute on function public.require_user() to authenticated;
commit;

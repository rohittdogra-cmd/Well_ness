begin;

create or replace function public.admin_pending_verifications()
returns jsonb language sql stable security definer set search_path=public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id,
    'user_id', v.user_id,
    'name', coalesce(p.name, ''),
    'email', u.email,
    'method', v.method,
    'evidence', v.evidence,
    'created_at', v.created_at
  ) order by v.created_at), '[]'::jsonb)
  from public.verification_requests v
  join auth.users u on u.id = v.user_id
  left join public.profiles p on p.id = v.user_id
  where public.is_admin() and v.status = 'pending';
$$;

revoke all on function public.admin_pending_verifications() from public, anon;
grant execute on function public.admin_pending_verifications() to authenticated;

commit;

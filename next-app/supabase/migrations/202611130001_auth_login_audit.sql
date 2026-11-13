begin;

create table public.auth_login_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  method text not null check (method in ('otp','password')),
  created_at timestamptz not null default now()
);

create index auth_login_logs_user_created on public.auth_login_logs(user_id, created_at desc);
alter table public.auth_login_logs enable row level security;
revoke all on public.auth_login_logs from anon, authenticated;
grant select, insert on public.auth_login_logs to authenticated;
create policy auth_login_logs_own_or_admin on public.auth_login_logs
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy auth_login_logs_insert_own on public.auth_login_logs
  for insert to authenticated with check (user_id = auth.uid());

commit;

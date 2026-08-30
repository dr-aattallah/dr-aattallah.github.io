begin;

create table if not exists public.student_login_challenges (
  challenge_id uuid primary key default gen_random_uuid(),
  university_id text not null,
  email text not null,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  used_at timestamptz,
  request_ip_hash text,
  constraint student_login_challenges_expiry_check
    check (expires_at > requested_at),
  constraint student_login_challenges_attempts_check
    check (attempts between 0 and 5)
);

create index if not exists student_login_challenges_student_idx
  on public.student_login_challenges (university_id, requested_at desc);
create index if not exists student_login_challenges_expiry_idx
  on public.student_login_challenges (expires_at);
create index if not exists student_login_challenges_ip_idx
  on public.student_login_challenges (request_ip_hash, requested_at desc);

alter table public.student_login_challenges enable row level security;

revoke all on public.student_login_challenges
  from public, anon, authenticated;
grant select, insert, update, delete
  on public.student_login_challenges
  to service_role;

comment on table public.student_login_challenges is
  'Server-only, short-lived challenges for student email OTP login.';

create or replace function public.cleanup_expired_student_login_challenges()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  deleted_count integer;
begin
  delete from public.student_login_challenges
  where expires_at < now() - interval '24 hours'
     or used_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_expired_student_login_challenges()
  from public, anon, authenticated;

commit;

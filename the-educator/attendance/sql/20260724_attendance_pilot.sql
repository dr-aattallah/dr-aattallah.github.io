begin;

create table if not exists public.attendance_pilot_checks (
  check_id bigint generated always as identity primary key,
  checked_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_email text,
  scenario_code text not null,
  result text not null,
  course_code text,
  session_id text,
  note text,
  constraint attendance_pilot_checks_scenario_check check (
    scenario_code in (
      'NFC_CHECKIN',
      'DUPLICATE_PREVENTION',
      'LATE_CALCULATION',
      'MANUAL_ATTENDANCE',
      'SESSION_LIFECYCLE',
      'STUDENT_PRIVACY',
      'EXCUSE_RECALCULATION',
      'MOBILE_RTL',
      'REALTIME_UPDATE'
    )
  ),
  constraint attendance_pilot_checks_result_check check (
    result in ('Passed', 'Failed', 'Blocked')
  ),
  constraint attendance_pilot_checks_note_length check (
    note is null or char_length(note) <= 500
  )
);

create index if not exists attendance_pilot_checks_checked_at_idx
  on public.attendance_pilot_checks (checked_at desc);
create index if not exists attendance_pilot_checks_scenario_idx
  on public.attendance_pilot_checks (scenario_code, checked_at desc);

alter table public.attendance_pilot_checks enable row level security;
revoke all on public.attendance_pilot_checks from anon, authenticated;
grant select on public.attendance_pilot_checks to authenticated;

drop policy if exists attendance_pilot_select_privileged
  on public.attendance_pilot_checks;
create policy attendance_pilot_select_privileged
  on public.attendance_pilot_checks
  for select
  to authenticated
  using (public.attendance_is_privileged());

create or replace function public.admin_record_pilot_check(
  p_scenario_code text,
  p_result text,
  p_course_code text default null,
  p_session_id text default null,
  p_note text default null
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  new_check_id bigint;
begin
  if not public.attendance_is_privileged() then
    raise exception 'Insufficient pilot check privileges'
      using errcode = '42501';
  end if;

  if p_scenario_code not in (
    'NFC_CHECKIN',
    'DUPLICATE_PREVENTION',
    'LATE_CALCULATION',
    'MANUAL_ATTENDANCE',
    'SESSION_LIFECYCLE',
    'STUDENT_PRIVACY',
    'EXCUSE_RECALCULATION',
    'MOBILE_RTL',
    'REALTIME_UPDATE'
  ) then
    raise exception 'Invalid pilot scenario';
  end if;

  if p_result not in ('Passed', 'Failed', 'Blocked') then
    raise exception 'Invalid pilot result';
  end if;

  insert into public.attendance_pilot_checks (
    actor_user_id,
    actor_email,
    scenario_code,
    result,
    course_code,
    session_id,
    note
  ) values (
    auth.uid(),
    auth.jwt() ->> 'email',
    p_scenario_code,
    p_result,
    nullif(trim(p_course_code), ''),
    nullif(trim(p_session_id), ''),
    nullif(left(trim(p_note), 500), '')
  )
  returning check_id into new_check_id;

  return new_check_id;
end;
$$;

revoke all on function public.admin_record_pilot_check(
  text, text, text, text, text
) from public, anon;
grant execute on function public.admin_record_pilot_check(
  text, text, text, text, text
) to authenticated;

create or replace function public.admin_get_pilot_readiness()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  payload jsonb;
begin
  if not public.attendance_is_privileged() then
    raise exception 'Insufficient pilot readiness privileges'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', now(),
    'metrics', jsonb_build_object(
      'active_course_plans', (
        select count(*) from public.course_plans where is_active
      ),
      'active_students', (
        select count(*) from public.users
        where lower(role::text) = 'student'
          and lower(status::text) = 'active'
      ),
      'total_sessions', (
        select count(*) from public.sessions
      ),
      'active_sessions', (
        select count(*) from public.sessions where is_active
      ),
      'attendance_records', (
        select count(*) from public.attendance_logs
      ),
      'pending_excuses', (
        select count(*) from public.excuse_requests
        where status in ('Pending', 'DiscussionRequested', 'MoreInfo')
      ),
      'pilot_checks', (
        select count(*) from public.attendance_pilot_checks
      ),
      'passed_checks', (
        select count(*) from public.attendance_pilot_checks
        where result = 'Passed'
      ),
      'latest_attendance_at', (
        select max(coalesce(recorded_at, created_at))
        from public.attendance_logs
      )
    ),
    'issues', jsonb_build_object(
      'duplicate_attendance', (
        select count(*) from (
          select session_id, student_id
          from public.attendance_logs
          group by session_id, student_id
          having count(*) > 1
        ) duplicates
      ),
      'orphan_attendance', (
        select count(*)
        from public.attendance_logs a
        left join public.sessions s on s.id = a.session_id
        where s.id is null
      ),
      'invalid_session_times', (
        select count(*) from public.sessions
        where end_time <= start_time
          or late_after < start_time
          or late_after > end_time
      ),
      'multiple_active_sessions', (
        select greatest(count(*) - 1, 0)
        from public.sessions where is_active
      ),
      'stale_pending_excuses', (
        select count(*) from public.excuse_requests
        where status in ('Pending', 'DiscussionRequested', 'MoreInfo')
          and submitted_at < now() - interval '48 hours'
      ),
      'missing_attendance_timestamps', (
        select count(*) from public.attendance_logs
        where coalesce(recorded_at, created_at) is null
      )
    ),
    'latest_checks', coalesce((
      select jsonb_agg(to_jsonb(check_row) order by check_row.checked_at desc)
      from (
        select
          check_id,
          checked_at,
          actor_email,
          scenario_code,
          result,
          course_code,
          session_id,
          note
        from public.attendance_pilot_checks
        order by checked_at desc
        limit 50
      ) check_row
    ), '[]'::jsonb)
  ) into payload;

  return payload;
end;
$$;

revoke all on function public.admin_get_pilot_readiness()
  from public, anon;
grant execute on function public.admin_get_pilot_readiness()
  to authenticated;

commit;

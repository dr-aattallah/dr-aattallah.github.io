begin;

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

  with required_scenarios(scenario_code) as (
    values
      ('NFC_CHECKIN'),
      ('DUPLICATE_PREVENTION'),
      ('LATE_CALCULATION'),
      ('MANUAL_ATTENDANCE'),
      ('SESSION_LIFECYCLE'),
      ('STUDENT_PRIVACY'),
      ('EXCUSE_RECALCULATION'),
      ('MOBILE_RTL'),
      ('REALTIME_UPDATE')
  ),
  scenario_statuses as (
    select
      required.scenario_code,
      latest.result,
      latest.checked_at,
      latest.actor_email,
      latest.note
    from required_scenarios required
    left join lateral (
      select result, checked_at, actor_email, note
      from public.attendance_pilot_checks checks
      where checks.scenario_code = required.scenario_code
      order by checked_at desc, check_id desc
      limit 1
    ) latest on true
  )
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
      'total_sessions', (select count(*) from public.sessions),
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
      'passed_scenarios', (
        select count(*) from scenario_statuses where result = 'Passed'
      ),
      'required_scenarios', (select count(*) from scenario_statuses),
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
    'scenario_statuses', (
      select jsonb_object_agg(
        scenario_code,
        jsonb_build_object(
          'result', result,
          'checked_at', checked_at,
          'actor_email', actor_email,
          'note', note
        )
      )
      from scenario_statuses
    ),
    'latest_checks', coalesce((
      select jsonb_agg(to_jsonb(check_row) order by check_row.checked_at desc)
      from (
        select check_id, checked_at, actor_email, scenario_code,
          result, course_code, session_id, note
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

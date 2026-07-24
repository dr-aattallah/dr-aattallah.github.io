begin;

alter table public.attendance_pilot_checks
  add column if not exists execution_mode text not null default 'HumanField',
  add column if not exists participant_count integer not null default 1,
  add column if not exists evidence_reference text;

alter table public.attendance_pilot_checks
  drop constraint if exists attendance_pilot_execution_mode_check,
  add constraint attendance_pilot_execution_mode_check
    check (execution_mode in ('HumanField', 'AutomatedLive')),
  drop constraint if exists attendance_pilot_participant_count_check,
  add constraint attendance_pilot_participant_count_check
    check (participant_count between 0 and 500),
  drop constraint if exists attendance_pilot_evidence_length_check,
  add constraint attendance_pilot_evidence_length_check
    check (
      evidence_reference is null
      or char_length(evidence_reference) between 3 and 300
    );

create or replace function public.admin_record_pilot_check(
  p_scenario_code text,
  p_result text,
  p_course_code text default null,
  p_session_id text default null,
  p_note text default null,
  p_execution_mode text default 'HumanField',
  p_participant_count integer default 1,
  p_evidence_reference text default null
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  new_check_id bigint;
  minimum_participants integer;
begin
  if not public.attendance_is_privileged() then
    raise exception 'Insufficient pilot check privileges'
      using errcode = '42501';
  end if;

  if p_scenario_code not in (
    'NFC_CHECKIN', 'DUPLICATE_PREVENTION', 'LATE_CALCULATION',
    'MANUAL_ATTENDANCE', 'SESSION_LIFECYCLE', 'STUDENT_PRIVACY',
    'EXCUSE_RECALCULATION', 'MOBILE_RTL', 'REALTIME_UPDATE'
  ) then
    raise exception 'Invalid pilot scenario';
  end if;
  if p_result not in ('Passed', 'Failed', 'Blocked') then
    raise exception 'Invalid pilot result';
  end if;
  if p_execution_mode not in ('HumanField', 'AutomatedLive') then
    raise exception 'Invalid pilot execution mode';
  end if;
  if nullif(trim(p_evidence_reference), '') is null then
    raise exception 'Evidence reference is required';
  end if;

  minimum_participants := case
    when p_scenario_code in (
      'NFC_CHECKIN', 'LATE_CALCULATION', 'STUDENT_PRIVACY',
      'MOBILE_RTL', 'REALTIME_UPDATE'
    ) then 2
    else 1
  end;
  if p_execution_mode = 'HumanField'
    and coalesce(p_participant_count, 0) < minimum_participants then
    raise exception 'Insufficient field participants';
  end if;

  insert into public.attendance_pilot_checks (
    actor_user_id, actor_email, scenario_code, result, course_code,
    session_id, note, execution_mode, participant_count,
    evidence_reference
  ) values (
    auth.uid(), auth.jwt() ->> 'email', p_scenario_code, p_result,
    nullif(trim(p_course_code), ''), nullif(trim(p_session_id), ''),
    nullif(left(trim(p_note), 500), ''), p_execution_mode,
    coalesce(p_participant_count, 0),
    left(trim(p_evidence_reference), 300)
  )
  returning check_id into new_check_id;

  return new_check_id;
end;
$$;

revoke all on function public.admin_record_pilot_check(
  text, text, text, text, text, text, integer, text
) from public, anon;
grant execute on function public.admin_record_pilot_check(
  text, text, text, text, text, text, integer, text
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

  with required_scenarios(scenario_code) as (
    values
      ('NFC_CHECKIN'), ('DUPLICATE_PREVENTION'), ('LATE_CALCULATION'),
      ('MANUAL_ATTENDANCE'), ('SESSION_LIFECYCLE'), ('STUDENT_PRIVACY'),
      ('EXCUSE_RECALCULATION'), ('MOBILE_RTL'), ('REALTIME_UPDATE')
  ),
  field_statuses as (
    select required.scenario_code, latest.result, latest.checked_at,
      latest.actor_email, latest.note, latest.evidence_reference,
      latest.participant_count
    from required_scenarios required
    left join lateral (
      select result, checked_at, actor_email, note, evidence_reference,
        participant_count
      from public.attendance_pilot_checks checks
      where checks.scenario_code = required.scenario_code
        and checks.execution_mode = 'HumanField'
      order by checked_at desc, check_id desc
      limit 1
    ) latest on true
  ),
  rehearsal_statuses as (
    select required.scenario_code, latest.result, latest.checked_at,
      latest.actor_email, latest.note, latest.evidence_reference
    from required_scenarios required
    left join lateral (
      select result, checked_at, actor_email, note, evidence_reference
      from public.attendance_pilot_checks checks
      where checks.scenario_code = required.scenario_code
        and checks.execution_mode = 'AutomatedLive'
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
        select count(*) from field_statuses where result = 'Passed'
      ),
      'passed_rehearsal_scenarios', (
        select count(*) from rehearsal_statuses where result = 'Passed'
      ),
      'required_scenarios', (select count(*) from field_statuses),
      'latest_attendance_at', (
        select max(coalesce(recorded_at, created_at))
        from public.attendance_logs
      )
    ),
    'issues', jsonb_build_object(
      'duplicate_attendance', (
        select count(*) from (
          select session_id, student_id from public.attendance_logs
          group by session_id, student_id having count(*) > 1
        ) duplicates
      ),
      'orphan_attendance', (
        select count(*) from public.attendance_logs a
        left join public.sessions s on s.id = a.session_id
        where s.id is null
      ),
      'invalid_session_times', (
        select count(*) from public.sessions
        where end_time <= start_time
          or late_after < start_time or late_after > end_time
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
          'result', result, 'checked_at', checked_at,
          'actor_email', actor_email, 'note', note,
          'evidence_reference', evidence_reference,
          'participant_count', participant_count
        )
      ) from field_statuses
    ),
    'rehearsal_statuses', (
      select jsonb_object_agg(
        scenario_code,
        jsonb_build_object(
          'result', result, 'checked_at', checked_at,
          'actor_email', actor_email, 'note', note,
          'evidence_reference', evidence_reference
        )
      ) from rehearsal_statuses
    ),
    'latest_checks', coalesce((
      select jsonb_agg(to_jsonb(check_row) order by check_row.checked_at desc)
      from (
        select check_id, checked_at, actor_email, scenario_code, result,
          course_code, session_id, note, execution_mode,
          participant_count, evidence_reference
        from public.attendance_pilot_checks
        order by checked_at desc limit 50
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

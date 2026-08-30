begin;

create table if not exists public.attendance_event_audit (
  audit_id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  course_code text,
  session_id text,
  student_university_id text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists attendance_event_audit_occurred_at_idx
  on public.attendance_event_audit (occurred_at desc);
create index if not exists attendance_event_audit_action_idx
  on public.attendance_event_audit (action);
create index if not exists attendance_event_audit_course_code_idx
  on public.attendance_event_audit (course_code);
create index if not exists attendance_event_audit_session_id_idx
  on public.attendance_event_audit (session_id);

alter table public.attendance_event_audit enable row level security;
revoke all on public.attendance_event_audit from anon, authenticated;
grant select on public.attendance_event_audit to authenticated;

create or replace function public.attendance_is_privileged()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'aattallah@kau.edu.sa'
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'attendance_role', ''))
       in ('administrator', 'instructor')
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''))
       in ('administrator', 'admin', 'instructor', 'teacher');
$$;

revoke all on function public.attendance_is_privileged() from public;
grant execute on function public.attendance_is_privileged() to authenticated;

drop policy if exists attendance_audit_select_privileged
  on public.attendance_event_audit;
create policy attendance_audit_select_privileged
  on public.attendance_event_audit
  for select
  to authenticated
  using (public.attendance_is_privileged());

create or replace function public.attendance_audit_capture()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  row_new jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  row_old jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  row_data jsonb := case when tg_op = 'DELETE' then row_old else row_new end;
  audit_action text;
  entity_key text;
  changed_fields jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'sessions' then
    if tg_op = 'INSERT' then
      audit_action := 'SESSION_CREATED';
    elsif tg_op = 'DELETE' then
      audit_action := 'SESSION_DELETED';
    elsif coalesce((row_old ->> 'is_active')::boolean, false)
          is distinct from coalesce((row_new ->> 'is_active')::boolean, false) then
      audit_action := case
        when coalesce((row_new ->> 'is_active')::boolean, false)
          then 'SESSION_ACTIVATED'
        else 'SESSION_CLOSED'
      end;
    else
      audit_action := 'SESSION_UPDATED';
    end if;
  elsif tg_table_name = 'excuse_requests' then
    if tg_op = 'INSERT' then
      audit_action := 'EXCUSE_SUBMITTED';
    elsif tg_op = 'DELETE' then
      audit_action := 'EXCUSE_DELETED';
    elsif row_old ->> 'status' is distinct from row_new ->> 'status' then
      audit_action := 'EXCUSE_STATUS_CHANGED';
    else
      audit_action := 'EXCUSE_UPDATED';
    end if;
  else
    if tg_op = 'INSERT' then
      audit_action := case
        when lower(coalesce(row_new ->> 'attendance_source', row_new ->> 'source', '')) = 'manual'
          then 'ATTENDANCE_MANUAL'
        else 'ATTENDANCE_RECORDED'
      end;
    elsif tg_op = 'DELETE' then
      audit_action := 'ATTENDANCE_DELETED';
    else
      audit_action := case
        when lower(coalesce(row_new ->> 'attendance_source', row_new ->> 'source', '')) = 'manual'
          then 'ATTENDANCE_MANUAL'
        else 'ATTENDANCE_UPDATED'
      end;
    end if;
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
      into changed_fields
      from jsonb_each(row_new)
     where row_old -> key is distinct from value
       and key not in (
         'file_path', 'storage_path', 'description', 'review_note',
         'reason', 'notes', 'token'
       );
  end if;

  entity_key := coalesce(
    row_data ->> 'session_id',
    row_data ->> 'excuse_id',
    row_data ->> 'attendance_id',
    row_data ->> 'id'
  );

  insert into public.attendance_event_audit (
    actor_user_id,
    actor_email,
    actor_role,
    action,
    entity_type,
    entity_id,
    course_code,
    session_id,
    student_university_id,
    details
  ) values (
    auth.uid(),
    auth.jwt() ->> 'email',
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'attendance_role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ),
    audit_action,
    tg_table_name,
    entity_key,
    coalesce(row_data ->> 'course_code', row_data ->> 'course'),
    row_data ->> 'session_id',
    coalesce(
      row_data ->> 'university_id',
      row_data ->> 'student_university_id',
      row_data ->> 'student_id'
    ),
    jsonb_strip_nulls(jsonb_build_object(
      'operation', tg_op,
      'status_before', row_old ->> 'status',
      'status_after', row_new ->> 'status',
      'attendance_before', row_old ->> 'attendance_status',
      'attendance_after', row_new ->> 'attendance_status',
      'source', coalesce(row_data ->> 'attendance_source', row_data ->> 'source'),
      'changed_fields', case when tg_op = 'UPDATE' then changed_fields else null end
    ))
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function public.attendance_audit_capture() from public, anon, authenticated;

do $$
declare
  target record;
  trigger_name text;
begin
  for target in
    select distinct c.table_schema, c.table_name
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name not in (
         'attendance_audit_log',
         'attendance_event_audit',
         'attendance_manual_audit',
         'session_exception_audit'
       )
       and (
         c.table_name in ('sessions', 'excuse_requests')
         or (
           exists (
             select 1
               from information_schema.columns x
              where x.table_schema = c.table_schema
                and x.table_name = c.table_name
                and x.column_name = 'session_id'
           )
           and exists (
             select 1
               from information_schema.columns x
              where x.table_schema = c.table_schema
                and x.table_name = c.table_name
                and x.column_name in (
                  'attendance_status', 'attendance_time',
                  'attendance_source', 'university_id',
                  'status', 'source', 'student_id', 'recorded_at'
                )
           )
         )
       )
  loop
    trigger_name := 'attendance_audit_' ||
      left(md5(target.table_schema || '.' || target.table_name), 16);
    execute format(
      'drop trigger if exists %I on %I.%I',
      trigger_name, target.table_schema, target.table_name
    );
    execute format(
      'create trigger %I after insert or update or delete on %I.%I
       for each row execute function public.attendance_audit_capture()',
      trigger_name, target.table_schema, target.table_name
    );
  end loop;
end;
$$;

create or replace function public.attendance_audit_immutable()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  raise exception 'Attendance audit entries are immutable';
end;
$$;

drop trigger if exists attendance_audit_immutable
  on public.attendance_event_audit;
create trigger attendance_audit_immutable
before update or delete on public.attendance_event_audit
for each row execute function public.attendance_audit_immutable();

revoke all on function public.attendance_audit_immutable() from public, anon, authenticated;

create or replace function public.admin_list_attendance_audit(
  p_limit integer default 200,
  p_action text default null,
  p_course_code text default null
)
returns table (
  audit_id bigint,
  occurred_at timestamptz,
  actor_email text,
  actor_role text,
  action text,
  entity_type text,
  entity_id text,
  course_code text,
  session_id text,
  student_university_id text,
  details jsonb
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.attendance_is_privileged() then
    raise exception 'Insufficient attendance audit privileges'
      using errcode = '42501';
  end if;

  return query
  select
    a.audit_id,
    a.occurred_at,
    a.actor_email,
    a.actor_role,
    a.action,
    a.entity_type,
    a.entity_id,
    a.course_code,
    a.session_id,
    a.student_university_id,
    a.details
  from public.attendance_event_audit a
  where (p_action is null or a.action = p_action)
    and (
      p_course_code is null
      or lower(a.course_code) = lower(p_course_code)
    )
  order by a.occurred_at desc, a.audit_id desc
  limit least(greatest(coalesce(p_limit, 200), 1), 500);
end;
$$;

revoke all on function public.admin_list_attendance_audit(integer, text, text)
  from public, anon;
grant execute on function public.admin_list_attendance_audit(integer, text, text)
  to authenticated;

commit;

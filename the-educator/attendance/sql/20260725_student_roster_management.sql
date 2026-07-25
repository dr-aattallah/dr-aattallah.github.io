begin;

create table if not exists public.attendance_roster_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_plan_id uuid not null references public.course_plans(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  enrollment_status text not null default 'Active'
    check (enrollment_status in ('Pending', 'Active', 'Dropped', 'Completed')),
  effective_from date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_plan_id, student_id)
);

create index if not exists attendance_roster_plan_status_idx
  on public.attendance_roster_enrollments(course_plan_id, enrollment_status);
create index if not exists attendance_roster_student_idx
  on public.attendance_roster_enrollments(student_id);

alter table public.attendance_roster_enrollments enable row level security;
revoke all on table public.attendance_roster_enrollments from anon;
revoke all on table public.attendance_roster_enrollments from authenticated;

create or replace function public.admin_list_attendance_roster(
  p_course_plan_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.attendance_is_privileged() then
    raise exception 'غير مصرح بإدارة الطلاب' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'success', true,
    'selected_course_plan_id', p_course_plan_id,
    'course_plans', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', cp.id,
        'course_code', cp.course_code,
        'course_name', cp.course_name,
        'term_code', cp.term_code,
        'section_code', cp.section_code,
        'term_start', cp.term_start,
        'term_end', cp.term_end,
        'session_count', (select count(*) from public.sessions s where s.course_plan_id = cp.id)
      ) order by cp.term_code desc, cp.course_code, cp.section_code)
      from public.course_plans cp
      where exists (select 1 from public.sessions s where s.course_plan_id = cp.id)
    ), '[]'::jsonb),
    'students', coalesce((
      select jsonb_agg(jsonb_build_object(
        'enrollment_id', ar.id,
        'course_plan_id', ar.course_plan_id,
        'student_id', u.id,
        'university_id', u.university_id,
        'name', u.name,
        'email', u.email,
        'user_status', u.status,
        'enrollment_status', ar.enrollment_status,
        'effective_from', ar.effective_from,
        'updated_at', ar.updated_at,
        'created_at', ar.created_at
      ) order by u.name, u.university_id)
      from public.attendance_roster_enrollments ar
      join public.users u on u.id = ar.student_id
      where p_course_plan_id is null or ar.course_plan_id = p_course_plan_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_list_attendance_roster(uuid) from public;
grant execute on function public.admin_list_attendance_roster(uuid) to authenticated;

create or replace function public.admin_upsert_attendance_student(
  p_course_plan_id uuid,
  p_university_id text,
  p_student_name text,
  p_effective_from date,
  p_status text default 'Active'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student_row public.users%rowtype;
  roster_row public.attendance_roster_enrollments%rowtype;
  normalized_id text := trim(coalesce(p_university_id, ''));
  normalized_name text := trim(coalesce(p_student_name, ''));
  normalized_status text := initcap(lower(trim(coalesce(p_status, 'Active'))));
begin
  if not public.attendance_is_privileged() then
    raise exception 'غير مصرح بإدارة الطلاب' using errcode = '42501';
  end if;
  if normalized_id !~ '^[A-Za-z0-9-]{5,40}$' then
    raise exception 'الرقم الجامعي غير صحيح';
  end if;
  if char_length(normalized_name) < 2 then
    raise exception 'اسم الطالب مطلوب';
  end if;
  if normalized_status not in ('Pending', 'Active', 'Dropped', 'Completed') then
    raise exception 'حالة التسجيل غير صحيحة';
  end if;
  if p_effective_from is null then
    raise exception 'تاريخ بدء احتساب الغياب مطلوب';
  end if;
  if not exists (
    select 1 from public.course_plans cp
    where cp.id = p_course_plan_id
      and exists (select 1 from public.sessions s where s.course_plan_id = cp.id)
  ) then
    raise exception 'اختر شعبة تم إنشاء جلسات لها';
  end if;

  select * into student_row
  from public.users
  where university_id = normalized_id
    and lower(role) = 'student'
  order by created_at
  limit 1;

  if student_row.id is null then
    insert into public.users (
      id, name, email, role, university_id, status, created_at, updated_at
    ) values (
      gen_random_uuid(), normalized_name,
      lower(normalized_id) || '@students.the-educator.local',
      'Student', normalized_id, 'Active', now(), now()
    )
    returning * into student_row;
  else
    update public.users
    set name = normalized_name, updated_at = now()
    where id = student_row.id
    returning * into student_row;
  end if;

  insert into public.attendance_roster_enrollments (
    course_plan_id, student_id, enrollment_status, effective_from
  ) values (
    p_course_plan_id, student_row.id, normalized_status, p_effective_from
  )
  on conflict (course_plan_id, student_id) do update
    set enrollment_status = excluded.enrollment_status,
        effective_from = excluded.effective_from,
        updated_at = now()
  returning * into roster_row;

  return jsonb_build_object(
    'success', true,
    'enrollment_id', roster_row.id,
    'student_id', student_row.id,
    'university_id', student_row.university_id,
    'name', student_row.name,
    'status', roster_row.enrollment_status,
    'effective_from', roster_row.effective_from
  );
end;
$$;

revoke all on function public.admin_upsert_attendance_student(uuid,text,text,date,text)
  from public;
grant execute on function public.admin_upsert_attendance_student(uuid,text,text,date,text)
  to authenticated;

create or replace function public.admin_bulk_enroll_attendance_students(
  p_course_plan_id uuid,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  succeeded integer := 0;
  failed integer := 0;
  errors jsonb := '[]'::jsonb;
begin
  if not public.attendance_is_privileged() then
    raise exception 'غير مصرح بإدارة الطلاب' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 500 then
    raise exception 'ملف الاستيراد غير صحيح أو يتجاوز 500 طالب';
  end if;

  for item in select value from jsonb_array_elements(p_rows)
  loop
    begin
      perform public.admin_upsert_attendance_student(
        p_course_plan_id,
        item ->> 'university_id',
        item ->> 'name',
        (item ->> 'effective_from')::date,
        coalesce(item ->> 'status', 'Active')
      );
      succeeded := succeeded + 1;
    exception when others then
      failed := failed + 1;
      errors := errors || jsonb_build_array(jsonb_build_object(
        'university_id', item ->> 'university_id',
        'name', item ->> 'name',
        'message', sqlerrm
      ));
    end;
  end loop;

  return jsonb_build_object(
    'success', failed = 0,
    'succeeded', succeeded,
    'failed', failed,
    'errors', errors
  );
end;
$$;

revoke all on function public.admin_bulk_enroll_attendance_students(uuid,jsonb)
  from public;
grant execute on function public.admin_bulk_enroll_attendance_students(uuid,jsonb)
  to authenticated;

create or replace function public.get_my_attendance_records()
returns table(
  session_id text,
  course_code text,
  start_time timestamptz,
  delivery_mode text,
  actual_status text,
  excuse_status text,
  counted_points numeric,
  discussion_scheduled_at timestamptz,
  discussion_method text,
  discussion_location text,
  discussion_message text,
  review_note text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id text;
  v_absence_weight numeric;
  v_late_weight numeric;
begin
  v_student_id := public.current_student_university_id();
  if v_student_id is null then
    raise exception 'الحساب غير مرتبط بطالب نشط';
  end if;
  select absence_weight, late_weight into v_absence_weight, v_late_weight
  from public.attendance_policy where id = 1;

  return query
  with base as (
    select
      s.id::text as session_id,
      s.course_code::text,
      s.start_time,
      coalesce(s.delivery_mode, 'InPerson')::text as delivery_mode,
      case when a.status = 'Late' then 'Late'
           when a.status = 'Present' then 'Present'
           else 'Absent' end::text as actual_status,
      coalesce(e.status, 'None')::text as excuse_status,
      e.discussion_scheduled_at, e.discussion_method, e.discussion_location,
      e.discussion_message, e.review_note
    from public.users u
    join public.attendance_roster_enrollments ar
      on ar.student_id = u.id and ar.enrollment_status = 'Active'
    join public.sessions s
      on s.course_plan_id = ar.course_plan_id
     and s.start_time::date >= ar.effective_from
    left join public.attendance_logs a
      on a.session_id = s.id and a.student_id = v_student_id
    left join lateral (
      select er.status, er.discussion_scheduled_at, er.discussion_method,
             er.discussion_location, er.discussion_message, er.review_note
      from public.excuse_requests er
      where er.session_id = s.id and er.student_id = v_student_id
      order by er.submitted_at desc limit 1
    ) e on true
    where u.university_id = v_student_id
      and s.attendance_required = true
      and s.schedule_status <> 'Cancelled'
      and s.start_time <= now()
  )
  select b.session_id, b.course_code, b.start_time, b.delivery_mode,
    b.actual_status, b.excuse_status,
    case when b.excuse_status = 'Accepted' then 0
         when b.actual_status = 'Late' then v_late_weight
         when b.actual_status = 'Absent' then v_absence_weight
         else 0 end::numeric,
    b.discussion_scheduled_at, b.discussion_method, b.discussion_location,
    b.discussion_message, b.review_note
  from base b
  order by b.start_time desc;
end;
$$;

revoke all on function public.get_my_attendance_records() from public;
grant execute on function public.get_my_attendance_records() to authenticated;

commit;

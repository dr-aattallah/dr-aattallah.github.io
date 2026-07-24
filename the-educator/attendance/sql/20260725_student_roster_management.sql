begin;

create or replace function public.admin_list_student_roster(
  p_course_id uuid default null
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
    'courses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'course_code', c.course_code,
        'title', c.title,
        'semester', c.semester,
        'section', c.section
      ) order by c.semester desc, c.course_code, c.section)
      from public.courses c
    ), '[]'::jsonb),
    'students', coalesce((
      select jsonb_agg(jsonb_build_object(
        'enrollment_id', e.id,
        'course_id', e.course_id,
        'student_id', u.id,
        'university_id', u.university_id,
        'name', u.name,
        'email', u.email,
        'user_status', u.status,
        'enrollment_status', e.status,
        'section', e.section,
        'updated_at', e.updated_at,
        'created_at', e.created_at
      ) order by u.name, u.university_id)
      from public.enrollments e
      join public.users u on u.id = e.student_id
      where p_course_id is null or e.course_id = p_course_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_list_student_roster(uuid) from public;
grant execute on function public.admin_list_student_roster(uuid) to authenticated;

create or replace function public.admin_upsert_student_enrollment(
  p_course_id uuid,
  p_university_id text,
  p_section text default null,
  p_status text default 'Active'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student_row public.users%rowtype;
  enrollment_row public.enrollments%rowtype;
  normalized_status text := initcap(lower(trim(coalesce(p_status, 'Active'))));
begin
  if not public.attendance_is_privileged() then
    raise exception 'غير مصرح بإدارة الطلاب' using errcode = '42501';
  end if;
  if normalized_status not in ('Pending', 'Active', 'Dropped', 'Completed') then
    raise exception 'حالة التسجيل غير صحيحة';
  end if;
  if not exists (select 1 from public.courses where id = p_course_id) then
    raise exception 'المقرر غير موجود';
  end if;

  select * into student_row
  from public.users
  where university_id = trim(p_university_id)
    and lower(role) = 'student'
  limit 1;

  if student_row.id is null then
    raise exception 'لا يوجد حساب طالب مرتبط بهذا الرقم الجامعي';
  end if;

  insert into public.enrollments (
    id, course_id, student_id, status, section, created_at, updated_at
  ) values (
    gen_random_uuid(), p_course_id, student_row.id, normalized_status,
    nullif(trim(p_section), ''), now(), now()
  )
  on conflict (course_id, student_id) do update
    set status = excluded.status,
        section = excluded.section,
        updated_at = now()
  returning * into enrollment_row;

  return jsonb_build_object(
    'success', true,
    'enrollment_id', enrollment_row.id,
    'student_id', student_row.id,
    'university_id', student_row.university_id,
    'status', enrollment_row.status,
    'section', enrollment_row.section
  );
end;
$$;

revoke all on function public.admin_upsert_student_enrollment(uuid,text,text,text)
  from public;
grant execute on function public.admin_upsert_student_enrollment(uuid,text,text,text)
  to authenticated;

create or replace function public.admin_bulk_enroll_students(
  p_course_id uuid,
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
      perform public.admin_upsert_student_enrollment(
        p_course_id,
        item ->> 'university_id',
        item ->> 'section',
        coalesce(item ->> 'status', 'Active')
      );
      succeeded := succeeded + 1;
    exception when others then
      failed := failed + 1;
      errors := errors || jsonb_build_array(jsonb_build_object(
        'university_id', item ->> 'university_id',
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

revoke all on function public.admin_bulk_enroll_students(uuid,jsonb)
  from public;
grant execute on function public.admin_bulk_enroll_students(uuid,jsonb)
  to authenticated;

commit;

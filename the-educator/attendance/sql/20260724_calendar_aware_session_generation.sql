begin;

create table if not exists public.academic_calendars (
  calendar_id text primary key,
  name_ar text not null,
  authority_ar text not null,
  timezone text not null default 'Asia/Riyadh',
  term_start date not null,
  term_end date not null,
  next_term_start date,
  is_active boolean not null default false,
  source_path text not null,
  source_sha256 jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_calendars_dates_check check (term_end >= term_start)
);

create table if not exists public.academic_calendar_periods (
  period_id bigint generated always as identity primary key,
  calendar_id text not null references public.academic_calendars(calendar_id)
    on delete cascade,
  period_code text not null,
  name_ar text not null,
  period_kind text not null,
  starts_on date not null,
  ends_on date not null,
  automatic_session_exclusion boolean not null default false,
  boundary_note_ar text,
  priority integer not null default 100,
  constraint academic_calendar_period_dates_check check (ends_on >= starts_on),
  constraint academic_calendar_period_kind_check check (
    period_kind in ('Break', 'FinalExam', 'AlternativeExam', 'Assessment')
  ),
  unique (calendar_id, period_code)
);

alter table public.course_plans
  add column if not exists academic_calendar_id text
    references public.academic_calendars(calendar_id);

create table if not exists public.course_plan_calendar_exclusions (
  exclusion_id bigint generated always as identity primary key,
  course_plan_id uuid not null references public.course_plans(id)
    on delete cascade,
  meeting_pattern_id uuid not null
    references public.course_meeting_patterns(id) on delete cascade,
  excluded_date date not null,
  period_code text not null,
  period_name_ar text not null,
  created_at timestamptz not null default now(),
  unique (course_plan_id, meeting_pattern_id, excluded_date)
);

create index if not exists academic_calendar_periods_dates_idx
  on public.academic_calendar_periods (
    calendar_id,
    starts_on,
    ends_on
  );
create index if not exists course_plan_calendar_exclusions_plan_idx
  on public.course_plan_calendar_exclusions (course_plan_id, excluded_date);

alter table public.academic_calendars enable row level security;
alter table public.academic_calendar_periods enable row level security;
alter table public.course_plan_calendar_exclusions enable row level security;

revoke all on public.academic_calendars from anon, authenticated;
revoke all on public.academic_calendar_periods from anon, authenticated;
revoke all on public.course_plan_calendar_exclusions from anon, authenticated;

insert into public.academic_calendars (
  calendar_id,
  name_ar,
  authority_ar,
  timezone,
  term_start,
  term_end,
  next_term_start,
  is_active,
  source_path,
  source_sha256,
  updated_at
) values (
  'kau-regular-2026-2027-semester-1',
  'الفصل الدراسي الأول 2026/2027 - انتظام',
  'جامعة الملك عبد العزيز - عمادة القبول والتسجيل',
  'Asia/Riyadh',
  date '2026-08-30',
  date '2027-01-07',
  date '2027-01-17',
  true,
  '/the-educator/attendance/docs/references/academic-calendar-2026-2027.md',
  jsonb_build_array(
    '1ebda9f3f78c84ae09fe6adfc590d52e5d0400006cfa55c2d8050586a826bee0',
    '98fd682508458408ce49e8a0e1d328407820c5f9ef9012901a23a7002389e004'
  ),
  now()
)
on conflict (calendar_id) do update set
  name_ar = excluded.name_ar,
  authority_ar = excluded.authority_ar,
  timezone = excluded.timezone,
  term_start = excluded.term_start,
  term_end = excluded.term_end,
  next_term_start = excluded.next_term_start,
  is_active = excluded.is_active,
  source_path = excluded.source_path,
  source_sha256 = excluded.source_sha256,
  updated_at = now();

insert into public.academic_calendar_periods (
  calendar_id,
  period_code,
  name_ar,
  period_kind,
  starts_on,
  ends_on,
  automatic_session_exclusion,
  boundary_note_ar,
  priority
) values
  (
    'kau-regular-2026-2027-semester-1',
    'NATIONAL_DAY_BREAK',
    'إجازة اليوم الوطني',
    'Break',
    date '2026-09-23',
    date '2026-09-26',
    true,
    'تبدأ بعد نهاية دوام الثلاثاء 2026-09-22.',
    10
  ),
  (
    'kau-regular-2026-2027-semester-1',
    'MIDTERM_1',
    'الاختبارات الدورية الأولى',
    'Assessment',
    date '2026-10-11',
    date '2026-10-22',
    false,
    null,
    50
  ),
  (
    'kau-regular-2026-2027-semester-1',
    'MIDTERM_2',
    'الاختبارات الدورية الثانية',
    'Assessment',
    date '2026-11-08',
    date '2026-11-19',
    false,
    null,
    50
  ),
  (
    'kau-regular-2026-2027-semester-1',
    'AUTUMN_BREAK',
    'إجازة الخريف',
    'Break',
    date '2026-11-20',
    date '2026-11-28',
    true,
    'تبدأ بعد نهاية دوام الخميس 2026-11-19.',
    10
  ),
  (
    'kau-regular-2026-2027-semester-1',
    'FINAL_EXAMS',
    'الاختبارات النهائية',
    'FinalExam',
    date '2026-12-20',
    date '2027-01-05',
    true,
    null,
    20
  ),
  (
    'kau-regular-2026-2027-semester-1',
    'ALTERNATIVE_EXAMS',
    'الاختبارات البديلة',
    'AlternativeExam',
    date '2027-01-06',
    date '2027-01-07',
    true,
    null,
    20
  )
on conflict (calendar_id, period_code) do update set
  name_ar = excluded.name_ar,
  period_kind = excluded.period_kind,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  automatic_session_exclusion = excluded.automatic_session_exclusion,
  boundary_note_ar = excluded.boundary_note_ar,
  priority = excluded.priority;

create or replace function public.admin_get_academic_calendar_reference()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  payload jsonb;
begin
  if not public.is_attendance_admin() then
    raise exception 'غير مصرح لك بعرض مرجع التقويم';
  end if;

  select jsonb_build_object(
    'calendar_id', c.calendar_id,
    'name_ar', c.name_ar,
    'authority_ar', c.authority_ar,
    'timezone', c.timezone,
    'term_start', c.term_start,
    'term_end', c.term_end,
    'next_term_start', c.next_term_start,
    'source_path', c.source_path,
    'periods', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'period_code', p.period_code,
          'name_ar', p.name_ar,
          'period_kind', p.period_kind,
          'starts_on', p.starts_on,
          'ends_on', p.ends_on,
          'automatic_session_exclusion',
            p.automatic_session_exclusion,
          'boundary_note_ar', p.boundary_note_ar
        )
        order by p.starts_on, p.priority
      )
      from public.academic_calendar_periods p
      where p.calendar_id = c.calendar_id
    ), '[]'::jsonb)
  )
  into payload
  from public.academic_calendars c
  where c.is_active
  order by c.term_start desc
  limit 1;

  return payload;
end;
$$;

revoke all on function public.admin_get_academic_calendar_reference()
  from public, anon;
grant execute on function public.admin_get_academic_calendar_reference()
  to authenticated;

create or replace function public.admin_create_course_plan(
  p_course_code text,
  p_section_code text,
  p_course_name text,
  p_term_code text,
  p_term_start date,
  p_term_end date,
  p_expected_weeks integer,
  p_late_minutes integer,
  p_is_active boolean,
  p_meetings jsonb
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan_id uuid;
  v_meeting jsonb;
  v_pattern_id uuid;
  v_date date;
  v_start timestamptz;
  v_end timestamptz;
  v_generated integer := 0;
  v_excluded integer := 0;
  v_day integer;
  v_calendar public.academic_calendars%rowtype;
  v_period_code text;
  v_period_name text;
begin
  if not public.is_attendance_admin() then
    raise exception 'غير مصرح لك بإنشاء خطط المقررات';
  end if;
  if trim(coalesce(p_course_code, '')) = '' then
    raise exception 'رمز المقرر مطلوب';
  end if;
  if trim(coalesce(p_section_code, '')) = '' then
    raise exception 'الشعبة مطلوبة';
  end if;
  if trim(coalesce(p_course_name, '')) = '' then
    raise exception 'اسم المقرر مطلوب';
  end if;
  if p_term_end < p_term_start then
    raise exception 'نهاية الفصل يجب أن تكون بعد البداية';
  end if;
  if p_expected_weeks not between 1 and 24 then
    raise exception 'عدد الأسابيع غير صالح';
  end if;
  if p_late_minutes not between 0 and 120 then
    raise exception 'دقائق التأخير غير صالحة';
  end if;
  if p_meetings is null
     or jsonb_typeof(p_meetings) <> 'array'
     or jsonb_array_length(p_meetings) = 0 then
    raise exception 'أضف موعدًا أسبوعيًا واحدًا على الأقل';
  end if;

  select c.*
  into v_calendar
  from public.academic_calendars c
  where c.is_active
    and daterange(c.term_start, c.term_end, '[]')
      && daterange(p_term_start, p_term_end, '[]')
  order by c.term_start desc
  limit 1;

  if v_calendar.calendar_id is not null
     and (
       p_term_start < v_calendar.term_start
       or p_term_end > v_calendar.term_end
     ) then
    raise exception
      'نطاق الخطة يجب أن يكون بين % و % وفق التقويم الأكاديمي',
      v_calendar.term_start,
      v_calendar.term_end;
  end if;

  insert into public.course_plans (
    course_code,
    section_code,
    course_name,
    term_code,
    term_start,
    term_end,
    expected_weeks,
    late_minutes,
    is_active,
    created_by,
    created_by_email,
    academic_calendar_id
  ) values (
    upper(trim(p_course_code)),
    upper(trim(p_section_code)),
    trim(p_course_name),
    trim(p_term_code),
    p_term_start,
    p_term_end,
    p_expected_weeks,
    p_late_minutes,
    p_is_active,
    auth.uid(),
    auth.jwt() ->> 'email',
    v_calendar.calendar_id
  )
  returning id into v_plan_id;

  for v_meeting in
    select value from jsonb_array_elements(p_meetings)
  loop
    v_day := (v_meeting ->> 'day_of_week')::integer;
    if v_day not between 0 and 6 then
      raise exception 'يوم المحاضرة غير صالح';
    end if;

    insert into public.course_meeting_patterns (
      course_plan_id,
      day_of_week,
      start_time,
      end_time,
      room,
      delivery_mode,
      tag_number
    ) values (
      v_plan_id,
      v_day,
      (v_meeting ->> 'start_time')::time,
      (v_meeting ->> 'end_time')::time,
      trim(v_meeting ->> 'room'),
      coalesce(nullif(v_meeting ->> 'delivery_mode', ''), 'InPerson'),
      coalesce((v_meeting ->> 'tag_number')::integer, 1)
    )
    returning id into v_pattern_id;

    v_date := p_term_start;
    while v_date <= p_term_end loop
      if extract(dow from v_date)::integer = v_day then
        v_period_code := null;
        v_period_name := null;

        if v_calendar.calendar_id is not null then
          select p.period_code, p.name_ar
          into v_period_code, v_period_name
          from public.academic_calendar_periods p
          where p.calendar_id = v_calendar.calendar_id
            and p.automatic_session_exclusion
            and v_date between p.starts_on and p.ends_on
          order by p.priority, p.starts_on
          limit 1;
        end if;

        if v_period_code is not null then
          insert into public.course_plan_calendar_exclusions (
            course_plan_id,
            meeting_pattern_id,
            excluded_date,
            period_code,
            period_name_ar
          ) values (
            v_plan_id,
            v_pattern_id,
            v_date,
            v_period_code,
            v_period_name
          )
          on conflict (
            course_plan_id,
            meeting_pattern_id,
            excluded_date
          ) do nothing;

          if found then
            v_excluded := v_excluded + 1;
          end if;
        else
          v_start :=
            (v_date + (v_meeting ->> 'start_time')::time)
            at time zone 'Asia/Riyadh';
          v_end :=
            (v_date + (v_meeting ->> 'end_time')::time)
            at time zone 'Asia/Riyadh';

          insert into public.sessions (
            id,
            course_code,
            section_code,
            room,
            start_time,
            end_time,
            late_after,
            tag_number,
            is_active,
            delivery_mode,
            schedule_status,
            attendance_required,
            course_plan_id,
            meeting_pattern_id,
            generated_from_plan
          ) values (
            upper(trim(p_course_code)) || '-' ||
              upper(trim(p_section_code)) || '-' ||
              to_char(v_date, 'YYYYMMDD') || '-' ||
              replace(v_meeting ->> 'start_time', ':', ''),
            upper(trim(p_course_code)),
            upper(trim(p_section_code)),
            trim(v_meeting ->> 'room'),
            v_start,
            v_end,
            v_start + make_interval(mins => p_late_minutes),
            coalesce((v_meeting ->> 'tag_number')::integer, 1),
            false,
            coalesce(
              nullif(v_meeting ->> 'delivery_mode', ''),
              'InPerson'
            ),
            'Scheduled',
            true,
            v_plan_id,
            v_pattern_id,
            true
          )
          on conflict (
            course_plan_id,
            meeting_pattern_id,
            start_time
          ) where generated_from_plan = true
          do nothing;

          if found then
            v_generated := v_generated + 1;
          end if;
        end if;
      end if;
      v_date := v_date + 1;
    end loop;
  end loop;

  return json_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'generated_sessions', v_generated,
    'excluded_sessions', v_excluded,
    'academic_calendar_id', v_calendar.calendar_id
  );
end;
$$;

create or replace function public.admin_list_course_plans_v2()
returns table (
  plan_id uuid,
  course_code text,
  section_code text,
  course_name text,
  term_code text,
  term_start date,
  term_end date,
  expected_weeks integer,
  weekly_meetings bigint,
  generated_sessions bigint,
  excluded_sessions bigint,
  academic_calendar_id text,
  academic_calendar_name text,
  is_active boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_attendance_admin() then
    raise exception 'غير مصرح لك بعرض خطط المقررات';
  end if;

  return query
  select
    cp.id,
    cp.course_code,
    cp.section_code,
    cp.course_name,
    cp.term_code,
    cp.term_start,
    cp.term_end,
    cp.expected_weeks,
    count(distinct cmp.id)::bigint,
    count(distinct s.id)::bigint,
    count(distinct e.exclusion_id)::bigint,
    cp.academic_calendar_id,
    c.name_ar,
    cp.is_active
  from public.course_plans cp
  left join public.course_meeting_patterns cmp
    on cmp.course_plan_id = cp.id
  left join public.sessions s
    on s.course_plan_id = cp.id
   and s.generated_from_plan = true
  left join public.course_plan_calendar_exclusions e
    on e.course_plan_id = cp.id
  left join public.academic_calendars c
    on c.calendar_id = cp.academic_calendar_id
  group by cp.id, c.name_ar
  order by cp.created_at desc;
end;
$$;

revoke all on function public.admin_list_course_plans_v2()
  from public, anon;
grant execute on function public.admin_list_course_plans_v2()
  to authenticated;

commit;

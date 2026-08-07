begin;

alter table public.course_meeting_patterns
  add column if not exists is_current boolean not null default true;

alter table public.course_meeting_patterns
  add column if not exists retired_at timestamptz;

alter table public.course_plans
  add column if not exists updated_at timestamptz not null default now();

do $$
declare
  v_name text;
begin
  for v_name in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.course_meeting_patterns'::regclass
      and con.contype = 'u'
      and (
        select array_agg(att.attname::text order by att.attname::text)
        from unnest(con.conkey) key(attnum)
        join pg_attribute att
          on att.attrelid = con.conrelid
         and att.attnum = key.attnum
      ) = array[
        'course_plan_id',
        'day_of_week',
        'start_time'
      ]::text[]
  loop
    execute format(
      'alter table public.course_meeting_patterns drop constraint %I',
      v_name
    );
  end loop;

  for v_name in
    select idx.relname
    from pg_index ind
    join pg_class idx on idx.oid = ind.indexrelid
    where ind.indrelid = 'public.course_meeting_patterns'::regclass
      and ind.indisunique
      and ind.indpred is null
      and ind.indexprs is null
      and ind.indnatts = 3
      and not exists (
        select 1
        from pg_constraint con
        where con.conindid = ind.indexrelid
      )
      and (
        select array_agg(att.attname::text order by att.attname::text)
        from unnest(ind.indkey::smallint[]) key(attnum)
        join pg_attribute att
          on att.attrelid = ind.indrelid
         and att.attnum = key.attnum
      ) = array[
        'course_plan_id',
        'day_of_week',
        'start_time'
      ]::text[]
  loop
    execute format('drop index public.%I', v_name);
  end loop;
end;
$$;

create index if not exists course_meeting_patterns_current_plan_idx
  on public.course_meeting_patterns(course_plan_id)
  where is_current = true;

create unique index if not exists
  course_meeting_patterns_current_slot_uidx
  on public.course_meeting_patterns(
    course_plan_id,
    day_of_week,
    start_time
  )
  where is_current = true;

create or replace function public.admin_get_course_plan_for_edit(
  p_plan_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  if not public.is_attendance_admin() then
    raise exception 'غير مصرح لك بتعديل خطط المقررات'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'plan_id', cp.id,
    'course_code', cp.course_code,
    'section_code', cp.section_code,
    'course_name', cp.course_name,
    'term_code', cp.term_code,
    'term_start', cp.term_start,
    'term_end', cp.term_end,
    'expected_weeks', cp.expected_weeks,
    'late_minutes', cp.late_minutes,
    'is_active', cp.is_active,
    'academic_calendar_id', cp.academic_calendar_id,
    'has_started_sessions', exists (
      select 1
      from public.sessions s
      where s.course_plan_id = cp.id
        and (
          s.start_time <= now()
          or exists (
            select 1
            from public.attendance_logs a
            where a.session_id = s.id
          )
        )
    ),
    'meetings', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'day_of_week', cmp.day_of_week,
          'start_time', to_char(cmp.start_time, 'HH24:MI'),
          'end_time', to_char(cmp.end_time, 'HH24:MI'),
          'room', cmp.room,
          'delivery_mode', cmp.delivery_mode,
          'tag_number', cmp.tag_number
        )
        order by cmp.start_time, cmp.end_time, cmp.room, cmp.day_of_week
      )
      from public.course_meeting_patterns cmp
      where cmp.course_plan_id = cp.id
        and cmp.is_current = true
    ), '[]'::jsonb)
  )
  into v_result
  from public.course_plans cp
  where cp.id = p_plan_id;

  if v_result is null then
    raise exception 'خطة المقرر غير موجودة';
  end if;

  return v_result;
end;
$$;

revoke all on function public.admin_get_course_plan_for_edit(uuid)
  from public, anon;
grant execute on function public.admin_get_course_plan_for_edit(uuid)
  to authenticated;

create or replace function public.admin_update_course_plan(
  p_plan_id uuid,
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
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan public.course_plans%rowtype;
  v_calendar public.academic_calendars%rowtype;
  v_meeting jsonb;
  v_pattern_id uuid;
  v_date date;
  v_start timestamptz;
  v_end timestamptz;
  v_day integer;
  v_generated integer := 0;
  v_updated integer := 0;
  v_removed integer := 0;
  v_excluded integer := 0;
  v_preserved integer := 0;
  v_period_code text;
  v_period_name text;
  v_has_history boolean := false;
  v_identity_changed boolean := false;
  v_schedule_changed boolean := false;
  v_current_meetings jsonb;
  v_requested_meetings jsonb;
  v_timezone text := 'Asia/Riyadh';
  v_cutoff timestamptz := now();
  v_today date;
begin
  if not public.is_attendance_admin() then
    raise exception 'غير مصرح لك بتعديل خطط المقررات'
      using errcode = '42501';
  end if;

  select *
  into v_plan
  from public.course_plans
  where id = p_plan_id
  for update;

  if v_plan.id is null then
    raise exception 'خطة المقرر غير موجودة';
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
  if trim(coalesce(p_term_code, '')) = '' then
    raise exception 'الفصل الدراسي مطلوب';
  end if;
  if p_term_start is null
     or p_term_end is null
     or p_term_end < p_term_start then
    raise exception 'فترة الفصل غير صحيحة';
  end if;
  if p_expected_weeks is null
     or p_expected_weeks not between 1 and 24 then
    raise exception 'عدد الأسابيع غير صالح';
  end if;
  if p_late_minutes is null
     or p_late_minutes not between 0 and 120 then
    raise exception 'دقائق التأخير غير صالحة';
  end if;
  if p_is_active is null then
    raise exception 'حالة تفعيل الخطة مطلوبة';
  end if;
  if p_meetings is null
     or jsonb_typeof(p_meetings) <> 'array'
     or jsonb_array_length(p_meetings) = 0 then
    raise exception 'أضف موعدًا أسبوعيًا واحدًا على الأقل';
  end if;
  if jsonb_array_length(p_meetings) > 21 then
    raise exception 'الحد الأعلى للمواعيد الأسبوعية هو 21 موعدًا';
  end if;
  if (p_term_end - p_term_start + 1)
     > ((p_expected_weeks + 2) * 7) then
    raise exception
      'الفترة المحددة أطول من عدد الأسابيع المتوقع بأكثر من أسبوعين';
  end if;

  for v_meeting in
    select value from jsonb_array_elements(p_meetings)
  loop
    if jsonb_typeof(v_meeting) <> 'object' then
      raise exception 'صيغة أحد المواعيد غير صحيحة';
    end if;
    if coalesce(v_meeting ->> 'day_of_week', '') !~ '^[0-6]$' then
      raise exception 'يوم المحاضرة غير صالح';
    end if;
    if coalesce(v_meeting ->> 'start_time', '')
         !~ '^[0-9]{2}:[0-9]{2}$'
       or coalesce(v_meeting ->> 'end_time', '')
         !~ '^[0-9]{2}:[0-9]{2}$' then
      raise exception 'صيغة وقت المحاضرة غير صحيحة';
    end if;
    if substring(v_meeting ->> 'start_time' from 1 for 2)::integer
         not between 0 and 23
       or substring(v_meeting ->> 'start_time' from 4 for 2)::integer
         not between 0 and 59
       or substring(v_meeting ->> 'end_time' from 1 for 2)::integer
         not between 0 and 23
       or substring(v_meeting ->> 'end_time' from 4 for 2)::integer
         not between 0 and 59 then
      raise exception 'وقت المحاضرة خارج النطاق الصحيح';
    end if;
    if (v_meeting ->> 'end_time')::time
       <= (v_meeting ->> 'start_time')::time then
      raise exception 'وقت نهاية المحاضرة يجب أن يكون بعد البداية';
    end if;
    if extract(
      epoch from (
        (v_meeting ->> 'end_time')::time
        - (v_meeting ->> 'start_time')::time
      )
    ) / 60 < p_late_minutes then
      raise exception 'دقائق التأخير يجب ألا تتجاوز مدة المحاضرة';
    end if;
    if trim(coalesce(v_meeting ->> 'room', '')) = '' then
      raise exception 'القاعة مطلوبة لكل موعد';
    end if;
    if coalesce(v_meeting ->> 'delivery_mode', '')
       not in ('InPerson', 'Online', 'Hybrid') then
      raise exception 'طريقة التدريس غير صالحة';
    end if;
    if coalesce(v_meeting ->> 'tag_number', '') !~ '^[1-3]$' then
      raise exception 'رقم بطاقة NFC غير صالح';
    end if;
  end loop;

  if exists (
    select 1
    from jsonb_array_elements(p_meetings) m
    group by
      (m ->> 'day_of_week')::integer,
      (m ->> 'start_time')::time
    having count(*) > 1
  ) then
    raise exception 'لا يمكن تكرار اليوم ووقت البداية في الخطة نفسها';
  end if;

  select exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and (
        s.start_time <= v_cutoff
        or exists (
          select 1
          from public.attendance_logs a
          where a.session_id = s.id
        )
      )
  )
  into v_has_history;

  v_identity_changed :=
    v_plan.course_code is distinct from upper(trim(p_course_code))
    or v_plan.section_code is distinct from upper(trim(p_section_code))
    or v_plan.course_name is distinct from trim(p_course_name)
    or v_plan.term_code is distinct from trim(p_term_code)
    or v_plan.term_start is distinct from p_term_start;

  if v_has_history and v_identity_changed then
    raise exception
      'بعد بدء المقرر لا يمكن تغيير الرمز أو الشعبة أو الاسم أو الفصل أو تاريخ البداية حفاظًا على السجل السابق';
  end if;

  if v_identity_changed and exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and coalesce(s.generated_from_plan, false) = false
  ) then
    raise exception
      'ترتبط الخطة بجلسة يدوية؛ لا يمكن تغيير هوية المقرر قبل فصلها';
  end if;

  select c.*
  into v_calendar
  from public.academic_calendars c
  where daterange(c.term_start, c.term_end, '[]')
      @> daterange(p_term_start, p_term_end, '[]')
    and (
      c.calendar_id = v_plan.academic_calendar_id
      or c.is_active
    )
  order by
    (c.calendar_id = v_plan.academic_calendar_id) desc,
    c.is_active desc,
    c.term_start desc
  limit 1;

  if v_calendar.calendar_id is null
     and v_plan.academic_calendar_id is not null then
    raise exception
      'النطاق الجديد يقع خارج مرجع التقويم المرتبط بالخطة';
  end if;

  v_timezone := coalesce(v_calendar.timezone, 'Asia/Riyadh');
  v_today := (v_cutoff at time zone v_timezone)::date;

  if exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and s.start_time <= v_cutoff
      and (s.start_time at time zone v_timezone)::date > p_term_end
  ) then
    raise exception
      'نهاية الفترة الجديدة تسبق جلسة محفوظة؛ لا يمكن تقصيرها إلى هذا التاريخ';
  end if;

  if exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and coalesce(s.generated_from_plan, false) = false
      and (s.start_time at time zone v_timezone)::date
        not between p_term_start and p_term_end
  ) then
    raise exception
      'توجد جلسة يدوية خارج النطاق الجديد؛ عدّلها أولًا';
  end if;

  if exists (
    select 1
    from public.course_plan_calendar_exclusions e
    where e.course_plan_id = p_plan_id
      and e.excluded_date < v_today
      and e.excluded_date not between p_term_start and p_term_end
  ) then
    raise exception
      'يوجد استثناء تقويمي سابق خارج النطاق الجديد؛ لا يمكن تغيير بداية الفترة';
  end if;

  select coalesce(
    jsonb_agg(
      n.payload
      order by n.day_of_week, n.start_time, n.end_time,
        n.room, n.delivery_mode, n.tag_number
    ),
    '[]'::jsonb
  )
  into v_current_meetings
  from (
    select
      cmp.day_of_week,
      cmp.start_time,
      cmp.end_time,
      trim(cmp.room) as room,
      cmp.delivery_mode,
      cmp.tag_number,
      jsonb_build_object(
        'day_of_week', cmp.day_of_week,
        'start_time', to_char(cmp.start_time, 'HH24:MI:SS'),
        'end_time', to_char(cmp.end_time, 'HH24:MI:SS'),
        'room', trim(cmp.room),
        'delivery_mode', cmp.delivery_mode,
        'tag_number', cmp.tag_number
      ) as payload
    from public.course_meeting_patterns cmp
    where cmp.course_plan_id = p_plan_id
      and cmp.is_current = true
  ) n;

  select coalesce(
    jsonb_agg(
      n.payload
      order by n.day_of_week, n.start_time, n.end_time,
        n.room, n.delivery_mode, n.tag_number
    ),
    '[]'::jsonb
  )
  into v_requested_meetings
  from (
    select
      (m ->> 'day_of_week')::integer as day_of_week,
      (m ->> 'start_time')::time as start_time,
      (m ->> 'end_time')::time as end_time,
      trim(m ->> 'room') as room,
      (m ->> 'delivery_mode') as delivery_mode,
      (m ->> 'tag_number')::integer as tag_number,
      jsonb_build_object(
        'day_of_week', (m ->> 'day_of_week')::integer,
        'start_time', to_char(
          (m ->> 'start_time')::time,
          'HH24:MI:SS'
        ),
        'end_time', to_char(
          (m ->> 'end_time')::time,
          'HH24:MI:SS'
        ),
        'room', trim(m ->> 'room'),
        'delivery_mode', (m ->> 'delivery_mode'),
        'tag_number', (m ->> 'tag_number')::integer
      ) as payload
    from jsonb_array_elements(p_meetings) m
  ) n;

  select count(*)
  into v_preserved
  from public.sessions s
  where s.course_plan_id = p_plan_id
    and s.generated_from_plan = true
    and s.start_time <= v_cutoff;

  if v_plan.course_code is not distinct from upper(trim(p_course_code))
     and v_plan.section_code is not distinct from upper(trim(p_section_code))
     and v_plan.course_name is not distinct from trim(p_course_name)
     and v_plan.term_code is not distinct from trim(p_term_code)
     and v_plan.term_start is not distinct from p_term_start
     and v_plan.term_end is not distinct from p_term_end
     and v_plan.expected_weeks is not distinct from p_expected_weeks
     and v_plan.late_minutes is not distinct from p_late_minutes
     and v_plan.is_active is not distinct from p_is_active
     and v_plan.academic_calendar_id
       is not distinct from v_calendar.calendar_id
     and v_current_meetings = v_requested_meetings then
    return jsonb_build_object(
      'success', true,
      'unchanged', true,
      'plan_id', p_plan_id,
      'removed_future_sessions', 0,
      'generated_sessions', 0,
      'updated_future_sessions', 0,
      'excluded_sessions', 0,
      'preserved_historical_sessions', v_preserved,
      'academic_calendar_id', v_plan.academic_calendar_id
    );
  end if;

  v_schedule_changed :=
    v_plan.course_code is distinct from upper(trim(p_course_code))
    or v_plan.section_code is distinct from upper(trim(p_section_code))
    or v_plan.term_start is distinct from p_term_start
    or v_plan.term_end is distinct from p_term_end
    or v_plan.late_minutes is distinct from p_late_minutes
    or v_plan.academic_calendar_id
      is distinct from v_calendar.calendar_id
    or v_current_meetings <> v_requested_meetings;

  update public.course_plans
  set course_code = upper(trim(p_course_code)),
      section_code = upper(trim(p_section_code)),
      course_name = trim(p_course_name),
      term_code = trim(p_term_code),
      term_start = p_term_start,
      term_end = p_term_end,
      expected_weeks = p_expected_weeks,
      late_minutes = p_late_minutes,
      is_active = p_is_active,
      academic_calendar_id = v_calendar.calendar_id,
      updated_at = v_cutoff
  where id = p_plan_id;

  if not v_schedule_changed then
    return jsonb_build_object(
      'success', true,
      'plan_updated_only', true,
      'plan_id', p_plan_id,
      'removed_future_sessions', 0,
      'generated_sessions', 0,
      'updated_future_sessions', 0,
      'excluded_sessions', 0,
      'preserved_historical_sessions', v_preserved,
      'academic_calendar_id', v_calendar.calendar_id
    );
  end if;

  perform 1
  from public.sessions s
  where s.course_plan_id = p_plan_id
    and s.generated_from_plan = true
    and s.start_time > v_cutoff
  order by s.id
  for update;

  if exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and s.generated_from_plan = true
      and s.start_time > v_cutoff
      and (
        coalesce(s.is_active, false) = true
        or coalesce(s.schedule_status, '') <> 'Scheduled'
        or exists (
          select 1
          from public.attendance_logs a
          where a.session_id = s.id
        )
        or exists (
          select 1
          from public.excuse_requests e
          where e.session_id = s.id
        )
      )
  ) then
    raise exception
      'توجد جلسة مستقبلية نشطة أو مرتبطة بحضور/عذر؛ عالجها قبل تحديث الجدول';
  end if;

  drop table if exists pg_temp.course_plan_edit_patterns;
  create temporary table course_plan_edit_patterns (
    id uuid primary key
  ) on commit drop;

  drop table if exists pg_temp.course_plan_edit_desired_sessions;
  create temporary table course_plan_edit_desired_sessions (
    id text primary key,
    meeting_pattern_id uuid not null,
    room text not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    late_after timestamptz not null,
    tag_number integer not null,
    delivery_mode text not null
  ) on commit drop;

  delete from public.course_plan_calendar_exclusions e
  where e.course_plan_id = p_plan_id
    and e.excluded_date >= v_today;

  for v_meeting in
    select value from jsonb_array_elements(p_meetings)
  loop
    v_day := (v_meeting ->> 'day_of_week')::integer;
    v_pattern_id := null;

    select cmp.id
    into v_pattern_id
    from public.course_meeting_patterns cmp
    where cmp.course_plan_id = p_plan_id
      and cmp.day_of_week = v_day
      and cmp.start_time = (v_meeting ->> 'start_time')::time
      and cmp.end_time = (v_meeting ->> 'end_time')::time
      and trim(cmp.room) = trim(v_meeting ->> 'room')
      and cmp.delivery_mode = (v_meeting ->> 'delivery_mode')
      and cmp.tag_number = (v_meeting ->> 'tag_number')::integer
    order by
      cmp.is_current desc,
      cmp.retired_at desc nulls last,
      cmp.id
    limit 1
    for update;

    if v_pattern_id is null then
      update public.course_meeting_patterns
      set is_current = false,
          retired_at = v_cutoff
      where course_plan_id = p_plan_id
        and day_of_week = v_day
        and start_time = (v_meeting ->> 'start_time')::time
        and is_current = true;

      insert into public.course_meeting_patterns (
        course_plan_id,
        day_of_week,
        start_time,
        end_time,
        room,
        delivery_mode,
        tag_number,
        is_current,
        retired_at
      ) values (
        p_plan_id,
        v_day,
        (v_meeting ->> 'start_time')::time,
        (v_meeting ->> 'end_time')::time,
        trim(v_meeting ->> 'room'),
        (v_meeting ->> 'delivery_mode'),
        (v_meeting ->> 'tag_number')::integer,
        true,
        null
      )
      returning id into v_pattern_id;
    else
      update public.course_meeting_patterns
      set is_current = false,
          retired_at = v_cutoff
      where course_plan_id = p_plan_id
        and day_of_week = v_day
        and start_time = (v_meeting ->> 'start_time')::time
        and is_current = true
        and id <> v_pattern_id;

      update public.course_meeting_patterns
      set is_current = true,
          retired_at = null
      where id = v_pattern_id;
    end if;

    insert into pg_temp.course_plan_edit_patterns(id)
    values (v_pattern_id);

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
          if v_date >= v_today then
            insert into public.course_plan_calendar_exclusions (
              course_plan_id,
              meeting_pattern_id,
              excluded_date,
              period_code,
              period_name_ar
            ) values (
              p_plan_id,
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
          end if;
        else
          v_start :=
            (v_date + (v_meeting ->> 'start_time')::time)
            at time zone v_timezone;
          v_end :=
            (v_date + (v_meeting ->> 'end_time')::time)
            at time zone v_timezone;

          if v_start > v_cutoff then
            insert into pg_temp.course_plan_edit_desired_sessions (
              id,
              meeting_pattern_id,
              room,
              start_time,
              end_time,
              late_after,
              tag_number,
              delivery_mode
            ) values (
              upper(trim(p_course_code)) || '-' ||
                upper(trim(p_section_code)) || '-' ||
                to_char(v_date, 'YYYYMMDD') || '-' ||
                to_char(
                  (v_meeting ->> 'start_time')::time,
                  'HH24MI'
                ),
              v_pattern_id,
              trim(v_meeting ->> 'room'),
              v_start,
              v_end,
              v_start + make_interval(mins => p_late_minutes),
              (v_meeting ->> 'tag_number')::integer,
              (v_meeting ->> 'delivery_mode')
            );
          end if;
        end if;
      end if;
      v_date := v_date + 1;
    end loop;
  end loop;

  update public.course_meeting_patterns cmp
  set is_current = false,
      retired_at = v_cutoff
  where cmp.course_plan_id = p_plan_id
    and cmp.is_current = true
    and not exists (
      select 1
      from pg_temp.course_plan_edit_patterns p
      where p.id = cmp.id
    );

  if exists (
    select 1
    from pg_temp.course_plan_edit_desired_sessions d
    join public.sessions s on s.id = d.id
    where s.course_plan_id is distinct from p_plan_id
       or coalesce(s.generated_from_plan, false) = false
       or s.start_time <= v_cutoff
  ) then
    raise exception
      'يتعارض أحد المواعيد الجديدة مع جلسة أخرى؛ غيّر الوقت أو الشعبة';
  end if;

  if exists (
    select 1
    from public.sessions s
    where s.course_plan_id = p_plan_id
      and s.generated_from_plan = true
      and s.start_time > v_cutoff
      and not exists (
        select 1
        from pg_temp.course_plan_edit_desired_sessions d
        where d.id = s.id
      )
      and exists (
        select 1
        from public.attendance_notifications n
        where n.related_session_id = s.id
      )
  ) then
    raise exception
      'ترتبط جلسة ستُحذف بإشعار سابق؛ عالج الإشعار قبل تغيير الموعد';
  end if;

  delete from public.sessions s
  where s.course_plan_id = p_plan_id
    and s.generated_from_plan = true
    and s.start_time > v_cutoff
    and not exists (
      select 1
      from pg_temp.course_plan_edit_desired_sessions d
      where d.id = s.id
    );
  get diagnostics v_removed = row_count;

  update public.sessions s
  set course_code = upper(trim(p_course_code)),
      section_code = upper(trim(p_section_code)),
      room = d.room,
      start_time = d.start_time,
      end_time = d.end_time,
      late_after = d.late_after,
      tag_number = d.tag_number,
      delivery_mode = d.delivery_mode,
      schedule_status = 'Scheduled',
      attendance_required = true,
      course_plan_id = p_plan_id,
      meeting_pattern_id = d.meeting_pattern_id,
      generated_from_plan = true
  from pg_temp.course_plan_edit_desired_sessions d
  where s.id = d.id
    and s.course_plan_id = p_plan_id
    and s.generated_from_plan = true
    and s.start_time > v_cutoff;
  get diagnostics v_updated = row_count;

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
  )
  select
    d.id,
    upper(trim(p_course_code)),
    upper(trim(p_section_code)),
    d.room,
    d.start_time,
    d.end_time,
    d.late_after,
    d.tag_number,
    false,
    d.delivery_mode,
    'Scheduled',
    true,
    p_plan_id,
    d.meeting_pattern_id,
    true
  from pg_temp.course_plan_edit_desired_sessions d
  left join public.sessions s on s.id = d.id
  where s.id is null;
  get diagnostics v_generated = row_count;

  return jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'removed_future_sessions', v_removed,
    'generated_sessions', v_generated,
    'updated_future_sessions', v_updated,
    'excluded_sessions', v_excluded,
    'preserved_historical_sessions', v_preserved,
    'academic_calendar_id', v_calendar.calendar_id
  );
end;
$$;

revoke all on function public.admin_update_course_plan(
  uuid,text,text,text,text,date,date,integer,integer,boolean,jsonb
) from public, anon;
grant execute on function public.admin_update_course_plan(
  uuid,text,text,text,text,date,date,integer,integer,boolean,jsonb
) to authenticated;

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
    count(distinct cmp.id)
      filter (where cmp.is_current = true),
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

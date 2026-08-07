'use strict';

(() => {
  const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
  const COURSE_PLAN_ROLES = [
    window.RoleAccess.ROLES.ADMINISTRATOR,
    window.RoleAccess.ROLES.INSTRUCTOR
  ];

  if (!window.supabase?.createClient) {
    console.error('Supabase client library was not loaded.');
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const $ = (id) => document.getElementById(id);
  const show = (el) => el?.classList.remove('is-hidden');
  const hide = (el) => el?.classList.add('is-hidden');
  let activeCalendar = null;
  let editingPlanId = null;
  let editingFeatureAvailable = false;

  function setMessage(text = '', type = '') {
    const el = $('formMessage');
    if (!el) return;
    el.textContent = text;
    el.className = `plan-message ${type}`.trim();
  }

  async function rpc(name, params = {}) {
    const { data, error } = await db.rpc(name, params);

    if (error) {
      throw new Error(error.message || 'تعذر تنفيذ العملية.');
    }

    return data;
  }

  async function verifyAdmin() {
    return Boolean(await window.RoleAccess.requireRole(
      db,
      COURSE_PLAN_ROLES,
      './'
    ));
  }

  function getSelectedDays(defaults = {}) {
    if (Array.isArray(defaults.days)) {
      return defaults.days
        .map(Number)
        .filter(Number.isInteger);
    }

    if (defaults.day !== undefined && defaults.day !== null) {
      return [Number(defaults.day)];
    }

    return [];
  }

  function addMeetingRow(defaults = {}) {
    const template = $('meetingRowTemplate');
    const container = $('meetingRows');

    if (!template || !container) return;

    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('.meeting-row');
    const selectedDays = getSelectedDays(defaults);

    row.querySelectorAll('.meeting-day').forEach((checkbox) => {
      checkbox.checked = selectedDays.includes(Number(checkbox.value));
    });

    row.querySelector('.meeting-start').value =
      defaults.start || '09:00';

    row.querySelector('.meeting-end').value =
      defaults.end || '10:20';

    row.querySelector('.meeting-room').value =
      defaults.room || '';

    row.querySelector('.meeting-mode').value =
      defaults.mode || 'InPerson';

    row.querySelector('.meeting-tag').value =
      String(defaults.tag ?? 1);

    row
      .querySelector('.remove-meeting-button')
      .addEventListener('click', () => {
        if (container.children.length <= 1) {
          setMessage(
            'يجب أن تحتوي الخطة على موعد واحد على الأقل.',
            'error'
          );
          return;
        }

        row.remove();
        setMessage();
      });

    container.appendChild(fragment);
  }

  function readMeetings() {
    const result = [];
    const rows = Array.from(
      document.querySelectorAll('.meeting-row')
    );

    if (!rows.length) {
      throw new Error('أضف موعدًا أسبوعيًا واحدًا على الأقل.');
    }

    rows.forEach((row, index) => {
      const start = row.querySelector('.meeting-start').value;
      const end = row.querySelector('.meeting-end').value;
      const room = row.querySelector('.meeting-room').value.trim();
      const selectedDays = Array.from(
        row.querySelectorAll('.meeting-day:checked')
      ).map((checkbox) => Number(checkbox.value));

      if (!selectedDays.length) {
        throw new Error(
          `اختر يومًا واحدًا على الأقل في الموعد رقم ${index + 1}.`
        );
      }

      if (!start || !end || end <= start) {
        throw new Error(`وقت الموعد رقم ${index + 1} غير صحيح.`);
      }

      if (!room) {
        throw new Error(`أدخل القاعة في الموعد رقم ${index + 1}.`);
      }

      const shared = {
        start_time: start,
        end_time: end,
        room,
        delivery_mode: row.querySelector('.meeting-mode').value,
        tag_number: Number(row.querySelector('.meeting-tag').value)
      };

      selectedDays.forEach((day) => {
        result.push({
          day_of_week: day,
          ...shared
        });
      });
    });

    const seen = new Set();
    result.forEach((meeting) => {
      const key = `${meeting.day_of_week}|${meeting.start_time}`;
      if (seen.has(key)) {
        throw new Error(
          'لا يمكن تكرار اليوم ووقت البداية في أكثر من موعد.'
        );
      }
      seen.add(key);
    });

    return result;
  }

  function validateDates(start, end, expectedWeeks) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new Error('تأكد من تاريخ بداية ونهاية الفصل.');
    }

    if (endDate < startDate) {
      throw new Error('نهاية الفصل يجب أن تكون بعد البداية.');
    }

    if (
      !Number.isInteger(expectedWeeks) ||
      expectedWeeks < 1 ||
      expectedWeeks > 24
    ) {
      throw new Error('عدد الأسابيع يجب أن يكون بين 1 و24.');
    }

    const actualDays =
      Math.floor((endDate - startDate) / 86400000) + 1;
    const maximumDays = (expectedWeeks + 2) * 7;

    if (actualDays > maximumDays) {
      throw new Error(
        'الفترة المحددة أطول بكثير من عدد الأسابيع المتوقع. راجع التواريخ.'
      );
    }
  }

  function setIdentityFieldsLocked(locked) {
    ['courseCode', 'sectionCode', 'courseName', 'termCode', 'termStart']
      .forEach((id) => {
        const field = $(id);
        if (!field) return;
        field.readOnly = Boolean(locked);
        if (locked) {
          field.setAttribute('aria-describedby', 'identityLockHint');
        } else {
          field.removeAttribute('aria-describedby');
        }
      });
  }

  function setEditMode(plan = null) {
    editingPlanId = plan?.plan_id || null;
    const isEditing = Boolean(editingPlanId);

    if (isEditing) {
      $('editModeTitle').textContent =
        `تعديل ${plan.course_code} — شعبة ${plan.section_code}`;
      $('savePlanButton').textContent =
        'حفظ التعديلات وتحديث الجلسات القادمة';
      $('submitSummaryText').textContent =
        'لن تتغير الجلسات السابقة أو سجلات الحضور المرتبطة بها.';
      show($('editModeBanner'));
    } else {
      $('savePlanButton').textContent =
        'إنشاء الخطة وتوليد المحاضرات';
      $('submitSummaryText').textContent =
        'يمكنك تعديل الاستثناءات لاحقًا لكل محاضرة.';
      hide($('editModeBanner'));
    }

    setIdentityFieldsLocked(Boolean(plan?.has_started_sessions));
  }

  function clearPlanForm() {
    const form = $('coursePlanForm');
    form?.reset();
    setEditMode(null);

    ['courseCode', 'sectionCode', 'courseName', 'termCode',
      'termStart', 'termEnd'].forEach((id) => {
      const field = $(id);
      if (field) field.value = '';
    });

    $('expectedWeeks').value = '16';
    $('lateMinutes').value = '15';
    $('activatePlan').checked = true;
    $('meetingRows').innerHTML = '';

    addMeetingRow({
      days: [],
      start: '09:00',
      end: '10:20',
      room: '',
      mode: 'InPerson',
      tag: 1
    });

    applyCalendarDefaults();
  }

  async function editPlan(planSummary) {
    setMessage('جارٍ تحميل بيانات المقرر...', 'info');

    try {
      const plan = await rpc('admin_get_course_plan_for_edit', {
        p_plan_id: planSummary.plan_id
      });

      $('courseCode').value = plan.course_code || '';
      $('sectionCode').value = plan.section_code || '';
      $('courseName').value = plan.course_name || '';
      $('termCode').value = plan.term_code || '';
      $('termStart').value = plan.term_start || '';
      $('termEnd').value = plan.term_end || '';
      $('expectedWeeks').value = String(plan.expected_weeks || 16);
      $('lateMinutes').value = String(plan.late_minutes ?? 15);
      $('activatePlan').checked = Boolean(plan.is_active);
      $('meetingRows').innerHTML = '';

      const grouped = window.CoursePlanEditorUtils.groupMeetings(
        plan.meetings
      );
      grouped.forEach(addMeetingRow);

      if (!grouped.length) {
        addMeetingRow({
          days: [],
          start: '09:00',
          end: '10:20',
          room: '',
          mode: 'InPerson',
          tag: 1
        });
      }

      setEditMode(plan);
      setMessage(
        plan.has_started_sessions
          ? 'بدأ سجل هذا المقرر؛ تم قفل بيانات الهوية، ويمكنك تعديل نهاية الفترة والمواعيد المستقبلية.'
          : 'يمكنك تعديل جميع البيانات. ستُعاد جدولة الجلسات المستقبلية فقط.',
        'success'
      );
      $('editModeBanner').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error) {
      console.error('Unable to load course plan for editing:', error);
      setMessage(error.message, 'error');
    }
  }

  function applyCalendarDefaults() {
    if (!activeCalendar) return;

    if (!$('termStart').value) {
      $('termStart').value = activeCalendar.term_start || '';
    }
    if (!$('termEnd').value) {
      $('termEnd').value = activeCalendar.term_end || '';
    }
    if (!$('termCode').value) {
      $('termCode').value = '2026/2027-1';
    }
    $('expectedWeeks').value = '18';
  }

  function renderCalendarReference(calendar) {
    activeCalendar = calendar || null;
    const section = $('calendarReference');

    if (!calendar) {
      $('calendarReferenceName').textContent =
        'لا يوجد تقويم أكاديمي نشط';
      $('calendarReferenceMeta').textContent =
        'أدخل نطاق الفصل يدويًا وتحقق منه قبل التوليد.';
      hide($('calendarSourceLink'));
      return;
    }

    $('calendarReferenceName').textContent = calendar.name_ar;
    $('calendarReferenceMeta').textContent =
      `${calendar.authority_ar} • ${formatDate(calendar.term_start)} ` +
      `إلى ${formatDate(calendar.term_end)} • ${calendar.timezone}`;

    const periods = $('calendarPeriods');
    periods.innerHTML = '';
    (calendar.periods || []).forEach((period) => {
      const item = document.createElement('span');
      item.className = `calendar-period ${
        period.automatic_session_exclusion ? '' : 'assessment'
      }`.trim();
      item.textContent =
        `${period.name_ar}: ${formatDate(period.starts_on)} - ` +
        `${formatDate(period.ends_on)}`;
      item.title = period.automatic_session_exclusion
        ? 'تُستبعد الجلسات تلقائيًا'
        : 'نافذة تقييم لا تلغي الجلسات تلقائيًا';
      periods.appendChild(item);
    });

    const sourceLink = $('calendarSourceLink');
    sourceLink.href = calendar.source_path;
    show(sourceLink);
    section.dataset.calendarId = calendar.calendar_id;
    applyCalendarDefaults();
  }

  async function loadCalendarReference() {
    try {
      const calendar = await rpc(
        'admin_get_academic_calendar_reference'
      );
      renderCalendarReference(calendar);
    } catch (error) {
      console.error('Unable to load academic calendar:', error);
      renderCalendarReference(null);
    }
  }

  async function savePlan(event) {
    event.preventDefault();
    setMessage();

    const form = $('coursePlanForm');
    const button = $('savePlanButton');

    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }

    button.disabled = true;

    try {
      const termStart = $('termStart').value;
      const termEnd = $('termEnd').value;
      const expectedWeeks = Number($('expectedWeeks').value);
      const lateMinutes = Number($('lateMinutes').value);

      validateDates(termStart, termEnd, expectedWeeks);

      if (
        !Number.isInteger(lateMinutes) ||
        lateMinutes < 0 ||
        lateMinutes > 120
      ) {
        throw new Error('دقائق التأخير يجب أن تكون بين 0 و120.');
      }

      const meetings = readMeetings();

      const wasEditing = Boolean(editingPlanId);
      const rpcName = wasEditing
        ? 'admin_update_course_plan'
        : 'admin_create_course_plan';
      const params = {
        p_course_code: $('courseCode').value.trim().toUpperCase(),
        p_section_code: $('sectionCode').value.trim().toUpperCase(),
        p_course_name: $('courseName').value.trim(),
        p_term_code: $('termCode').value.trim(),
        p_term_start: termStart,
        p_term_end: termEnd,
        p_expected_weeks: expectedWeeks,
        p_late_minutes: lateMinutes,
        p_is_active: $('activatePlan').checked,
        p_meetings: meetings
      };

      if (wasEditing) {
        params.p_plan_id = editingPlanId;
      }

      const result = await rpc(rpcName, params);

      const generated =
        result?.generated_sessions ??
        result?.generated ??
        0;
      const excluded = result?.excluded_sessions ?? 0;

      let successMessage;
      if (result?.unchanged) {
        successMessage = 'لم تتغير البيانات؛ بقيت الخطة والجلسات كما هي.';
      } else if (result?.plan_updated_only) {
        successMessage =
          'تم حفظ بيانات المقرر دون تغيير جدول الجلسات.';
      } else if (wasEditing) {
        successMessage =
          `تم حفظ التعديلات: تحديث ${
            result?.updated_future_sessions ?? 0
          } جلسة، حذف ${
            result?.removed_future_sessions ?? 0
          }، وتوليد ${generated} جلسة مستقبلية جديدة، ` +
          `مع حفظ ${
            result?.preserved_historical_sessions ?? 0
          } جلسة سابقة دون تغيير.`;
      } else {
        successMessage =
          `تم إنشاء الخطة وتوليد ${generated} محاضرة، ` +
          `واستبعاد ${excluded} موعدًا وفق التقويم الأكاديمي.`;
      }

      clearPlanForm();
      setMessage(successMessage, 'success');
      await loadPlans();
    } catch (error) {
      console.error('Unable to save course plan:', error);
      setMessage(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  }

  function formatDate(value) {
    if (!value) return '—';

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  function renderPlans(plans) {
    const grid = $('plansGrid');
    grid.innerHTML = '';
    hide($('plansLoading'));

    if (!plans.length) {
      show($('plansEmpty'));
      hide(grid);
      return;
    }

    hide($('plansEmpty'));
    show(grid);

    plans.forEach((plan) => {
      const card = document.createElement('article');
      card.className = 'plan-card';

      const head = document.createElement('div');
      head.className = 'plan-card-head';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = plan.course_code || '—';

      const subtitle = document.createElement('p');
      subtitle.textContent =
        `${plan.course_name || '—'} — ${plan.section_code || '—'}`;

      titleWrap.append(title, subtitle);

      const status = document.createElement('span');
      status.className =
        `plan-status ${plan.is_active ? 'active' : 'inactive'}`;
      status.textContent =
        plan.is_active ? 'نشطة' : 'متوقفة';

      head.append(titleWrap, status);

      const meta = document.createElement('div');
      meta.className = 'plan-meta';

      const values = [
        ['الفصل', plan.term_code],
        ['المواعيد أسبوعيًا', plan.weekly_meetings],
        ['الجلسات المولدة', plan.generated_sessions],
        ['الجلسات المستبعدة', plan.excluded_sessions],
        ['مرجع التقويم', plan.academic_calendar_name || 'غير مرتبط'],
        [
          'الفترة',
          `${formatDate(plan.term_start)} – ${formatDate(plan.term_end)}`
        ]
      ];

      values.forEach(([label, value]) => {
        const item = document.createElement('div');
        const labelEl = document.createElement('span');
        const valueEl = document.createElement('strong');

        labelEl.textContent = label;
        valueEl.textContent = value ?? '—';

        item.append(labelEl, valueEl);
        meta.appendChild(item);
      });

      const actions = document.createElement('div');
      actions.className = 'plan-actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'secondary-button small';
      toggleButton.textContent =
        plan.is_active ? 'إيقاف الخطة' : 'تفعيل الخطة';

      toggleButton.addEventListener('click', async () => {
        toggleButton.disabled = true;

        try {
          await rpc('admin_set_course_plan_active', {
            p_plan_id: plan.plan_id,
            p_is_active: !plan.is_active
          });

          await loadPlans();
        } catch (error) {
          console.error('Unable to change course plan status:', error);
          alert(error.message);
        } finally {
          toggleButton.disabled = false;
        }
      });

      if (editingFeatureAvailable) {
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className =
          'secondary-button small plan-edit-button';
        editButton.textContent = 'تعديل المقرر';
        editButton.setAttribute(
          'aria-label',
          `تعديل ${plan.course_code} شعبة ${plan.section_code}`
        );

        editButton.addEventListener('click', async () => {
          editButton.disabled = true;

          try {
            await editPlan(plan);
          } finally {
            editButton.disabled = false;
          }
        });

        actions.appendChild(editButton);
      }

      actions.appendChild(toggleButton);
      card.append(head, meta, actions);
      grid.appendChild(card);
    });
  }

  async function loadPlans() {
    show($('plansLoading'));
    hide($('plansEmpty'));
    hide($('plansGrid'));

    try {
      const plans = await rpc('admin_list_course_plans_v2');
      const normalizedPlans = Array.isArray(plans) ? plans : [];
      editingFeatureAvailable = false;

      if (normalizedPlans.length) {
        try {
          await rpc('admin_get_course_plan_for_edit', {
            p_plan_id: normalizedPlans[0].plan_id
          });
          editingFeatureAvailable = true;
        } catch (error) {
          console.info(
            'Course plan editing is waiting for its database migration.',
            error.message
          );
        }
      }

      renderPlans(normalizedPlans);
    } catch (error) {
      console.error('Unable to load course plans:', error);
      hide($('plansLoading'));
      show($('plansEmpty'));
      $('plansEmpty').textContent = error.message;
    }
  }

  $('addMeetingButton')?.addEventListener(
    'click',
    () => addMeetingRow({
      days: [],
      start: '09:00',
      end: '10:20',
      room: '',
      mode: 'InPerson',
      tag: 1
    })
  );

  $('coursePlanForm')?.addEventListener(
    'submit',
    savePlan
  );

  $('cancelEditButton')?.addEventListener(
    'click',
    () => {
      clearPlanForm();
      setMessage('تم إلغاء التعديل والعودة إلى إنشاء مقرر جديد.', 'info');
      $('coursePlanForm')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  );

  $('refreshPlansButton')?.addEventListener(
    'click',
    loadPlans
  );

  (async function init() {
    clearPlanForm();

    if (await verifyAdmin()) {
      await loadCalendarReference();
      await loadPlans();
    }
  })();
})();

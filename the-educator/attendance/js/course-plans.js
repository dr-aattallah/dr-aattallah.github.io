'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const ADMIN_EMAIL = 'aattallah@kau.edu.sa';

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);
const show = (el) => el?.classList.remove('is-hidden');
const hide = (el) => el?.classList.add('is-hidden');

const DAY_NAMES = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت'
};

function setMessage(text = '', type = '') {
  const el = $('formMessage');
  el.textContent = text;
  el.className = `plan-message ${type}`.trim();
}

async function rpc(name, params = {}) {
  const { data, error } = await db.rpc(name, params);
  if (error) throw new Error(error.message || 'تعذر تنفيذ العملية.');
  return data;
}

async function verifyAdmin() {
  const { data: { session } } = await db.auth.getSession();

  if (
    !session ||
    session.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    location.href = './';
    return false;
  }

  return true;
}

function addMeetingRow(defaults = {}) {
  const fragment = $('meetingRowTemplate').content.cloneNode(true);
  const row = fragment.querySelector('.meeting-row');

  row.querySelector('.meeting-day').value =
    String(defaults.day ?? 0);

  row.querySelector('.meeting-start').value =
    defaults.start || '09:00';

  row.querySelector('.meeting-end').value =
    defaults.end || '10:20';

  row.querySelector('.meeting-room').value =
    defaults.room || 'H1-7';

  row.querySelector('.meeting-mode').value =
    defaults.mode || 'InPerson';

  row.querySelector('.meeting-tag').value =
    String(defaults.tag ?? 1);

  row
    .querySelector('.remove-meeting-button')
    .addEventListener('click', () => {
      if ($('meetingRows').children.length <= 1) {
        setMessage('يجب أن تحتوي الخطة على موعد واحد على الأقل.', 'error');
        return;
      }

      row.remove();
      setMessage();
    });

  $('meetingRows').appendChild(fragment);
}

function readMeetings() {
  return Array.from(
    document.querySelectorAll('.meeting-row')
  ).map((row, index) => {
    const start = row.querySelector('.meeting-start').value;
    const end = row.querySelector('.meeting-end').value;

    if (!start || !end || end <= start) {
      throw new Error(`وقت الموعد رقم ${index + 1} غير صحيح.`);
    }

    return {
      day_of_week: Number(row.querySelector('.meeting-day').value),
      start_time: start,
      end_time: end,
      room: row.querySelector('.meeting-room').value.trim(),
      delivery_mode: row.querySelector('.meeting-mode').value,
      tag_number: Number(row.querySelector('.meeting-tag').value)
    };
  });
}

function validateDates(start, end, expectedWeeks) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('تأكد من تاريخ بداية ونهاية الفصل.');
  }

  if (endDate < startDate) {
    throw new Error('نهاية الفصل يجب أن تكون بعد البداية.');
  }

  const actualDays = Math.floor((endDate - startDate) / 86400000) + 1;
  const maximumDays = (expectedWeeks + 2) * 7;

  if (actualDays > maximumDays) {
    throw new Error(
      'الفترة المحددة أطول بكثير من عدد الأسابيع المتوقع. راجع التواريخ.'
    );
  }
}

async function savePlan(event) {
  event.preventDefault();
  setMessage();

  const button = $('savePlanButton');
  button.disabled = true;

  try {
    const termStart = $('termStart').value;
    const termEnd = $('termEnd').value;
    const expectedWeeks = Number($('expectedWeeks').value);

    validateDates(termStart, termEnd, expectedWeeks);

    const meetings = readMeetings();

    if (meetings.some(item => !item.room)) {
      throw new Error('أدخل القاعة لكل موعد.');
    }

    const result = await rpc('admin_create_course_plan', {
      p_course_code: $('courseCode').value.trim().toUpperCase(),
      p_section_code: $('sectionCode').value.trim().toUpperCase(),
      p_course_name: $('courseName').value.trim(),
      p_term_code: $('termCode').value.trim(),
      p_term_start: termStart,
      p_term_end: termEnd,
      p_expected_weeks: expectedWeeks,
      p_late_minutes: Number($('lateMinutes').value),
      p_is_active: $('activatePlan').checked,
      p_meetings: meetings
    });

    const generated =
      result?.generated_sessions ??
      result?.generated ??
      0;

    setMessage(
      `تم إنشاء الخطة وتوليد ${generated} محاضرة بنجاح.`,
      'success'
    );

    $('coursePlanForm').reset();
    $('expectedWeeks').value = '16';
    $('lateMinutes').value = '15';
    $('activatePlan').checked = true;
    $('meetingRows').innerHTML = '';
    addMeetingRow();

    await loadPlans();
  } catch (error) {
    setMessage(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function formatDate(value) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

function renderPlans(plans) {
  $('plansGrid').innerHTML = '';
  hide($('plansLoading'));

  if (!plans.length) {
    show($('plansEmpty'));
    hide($('plansGrid'));
    return;
  }

  hide($('plansEmpty'));
  show($('plansGrid'));

  plans.forEach(plan => {
    const card = document.createElement('article');
    card.className = 'plan-card';

    const head = document.createElement('div');
    head.className = 'plan-card-head';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = plan.course_code;
    const subtitle = document.createElement('p');
    subtitle.textContent =
      `${plan.course_name} — ${plan.section_code}`;
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
      [
        'الفترة',
        `${formatDate(plan.term_start)} – ${formatDate(plan.term_end)}`
      ]
    ];

    values.forEach(([label, value]) => {
      const item = document.createElement('div');
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      const valueEl = document.createElement('strong');
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
        alert(error.message);
      } finally {
        toggleButton.disabled = false;
      }
    });

    actions.appendChild(toggleButton);
    card.append(head, meta, actions);
    $('plansGrid').appendChild(card);
  });
}

async function loadPlans() {
  show($('plansLoading'));
  hide($('plansEmpty'));
  hide($('plansGrid'));

  try {
    const plans = await rpc('admin_list_course_plans');
    renderPlans(Array.isArray(plans) ? plans : []);
  } catch (error) {
    hide($('plansLoading'));
    show($('plansEmpty'));
    $('plansEmpty').textContent = error.message;
  }
}

$('addMeetingButton')?.addEventListener(
  'click',
  () => addMeetingRow()
);

$('coursePlanForm')?.addEventListener(
  'submit',
  savePlan
);

$('refreshPlansButton')?.addEventListener(
  'click',
  loadPlans
);

(async function init() {
  addMeetingRow({
    day: 0,
    start: '09:00',
    end: '10:20',
    room: 'H1-7',
    mode: 'InPerson',
    tag: 1
  });

  if (await verifyAdmin()) {
    await loadPlans();
  }
})();

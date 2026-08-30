'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const REPORT_ROLES = [
  window.RoleAccess.ROLES.ADMINISTRATOR,
  window.RoleAccess.ROLES.INSTRUCTOR,
  window.RoleAccess.ROLES.TEACHING_ASSISTANT
];
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const $ = (id) => document.getElementById(id);

let courseGroups = [];
let currentReport = null;
let currentCourse = null;
let reportLoading = false;

const show = (element) => element?.classList.remove('is-hidden');
const hide = (element) => element?.classList.add('is-hidden');

async function rpc(name, params = {}) {
  const {data, error} = await db.rpc(name, params);
  if (error) throw new Error(error.message || 'تعذر تنفيذ العملية.');
  return data;
}

async function verifyAdmin() {
  return Boolean(await window.RoleAccess.requireRole(
    db,
    REPORT_ROLES,
    './'
  ));
}

function courseKey(session) {
  const stableId =
    session.course_id || session.course_plan_id || session.plan_id;
  if (stableId) return String(stableId);

  return [
    session.course_code || 'unknown',
    session.section_code || '',
    session.term_code || ''
  ].join('|');
}

function groupSessions(sessions) {
  const groups = new Map();

  sessions.forEach((session) => {
    const key = courseKey(session);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        course_code: session.course_code || 'مقرر غير محدد',
        section_code: session.section_code || '',
        term_code: session.term_code || '',
        sessions: []
      });
    }
    groups.get(key).sessions.push(session);
  });

  return [...groups.values()].sort((first, second) =>
    first.course_code.localeCompare(second.course_code, 'ar')
  );
}

function setProgress(message, isError = false) {
  const progress = $('reportProgress');
  progress.textContent = message;
  progress.style.color = isError ? '#c64d69' : '';
}

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Riyadh'
  }).format(new Date());
}

function renderRows() {
  const deniedOnly = $('deniedOnly').checked;
  const rows = (currentReport?.students || [])
    .filter((student) => !deniedOnly || student.is_denied);
  const body = $('reportTableBody');
  body.innerHTML = '';

  rows.forEach((student) => {
    const tr = document.createElement('tr');
    const values = [
      student.university_id,
      student.student_name,
      student.counted_sessions,
      student.present_count,
      student.late_count,
      student.absent_count,
      student.absence_points,
      formatPercentage(student.attendance_percentage),
      formatPercentage(student.absence_percentage)
    ];

    values.forEach((value) => {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.appendChild(td);
    });

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = student.is_denied ? 'denied-pill' : 'safe-pill';
    status.textContent = student.is_denied ? 'محروم' : 'سليم';
    statusCell.appendChild(status);
    tr.appendChild(statusCell);
    body.appendChild(tr);
  });

  $('tableEmpty').classList.toggle('is-hidden', rows.length > 0);
  document.querySelector('.table-wrap')
    ?.classList.toggle('is-hidden', rows.length === 0);
}

function renderReport(report, course) {
  currentReport = report;
  currentCourse = course;
  const label = [
    course.course_code,
    course.section_code,
    course.term_code
  ].filter(Boolean).join(' — ');

  $('reportCourseTitle').textContent = label;
  $('reportGeneratedAt').textContent =
    `أُنشئ في ${formatGeneratedAt()}`;
  $('countedSessions').textContent = report.counted_sessions;
  $('studentCount').textContent = report.student_count;
  $('averageAttendance').textContent =
    formatPercentage(report.average_attendance_percentage);
  $('deniedCount').textContent = report.denied_count;

  hide($('reportEmpty'));
  show($('reportView'));
  $('exportExcelButton').disabled = report.student_count === 0;
  $('exportPdfButton').disabled = report.student_count === 0;
  renderRows();
}

async function loadRosters(sessions) {
  const rosterBySession = {};
  const batchSize = 4;

  for (let index = 0; index < sessions.length; index += batchSize) {
    const batch = sessions.slice(index, index + batchSize);
    const results = await Promise.all(
      batch.map(async (session) => ({
        session_id: session.session_id,
        roster: await rpc('admin_get_live_roster', {
          p_session_id: session.session_id
        })
      }))
    );

    results.forEach(({session_id, roster}) => {
      rosterBySession[session_id] = Array.isArray(roster) ? roster : [];
    });

    setProgress(
      `تم تحميل ${Math.min(index + batchSize, sessions.length)} من ` +
      `${sessions.length} جلسة...`
    );
  }

  return rosterBySession;
}

async function loadSelectedReport() {
  if (reportLoading || !courseGroups.length) return;
  const course = courseGroups[Number($('courseSelector').value)];
  if (!course) return;

  reportLoading = true;
  $('refreshReportButton').disabled = true;
  $('courseSelector').disabled = true;
  $('exportExcelButton').disabled = true;
  $('exportPdfButton').disabled = true;
  setProgress('جارٍ إعداد تقرير المقرر...');

  try {
    const countedSessions = course.sessions.filter((session) =>
      window.CourseReportCalculations.sessionIsCounted(session)
    );
    const rosterBySession = await loadRosters(countedSessions);
    const report = window.CourseReportCalculations.buildCourseReport(
      course.sessions,
      rosterBySession
    );
    renderReport(report, course);
    setProgress(`اكتمل التقرير: ${report.student_count} طالب.`);
  } catch (error) {
    setProgress(error.message || 'تعذر إعداد التقرير.', true);
  } finally {
    reportLoading = false;
    $('refreshReportButton').disabled = false;
    $('courseSelector').disabled = false;
  }
}

async function loadCourses() {
  setProgress('جارٍ تحميل المقررات...');
  hide($('reportView'));
  show($('reportEmpty'));

  try {
    const rows = await rpc('admin_list_sessions');
    courseGroups = groupSessions(Array.isArray(rows) ? rows : []);
    const selector = $('courseSelector');
    selector.innerHTML = '';

    courseGroups.forEach((course, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = [
        course.course_code,
        course.section_code,
        course.term_code
      ].filter(Boolean).join(' — ');
      selector.appendChild(option);
    });

    if (!courseGroups.length) {
      selector.disabled = true;
      setProgress('لا توجد جلسات مقررات متاحة.');
      return;
    }

    selector.disabled = false;
    await loadSelectedReport();
  } catch (error) {
    setProgress(error.message || 'تعذر تحميل المقررات.', true);
  }
}

function safeCsvValue(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  if (!currentReport || !currentCourse) return;
  const headers = [
    'الرقم الجامعي', 'الاسم', 'الجلسات', 'حاضر', 'متأخر', 'غائب',
    'نقاط الغياب', 'نسبة الحضور', 'نسبة الغياب', 'الحالة'
  ];
  const rows = currentReport.students.map((student) => [
    student.university_id,
    student.student_name,
    student.counted_sessions,
    student.present_count,
    student.late_count,
    student.absent_count,
    student.absence_points,
    formatPercentage(student.attendance_percentage),
    formatPercentage(student.absence_percentage),
    student.is_denied ? 'محروم' : 'سليم'
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(safeCsvValue).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const code = currentCourse.course_code.replace(/[^A-Za-z0-9_-]/g, '-');
  link.href = url;
  link.download = `attendance-report-${code}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

$('courseSelector').addEventListener('change', loadSelectedReport);
$('refreshReportButton').addEventListener('click', loadCourses);
$('deniedOnly').addEventListener('change', renderRows);
$('exportExcelButton').addEventListener('click', exportCsv);
$('exportPdfButton').addEventListener('click', () => window.print());

(async function init() {
  if (await verifyAdmin()) await loadCourses();
})();

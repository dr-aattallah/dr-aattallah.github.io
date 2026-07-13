
'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';

const params = new URLSearchParams(window.location.search);
const requestedStudentId = (params.get('student') || '').trim();

const loading = document.getElementById('historyLoading');
const errorBox = document.getElementById('historyError');
const errorMessage = document.getElementById('historyErrorMessage');
const content = document.getElementById('historyContent');
const tableBody = document.getElementById('attendanceTable');
const tableWrap = document.querySelector('.history-table-wrap');
const emptyHistory = document.getElementById('emptyHistory');

function showError(message) {
  loading.classList.add('is-hidden');
  content.classList.add('is-hidden');
  errorBox.classList.remove('is-hidden');
  errorMessage.textContent = message;
}

function statusArabic(status) {
  return {
    Present: 'حاضر',
    Late: 'متأخر',
    Absent: 'غائب',
    Partial: 'حضور جزئي',
    Rejected: 'مرفوض'
  }[status] || status || 'غير محدد';
}

function statusClass(status) {
  if (status === 'Present') return 'present';
  if (status === 'Late') return 'late';
  return 'other';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Riyadh'
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  }).format(new Date(value));
}

async function fetchRows() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_student_attendance`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ p_student_id: requestedStudentId })
    }
  );

  let payload = null;
  try { payload = await response.json(); } catch {}

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      payload?.details ||
      `تعذر تحميل السجل (${response.status}).`
    );
  }

  return Array.isArray(payload) ? payload : [];
}

function render(rows) {
  loading.classList.add('is-hidden');
  errorBox.classList.add('is-hidden');
  content.classList.remove('is-hidden');

  const first = rows[0] || {};
  const resolvedName = first.student_name || 'طالب';
  const resolvedStudentId = first.university_id || requestedStudentId;

  document.getElementById('studentName').textContent = resolvedName;
  document.getElementById('studentId').textContent = resolvedStudentId;

  const total = rows.length;
  const present = rows.filter(r => r.status === 'Present').length;
  const late = rows.filter(r => r.status === 'Late').length;
  const committed = present + late;
  const rate = total ? Math.round((committed / total) * 100) : 0;

  document.getElementById('totalAttendance').textContent = total;
  document.getElementById('presentCount').textContent = present;
  document.getElementById('lateCount').textContent = late;
  document.getElementById('attendanceRate').textContent = `${rate}%`;
  document.getElementById('recordCountBadge').textContent = `${total} سجل`;

  tableBody.innerHTML = '';

  if (!total) {
    emptyHistory.classList.remove('is-hidden');
    tableWrap.classList.add('is-hidden');
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');

    const course = document.createElement('td');
    course.textContent = row.course_code || '—';

    const date = document.createElement('td');
    date.textContent = formatDate(row.attendance_time);

    const time = document.createElement('td');
    time.textContent = formatTime(row.attendance_time);

    const status = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = `history-pill ${statusClass(row.status)}`;
    pill.textContent = statusArabic(row.status);
    status.appendChild(pill);

    tr.append(course, date, time, status);
    tableBody.appendChild(tr);
  });
}

async function init() {
  if (!requestedStudentId) {
    showError('لم يتم تحديد الرقم الجامعي في رابط الصفحة.');
    return;
  }

  try {
    render(await fetchRows());
  } catch (error) {
    showError(error instanceof Error ? error.message : 'تعذر تحميل سجل الحضور.');
  }
}

init();

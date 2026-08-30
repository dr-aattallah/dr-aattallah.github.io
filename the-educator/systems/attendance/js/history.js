'use strict';

/*
 * Attendance History — Supabase RPC integration
 * Path example:
 * the-educator/attendance/js/attendance-history.js
 */

const SUPABASE_URL =
  'https://obgmbgsgwxbenglltcwv.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';

const params =
  new URLSearchParams(window.location.search);

const requestedStudentId =
  (params.get('student') || '').trim();

const loadingElement =
  document.getElementById('historyLoading');

const errorElement =
  document.getElementById('historyError');

const errorMessageElement =
  document.getElementById('historyErrorMessage');

const contentElement =
  document.getElementById('historyContent');

const studentNameElement =
  document.getElementById('studentName');

const studentIdElement =
  document.getElementById('studentId');

const totalAttendanceElement =
  document.getElementById('totalAttendance');

const presentCountElement =
  document.getElementById('presentCount');

const lateCountElement =
  document.getElementById('lateCount');

const attendanceRateElement =
  document.getElementById('attendanceRate');

const recordCountBadgeElement =
  document.getElementById('recordCountBadge');

const emptyHistoryElement =
  document.getElementById('emptyHistory');

const attendanceTableElement =
  document.getElementById('attendanceTable');

const tableWrapperElement =
  document.querySelector('.history-table-wrap');

function hideElement(element) {
  element?.classList.add('is-hidden');
}

function showElement(element) {
  element?.classList.remove('is-hidden');
}

function showLoading() {
  showElement(loadingElement);
  hideElement(errorElement);
  hideElement(contentElement);
}

function showError(message) {
  hideElement(loadingElement);
  hideElement(contentElement);
  showElement(errorElement);

  if (errorMessageElement) {
    errorMessageElement.textContent =
      message || 'حدث خطأ غير متوقع.';
  }
}

function statusToArabic(status) {
  const values = {
    Present: 'حاضر',
    Late: 'متأخر',
    Absent: 'غائب',
    Partial: 'حضور جزئي',
    Rejected: 'مرفوض'
  };

  return values[status] || status || 'غير محدد';
}

function statusClass(status) {
  if (status === 'Present') {
    return 'present';
  }

  if (status === 'Late') {
    return 'late';
  }

  return 'other';
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Riyadh'
  }).format(date);
}

function formatTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  }).format(date);
}

function escapeText(value) {
  return String(value ?? '').trim();
}

async function fetchAttendanceRecords() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_student_attendance`,
    {
      method: 'POST',

      headers: {
        apikey:
          SUPABASE_PUBLISHABLE_KEY,

        Authorization:
          `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

        'Content-Type':
          'application/json',

        Accept:
          'application/json'
      },

      body: JSON.stringify({
        p_student_id:
          requestedStudentId
      })
    }
  );

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.details ||
      payload?.hint ||
      `تعذر تحميل سجل الحضور (${response.status}).`;

    throw new Error(message);
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload;
}

function updateStudentSummary(records) {
  const firstRecord =
    records[0] || {};

  const studentName =
    escapeText(firstRecord.student_name) ||
    'طالب';

  const universityId =
    escapeText(firstRecord.university_id) ||
    requestedStudentId ||
    '—';

  if (studentNameElement) {
    studentNameElement.textContent =
      studentName;
  }

  if (studentIdElement) {
    studentIdElement.textContent =
      universityId;
  }
}

function updateStatistics(records) {
  const total =
    records.length;

  const present =
    records.filter(
      (record) =>
        record.status === 'Present'
    ).length;

  const late =
    records.filter(
      (record) =>
        record.status === 'Late'
    ).length;

  const attended =
    present + late;

  const rate =
    total > 0
      ? Math.round(
          (attended / total) * 100
        )
      : 0;

  if (totalAttendanceElement) {
    totalAttendanceElement.textContent =
      String(total);
  }

  if (presentCountElement) {
    presentCountElement.textContent =
      String(present);
  }

  if (lateCountElement) {
    lateCountElement.textContent =
      String(late);
  }

  if (attendanceRateElement) {
    attendanceRateElement.textContent =
      `${rate}%`;
  }

  if (recordCountBadgeElement) {
    recordCountBadgeElement.textContent =
      `${total} سجل`;
  }
}

function createAttendanceRow(record) {
  const row =
    document.createElement('tr');

  const courseCell =
    document.createElement('td');

  const dateCell =
    document.createElement('td');

  const timeCell =
    document.createElement('td');

  const statusCell =
    document.createElement('td');

  const statusPill =
    document.createElement('span');

  courseCell.textContent =
    escapeText(record.course_code) ||
    '—';

  dateCell.textContent =
    formatDate(record.attendance_time);

  timeCell.textContent =
    formatTime(record.attendance_time);

  statusPill.className =
    `history-pill ${statusClass(record.status)}`;

  statusPill.textContent =
    statusToArabic(record.status);

  statusCell.appendChild(statusPill);

  row.append(
    courseCell,
    dateCell,
    timeCell,
    statusCell
  );

  return row;
}

function renderAttendanceTable(records) {
  if (!attendanceTableElement) {
    return;
  }

  attendanceTableElement.innerHTML =
    '';

  if (records.length === 0) {
    showElement(emptyHistoryElement);
    hideElement(tableWrapperElement);
    return;
  }

  hideElement(emptyHistoryElement);
  showElement(tableWrapperElement);

  const fragment =
    document.createDocumentFragment();

  records.forEach((record) => {
    fragment.appendChild(
      createAttendanceRow(record)
    );
  });

  attendanceTableElement.appendChild(
    fragment
  );
}

function renderAttendanceHistory(records) {
  hideElement(loadingElement);
  hideElement(errorElement);
  showElement(contentElement);

  updateStudentSummary(records);
  updateStatistics(records);
  renderAttendanceTable(records);
}

async function initializeAttendanceHistory() {
  showLoading();

  if (!requestedStudentId) {
    showError(
      'لم يتم تحديد الرقم الجامعي في رابط الصفحة.'
    );

    return;
  }

  try {
    const records =
      await fetchAttendanceRecords();

    renderAttendanceHistory(records);
  } catch (error) {
    console.error(
      'Attendance history error:',
      error
    );

    showError(
      error instanceof Error
        ? error.message
        : 'تعذر تحميل سجل الحضور.'
    );
  }
}

initializeAttendanceHistory();

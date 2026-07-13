'use strict';

/*
 * NFC Attendance — Supabase RPC integration
 * Replace only: the-educator/attendance/js/checkin.js
 */

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcvv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';

const DEFAULT_SESSION_ID = 'CPCS203-20260713';

const TAGS = Object.freeze({
  '1': {
    number: 1,
    label: 'البطاقة 1',
    uid: '04:79:0F:CA:9C:17:90'
  },
  '2': {
    number: 2,
    label: 'البطاقة 2',
    uid: '04:65:4E:CA:9C:17:90'
  },
  '3': {
    number: 3,
    label: 'البطاقة 3',
    uid: '04:5D:24:CA:9C:17:90'
  },
  'NFC-FRONT': {
    number: 1,
    label: 'البطاقة 1',
    uid: '04:79:0F:CA:9C:17:90'
  },
  'NFC-MIDDLE': {
    number: 2,
    label: 'البطاقة 2',
    uid: '04:65:4E:CA:9C:17:90'
  },
  'NFC-BACK': {
    number: 3,
    label: 'البطاقة 3',
    uid: '04:5D:24:CA:9C:17:90'
  }
});

const steps = [
  document.getElementById('stepOne'),
  document.getElementById('stepTwo'),
  document.getElementById('stepThree')
];

const stepperItems = Array.from(document.querySelectorAll('.stepper-item'));
const readerStage = document.getElementById('readerStage');
const readerStatus = document.getElementById('readerStatus');
const simulateReadButton = document.getElementById('simulateRead');
const readTagLabel = document.getElementById('readTagLabel');
const form = document.getElementById('checkinForm');
const studentIdInput = document.getElementById('studentId');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const attendanceStatus = document.getElementById('attendanceStatus');
const attendanceTime = document.getElementById('attendanceTime');
const countdown = document.getElementById('countdown');

const query = new URLSearchParams(window.location.search);
const tagKey = query.get('tag') || query.get('card') || '';
const sessionId = query.get('session') || DEFAULT_SESSION_ID;

let selectedTag = TAGS[tagKey] || null;
let cardRead = false;
let secondsLeft = 347;

function showStep(number) {
  steps.forEach((step, index) => {
    step?.classList.toggle('active', index === number - 1);
  });

  stepperItems.forEach((item, index) => {
    item.classList.toggle('active', index === number - 1);
    item.classList.toggle('done', index < number - 1);
  });
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}

function setReaderStatus(type, message) {
  readerStatus.className = `reader-status ${type}`;

  if (type === 'waiting') {
    readerStatus.innerHTML =
      `<span class="status-spinner"></span><strong>${message}</strong>`;
    return;
  }

  const icon = type === 'success' ? '✓' : '×';
  readerStatus.innerHTML = `<span>${icon}</span><strong>${message}</strong>`;
}

function markCardAsRead(tag) {
  selectedTag = tag;
  cardRead = true;

  if (readTagLabel) readTagLabel.textContent = tag.label;

  setReaderStatus('success', 'تمت قراءة البطاقة بنجاح');
  readerStage?.classList.add('read-complete');

  window.setTimeout(() => {
    showStep(2);
    studentIdInput?.focus();
  }, 700);
}

function simulateCardRead() {
  setReaderStatus('waiting', 'جارٍ قراءة البطاقة...');
  simulateReadButton.disabled = true;

  window.setTimeout(() => {
    // The simulation is for development only and defaults to Card 1.
    markCardAsRead(selectedTag || TAGS['1']);
    simulateReadButton.disabled = false;
  }, 1000);
}

simulateReadButton?.addEventListener('click', simulateCardRead);

/*
 * Opening the page from a programmed NFC URL such as:
 * /checkin/?tag=1&session=CPCS203-20260713
 * counts as completion of the browser-side card-read stage.
 */
if (selectedTag) {
  window.setTimeout(() => markCardAsRead(selectedTag), 550);
}

function showFormMessage(text) {
  formMessage.textContent = text;
  formMessage.className = 'message show error';
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

function showResult(result) {
  showStep(3);

  const success = result?.success === true;
  const recordedAt = result?.recorded_at || new Date().toISOString();

  if (attendanceTime) attendanceTime.textContent = formatTime(recordedAt);

  if (success) {
    resultIcon.className = 'result-icon';
    resultIcon.innerHTML = '<span>✓</span>';
    resultTitle.textContent = result.message || 'تم تسجيل حضورك';
    resultText.textContent = result.student_name
      ? `مرحبًا ${result.student_name}، تم حفظ حضورك بنجاح.`
      : 'تم حفظ حضورك بنجاح.';
    attendanceStatus.textContent = statusToArabic(result.status);
    return;
  }

  resultIcon.className = 'result-icon failure';
  resultIcon.innerHTML = '<span>×</span>';
  resultTitle.textContent =
    result?.code === 'DUPLICATE_ATTENDANCE'
      ? 'حضورك مسجل مسبقًا'
      : 'تعذر تسجيل الحضور';
  resultText.textContent =
    result?.message || 'لم يتم حفظ حضورك. حاول مرة أخرى أو تواصل مع المعلم.';
  attendanceStatus.textContent =
    result?.code === 'DUPLICATE_ATTENDANCE' ? 'مسجل مسبقًا' : 'مرفوض';
}

async function recordAttendance(universityId) {
  if (!selectedTag) {
    throw new Error('لم يتم التعرف على بطاقة NFC.');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/record_attendance`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        p_university_id: universityId,
        p_session_id: sessionId,
        p_tag_number: selectedTag.number,
        p_card_uid: selectedTag.uid
      })
    }
  );

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const serverMessage =
      payload?.message ||
      payload?.details ||
      `تعذر الاتصال بخدمة الحضور (${response.status}).`;

    throw new Error(serverMessage);
  }

  return payload;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!cardRead || !selectedTag) {
    showStep(1);
    setReaderStatus('error', 'المس بطاقة NFC أولًا.');
    return;
  }

  const studentId = studentIdInput.value.trim();

  if (!studentId) {
    showFormMessage('أدخل الرقم الجامعي أولًا.');
    studentIdInput.focus();
    return;
  }

  if (!/^[A-Za-z0-9-]{5,40}$/.test(studentId)) {
    showFormMessage('صيغة الرقم الجامعي غير صحيحة.');
    studentIdInput.focus();
    return;
  }

  submitButton.classList.add('is-loading');
  submitButton.disabled = true;
  formMessage.className = 'message';

  try {
    const result = await recordAttendance(studentId);
    showResult(result);
  } catch (error) {
    showResult({
      success: false,
      code: 'NETWORK_OR_API_ERROR',
      message: error instanceof Error
        ? error.message
        : 'تعذر الاتصال بخدمة الحضور.'
    });
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.disabled = false;
  }
});

window.setInterval(() => {
  if (!countdown || secondsLeft <= 0) return;

  secondsLeft -= 1;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  countdown.textContent = `${minutes}:${seconds}`;
}, 1000);

window.requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach((item) => {
    item.classList.add('visible');
  });
});

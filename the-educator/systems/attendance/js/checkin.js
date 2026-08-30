'use strict';

/*
 * NFC Attendance — Supabase RPC integration
 * Path: the-educator/attendance/js/checkin.js
 */

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';

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

const stepperItems = Array.from(
  document.querySelectorAll('.stepper-item')
);

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

const historyLink =
  document.querySelector('.result-actions a[href*="history"]');

const query = new URLSearchParams(window.location.search);

const tagKey =
  query.get('tag') ||
  query.get('card') ||
  '';

let selectedTag = TAGS[tagKey] || null;
let cardRead = false;
let activeSession = null;
let currentStudentId = '';
let countdownTimer = null;
let retryFlushInProgress = false;

function pendingAttendancePayload(universityId) {
  return {
    universityId,
    sessionId: activeSession?.session_id,
    tagNumber: selectedTag?.number,
    cardUid: selectedTag?.uid,
    sessionEndsAt: new Date(activeSession?.end_time || 0).getTime()
  };
}

async function sendPendingAttendance(item) {
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
        p_university_id: item.universityId,
        p_session_id: item.sessionId,
        p_tag_number: item.tagNumber,
        p_card_uid: item.cardUid
      })
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      payload?.message || `تعذر إرسال الحضور (${response.status}).`
    );
    error.retryable = response.status >= 500 || response.status === 429;
    throw error;
  }
  return payload;
}

async function flushPendingAttendance() {
  if (
    retryFlushInProgress ||
    !navigator.onLine ||
    !window.CheckinOfflineQueue
  ) return;
  retryFlushInProgress = true;
  try {
    const outcome = await window.CheckinOfflineQueue.flush(
      sessionStorage,
      sendPendingAttendance
    );
    const success = outcome.results.find(result => result.success);
    if (success) {
      showResult(success.result, success.item.universityId);
    }
  } finally {
    retryFlushInProgress = false;
  }
}

window.addEventListener('online', flushPendingAttendance);

async function loadActiveSession() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/get_active_session`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: '{}'
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.details ||
      data?.hint ||
      'تعذر تحميل الجلسة النشطة.'
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('لا توجد جلسة نشطة حاليًا.');
  }

  activeSession = data[0];
  const sessionCourseCode =
  document.getElementById('sessionCourseCode');

const resultCourseCode =
  document.getElementById('resultCourseCode');

const sessionRoom =
  document.getElementById('sessionRoom');

const sessionTime =
  document.getElementById('sessionTime');

if (sessionCourseCode) {
  sessionCourseCode.textContent =
    activeSession.course_code || '—';
}

if (resultCourseCode) {
  resultCourseCode.textContent =
    activeSession.course_code || '—';
}

if (sessionRoom) {
  sessionRoom.textContent =
    activeSession.room || '—';
}

if (sessionTime) {
  const start = new Date(activeSession.start_time);
  const end = new Date(activeSession.end_time);

  sessionTime.textContent =
    `${start.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh'
    })} - ${end.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh'
    })}`;
}
  initializeCountdown(activeSession.end_time);

  return activeSession;
}

function initializeCountdown(endTime) {
  if (!countdown || !endTime) {
    return;
  }

  const endTimestamp = new Date(endTime).getTime();

  if (Number.isNaN(endTimestamp)) {
    countdown.textContent = '--:--';
    return;
  }

  function updateCountdown() {
    const secondsLeft = Math.max(
      0,
      Math.floor((endTimestamp - Date.now()) / 1000)
    );

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    countdown.textContent =
      hours > 0
        ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (secondsLeft <= 0 && countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  updateCountdown();

  if (countdownTimer) {
    window.clearInterval(countdownTimer);
  }

  countdownTimer = window.setInterval(updateCountdown, 1000);
}

function showStep(number) {
  steps.forEach((step, index) => {
    step?.classList.toggle(
      'active',
      index === number - 1
    );
  });

  stepperItems.forEach((item, index) => {
    item.classList.toggle(
      'active',
      index === number - 1
    );

    item.classList.toggle(
      'done',
      index < number - 1
    );
  });
}

function formatTime(value) {
  const date = value
    ? new Date(value)
    : new Date();

  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  }).format(date);
}

function setReaderStatus(type, message) {
  if (!readerStatus) {
    return;
  }

  readerStatus.className =
    `reader-status ${type}`;

  if (type === 'waiting') {
    readerStatus.innerHTML = `
      <span class="status-spinner"></span>
      <strong>${message}</strong>
    `;

    return;
  }

  const icon =
    type === 'success'
      ? '✓'
      : '×';

  readerStatus.innerHTML = `
    <span>${icon}</span>
    <strong>${message}</strong>
  `;
}

function markCardAsRead(tag) {
  selectedTag = tag;
  cardRead = true;

  if (readTagLabel) {
    readTagLabel.textContent = tag.label;
  }

  setReaderStatus(
    'success',
    'تمت قراءة البطاقة بنجاح'
  );

  readerStage?.classList.add(
    'read-complete'
  );

  window.setTimeout(() => {
    showStep(2);
    studentIdInput?.focus();
  }, 700);
}

function simulateCardRead() {
  if (!simulateReadButton) {
    return;
  }

  setReaderStatus(
    'waiting',
    'جارٍ قراءة البطاقة...'
  );

  simulateReadButton.disabled = true;

  window.setTimeout(() => {
    markCardAsRead(
      selectedTag || TAGS['1']
    );

    simulateReadButton.disabled = false;
  }, 1000);
}

simulateReadButton?.addEventListener(
  'click',
  simulateCardRead
);

if (selectedTag) {
  window.setTimeout(() => {
    markCardAsRead(selectedTag);
  }, 550);
}

function showFormMessage(text) {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = text;
  formMessage.className =
    'message show error';
}

function statusToArabic(status) {
  const values = {
    Present: 'حاضر',
    Late: 'متأخر',
    Absent: 'غائب',
    Partial: 'حضور جزئي',
    PendingSync: 'بانتظار المزامنة',
    Rejected: 'مرفوض'
  };

  return (
    values[status] ||
    status ||
    'غير محدد'
  );
}

function updateHistoryLink(studentId) {
  if (!historyLink || !studentId) {
    return;
  }

  const encodedStudentId =
    encodeURIComponent(studentId);

  historyLink.href =
    `../history/?student=${encodedStudentId}`;
}

function showResult(result, submittedStudentId) {
  showStep(3);

  const success =
    result?.success === true;

  const studentId =
    result?.university_id ||
    submittedStudentId ||
    currentStudentId;

  currentStudentId = studentId;
  updateHistoryLink(studentId);

  const recordedAt =
    result?.recorded_at ||
    new Date().toISOString();

  if (attendanceTime) {
    attendanceTime.textContent =
      formatTime(recordedAt);
  }

  if (success) {
    if (resultIcon) {
      resultIcon.className =
        'result-icon';

      resultIcon.innerHTML =
        '<span>✓</span>';
    }

    if (resultTitle) {
      resultTitle.textContent =
        result.message ||
        'تم تسجيل حضورك';
    }

    if (resultText) {
      resultText.textContent = result.status === 'PendingSync'
        ? 'سيُرسل الطلب تلقائيًا عند عودة الشبكة خلال صلاحية الجلسة.'
        : result.student_name
          ? `مرحبًا ${result.student_name}، تم حفظ حضورك بنجاح.`
          : 'تم حفظ حضورك بنجاح.';
    }

    if (attendanceStatus) {
      attendanceStatus.textContent =
        statusToArabic(result.status);
    }

    return;
  }

  if (resultIcon) {
    resultIcon.className =
      'result-icon failure';

    resultIcon.innerHTML =
      '<span>×</span>';
  }

  const isDuplicate =
    result?.code ===
    'DUPLICATE_ATTENDANCE';

  if (resultTitle) {
    resultTitle.textContent =
      isDuplicate
        ? 'حضورك مسجل مسبقًا'
        : 'تعذر تسجيل الحضور';
  }

  if (resultText) {
    resultText.textContent =
      result?.message ||
      'لم يتم حفظ حضورك. حاول مرة أخرى أو تواصل مع المعلم.';
  }

  if (attendanceStatus) {
    attendanceStatus.textContent =
      isDuplicate
        ? 'مسجل مسبقًا'
        : 'مرفوض';
  }
}

async function recordAttendance(universityId) {
  if (!selectedTag) {
    throw new Error(
      'لم يتم التعرف على بطاقة NFC.'
    );
  }

  if (!activeSession) {
    throw new Error(
      'لم يتم تحميل بيانات الجلسة النشطة.'
    );
  }

  return sendPendingAttendance(pendingAttendancePayload(universityId));
}

form?.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();

    if (!cardRead || !selectedTag) {
      showStep(1);

      setReaderStatus(
        'error',
        'المس بطاقة NFC أولًا.'
      );

      return;
    }

    const studentId =
      studentIdInput?.value.trim() ||
      '';

    if (!studentId) {
      showFormMessage(
        'أدخل الرقم الجامعي أولًا.'
      );

      studentIdInput?.focus();

      return;
    }

    if (
      !/^[A-Za-z0-9-]{5,40}$/.test(
        studentId
      )
    ) {
      showFormMessage(
        'صيغة الرقم الجامعي غير صحيحة.'
      );

      studentIdInput?.focus();

      return;
    }

    currentStudentId = studentId;
    updateHistoryLink(studentId);

    submitButton?.classList.add(
      'is-loading'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (formMessage) {
      formMessage.className =
        'message';
    }

    try {
      const result =
        await recordAttendance(
          studentId
        );

      showResult(
        result,
        studentId
      );
    } catch (error) {
      const retryable =
        !navigator.onLine ||
        error?.retryable !== false;
      const queued = retryable && window.CheckinOfflineQueue
        ? window.CheckinOfflineQueue.enqueue(
          sessionStorage,
          pendingAttendancePayload(studentId)
        )
        : {queued:false};

      if (queued.queued || queued.reason === 'duplicate') {
        showResult(
          {
            success:true,
            status:'PendingSync',
            message:'حُفظ الطلب مؤقتًا بأمان'
          },
          studentId
        );
        return;
      }
      showResult(
        {
          success: false,
          code:
            'NETWORK_OR_API_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'تعذر الاتصال بخدمة الحضور.'
        },
        studentId
      );
    } finally {
      submitButton?.classList.remove(
        'is-loading'
      );

      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }
);

window.addEventListener(
  'DOMContentLoaded',
  async () => {
    try {
      await loadActiveSession();

      console.log(
        'Active session loaded:',
        activeSession
      );
    } catch (error) {
      console.error(
        'Active session error:',
        error
      );

      showFormMessage(
        error instanceof Error
          ? error.message
          : 'تعذر تحميل الجلسة النشطة.'
      );
    }
  }
);

window.requestAnimationFrame(() => {
  document
    .querySelectorAll('.reveal')
    .forEach((item) => {
      item.classList.add(
        'visible'
      );
    });
});

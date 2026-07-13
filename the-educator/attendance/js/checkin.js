
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

const params = new URLSearchParams(window.location.search);
const tagValue = params.get('tag') || params.get('card') || '';

const tagMap = {
  '1': 'البطاقة 1',
  '2': 'البطاقة 2',
  '3': 'البطاقة 3',
  'NFC-FRONT': 'البطاقة 1',
  'NFC-MIDDLE': 'البطاقة 2',
  'NFC-BACK': 'البطاقة 3'
};

let currentStep = 1;
let cardRead = false;
let secondsLeft = 347;

function showStep(number) {
  currentStep = number;

  steps.forEach((step, index) => {
    step.classList.toggle('active', index === number - 1);
  });

  stepperItems.forEach((item, index) => {
    item.classList.toggle('active', index === number - 1);
    item.classList.toggle('done', index < number - 1);
  });
}

function formatTime(date) {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}

function markCardAsRead(label) {
  cardRead = true;
  readTagLabel.textContent = label;
  readerStatus.className = 'reader-status success';
  readerStatus.innerHTML = '<span>✓</span><strong>تمت قراءة البطاقة بنجاح</strong>';
  readerStage.classList.add('read-complete');

  setTimeout(() => showStep(2), 850);
}

function simulateCardRead() {
  readerStatus.className = 'reader-status waiting';
  readerStatus.innerHTML = '<span class="status-spinner"></span><strong>جارٍ قراءة البطاقة...</strong>';
  simulateReadButton.disabled = true;

  setTimeout(() => {
    const label = tagMap[tagValue] || 'البطاقة 1';
    markCardAsRead(label);
    simulateReadButton.disabled = false;
  }, 1200);
}

simulateReadButton?.addEventListener('click', simulateCardRead);

// If the page was opened by an NFC URL, treat the tag parameter as a successful read.
if (tagMap[tagValue]) {
  setTimeout(() => markCardAsRead(tagMap[tagValue]), 650);
}

function showFormMessage(text) {
  formMessage.textContent = text;
  formMessage.className = 'message show error';
}

function showResult(success, studentId) {
  showStep(3);
  attendanceTime.textContent = formatTime(new Date());

  if (success) {
    resultIcon.className = 'result-icon';
    resultIcon.innerHTML = '<span>✓</span>';
    resultTitle.textContent = 'تم تسجيل حضورك';
    resultText.textContent = `تم حفظ حضور الطالب ${studentId} بنجاح.`;
    attendanceStatus.textContent = 'حاضر';
  } else {
    resultIcon.className = 'result-icon failure';
    resultIcon.innerHTML = '<span>×</span>';
    resultTitle.textContent = 'تعذر تسجيل الحضور';
    resultText.textContent = 'لم يتم حفظ حضورك. حاول مرة أخرى أو تواصل مع المعلم.';
    attendanceStatus.textContent = 'مرفوض';
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!cardRead) {
    showStep(1);
    return;
  }

  const studentId = studentIdInput.value.trim();

  if (!studentId) {
    showFormMessage('أدخل الرقم الجامعي أولًا.');
    studentIdInput.focus();
    return;
  }

  if (!/^[A-Za-z0-9-]{5,20}$/.test(studentId)) {
    showFormMessage('الرقم الجامعي غير صحيح.');
    studentIdInput.focus();
    return;
  }

  submitButton.classList.add('is-loading');
  submitButton.disabled = true;
  formMessage.className = 'message';

  try {
    // Prototype: replace this delay with a Supabase request.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showResult(true, studentId);
  } catch (error) {
    showResult(false, studentId);
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.disabled = false;
  }
});

setInterval(() => {
  if (!countdown || secondsLeft <= 0) return;
  secondsLeft -= 1;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  countdown.textContent = `${minutes}:${seconds}`;
}, 1000);

requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
});

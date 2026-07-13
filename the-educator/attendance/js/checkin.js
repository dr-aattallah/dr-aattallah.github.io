
const form = document.getElementById('checkinForm');
const studentIdInput = document.getElementById('studentId');
const submitButton = document.getElementById('submitButton');
const messageBox = document.getElementById('messageBox');
const tagDisplay = document.getElementById('tagDisplay');

const params = new URLSearchParams(window.location.search);
const tag = params.get('tag') || params.get('card') || '';

const tags = {
  '1': 'البطاقة 1',
  '2': 'البطاقة 2',
  '3': 'البطاقة 3',
  'NFC-FRONT': 'البطاقة 1',
  'NFC-MIDDLE': 'البطاقة 2',
  'NFC-BACK': 'البطاقة 3'
};

if (tags[tag]) tagDisplay.textContent = tags[tag];

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message show ${type}`;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const studentId = studentIdInput.value.trim();

  if (!studentId) {
    showMessage('أدخل الرقم الجامعي أولًا.', 'error');
    studentIdInput.focus();
    return;
  }

  if (!/^[A-Za-z0-9-]{5,20}$/.test(studentId)) {
    showMessage('الرقم الجامعي غير صحيح.', 'error');
    studentIdInput.focus();
    return;
  }

  submitButton.classList.add('is-loading');
  submitButton.disabled = true;
  messageBox.className = 'message';

  try {
    await new Promise((resolve) => setTimeout(resolve, 900));
    showMessage(`تم تجهيز النموذج التجريبي للطالب ${studentId}.`, 'success');
    form.reset();
  } catch (error) {
    showMessage('تعذر تسجيل الحضور. حاول مرة أخرى.', 'error');
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.disabled = false;
  }
});

requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
});

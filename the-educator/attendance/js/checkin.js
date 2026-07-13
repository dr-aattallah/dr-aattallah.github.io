
const form = document.getElementById('checkinForm');
const studentIdInput = document.getElementById('studentId');
const submitButton = document.getElementById('submitButton');
const messageBox = document.getElementById('messageBox');
const tagDisplay = document.getElementById('tagDisplay');
const zoneDisplay = document.getElementById('zoneDisplay');

const params = new URLSearchParams(window.location.search);
const tag = params.get('tag') || params.get('card') || '';
const tagMap = {
  '1': ['Card 1', 'Front zone'],
  '2': ['Card 2', 'Middle zone'],
  '3': ['Card 3', 'Back zone'],
  'NFC-FRONT': ['Card 1', 'Front zone'],
  'NFC-MIDDLE': ['Card 2', 'Middle zone'],
  'NFC-BACK': ['Card 3', 'Back zone']
};

if (tagMap[tag]) {
  tagDisplay.textContent = tagMap[tag][0];
  zoneDisplay.textContent = tagMap[tag][1];
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message show ${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const studentId = studentIdInput.value.trim();

  if (!studentId) {
    showMessage('Please enter your university ID.', 'error');
    studentIdInput.focus();
    return;
  }

  if (!/^[A-Za-z0-9-]{5,20}$/.test(studentId)) {
    showMessage('Enter a valid university ID.', 'error');
    studentIdInput.focus();
    return;
  }

  submitButton.classList.add('is-loading');
  submitButton.disabled = true;
  messageBox.className = 'message';

  try {
    await new Promise((resolve) => setTimeout(resolve, 850));
    showMessage(`Prototype ready. Student ${studentId} would be recorded for CPCS-203.`, 'success');
    form.reset();
  } catch {
    showMessage('Something went wrong. Please try again.', 'error');
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.disabled = false;
  }
});

requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
});

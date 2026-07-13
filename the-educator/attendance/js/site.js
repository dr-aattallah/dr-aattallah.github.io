
const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

function updateClock() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const clock = document.getElementById('liveClock');
  if (clock) clock.textContent = formatter.format(now);
}
updateClock();
setInterval(updateClock, 1000);

let remainingSeconds = 373;
const countdown = document.getElementById('countdown');

setInterval(() => {
  if (!countdown || remainingSeconds <= 0) return;
  remainingSeconds -= 1;
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');
  countdown.textContent = `${minutes}:${seconds}`;
}, 1000);

const stepCards = Array.from(document.querySelectorAll('.step-card'));
const progressDots = [
  document.getElementById('progressOne'),
  document.getElementById('progressTwo'),
  document.getElementById('progressThree')
];

let currentStep = 0;
let animationPaused = false;
let filmTimer;

function showStep(index) {
  stepCards.forEach((card, i) => card.classList.toggle('active', i === index));
  progressDots.forEach((dot, i) => dot?.classList.toggle('active', i === index));
  currentStep = index;
}

function startFilm() {
  clearInterval(filmTimer);
  filmTimer = setInterval(() => {
    if (!animationPaused && stepCards.length) {
      showStep((currentStep + 1) % stepCards.length);
    }
  }, 2600);
}

startFilm();

const pauseButton = document.getElementById('pauseAnimation');
pauseButton?.addEventListener('click', () => {
  animationPaused = !animationPaused;
  pauseButton.textContent = animationPaused ? '▶' : 'Ⅱ';
  pauseButton.setAttribute('aria-label', animationPaused ? 'تشغيل الحركة' : 'إيقاف الحركة');
});

const typingDemo = document.getElementById('typingDemo');
const demoValue = '240123456';
let typingIndex = 0;

setInterval(() => {
  if (!typingDemo || animationPaused) return;
  typingIndex = (typingIndex + 1) % (demoValue.length + 1);
  const visible = demoValue.slice(0, typingIndex);
  typingDemo.textContent = visible.padEnd(demoValue.length, '0');
}, 240);

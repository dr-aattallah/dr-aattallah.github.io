'use strict';

const SUPABASE_URL = 'https://obgmbgsgwxbenglltcwv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM';
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const returnPath = window.AccountRecoveryRules.safeReturnPath(
  params.get('return')
);

function message(text = '', type = '') {
  const element = $('recoveryMessage');
  element.textContent = text;
  element.className = `app-message recovery-message ${type}`.trim();
  element.hidden = !text;
}

function loading(button, active) {
  button.disabled = active;
  button.setAttribute('aria-busy', String(active));
}

function showUpdateMode() {
  $('requestPanel').hidden = true;
  $('updatePanel').hidden = false;
  $('newPassword').focus();
}

$('returnLink').href = returnPath;

db.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') showUpdateMode();
});

db.auth.getSession().then(({ data }) => {
  if (params.get('mode') === 'update' && data.session) {
    showUpdateMode();
  }
});

$('recoveryRequestForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  const email = $('recoveryEmail').value.trim().toLowerCase();
  if (!email) return;

  loading(button, true);
  message();
  const redirect = new URL(
    '/the-educator/reset-password.html?mode=update',
    window.location.origin
  );
  redirect.searchParams.set('return', returnPath);

  await db.auth.resetPasswordForEmail(email, {
    redirectTo: redirect.href
  });

  loading(button, false);
  message(
    'إذا كان البريد مرتبطًا بحساب فستصلك رسالة الاستعادة خلال دقائق. تحقق من البريد غير المرغوب.',
    'success'
  );
});

$('passwordUpdateForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  const password = $('newPassword').value;
  const confirmation = $('confirmPassword').value;
  const validation =
    window.AccountRecoveryRules.validatePassword(password);

  if (!validation.valid) {
    message(
      'استخدم 10 أحرف على الأقل تشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا.',
      'error'
    );
    return;
  }
  if (password !== confirmation) {
    message('كلمتا المرور غير متطابقتين.', 'error');
    return;
  }

  loading(button, true);
  message();
  const { error } = await db.auth.updateUser({ password });
  loading(button, false);

  if (error) {
    message(error.message || 'تعذر تحديث كلمة المرور.', 'error');
    return;
  }

  message('تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.', 'success');
  await db.auth.signOut();
  setTimeout(() => window.location.assign(returnPath), 1200);
});

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const edgeSource = fs.readFileSync(
  path.join(root, 'supabase/functions/student-access/index.ts'),
  'utf8'
);
const migration = fs.readFileSync(
  path.join(
    root,
    'attendance/sql/20260724_secure_student_login_challenges.sql'
  ),
  'utf8'
);
const studentClient = fs.readFileSync(
  path.join(root, 'attendance/js/student.js'),
  'utf8'
);

test('student login uses provider-generated OTP and never a fixed token', () => {
  assert.match(edgeSource, /generateLink/);
  assert.match(edgeSource, /signInWithOtp/);
  assert.match(edgeSource, /verifyOtp/);
  assert.match(edgeSource, /email_otp/);
  assert.doesNotMatch(edgeSource, /TEMPORARY_OTP|246810/);
});

test('student login safely falls back to a one-time email link', () => {
  assert.match(edgeSource, /delivery_method:\s*"magic_link"/);
  assert.match(edgeSource, /emailRedirectTo:\s*STUDENT_PORTAL_URL/);
  assert.match(edgeSource, /shouldCreateUser:\s*true/);
  assert.match(edgeSource, /university_id:\s*universityId/);
});

test('student requests do not depend on Auth admin createUser', () => {
  assert.doesNotMatch(edgeSource, /admin\.auth\.admin\.createUser/);
});

test('pasted sign-in links are restricted to this Supabase project', () => {
  assert.match(
    studentClient,
    /url\.hostname!=='obgmbgsgwxbenglltcwv\.supabase\.co'/
  );
  assert.match(studentClient, /url\.pathname!=='\/auth\/v1\/verify'/);
  assert.match(studentClient, /token_hash:tokenHash/);
});

test('email rate-limit cooldown persists and disables repeat requests', () => {
  assert.match(studentClient, /SEND_COOLDOWN_KEY/);
  assert.match(studentClient, /localStorage\.setItem\(SEND_COOLDOWN_KEY/);
  assert.match(studentClient, /requestCodeButton\.disabled=active/);
  assert.match(studentClient, /retryAfterSeconds/);
});

test('student login limits requests, attempts, and expiry', () => {
  assert.match(edgeSource, /MAX_REQUESTS_PER_15_MINUTES\s*=\s*3/);
  assert.match(edgeSource, /MAX_VERIFY_ATTEMPTS\s*=\s*5/);
  assert.match(edgeSource, /CHALLENGE_MINUTES\s*=\s*10/);
  assert.match(edgeSource, /over_email_send_rate_limit/);
  assert.match(edgeSource, /retry_after_seconds:\s*3600/);
});

test('challenge storage is private and protected by RLS', () => {
  assert.match(
    migration,
    /alter table public\.student_login_challenges enable row level security/i
  );
  assert.match(
    migration,
    /revoke all on public\.student_login_challenges[\s\S]*anon, authenticated/i
  );
});

const assert = require('node:assert/strict');
const test = require('node:test');
const rules = require('../assets/js/account-recovery-rules.js');

test('requires a strong recovery password', () => {
  assert.equal(rules.validatePassword('short').valid, false);
  assert.equal(rules.validatePassword('alllowercase123!').valid, false);
  assert.equal(rules.validatePassword('StrongPass9!').valid, true);
});

test('accepts only local Educator return paths', () => {
  assert.equal(
    rules.safeReturnPath('/the-educator/attendance/admin/'),
    '/the-educator/attendance/admin/'
  );
  assert.equal(
    rules.safeReturnPath('https://malicious.example/'),
    '/the-educator/login.html'
  );
  assert.equal(
    rules.safeReturnPath('//malicious.example/'),
    '/the-educator/login.html'
  );
});

test('accepts only recovery links from the configured Supabase project', () => {
  const token = 'a'.repeat(64);
  assert.equal(
    rules.parseSupabaseEmailToken(
      `https://obgmbgsgwxbenglltcwv.supabase.co/auth/v1/verify?token=${token}&type=recovery`,
      'recovery'
    ),
    token
  );
  assert.equal(
    rules.parseSupabaseEmailToken(
      `https://malicious.example/auth/v1/verify?token=${token}&type=recovery`,
      'recovery'
    ),
    ''
  );
  assert.equal(
    rules.parseSupabaseEmailToken(
      `https://obgmbgsgwxbenglltcwv.supabase.co/auth/v1/verify?token=${token}&type=magiclink`,
      'recovery'
    ),
    ''
  );
});

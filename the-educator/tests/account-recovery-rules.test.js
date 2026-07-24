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

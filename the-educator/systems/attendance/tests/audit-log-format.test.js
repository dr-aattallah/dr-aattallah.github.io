const assert = require('node:assert/strict');
const test = require('node:test');
const format = require('../js/audit-log-format.js');

test('translates known audit actions', () => {
  assert.equal(format.actionLabel('SESSION_ACTIVATED'), 'تفعيل جلسة');
  assert.equal(format.actionLabel('ATTENDANCE_MANUAL'), 'تحضير يدوي');
});

test('keeps unknown actions visible', () => {
  assert.equal(format.actionLabel('CUSTOM_ACTION'), 'CUSTOM_ACTION');
});

test('summarizes status changes without exposing full payloads', () => {
  assert.equal(
    format.summarizeDetails({
      status_before: 'Pending',
      status_after: 'Accepted',
      operation: 'UPDATE'
    }),
    'Pending ← Accepted'
  );
});

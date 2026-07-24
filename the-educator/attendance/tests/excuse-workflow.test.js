'use strict';

const assert = require('node:assert/strict');
const {
  canStudentSubmit,
  decisionNeedsNote,
  validateFile
} = require('../js/excuse-workflow.js');

const file = (name, type, size = 1024) => ({name, type, size});

assert.equal(validateFile(file('excuse.pdf', 'application/pdf')), '');
assert.equal(validateFile(file('scan.JPG', 'image/jpeg')), '');
assert.match(validateFile(file('script.html', 'text/html')), /غير مدعومة/);
assert.match(
  validateFile(file('large.pdf', 'application/pdf', 10 * 1024 * 1024 + 1)),
  /يتجاوز/
);
assert.match(validateFile(file('empty.pdf', 'application/pdf', 0)), /فارغ/);

assert.equal(canStudentSubmit('None'), true);
assert.equal(canStudentSubmit('MoreInfo'), true);
assert.equal(canStudentSubmit('Pending'), false);
assert.equal(canStudentSubmit('Accepted'), false);
assert.equal(canStudentSubmit('Rejected'), false);

assert.equal(decisionNeedsNote('Accepted'), false);
assert.equal(decisionNeedsNote('Rejected'), true);
assert.equal(decisionNeedsNote('MoreInfo'), true);

console.log('excuse workflow: all tests passed');

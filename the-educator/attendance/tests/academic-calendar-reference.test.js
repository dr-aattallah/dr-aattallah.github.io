const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const referencePath = path.join(
  __dirname,
  '../docs/references/academic-calendar-2026-2027.json'
);
const calendar = JSON.parse(fs.readFileSync(referencePath, 'utf8'));

test('calendar uses Riyadh timezone and official term boundaries', () => {
  assert.equal(calendar.scope.timezone, 'Asia/Riyadh');
  assert.equal(calendar.scope.term_start, '2026-08-30');
  assert.equal(calendar.scope.term_end_after_work, '2027-01-07');
  assert.equal(calendar.scope.next_term_start, '2027-01-17');
});

test('calendar excludes official non-teaching periods', () => {
  const ranges = new Map(
    calendar.session_generation.exclude_date_ranges.map(
      (range) => [range.code, range]
    )
  );
  assert.deepEqual(
    [ranges.get('AUTUMN_BREAK').start, ranges.get('AUTUMN_BREAK').end],
    ['2026-11-20', '2026-11-28']
  );
  assert.deepEqual(
    [ranges.get('FINAL_EXAMS').start, ranges.get('FINAL_EXAMS').end],
    ['2026-12-20', '2027-01-05']
  );
});

test('midterm windows do not cancel sessions automatically', () => {
  assert.ok(
    calendar.session_generation.assessment_windows.every(
      (window) => window.automatic_cancellation === false
    )
  );
});

test('source documents include integrity hashes', () => {
  assert.equal(calendar.source_documents.length, 2);
  calendar.source_documents.forEach((source) => {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    const sourcePath = path.join(path.dirname(referencePath), source.file);
    const actualHash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(sourcePath))
      .digest('hex');
    assert.equal(actualHash, source.sha256);
  });
});

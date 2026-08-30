'use strict';

const assert = require('node:assert/strict');
const {summarizeRoster} = require('../js/live-session-calculations.js');

{
  const summary = summarizeRoster([
    {student_name: 'أحمد', attendance_status: 'Present', recorded_at: '2026-07-24T08:00:00Z'},
    {student_name: 'سارة', attendance_status: 'Late', recorded_at: '2026-07-24T08:05:00Z'},
    {student_name: 'نورة', attendance_status: 'Absent', recorded_at: null},
    {student_name: 'محمد', attendance_status: 'Unmarked', recorded_at: null}
  ]);

  assert.equal(summary.student_count, 4);
  assert.equal(summary.present_count, 1);
  assert.equal(summary.late_count, 1);
  assert.equal(summary.absent_count, 1);
  assert.equal(summary.unmarked_count, 1);
  assert.equal(summary.attendance_percentage, 50);
  assert.equal(summary.last_attendee.student_name, 'سارة');
}

assert.deepEqual(summarizeRoster([]), {
  student_count: 0,
  present_count: 0,
  late_count: 0,
  absent_count: 0,
  unmarked_count: 0,
  attendance_percentage: 0,
  last_attendee: null
});

console.log('live session calculations: all tests passed');

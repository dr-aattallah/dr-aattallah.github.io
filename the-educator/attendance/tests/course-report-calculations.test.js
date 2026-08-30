'use strict';

const assert = require('node:assert/strict');
const {
  buildCourseReport,
  sessionIsCounted
} = require('../js/course-report-calculations.js');

const now = new Date('2026-07-24T12:00:00Z');
const session = (id, overrides = {}) => ({
  session_id: id,
  end_time: '2026-07-24T10:00:00Z',
  attendance_required: true,
  is_active: false,
  schedule_status: 'Scheduled',
  ...overrides
});

assert.equal(sessionIsCounted(session('A'), now), true);
assert.equal(
  sessionIsCounted(session('A', {schedule_status: 'Cancelled'}), now),
  false
);
assert.equal(
  sessionIsCounted(session('A', {attendance_required: false}), now),
  false
);
assert.equal(
  sessionIsCounted(session('A', {is_active: true}), now),
  false
);

{
  const report = buildCourseReport(
    [session('S1'), session('S2'), session('S3'), session('S4')],
    {
      S1: [
        {university_id: '1', student_name: 'أحمد', attendance_status: 'Present'},
        {university_id: '2', student_name: 'سارة', attendance_status: 'Absent'}
      ],
      S2: [
        {university_id: '1', student_name: 'أحمد', attendance_status: 'Late'},
        {university_id: '2', student_name: 'سارة', attendance_status: 'Present'}
      ],
      S3: [
        {university_id: '1', student_name: 'أحمد', attendance_status: 'Absent', excuse_status: 'Accepted'},
        {university_id: '2', student_name: 'سارة', attendance_status: 'Late'}
      ],
      S4: [
        {university_id: '1', student_name: 'أحمد', attendance_status: 'Unmarked'},
        {university_id: '2', student_name: 'سارة', attendance_status: 'Present'}
      ]
    },
    now
  );

  assert.equal(report.counted_sessions, 4);
  assert.equal(report.student_count, 2);
  assert.equal(report.denied_count, 2);

  const ahmad = report.students.find((row) => row.university_id === '1');
  const sara = report.students.find((row) => row.university_id === '2');
  assert.equal(ahmad.absence_points, 1.5);
  assert.equal(ahmad.absence_percentage, 37.5);
  assert.equal(ahmad.is_denied, true);
  assert.equal(sara.absence_points, 1.5);
  assert.equal(sara.absence_percentage, 37.5);
  assert.equal(sara.is_denied, true);
}

{
  const report = buildCourseReport(
    [session('S1'), session('S2'), session('S3'), session('S4')],
    {
      S1: [{university_id: '1', attendance_status: 'Absent'}],
      S2: [{university_id: '1', attendance_status: 'Present'}],
      S3: [{university_id: '1', attendance_status: 'Present'}],
      S4: [{university_id: '1', attendance_status: 'Present'}]
    },
    now
  );

  assert.equal(report.students[0].absence_percentage, 25);
  assert.equal(report.students[0].is_denied, false);
}

console.log('course report calculations: all tests passed');

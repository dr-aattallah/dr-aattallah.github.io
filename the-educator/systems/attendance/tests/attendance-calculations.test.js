'use strict';

const assert = require('node:assert/strict');
const {
  groupRecordsByCourse,
  summarizeCourse
} = require('../js/attendance-calculations.js');

const record = (course_code, actual_status, counted_points, excuse_status = 'None') => ({
  course_code,
  actual_status,
  counted_points,
  excuse_status
});

{
  const courses = groupRecordsByCourse([
    record('COURSE-A', 'Present', 0),
    record('COURSE-B', 'Absent', 1),
    record('COURSE-C', 'Absent', 1)
  ]);

  assert.equal(courses.length, 3);
  assert.equal(courses[0].summary.absence_percentage, 0);
  assert.equal(courses[0].summary.is_denied, false);
  assert.equal(courses[1].summary.absence_percentage, 100);
  assert.equal(courses[1].summary.is_denied, true);
  assert.equal(courses[2].summary.absence_percentage, 100);
  assert.equal(courses[2].summary.is_denied, true);
}

{
  const summary = summarizeCourse([
    ...Array.from({ length: 15 }, () => record('COURSE-A', 'Present', 0)),
    ...Array.from({ length: 5 }, () => record('COURSE-A', 'Absent', 1))
  ]);

  assert.equal(summary.absence_points, 5);
  assert.equal(summary.absence_percentage, 25);
  assert.equal(summary.is_denied, false);
}

{
  const summary = summarizeCourse([
    record('COURSE-A', 'Present', 0),
    record('COURSE-A', 'Late', 0.5),
    record('COURSE-A', 'Absent', 0, 'Accepted'),
    record('COURSE-A', 'Absent', 1, 'Rejected')
  ]);

  assert.equal(summary.present_count, 1);
  assert.equal(summary.late_count, 1);
  assert.equal(summary.absent_count, 2);
  assert.equal(summary.absence_points, 1.5);
  assert.equal(summary.absence_percentage, 37.5);
  assert.equal(summary.attendance_percentage, 62.5);
  assert.equal(summary.is_denied, true);
}

{
  const summary = summarizeCourse([
    record('COURSE-A', 'Late', 'not-a-number')
  ]);

  assert.equal(summary.absence_points, 0.5);
  assert.equal(summary.absence_percentage, 50);
  assert.equal(summary.is_denied, true);
}

{
  const summary = summarizeCourse([]);

  assert.deepEqual(summary, {
    counted_sessions: 0,
    present_count: 0,
    late_count: 0,
    absent_count: 0,
    absence_points: 0,
    attendance_percentage: 100,
    absence_percentage: 0,
    is_denied: false
  });
}

{
  const courses = groupRecordsByCourse([
    {...record('COURSE-A', 'Present', 0), course_id: 'offering-1'},
    {...record('COURSE-A', 'Absent', 1), course_id: 'offering-2'}
  ]);

  assert.equal(courses.length, 2);
  assert.equal(courses[0].summary.counted_sessions, 1);
  assert.equal(courses[1].summary.counted_sessions, 1);
}

console.log('attendance calculations: all tests passed');

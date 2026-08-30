'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeTime,
  groupMeetings
} = require('../js/course-plan-editor-utils.js');

test('normalizeTime removes seconds from database time values', () => {
  assert.equal(normalizeTime('09:00:00'), '09:00');
  assert.equal(normalizeTime('13:45'), '13:45');
  assert.equal(normalizeTime(''), '');
});

test('groupMeetings combines matching days into one editable row', () => {
  const grouped = groupMeetings([
    {
      day_of_week: 4,
      start_time: '09:00:00',
      end_time: '10:20:00',
      room: 'H1-2',
      delivery_mode: 'InPerson',
      tag_number: 1
    },
    {
      day_of_week: 0,
      start_time: '09:00:00',
      end_time: '10:20:00',
      room: 'H1-2',
      delivery_mode: 'InPerson',
      tag_number: 1
    },
    {
      day_of_week: 2,
      start_time: '09:00:00',
      end_time: '10:20:00',
      room: 'H1-2',
      delivery_mode: 'InPerson',
      tag_number: 1
    }
  ]);

  assert.deepEqual(grouped, [{
    days: [0, 2, 4],
    start: '09:00',
    end: '10:20',
    room: 'H1-2',
    mode: 'InPerson',
    tag: 1
  }]);
});

test('groupMeetings keeps different schedules in separate rows', () => {
  const grouped = groupMeetings([
    {
      day_of_week: 1,
      start_time: '08:00',
      end_time: '09:20',
      room: 'A',
      delivery_mode: 'InPerson',
      tag_number: 1
    },
    {
      day_of_week: 3,
      start_time: '08:00',
      end_time: '09:20',
      room: 'B',
      delivery_mode: 'Online',
      tag_number: 2
    }
  ]);

  assert.equal(grouped.length, 2);
  assert.deepEqual(grouped[0].days, [1]);
  assert.deepEqual(grouped[1].days, [3]);
  assert.equal(grouped[1].room, 'B');
  assert.equal(grouped[1].mode, 'Online');
});

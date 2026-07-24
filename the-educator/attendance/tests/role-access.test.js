'use strict';

const assert = require('node:assert/strict');
const {
  ROLES,
  hasRole,
  normalizeRole,
  roleForSession
} = require('../js/role-access.js');

const session = (app_metadata = {}, email = 'user@example.edu') => ({
  user: {app_metadata, email}
});

assert.equal(normalizeRole('admin'), ROLES.ADMINISTRATOR);
assert.equal(normalizeRole('Teaching_Assistant'), ROLES.TEACHING_ASSISTANT);
assert.equal(normalizeRole('ta'), ROLES.TEACHING_ASSISTANT);
assert.equal(normalizeRole('unknown'), null);

assert.equal(
  roleForSession(session({attendance_role: 'Instructor'})),
  ROLES.INSTRUCTOR
);
assert.equal(
  roleForSession(session({roles: ['TeachingAssistant']})),
  ROLES.TEACHING_ASSISTANT
);
assert.equal(
  roleForSession(session({}, 'aattallah@kau.edu.sa')),
  ROLES.ADMINISTRATOR
);
assert.equal(
  roleForSession({
    user: {
      app_metadata: {},
      user_metadata: {role: 'Administrator'},
      email: 'student@example.edu'
    }
  }),
  null
);

assert.equal(
  hasRole(
    session({role: 'TeachingAssistant'}),
    [ROLES.ADMINISTRATOR, ROLES.TEACHING_ASSISTANT]
  ),
  true
);
assert.equal(
  hasRole(session({role: 'Student'}), [ROLES.INSTRUCTOR]),
  false
);

console.log('role access: all tests passed');

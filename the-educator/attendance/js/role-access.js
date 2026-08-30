(function roleAccessModule(globalScope) {
  'use strict';

  const ROLES = Object.freeze({
    ADMINISTRATOR: 'Administrator',
    INSTRUCTOR: 'Instructor',
    TEACHING_ASSISTANT: 'TeachingAssistant',
    STUDENT: 'Student'
  });
  const LEGACY_ADMIN_EMAIL = 'aattallah@kau.edu.sa';

  const aliases = new Map([
    ['administrator', ROLES.ADMINISTRATOR],
    ['admin', ROLES.ADMINISTRATOR],
    ['instructor', ROLES.INSTRUCTOR],
    ['teacher', ROLES.INSTRUCTOR],
    ['teachingassistant', ROLES.TEACHING_ASSISTANT],
    ['teaching_assistant', ROLES.TEACHING_ASSISTANT],
    ['teaching-assistant', ROLES.TEACHING_ASSISTANT],
    ['ta', ROLES.TEACHING_ASSISTANT],
    ['student', ROLES.STUDENT]
  ]);

  function normalizeRole(value) {
    const key = String(value || '').trim().toLowerCase();
    return aliases.get(key) || null;
  }

  function roleForSession(session) {
    if (!session?.user) return null;

    // Only app_metadata is trusted because users cannot edit it themselves.
    const metadata = session.user.app_metadata || {};
    const candidates = [
      metadata.attendance_role,
      metadata.role,
      ...(Array.isArray(metadata.roles) ? metadata.roles : [])
    ];

    for (const candidate of candidates) {
      const role = normalizeRole(candidate);
      if (role) return role;
    }

    if (
      session.user.email?.toLowerCase() === LEGACY_ADMIN_EMAIL.toLowerCase()
    ) {
      return ROLES.ADMINISTRATOR;
    }

    return null;
  }

  function hasRole(session, allowedRoles) {
    const role = roleForSession(session);
    return Boolean(role && allowedRoles.includes(role));
  }

  async function requireRole(db, allowedRoles, redirectUrl = './') {
    const {data: {session}, error} = await db.auth.getSession();
    if (error || !hasRole(session, allowedRoles)) {
      if (redirectUrl) location.href = redirectUrl;
      return null;
    }

    const role = roleForSession(session);
    document.documentElement.dataset.attendanceRole = role;
    return {role, session};
  }

  const api = {ROLES, hasRole, normalizeRole, requireRole, roleForSession};
  globalScope.RoleAccess = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

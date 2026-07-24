(function courseReportCalculationsModule(globalScope) {
  'use strict';

  function sessionIsCounted(session, now = new Date()) {
    if (!session || session.attendance_required === false) return false;
    if (session.schedule_status === 'Cancelled') return false;

    const endTime = new Date(session.end_time);
    return !session.is_active &&
      !Number.isNaN(endTime.getTime()) &&
      endTime <= now;
  }

  function pointsForRow(row) {
    if (row?.excuse_status === 'Accepted') return 0;
    if (row?.attendance_status === 'Late') return 0.5;
    if (row?.attendance_status === 'Present') return 0;
    return 1;
  }

  function buildCourseReport(sessions, rosterBySession, now = new Date()) {
    const countedSessions = (Array.isArray(sessions) ? sessions : [])
      .filter((session) => sessionIsCounted(session, now));
    const students = new Map();

    countedSessions.forEach((session) => {
      const roster = rosterBySession?.[session.session_id] || [];

      roster.forEach((row) => {
        const universityId = String(row?.university_id || '').trim();
        if (!universityId) return;

        if (!students.has(universityId)) {
          students.set(universityId, {
            university_id: universityId,
            student_name: row.student_name || '—',
            counted_sessions: 0,
            present_count: 0,
            late_count: 0,
            absent_count: 0,
            absence_points: 0
          });
        }

        const student = students.get(universityId);
        const status = row.attendance_status || 'Unmarked';
        student.counted_sessions += 1;
        student.present_count += status === 'Present' ? 1 : 0;
        student.late_count += status === 'Late' ? 1 : 0;
        student.absent_count +=
          status === 'Absent' || status === 'Unmarked' ? 1 : 0;
        student.absence_points += pointsForRow(row);
      });
    });

    const rows = [...students.values()]
      .map((student) => {
        const absencePercentage = student.counted_sessions
          ? (student.absence_points / student.counted_sessions) * 100
          : 0;

        return {
          ...student,
          attendance_percentage: Math.max(0, 100 - absencePercentage),
          absence_percentage: absencePercentage,
          is_denied: absencePercentage > 25
        };
      })
      .sort((first, second) =>
        second.absence_percentage - first.absence_percentage ||
        first.student_name.localeCompare(second.student_name, 'ar')
      );

    return {
      counted_sessions: countedSessions.length,
      student_count: rows.length,
      denied_count: rows.filter((row) => row.is_denied).length,
      average_attendance_percentage: rows.length
        ? rows.reduce(
          (total, row) => total + row.attendance_percentage,
          0
        ) / rows.length
        : 0,
      students: rows
    };
  }

  const api = {buildCourseReport, pointsForRow, sessionIsCounted};
  globalScope.CourseReportCalculations = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

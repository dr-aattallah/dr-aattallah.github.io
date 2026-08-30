(function attendanceCalculationsModule(globalScope) {
  'use strict';

  const normalizeCourseCode = (value) => {
    const code = String(value || '').trim();
    return code || 'مقرر غير محدد';
  };

  function pointsForRecord(record) {
    if (record?.excuse_status === 'Accepted') return 0;

    return {
      Present: 0,
      Late: 0.5,
      Absent: 1
    }[record?.actual_status] ?? 0;
  }

  function summarizeCourse(records) {
    const safeRecords = Array.isArray(records) ? records : [];
    const countedSessions = safeRecords.length;
    const presentCount = safeRecords.filter(
      (record) => record?.actual_status === 'Present'
    ).length;
    const lateCount = safeRecords.filter(
      (record) => record?.actual_status === 'Late'
    ).length;
    const absentCount = safeRecords.filter(
      (record) => record?.actual_status === 'Absent'
    ).length;
    const absencePoints = safeRecords.reduce(
      (total, record) => total + pointsForRecord(record),
      0
    );
    const absencePercentage = countedSessions
      ? (absencePoints / countedSessions) * 100
      : 0;

    return {
      counted_sessions: countedSessions,
      present_count: presentCount,
      late_count: lateCount,
      absent_count: absentCount,
      absence_points: absencePoints,
      attendance_percentage: Math.max(0, 100 - absencePercentage),
      absence_percentage: absencePercentage,
      is_denied: absencePercentage > 25
    };
  }

  function groupRecordsByCourse(records) {
    const courses = new Map();

    (Array.isArray(records) ? records : []).forEach((record) => {
      const courseCode = normalizeCourseCode(record?.course_code);
      const courseId = String(record?.course_id || '').trim();
      const courseKey = courseId ? `id:${courseId}` : `code:${courseCode}`;

      if (!courses.has(courseKey)) {
        courses.set(courseKey, {
          course_id: courseId || null,
          course_code: courseCode,
          records: []
        });
      }

      courses.get(courseKey).records.push(record);
    });

    return [...courses.values()]
      .sort((first, second) =>
        first.course_code.localeCompare(second.course_code, 'ar')
      )
      .map((course) => ({
        ...course,
        summary: summarizeCourse(course.records)
      }));
  }

  const api = { groupRecordsByCourse, summarizeCourse };
  globalScope.AttendanceCalculations = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function liveSessionCalculationsModule(globalScope) {
  'use strict';

  function summarizeRoster(roster) {
    const rows = Array.isArray(roster) ? roster : [];
    const count = (status) =>
      rows.filter((row) => row?.attendance_status === status).length;
    const present = count('Present');
    const late = count('Late');
    const absent = count('Absent');
    const unmarked = rows.filter(
      (row) => !row?.attendance_status || row.attendance_status === 'Unmarked'
    ).length;
    const attendancePercentage = rows.length
      ? ((present + late) / rows.length) * 100
      : 0;
    const lastAttendee = rows
      .filter((row) =>
        row?.recorded_at && ['Present', 'Late'].includes(row.attendance_status)
      )
      .sort((first, second) =>
        new Date(second.recorded_at).getTime() -
        new Date(first.recorded_at).getTime()
      )[0] || null;

    return {
      student_count: rows.length,
      present_count: present,
      late_count: late,
      absent_count: absent,
      unmarked_count: unmarked,
      attendance_percentage: attendancePercentage,
      last_attendee: lastAttendee
    };
  }

  const api = {summarizeRoster};
  globalScope.LiveSessionCalculations = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

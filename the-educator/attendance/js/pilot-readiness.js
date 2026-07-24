(function pilotReadinessModule(globalScope) {
  'use strict';

  const SCENARIOS = Object.freeze({
    NFC_CHECKIN: 'تسجيل الحضور عبر NFC',
    DUPLICATE_PREVENTION: 'منع التسجيل المكرر',
    LATE_CALCULATION: 'احتساب التأخير',
    MANUAL_ATTENDANCE: 'التحضير اليدوي',
    SESSION_LIFECYCLE: 'فتح وإغلاق الجلسة',
    STUDENT_PRIVACY: 'خصوصية بيانات الطالب',
    EXCUSE_RECALCULATION: 'العذر وإعادة الاحتساب',
    MOBILE_RTL: 'الجوال واتجاه RTL',
    REALTIME_UPDATE: 'التحديث اللحظي'
  });

  const ISSUE_LABELS = Object.freeze({
    duplicate_attendance: 'سجلات حضور مكررة',
    orphan_attendance: 'حضور دون جلسة مرتبطة',
    invalid_session_times: 'جلسات بأوقات غير صحيحة',
    multiple_active_sessions: 'جلسات نشطة إضافية',
    stale_pending_excuses: 'أعذار متأخرة عن 48 ساعة',
    missing_attendance_timestamps: 'حضور دون وقت تسجيل'
  });

  function calculateReadiness(issues, metrics) {
    const issueValues = Object.values(issues || {}).map(Number);
    const blockingIssues = issueValues.filter((value) => value > 0).length;
    const passed = Number(
      metrics?.passed_scenarios ?? metrics?.passed_checks ?? 0
    );
    const required = Number(
      metrics?.required_scenarios || Object.keys(SCENARIOS).length
    );
    const coverage = Math.min(passed / required, 1);
    const score = Math.max(
      0,
      Math.round(100 - blockingIssues * 12 - (1 - coverage) * 28)
    );

    if (blockingIssues === 0 && coverage === 1) {
      return {score, state: 'جاهز للتعميم', tone: 'ready'};
    }
    if (
      blockingIssues <= 1 &&
      coverage >= 2 / 3 &&
      score >= 70
    ) {
      return {score, state: 'جاهز لتجربة محدودة', tone: 'pilot'};
    }
    return {score, state: 'يحتاج معالجة قبل التجربة', tone: 'blocked'};
  }

  function issueTone(value) {
    const count = Number(value || 0);
    if (count === 0) return 'good';
    if (count <= 2) return 'warning';
    return 'bad';
  }

  const api = {ISSUE_LABELS, SCENARIOS, calculateReadiness, issueTone};
  globalScope.PilotReadiness = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

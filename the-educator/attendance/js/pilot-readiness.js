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

  const SCENARIO_DETAILS = Object.freeze({
    NFC_CHECKIN: {
      participants: 2,
      steps: 'افتح جلسة فعلية، ثم يسجل طالبان مختلفان عبر هاتفين يدعمان NFC.',
      acceptance: 'يظهر سجل واحد لكل طالب مع المصدر NFC ووقت التسجيل الصحيح.'
    },
    DUPLICATE_PREVENTION: {
      participants: 1,
      steps: 'يحاول الطالب نفسه تسجيل الحضور مرتين للجلسة ذاتها.',
      acceptance: 'يبقى سجل واحد فقط وتظهر رسالة واضحة للمحاولة الثانية.'
    },
    LATE_CALCULATION: {
      participants: 2,
      steps: 'يسجل طالب قبل حد التأخير وآخر بعده في جلسة حية.',
      acceptance: 'يُسجل الأول حاضرًا والثاني متأخرًا وفق توقيت الجلسة.'
    },
    MANUAL_ATTENDANCE: {
      participants: 1,
      steps: 'يعدل المعلم حالة طالب يدويًا ويكتب سبب التعديل.',
      acceptance: 'تتغير الحالة ويظهر السبب والفاعل في سجل التدقيق.'
    },
    SESSION_LIFECYCLE: {
      participants: 1,
      steps: 'يفتح المعلم جلسة مخططة ثم يغلقها ويحاول التسجيل بعدها.',
      acceptance: 'يُقبل التسجيل أثناء الفتح ويُرفض بعد الإغلاق.'
    },
    STUDENT_PRIVACY: {
      participants: 2,
      steps: 'يسجل طالبان الدخول ويحاول كل منهما الوصول لسجل الآخر.',
      acceptance: 'لا يرى كل طالب إلا بياناته ولا تنكشف بيانات الطالب الآخر.'
    },
    EXCUSE_RECALCULATION: {
      participants: 1,
      steps: 'يرفع طالب عذرًا ثم يقبله المعلم من لوحة الأعذار.',
      acceptance: 'تتحدث حالة العذر والمؤشرات والتقرير دون تعديل يدوي إضافي.'
    },
    MOBILE_RTL: {
      participants: 2,
      steps: 'تُنفذ الرحلة على هاتف iOS وهاتف Android بعرض ضيق.',
      acceptance: 'لا يوجد قص أو تمرير أفقي وتبقى عناصر RTL قابلة للاستخدام.'
    },
    REALTIME_UPDATE: {
      participants: 2,
      steps: 'تبقى شاشة المعلم مفتوحة بينما يسجل طالبان تباعًا.',
      acceptance: 'تظهر السجلات الجديدة دون تحديث يدوي خلال خمس ثوانٍ.'
    }
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

  const api = {
    ISSUE_LABELS,
    SCENARIOS,
    SCENARIO_DETAILS,
    calculateReadiness,
    issueTone
  };
  globalScope.PilotReadiness = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

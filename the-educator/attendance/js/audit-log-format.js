(function auditLogFormatModule(globalScope) {
  'use strict';

  const ACTION_LABELS = Object.freeze({
    SESSION_CREATED: 'إنشاء جلسة',
    SESSION_ACTIVATED: 'تفعيل جلسة',
    SESSION_CLOSED: 'إغلاق جلسة',
    SESSION_UPDATED: 'تحديث جلسة',
    SESSION_DELETED: 'حذف جلسة',
    ATTENDANCE_RECORDED: 'تسجيل حضور',
    ATTENDANCE_UPDATED: 'تعديل حضور',
    ATTENDANCE_MANUAL: 'تحضير يدوي',
    ATTENDANCE_DELETED: 'حذف حضور',
    EXCUSE_SUBMITTED: 'تقديم عذر',
    EXCUSE_STATUS_CHANGED: 'تغيير حالة عذر',
    EXCUSE_UPDATED: 'تحديث عذر',
    EXCUSE_DELETED: 'حذف عذر'
  });

  function actionLabel(action) {
    return ACTION_LABELS[action] || action || 'عملية غير معروفة';
  }

  function summarizeDetails(details) {
    if (!details || typeof details !== 'object') return '—';

    const parts = [];
    if (details.attendance_before || details.attendance_after) {
      parts.push(
        `${details.attendance_before || '—'} ← ${details.attendance_after || '—'}`
      );
    }
    if (details.status_before || details.status_after) {
      parts.push(
        `${details.status_before || '—'} ← ${details.status_after || '—'}`
      );
    }
    if (details.source) parts.push(`المصدر: ${details.source}`);
    return parts.join(' • ') || details.operation || '—';
  }

  const api = {ACTION_LABELS, actionLabel, summarizeDetails};
  globalScope.AuditLogFormat = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

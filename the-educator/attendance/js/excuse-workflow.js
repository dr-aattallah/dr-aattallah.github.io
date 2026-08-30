(function excuseWorkflowModule(globalScope) {
  'use strict';

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);
  const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);

  function fileExtension(fileName) {
    const parts = String(fileName || '').toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  function validateFile(file) {
    if (!file) return 'أرفق ملف العذر.';
    if (!Number.isFinite(file.size) || file.size <= 0) {
      return 'ملف العذر فارغ أو غير صالح.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'حجم الملف يتجاوز 10 ميجابايت.';
    }

    const extension = fileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return 'صيغة الملف غير مدعومة. استخدم PDF أو صورة.';
    }
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return 'نوع الملف غير مدعوم. استخدم PDF أو صورة.';
    }
    return '';
  }

  function canStudentSubmit(status) {
    return !status || status === 'None' || status === 'MoreInfo';
  }

  function decisionNeedsNote(action) {
    return action === 'Rejected' || action === 'MoreInfo';
  }

  const api = {
    MAX_FILE_SIZE,
    canStudentSubmit,
    decisionNeedsNote,
    fileExtension,
    validateFile
  };
  globalScope.ExcuseWorkflow = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function accountRecoveryRulesModule(globalScope) {
  'use strict';

  function validatePassword(password) {
    const value = String(password || '');
    const requirements = {
      length: value.length >= 10,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value)
    };
    return {
      valid: Object.values(requirements).every(Boolean),
      requirements
    };
  }

  function safeReturnPath(value) {
    const path = String(value || '');
    return /^\/the-educator\/[A-Za-z0-9/_-]*(?:\.html)?$/.test(path)
      ? path
      : '/the-educator/login.html';
  }

  const api = { validatePassword, safeReturnPath };
  globalScope.AccountRecoveryRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

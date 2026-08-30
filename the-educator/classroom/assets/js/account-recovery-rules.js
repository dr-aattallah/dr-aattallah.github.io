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

  function parseSupabaseEmailToken(value, expectedType) {
    try {
      const url = new URL(String(value || '').trim());
      const token = url.searchParams.get('token') || '';
      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'obgmbgsgwxbenglltcwv.supabase.co' ||
        url.pathname !== '/auth/v1/verify' ||
        url.searchParams.get('type') !== expectedType ||
        !/^[0-9a-f]{40,128}$/i.test(token)
      ) return '';
      return token;
    } catch {
      return '';
    }
  }

  const api = {
    validatePassword,
    safeReturnPath,
    parseSupabaseEmailToken
  };
  globalScope.AccountRecoveryRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

(() => {
  'use strict';

  const main = document.querySelector('main');

  if (main) {
    if (!main.id) main.id = 'main-content';
    main.setAttribute('tabindex', '-1');

    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = `#${main.id}`;
      skip.textContent =
        document.documentElement.lang === 'ar'
          ? 'تجاوز القائمة والانتقال إلى المحتوى'
          : 'Skip navigation and go to content';
      document.body.prepend(skip);
    }
  }

  document.querySelectorAll('nav:not([aria-label])').forEach((nav) => {
    nav.setAttribute(
      'aria-label',
      document.documentElement.lang === 'ar'
        ? 'التنقل الرئيسي'
        : 'Primary navigation'
    );
  });

  document.querySelectorAll('nav a[href]').forEach((link) => {
    const target = new URL(link.href, window.location.href);
    const current = window.location.pathname.replace(/index\.html$/, '');
    const destination = target.pathname.replace(/index\.html$/, '');

    if (current === destination) {
      link.setAttribute('aria-current', 'page');
    }
  });

  document
    .querySelectorAll(
      '.app-message, .admin-message, .student-message, ' +
        '.live-message, .plan-message, .form-message, .message'
    )
    .forEach((message) => {
      if (!message.hasAttribute('role')) {
        message.setAttribute('role', 'status');
      }
      if (!message.hasAttribute('aria-live')) {
        message.setAttribute('aria-live', 'polite');
      }
      message.setAttribute('aria-atomic', 'true');
    });

  document.querySelectorAll('.spinner').forEach((spinner) => {
    spinner.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.table-wrap').forEach((wrapper, index) => {
    const table = wrapper.querySelector('table');
    if (!table) return;

    const section = wrapper.closest('section, article');
    const heading = section?.querySelector('h1, h2, h3');
    const label =
      heading?.textContent.trim() ||
      (document.documentElement.lang === 'ar'
        ? `جدول البيانات ${index + 1}`
        : `Data table ${index + 1}`);

    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', label);
    wrapper.setAttribute('tabindex', '0');

    if (!table.querySelector('caption')) {
      const caption = document.createElement('caption');
      caption.className = 'visually-hidden';
      caption.textContent = label;
      table.prepend(caption);
    }
  });

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener(
      'invalid',
      (event) => {
        event.target.setAttribute('aria-invalid', 'true');
      },
      true
    );

    form.addEventListener('input', (event) => {
      if (event.target.matches('input, select, textarea')) {
        event.target.removeAttribute('aria-invalid');
      }
    });
  });
})();

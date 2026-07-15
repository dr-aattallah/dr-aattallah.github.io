(() => {
  'use strict';

  /*
   * ==========================================================
   * The Educator — Central Navigation
   * ==========================================================
   * هذا هو الملف المركزي الوحيد لإدارة روابط وقوائم النظام.
   *
   * قواعد مهمة:
   * 1) سجل الطالب متاح من أي مكان.
   * 2) لا يوجد رابط عام لتسجيل الحضور.
   * 3) تسجيل الحضور يتم فقط من رابط بطاقة NFC داخل القاعة.
   * 4) صفحات الأستاذ تظهر لها قائمة إدارة مستقلة.
   */

  const ROOT = '/the-educator/';
  const ATTENDANCE_ROOT = `${ROOT}attendance/`;

  /*
   * عدّل الروابط أو أسماء القوائم هنا فقط.
   */
  const NAVIGATION = {
    educator: [
      { label: 'الرئيسية', href: ROOT, icon: 'home' },
      {
        label: 'نظام الحضور',
        href: `${ATTENDANCE_ROOT}student/`,
        icon: 'attendance',
        featured: true
      },
      {
        label: 'دخول The Educator',
        href: `${ROOT}login.html`,
        icon: 'login'
      },
      { label: 'الملف الشخصي', href: '/', icon: 'portfolio' }
    ],

    student: [
      {
        label: 'بوابة الحضور',
        href: ATTENDANCE_ROOT,
        icon: 'attendance'
      },
      {
        label: 'سجل حضوري',
        href: `${ATTENDANCE_ROOT}student/`,
        icon: 'record',
        featured: true
      },
      {
        label: 'المساعدة',
        href: `${ATTENDANCE_ROOT}student/help.html`,
        icon: 'help'
      },
      {
        label: 'التسجيل عبر NFC فقط',
        href: '#',
        icon: 'nfc',
        disabled: true,
        title:
          'لا يمكن تسجيل الحضور من المنزل. افتح رابط بطاقة NFC داخل القاعة.'
      }
    ],

    admin: [
      {
        label: 'لوحة الإدارة',
        href: `${ATTENDANCE_ROOT}admin/`,
        icon: 'dashboard'
      },
      {
  label: 'المقررات الفصلية',
  href: `${ATTENDANCE_ROOT}admin/courses.html`,
  icon: 'sessions'
},
      {
        label: 'الجلسة الحية',
        href: `${ATTENDANCE_ROOT}admin/live-session.html`,
        icon: 'live',
        featured: true
      },
      {
        label: 'إدارة الجلسات',
        href: `${ATTENDANCE_ROOT}admin/`,
        icon: 'sessions'
      },
      {
        label: 'مراجعة الأعذار',
        href: `${ATTENDANCE_ROOT}admin/excuses.html`,
        icon: 'excuses'
      },
      {
        label: 'بوابة الطالب',
        href: `${ATTENDANCE_ROOT}student/`,
        icon: 'student'
      },
      { label: 'The Educator', href: ROOT, icon: 'educator' }
    ]
  };

  const ICONS = {
    home:
      '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',

    attendance:
      '<path d="M7 3h10v4H7zM5 7h14v14H5z"/><path d="m8 14 2.5 2.5L16 11"/>',

    login:
      '<path d="M11 5H5v14h6M14 8l4 4-4 4M9 12h9"/>',

    portfolio:
      '<rect x="4" y="6" width="16" height="13" rx="2"/><path d="M9 6V4h6v2M4 11h16"/>',

    record:
      '<path d="M6 4h12v17H6zM9 8h6M9 12h6M9 16h4"/>',

    help:
      '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-1 .7-1.5 1.1-1.5 2.2M12 17h.01"/>',

    nfc:
      '<path d="M8 8c2.2-2.2 5.8-2.2 8 0M10.5 10.5c.8-.8 2.2-.8 3 0M12 14v6M5.5 5.5c3.6-3.6 9.4-3.6 13 0"/>',

    dashboard:
      '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',

    live:
      '<circle cx="12" cy="12" r="3"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.7 4.7a10.3 10.3 0 0 0 0 14.6M19.3 4.7a10.3 10.3 0 0 1 0 14.6"/>',

    sessions:
      '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3"/>',

    excuses:
      '<path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h5"/>',

    student:
      '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',

    educator:
      '<path d="m3 9 9-5 9 5-9 5zM7 12v5c3 2.5 7 2.5 10 0v-5M21 9v6"/>'
  };

  function icon(name) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${ICONS[name] || ICONS.home}
      </svg>
    `;
  }

  function currentContext() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('/attendance/admin/')) {
      return 'admin';
    }

    if (path.includes('/attendance/')) {
      return 'student';
    }

    return 'educator';
  }

  function normalizePath(href) {
    try {
      const url = new URL(href, window.location.origin);

      return url.pathname
        .replace(/index\.html$/i, '')
        .replace(/\/$/, '');
    } catch {
      return href;
    }
  }

  function isActive(href) {
    if (!href || href === '#') {
      return false;
    }

    const current = normalizePath(window.location.pathname);
    const target = normalizePath(href);

    if (target.endsWith('/attendance')) {
      return current.endsWith('/attendance');
    }

    if (target.endsWith('/attendance/student')) {
      return current.endsWith('/attendance/student');
    }

    if (target.endsWith('/attendance/admin')) {
      return current.endsWith('/attendance/admin');
    }

    return current === target;
  }

  /*
   * يخفي شريط الصفحة القديم حتى لا تظهر قائمتان.
   * إضافة ملف الملاحة هي التعديل الوحيد المطلوب في كل صفحة.
   */
  function hideLegacyNavigation() {
    const selectors = [
      'body > nav',
      'body > header.nav-shell',
      'body > header.admin-nav',
      'body > header.student-nav',
      'body > header.live-nav',
      'body > header.excuses-nav',
      'body > header.site-nav',
      'body > header.history-nav',
      'body > header.checkin-nav'
    ];

    document
      .querySelectorAll(selectors.join(','))
      .forEach((element) => {
        if (element.closest('#systemNavigationRoot')) {
          return;
        }

        element.classList.add('system-nav-legacy-hidden');
        element.setAttribute('aria-hidden', 'true');
      });
  }

  /*
   * كل تصميم القائمة موجود هنا أيضًا حتى يبقى النظام في ملف واحد.
   */
  function navigationStyles() {
    return `
      :root {
        --system-nav-ink: #10264b;
        --system-nav-muted: #75839c;
        --system-nav-accent: #7185ff;
        --system-nav-mint: #58ceb7;
      }

      .system-nav-legacy-hidden {
        display: none !important;
      }

      #systemNavigationRoot {
        position: relative;
        z-index: 9998;
        width: min(1180px, calc(100% - 28px));
        margin: 14px auto 0;
        font-family:
          "Tajawal",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        direction: rtl;
      }

      .system-navigation {
        min-height: 68px;
        padding: 9px 11px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 16px;
        border: 1px solid rgba(255, 255, 255, 0.82);
        border-radius: 25px;
        background:
          linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.72),
            rgba(246, 249, 255, 0.46)
          ),
          rgba(255, 255, 255, 0.4);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.94),
          inset 0 -1px 0 rgba(132, 150, 196, 0.08),
          0 15px 45px rgba(58, 77, 127, 0.11);
        backdrop-filter: blur(30px) saturate(170%);
        -webkit-backdrop-filter: blur(30px) saturate(170%);
      }

      .system-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 6px 9px;
        color: var(--system-nav-ink);
        font-weight: 800;
        text-decoration: none;
        white-space: nowrap;
      }

      .system-brand-orb {
        width: 39px;
        height: 39px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        color: #fff;
        font-size: 16px;
        background:
          linear-gradient(
            135deg,
            var(--system-nav-mint),
            #72a5ff 68%,
            #8d7dff
          );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.62),
          0 10px 24px rgba(94, 131, 224, 0.25);
      }

      .system-nav-center {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-width: 0;
      }

      .system-nav-item {
        position: relative;
        min-height: 44px;
        padding: 0 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid transparent;
        border-radius: 16px;
        color: var(--system-nav-ink);
        text-decoration: none;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 800;
        overflow: hidden;
        isolation: isolate;
        transition:
          transform 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease,
          color 0.18s ease;
      }

      /*
       * طبقات الزجاج المائي.
       */
      .system-nav-item::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -2;
        opacity: 0;
        background:
          radial-gradient(
            circle at 18% 0%,
            rgba(255, 255, 255, 0.95),
            transparent 45%
          ),
          linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.72),
            rgba(116, 143, 255, 0.12) 48%,
            rgba(92, 215, 188, 0.16)
          );
        transition: opacity 0.18s ease;
      }

      .system-nav-item::after {
        content: "";
        position: absolute;
        width: 68px;
        height: 68px;
        top: -48px;
        left: 10%;
        border-radius: 50%;
        opacity: 0;
        background: rgba(255, 255, 255, 0.85);
        filter: blur(13px);
        transition:
          opacity 0.18s ease,
          transform 0.35s ease;
      }

      .system-nav-item:hover,
      .system-nav-item:focus-visible,
      .system-nav-item.is-active {
        transform: translateY(-1px) scale(1.015);
        border-color: rgba(255, 255, 255, 0.88);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.96),
          inset 0 -1px 0 rgba(102, 125, 188, 0.08),
          0 10px 25px rgba(69, 91, 150, 0.12),
          0 0 0 1px rgba(112, 137, 216, 0.05);
      }

      .system-nav-item:hover::before,
      .system-nav-item:focus-visible::before,
      .system-nav-item.is-active::before {
        opacity: 1;
      }

      .system-nav-item:hover::after,
      .system-nav-item:focus-visible::after {
        opacity: 0.78;
        transform: translateX(85px);
      }

      .system-nav-item.is-featured {
        color: #fff;
        background:
          linear-gradient(135deg, #6d83ff, #8279f6);
        border-color: rgba(255, 255, 255, 0.48);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.35),
          0 10px 26px rgba(103, 115, 237, 0.24);
      }

      .system-nav-item.is-featured::before {
        background:
          linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.04)
          );
      }

      .system-nav-item.is-disabled {
        cursor: help;
        color: var(--system-nav-muted);
        opacity: 0.72;
      }

      .system-nav-item svg {
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .system-nav-side {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .system-menu-button {
        display: none;
        width: 44px;
        height: 44px;
        border: 1px solid rgba(255, 255, 255, 0.82);
        border-radius: 15px;
        color: var(--system-nav-ink);
        background: rgba(255, 255, 255, 0.44);
        cursor: pointer;
      }

      .system-menu-button span {
        display: block;
        width: 18px;
        height: 2px;
        margin: 4px auto;
        border-radius: 4px;
        background: currentColor;
      }

      .system-context-label {
        padding: 7px 11px;
        border-radius: 999px;
        color: var(--system-nav-muted);
        background: rgba(255, 255, 255, 0.38);
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      }

      .system-mobile-panel {
        display: none;
      }

      @media (max-width: 980px) {
        .system-navigation {
          grid-template-columns: auto 1fr auto;
        }

        .system-nav-center {
          display: none;
        }

        .system-menu-button {
          display: block;
        }

        .system-mobile-panel {
          margin-top: 9px;
          padding: 9px;
          display: grid;
          gap: 5px;
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 23px;
          background: rgba(248, 251, 255, 0.78);
          box-shadow:
            0 18px 48px rgba(58, 77, 127, 0.14);
          backdrop-filter: blur(30px) saturate(165%);
          -webkit-backdrop-filter:
            blur(30px) saturate(165%);
          transform-origin: top;
          animation: systemNavOpen 0.18s ease;
        }

        .system-mobile-panel[hidden] {
          display: none;
        }

        .system-mobile-panel .system-nav-item {
          justify-content: flex-start;
          width: 100%;
        }

        @keyframes systemNavOpen {
          from {
            opacity: 0;
            transform:
              translateY(-7px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }
      }

      @media (max-width: 560px) {
        #systemNavigationRoot {
          width: calc(100% - 18px);
          margin-top: 9px;
        }

        .system-navigation {
          min-height: 60px;
          border-radius: 21px;
          padding: 7px 8px;
          gap: 7px;
        }

        .system-brand span:last-child {
          display: none;
        }

        .system-brand-orb {
          width: 37px;
          height: 37px;
        }

        .system-context-label {
          max-width: 132px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    `;
  }

  function itemMarkup(item) {
    const active = isActive(item.href);

    const classes = [
      'system-nav-item',
      item.featured ? 'is-featured' : '',
      item.disabled ? 'is-disabled' : '',
      active ? 'is-active' : ''
    ]
      .filter(Boolean)
      .join(' ');

    const attributes = [
      `class="${classes}"`,
      `href="${item.href}"`,
      item.title ? `title="${item.title}"` : '',
      item.disabled ? 'aria-disabled="true"' : '',
      active ? 'aria-current="page"' : ''
    ]
      .filter(Boolean)
      .join(' ');

    return `
      <a ${attributes}>
        ${icon(item.icon)}
        <span>${item.label}</span>
      </a>
    `;
  }

  function preventDisabledLinks(root) {
    root
      .querySelectorAll('.system-nav-item.is-disabled')
      .forEach((item) => {
        item.addEventListener(
          'click',
          (event) => event.preventDefault()
        );
      });
  }

  function renderNavigation() {
    if (document.getElementById('systemNavigationRoot')) {
      return;
    }

    hideLegacyNavigation();

    const context = currentContext();
    const items = NAVIGATION[context];

    const contextLabel = {
      educator: 'المنصة الأكاديمية',
      student: 'بوابة الحضور',
      admin: 'لوحة المعلم'
    }[context];

    const root = document.createElement('div');

    root.id = 'systemNavigationRoot';

    root.innerHTML = `
      <style>${navigationStyles()}</style>

      <nav
        class="system-navigation"
        aria-label="التنقل الرئيسي"
      >
        <a
          class="system-brand"
          href="${ROOT}"
          aria-label="The Educator"
        >
          <span class="system-brand-orb">E</span>
          <span>The Educator</span>
        </a>

        <div class="system-nav-center">
          ${items.map(itemMarkup).join('')}
        </div>

        <div class="system-nav-side">
          <span class="system-context-label">
            ${contextLabel}
          </span>

          <button
            class="system-menu-button"
            type="button"
            aria-label="فتح القائمة"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        class="system-mobile-panel"
        hidden
      >
        ${items.map(itemMarkup).join('')}
      </div>
    `;

    document.body.prepend(root);

    preventDisabledLinks(root);

    root
      .querySelectorAll('.system-nav-item:not(.is-disabled)')
      .forEach((link) => {
        link.addEventListener('click', (event) => {
          const href = link.getAttribute('href');

          if (!href || href === '#') {
            return;
          }

          event.preventDefault();
          window.location.assign(
            new URL(href, window.location.origin).href
          );
        });
      });

    const button =
      root.querySelector('.system-menu-button');

    const panel =
      root.querySelector('.system-mobile-panel');

    button?.addEventListener('click', () => {
      const open = panel.hasAttribute('hidden');

      panel.toggleAttribute('hidden', !open);

      button.setAttribute(
        'aria-expanded',
        String(open)
      );
    });

    document.addEventListener('click', (event) => {
      if (
        !root.contains(event.target) &&
        !panel.hasAttribute('hidden')
      ) {
        panel.setAttribute('hidden', '');

        button?.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    });

    const legacyObserver = new MutationObserver(() => {
      hideLegacyNavigation();
    });

    legacyObserver.observe(document.body, {
      childList: true,
      subtree: false
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      renderNavigation,
      { once: true }
    );
  } else {
    renderNavigation();
  }
})();

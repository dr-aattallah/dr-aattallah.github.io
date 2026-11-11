(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('.language-switch');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-menu');
  const archiveButton = document.querySelector('.archive-toggle');
  const archive = document.getElementById('publication-archive');
  const backTop = document.querySelector('.back-top');
  const queryLanguage = new URLSearchParams(location.search).get('lang');
  let language = queryLanguage === 'ar' || queryLanguage === 'en' ? queryLanguage : 'en';

  function applyLanguage(nextLanguage) {
    language = nextLanguage;
    const arabic = language === 'ar';
    root.lang = language;
    root.dir = arabic ? 'rtl' : 'ltr';
    document.title = arabic
      ? 'الدكتور عبدالعزيز عطاءالله — معاينة التصميم الثاني'
      : 'Dr. Abdulaziz Attaallah — Design Two Preview';

    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-alt-en][data-alt-ar]').forEach((element) => {
      element.alt = element.dataset[`alt${arabic ? 'Ar' : 'En'}`];
    });
    document.querySelectorAll('[data-aria-en][data-aria-ar]').forEach((element) => {
      element.setAttribute('aria-label', element.dataset[`aria${arabic ? 'Ar' : 'En'}`]);
    });
    languageButton.textContent = arabic ? 'English' : 'العربية';
    languageButton.setAttribute('aria-label', arabic ? 'Switch to English' : 'التبديل إلى العربية');
    backTop.setAttribute('aria-label', arabic ? 'العودة إلى أعلى الصفحة' : 'Back to top');
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }

  function closeMenu() {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  languageButton.addEventListener('click', () => applyLanguage(language === 'en' ? 'ar' : 'en'));
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  archiveButton.addEventListener('click', () => {
    const expanded = archiveButton.getAttribute('aria-expanded') === 'true';
    archiveButton.setAttribute('aria-expanded', String(!expanded));
    archive.hidden = expanded;
    if (!expanded) archive.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  });

  addEventListener('scroll', () => backTop.classList.toggle('visible', scrollY > 650), {passive:true});
  backTop.addEventListener('click', () => scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}));
  applyLanguage(language);
})();

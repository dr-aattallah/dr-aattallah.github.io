(()=>{
  'use strict';

  const legacyCounters=[...document.querySelectorAll('[data-visitor-counter]')];
  if(!legacyCounters.length)return;

  // Replace the portfolio's legacy counter UI with the shared counter component.
  legacyCounters.forEach((legacy)=>{
    const shared=document.createElement('span');
    shared.dataset.visitorCounter='academic-portfolio';
    shared.dataset.label=document.documentElement.lang==='ar'?'الزوار':'Visitors';
    shared.dataset.loadingLabel=document.documentElement.lang==='ar'?'جاري تحميل عدد الزوار…':'Counting visitors…';
    shared.dataset.errorLabel=document.documentElement.lang==='ar'?'عداد الزوار غير متاح':'Visitor count unavailable';
    shared.textContent=shared.dataset.loadingLabel;
    legacy.replaceWith(shared);
  });

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='the-educator/infrastructure/analytics/visitor-counter.css';
  document.head.appendChild(css);

  const script=document.createElement('script');
  script.src='the-educator/infrastructure/analytics/visitor-counter.js';
  script.dataset.namespace='academic-portfolio';
  document.body.appendChild(script);
})();

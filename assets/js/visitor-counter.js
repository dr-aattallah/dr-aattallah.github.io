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

  function updateCounterLanguage(){
    const ar=document.documentElement.lang==='ar';
    document.querySelectorAll('[data-visitor-counter]').forEach(el=>{
      el.dataset.label=ar?'الزوار':'Visitors';
      el.dataset.loadingLabel=ar?'جاري تحميل عدد الزوار…':'Counting visitors…';
      el.dataset.errorLabel=ar?'عداد الزوار غير متاح':'Visitor count unavailable';
      const label=el.querySelector('[data-counter-label]');
      if(label)label.textContent=el.dataset.label;
      const number=el.querySelector('[data-counter-count], [data-counter-value]');
      if(number && /^\\d[\\d,٬]*$/.test(number.textContent.trim())){
        const n=Number(number.textContent.replace(/[^0-9]/g,''));
        if(Number.isFinite(n))number.textContent=new Intl.NumberFormat(ar?'ar-SA':'en-US').format(n);
      }
      el.setAttribute('aria-label',el.dataset.label);
    });
  }
  window.addEventListener('portfolio:languagechange',updateCounterLanguage);
  new MutationObserver(updateCounterLanguage).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='the-educator/infrastructure/analytics/visitor-counter.css';
  document.head.appendChild(css);

  const script=document.createElement('script');
  script.src='the-educator/infrastructure/analytics/visitor-counter.js';
  script.dataset.namespace='academic-portfolio';
  document.body.appendChild(script);
})();

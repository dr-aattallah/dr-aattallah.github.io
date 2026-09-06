(()=>{
  if(window.__CPCS351_NAV_SHIM__)return;window.__CPCS351_NAV_SHIM__=true;
  const run=()=>window.CPCS351Navigation?.refresh?.();
  if(window.CPCS351Navigation){run();return;}
  if(document.querySelector('script[data-cpcs-study-loader]'))return;
  const s=document.createElement('script');s.src='/the-educator/learning/courses/cpcs351/study.js';s.dataset.cpcsStudyLoader='1';s.onload=run;document.head.append(s);
})();

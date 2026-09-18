(()=>{
  'use strict';
  if(window.__CPCS351_LIQUID_NAV__)return;
  window.__CPCS351_LIQUID_NAV__=1;

  const SELECTOR='.course-header,.topbar';

  function point(el,event){
    const r=el.getBoundingClientRect();
    el.style.setProperty('--glass-x',`${event.clientX-r.left}px`);
    el.style.setProperty('--glass-y',`${event.clientY-r.top}px`);
  }

  function indicator(nav,target){
    if(!nav||!target)return;
    const nr=nav.getBoundingClientRect(),tr=target.getBoundingClientRect();
    nav.style.setProperty('--liquid-x',`${tr.left-nr.left}px`);
    nav.style.setProperty('--liquid-y',`${tr.top-nr.top}px`);
    nav.style.setProperty('--liquid-w',`${tr.width}px`);
    nav.style.setProperty('--liquid-h',`${tr.height}px`);
    nav.classList.add('liquid-nav-ready');
  }

  function active(nav){
    return nav.querySelector('[aria-current="page"],button[aria-expanded="true"]')||
      nav.querySelector('a,button');
  }

  function wire(host){
    if(!host||host.dataset.liquidNavReady)return;
    host.dataset.liquidNavReady='1';
    host.classList.add('liquid-glass-nav');

    host.addEventListener('pointermove',e=>point(host,e),{passive:true});
    host.addEventListener('pointerleave',()=>{
      host.style.removeProperty('--glass-x');
      host.style.removeProperty('--glass-y');
      const nav=host.querySelector('.course-header-nav,.edu-top-actions');
      if(nav)indicator(nav,active(nav));
    },{passive:true});

    const nav=host.querySelector('.course-header-nav,.edu-top-actions');
    if(!nav)return;
    requestAnimationFrame(()=>indicator(nav,active(nav)));

    nav.addEventListener('pointerover',e=>{
      const item=e.target.closest('a,button');
      if(item&&nav.contains(item))indicator(nav,item);
    });
    nav.addEventListener('focusin',e=>{
      const item=e.target.closest('a,button');
      if(item)indicator(nav,item);
    });
    nav.addEventListener('pointerleave',()=>indicator(nav,active(nav)),{passive:true});
    nav.addEventListener('click',e=>{
      const item=e.target.closest('a,button');
      if(!item)return;
      const r=item.getBoundingClientRect();
      item.style.setProperty('--ripple-x',`${e.clientX-r.left}px`);
      item.style.setProperty('--ripple-y',`${e.clientY-r.top}px`);
      item.classList.remove('liquid-ripple');
      void item.offsetWidth;
      item.classList.add('liquid-ripple');
      setTimeout(()=>item.classList.remove('liquid-ripple'),650);
    });

    new ResizeObserver(()=>indicator(nav,active(nav))).observe(nav);
  }

  function init(){document.querySelectorAll(SELECTOR).forEach(wire)}
  window.CPCS351LiquidNav={init};
  new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
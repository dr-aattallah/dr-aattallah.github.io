(()=>{
  'use strict';
  const DEFAULT_ENDPOINT='https://abacus.jasoncameron.dev';
  const SCRIPT=document.currentScript;
  const endpoint=(SCRIPT?.dataset.endpoint||DEFAULT_ENDPOINT).replace(/\/$/,'');
  const namespace=SCRIPT?.dataset.namespace||location.hostname.replace(/[^a-z0-9._-]/gi,'-')||'the-educator';
  const seen=new Map();

  function clean(value,fallback){
    const out=String(value||'').trim().toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
    return out||fallback;
  }
  function format(value){return new Intl.NumberFormat(document.documentElement.lang||'en').format(value)}
  function render(el,value){
    el.classList.remove('visitor-counter--loading','visitor-counter--error');
    el.innerHTML=`<span class="visitor-counter__dot" aria-hidden="true"></span><span class="visitor-counter__label">${el.dataset.label||'Visits'}</span><strong class="visitor-counter__value">${format(value)}</strong>`;
    el.setAttribute('aria-label',`${el.dataset.label||'Visits'}: ${format(value)}`);
  }
  function fail(el){
    const fallback=Number(el.dataset.fallbackValue);
    if(Number.isFinite(fallback)){
      render(el,fallback);
      el.classList.add('visitor-counter--stale');
      return;
    }
    el.classList.remove('visitor-counter--loading');el.classList.add('visitor-counter--error');
    el.textContent=el.dataset.errorLabel||'Visit count unavailable';
  }
  async function count(el){
    const key=clean(el.dataset.visitorCounter||el.dataset.key||location.pathname,'page');
    const ns=clean(el.dataset.namespace||namespace,'the-educator');
    const action=clean(el.dataset.action||'view','view');
    const id=`${ns}/${action}/${key}`;
    el.classList.add('visitor-counter','visitor-counter--loading');
    el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.textContent=el.dataset.loadingLabel||'Counting visits…';
    try{
      let promise=seen.get(id);
      if(!promise){
        const counterKey=`${ns}/${key}`;
        const request=async verb=>{
          const controller=new AbortController();
          const timer=setTimeout(()=>controller.abort(),8000);
          try{
            const response=await fetch(`${endpoint}/${verb}/${counterKey}`,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',headers:{Accept:'application/json'},signal:controller.signal});
            if(!response.ok)throw new Error(`Counter ${response.status}`);
            return response.json();
          }finally{clearTimeout(timer)}
        };
        promise=(async()=>{
          try{return await request(action==='view'?'hit':'get').catch(()=>request('get'))}
          catch(firstError){
            await new Promise(resolve=>setTimeout(resolve,1600));
            return request('get');
          }
        })();
        seen.set(id,promise);
      }
      const data=await promise;
      const value=Number(data.value??data.count??data.data?.count);
      if(!Number.isFinite(value))throw new Error('Invalid counter response');
      render(el,value);
    }catch(error){console.warn('[VisitorCounter]',error);seen.delete(id);fail(el)}
  }
  function init(root=document){root.querySelectorAll('[data-visitor-counter]').forEach(el=>{if(!el.dataset.visitorCounterReady){el.dataset.visitorCounterReady='1';count(el)}})}
  window.VisitorCounter={init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();

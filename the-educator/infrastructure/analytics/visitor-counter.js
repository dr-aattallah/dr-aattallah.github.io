(()=>{
  'use strict';
  const DEFAULT_ENDPOINT='https://api.counterapi.dev/v1';
  const SCRIPT=document.currentScript;
  const endpoint=(SCRIPT?.dataset.endpoint||DEFAULT_ENDPOINT).replace(/\/$/,'');
  const namespace=SCRIPT?.dataset.namespace||location.hostname.replace(/[^a-z0-9_-]/gi,'-')||'the-educator';
  const seen=new Map();

  function clean(value,fallback){
    const out=String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');
    return out||fallback;
  }
  function format(value){return new Intl.NumberFormat(document.documentElement.lang||'en').format(value)}
  function render(el,value){
    el.classList.remove('visitor-counter--loading','visitor-counter--error');
    el.innerHTML=`<span class="visitor-counter__dot" aria-hidden="true"></span><span class="visitor-counter__label">${el.dataset.label||'Visits'}</span><strong class="visitor-counter__value">${format(value)}</strong>`;
    el.setAttribute('aria-label',`${el.dataset.label||'Visits'}: ${format(value)}`);
  }
  function fail(el){
    el.classList.remove('visitor-counter--loading');el.classList.add('visitor-counter--error');
    el.textContent=el.dataset.errorLabel||'Visit count unavailable';
  }
  async function count(el){
    const key=clean(el.dataset.visitorCounter||el.dataset.key||location.pathname,'page');
    const ns=clean(el.dataset.namespace||namespace,'the-educator');
    const id=`${ns}/${key}`;
    el.classList.add('visitor-counter','visitor-counter--loading');
    el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.textContent=el.dataset.loadingLabel||'Counting visits…';
    try{
      let promise=seen.get(id);
      if(!promise){
        promise=fetch(`${endpoint}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/up`,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error(`Counter ${r.status}`);return r.json()});
        seen.set(id,promise);
      }
      const data=await promise;
      const value=Number(data.count??data.value??data.data?.count);
      if(!Number.isFinite(value))throw new Error('Invalid counter response');
      render(el,value);
    }catch(error){console.warn('[VisitorCounter]',error);seen.delete(id);fail(el)}
  }
  function init(root=document){root.querySelectorAll('[data-visitor-counter]').forEach(el=>{if(!el.dataset.visitorCounterReady){el.dataset.visitorCounterReady='1';count(el)}})}
  window.VisitorCounter={init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();
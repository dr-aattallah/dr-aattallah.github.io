(()=>{
'use strict';
const CFG={safeH:650,safeW:1210,minZoom:.68,maxZoom:1.08,step:.05};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function normalize(card){
 card.classList.add('edu-autofit');
 qa('details',card).forEach(d=>d.open=true);
 card.style.removeProperty('zoom');
 card.dataset.eduZoom='1';
}
function measure(card){
 const h=card.scrollHeight,w=card.scrollWidth;
 return Math.min(1,CFG.safeH/Math.max(h,1),CFG.safeW/Math.max(w,1));
}
function applyZoom(card,z){
 z=Math.max(CFG.minZoom,Math.min(CFG.maxZoom,z));
 card.style.setProperty('zoom',z,'important');
 card.dataset.eduZoom=String(z);
 return z;
}
function fitCard(card){
 normalize(card);
 requestAnimationFrame(()=>{
   const z=measure(card);
   applyZoom(card,z<.995?z*.985:1);
 });
}
function fitAll(){
 const cards=qa('.reveal .slides .slide-card');
 if(!cards.length)return false;
 cards.forEach(fitCard);
 qa('.slide-card details').forEach(d=>d.open=true);
 Reveal.sync?.();Reveal.layout?.();
 document.documentElement.classList.add('edu-autofit-ready');
 return true;
}
function currentCard(){return q('.reveal .slides section.present .slide-card')||q('.reveal .slides .slide-card')}
function manual(delta){
 const card=currentCard();if(!card)return;
 const now=parseFloat(card.dataset.eduZoom||getComputedStyle(card).zoom||1)||1;
 applyZoom(card,now+delta);
}
function reset(){const card=currentCard();if(card)fitCard(card)}
function controls(){
 if(q('.edu-zoom-controls'))return;
 const box=document.createElement('div');box.className='edu-zoom-controls';box.setAttribute('aria-label','Slide size controls');
 box.innerHTML='<button type="button" data-z="-">−</button><button type="button" data-z="0" title="Fit slide">Fit</button><button type="button" data-z="+">+</button>';
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.dataset.z==='-'?manual(-CFG.step):b.dataset.z==='+'?manual(CFG.step):reset()});
 document.body.append(box);
}
function boot(){
 let tries=0;const timer=setInterval(()=>{tries++;
   if(window.Reveal&&Reveal.isReady?.()&&q('.reveal .slides .slide-card')){
     clearInterval(timer);controls();requestAnimationFrame(()=>requestAnimationFrame(fitAll));
     Reveal.on?.('slidechanged',e=>{const c=q('.slide-card',e.currentSlide);if(c&&!c.dataset.eduZoom)fitCard(c)});
     window.addEventListener('resize',()=>{clearTimeout(window.__eduFitTimer);window.__eduFitTimer=setTimeout(fitAll,120)});
   }else if(tries>120)clearInterval(timer);
 },100);
}
window.EducatorAutoPresentation={run:fitAll,zoomIn:()=>manual(CFG.step),zoomOut:()=>manual(-CFG.step),fit:reset};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
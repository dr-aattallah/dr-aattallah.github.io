(()=>{
'use strict';
const CFG={safeH:650,minBody:18,minH2:30,minH1:40,maxPasses:6};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const px=(el,p,v)=>el&&el.style.setProperty(p,v+'px','important');
const overflow=c=>c.scrollHeight>CFG.safeH+2||c.scrollWidth>c.clientWidth+2;
function normalize(card){
 card.classList.add('edu-autofit');
 qa('details',card).forEach(d=>d.open=true);if(card.matches('details'))card.open=true;
 ['height','min-height','max-height','overflow'].forEach(p=>card.style.removeProperty(p));
 card.classList.remove('edu-dense');
}
function shrink(card,pass){
 const ratio=Math.max(.78,1-pass*.035);
 qa('h1',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH1,54*ratio)));
 qa('h2',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH2,42*ratio)));
 qa('h3',card).forEach(x=>px(x,'font-size',Math.max(24,29*ratio)));
 qa('p,li,td,th,summary,figcaption',card).forEach(x=>px(x,'font-size',Math.max(CFG.minBody,23*ratio)));
}
function continued(section,selector,min){
 const source=qa(selector,q('.slide-card',section)).find(x=>x.children.length>=min);if(!source)return false;
 const items=[...source.children],half=Math.ceil(items.length/2),clone=section.cloneNode(true),c2=q('.slide-card',clone);
 const all2=qa(selector,c2),idx=qa(selector,q('.slide-card',section)).indexOf(source),dest=all2[idx];if(!dest)return false;
 items.slice(half).forEach(x=>x.remove());[...dest.children].slice(0,half).forEach(x=>x.remove());
 const h=q('h1,h2,h3',c2);if(h&&!/continued/i.test(h.textContent))h.textContent=(h.textContent||'')+' · Continued';
 section.after(clone);return true;
}
function splitTable(section){
 const table=q('.slide-card table',section);if(!table)return false;
 const bodies=[...table.tBodies],rows=bodies.flatMap(b=>[...b.rows]);if(rows.length<4)return false;
 const half=Math.ceil(rows.length/2),clone=section.cloneNode(true),t2=q('.slide-card table',clone);
 const rows2=[...t2.tBodies].flatMap(b=>[...b.rows]);
 rows.slice(half).forEach(x=>x.remove());rows2.slice(0,half).forEach(x=>x.remove());
 const h=q('.slide-card h1,.slide-card h2,.slide-card h3',clone);if(h&&!/continued/i.test(h.textContent))h.textContent=(h.textContent||'')+' · Continued';
 section.after(clone);return true;
}
function fit(section,depth=0){
 const card=q('.slide-card',section);if(!card||depth>6||card.dataset.eduFit==='done')return;
 normalize(card);
 for(let p=0;p<CFG.maxPasses&&overflow(card);p++)shrink(card,p+1);
 if(overflow(card)){
   const did=splitTable(section)||continued(section,'ul,ol',5);
   if(did){card.dataset.eduFit='done';fit(section,depth+1);fit(section.nextElementSibling,depth+1);return;}
 }
 /* Never clip: if a mixed-content slide is still too tall, allow Reveal to scale the whole slide.
    This is safer than hiding content below an artificial card boundary. */
 card.dataset.eduFit='done';
}
function fitAll(){
 const deck=q('.reveal .slides');if(!deck||qa(':scope > section',deck).length<2)return false;
 qa(':scope > section',deck).forEach(s=>fit(s));
 qa('.slide-card details',deck).forEach(d=>d.open=true);
 Reveal.sync?.();Reveal.layout?.();document.documentElement.classList.add('edu-autofit-ready');return true;
}
function boot(){let tries=0;const timer=setInterval(()=>{tries++;if(window.Reveal&&Reveal.isReady?.()&&q('.reveal .slides .classroom-slide')){clearInterval(timer);requestAnimationFrame(()=>requestAnimationFrame(fitAll));}else if(tries>100)clearInterval(timer)},100)}
window.EducatorAutoPresentation={run:fitAll};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
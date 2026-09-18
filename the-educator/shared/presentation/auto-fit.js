(()=>{
'use strict';
const CFG={minH:500,maxH:660,targetH:610,minBody:18,minH2:31,minH1:42,maxPasses:8};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const px=(el,p,v)=>el&&el.style.setProperty(p,v+'px','important');
const overflow=c=>c.scrollHeight>c.clientHeight+2||c.scrollWidth>c.clientWidth+2;
function naturalHeight(card){
 card.style.setProperty('height','auto','important');card.style.setProperty('min-height','0','important');card.style.setProperty('max-height','none','important');card.style.setProperty('overflow','visible','important');
 return Math.ceil(card.scrollHeight);
}
function setHeight(card,h){h=Math.max(CFG.minH,Math.min(CFG.maxH,h));card.style.setProperty('--edu-card-h',h+'px');card.style.setProperty('height',h+'px','important');card.style.setProperty('min-height',h+'px','important');card.style.setProperty('max-height',h+'px','important');return h}
function normalize(card){
 card.classList.add('edu-autofit');qa('details',card).forEach(d=>d.open=true);if(card.matches('details'))card.open=true;
 card.style.removeProperty('font-size');card.classList.remove('edu-dense');
}
function shrink(card,pass){
 const ratio=Math.max(.74,1-pass*.035);
 qa('h1',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH1,56*ratio)));
 qa('h2',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH2,44*ratio)));
 qa('h3',card).forEach(x=>px(x,'font-size',Math.max(25,30*ratio)));
 qa('p,li,td,th,summary,figcaption',card).forEach(x=>px(x,'font-size',Math.max(CFG.minBody,24*ratio)));
}
function splitTable(section,card){
 const table=q('table',card);if(!table)return false;
 const rows=[...table.tBodies].flatMap(b=>[...b.rows]);if(rows.length<5)return false;
 const half=Math.ceil(rows.length/2),clone=section.cloneNode(true),c2=q('.slide-card',clone),t2=q('table',c2);
 const rows2=[...t2.tBodies].flatMap(b=>[...b.rows]);
 rows.slice(half).forEach(x=>x.remove());rows2.slice(0,half).forEach(x=>x.remove());
 const h=q('h1,h2,h3',c2);if(h)h.textContent=(h.textContent||'')+' · Continued';
 section.after(clone);return true;
}
function splitList(section,card){
 const list=qa('ul,ol',card).find(x=>x.children.length>=5);if(!list)return false;
 const items=[...list.children],half=Math.ceil(items.length/2),clone=section.cloneNode(true),c2=q('.slide-card',clone),lists=qa('ul,ol',c2),idx=qa('ul,ol',card).indexOf(list),l2=lists[idx];if(!l2)return false;
 items.slice(half).forEach(x=>x.remove());[...l2.children].slice(0,half).forEach(x=>x.remove());
 const h=q('h1,h2,h3',c2);if(h)h.textContent=(h.textContent||'')+' · Continued';
 section.after(clone);return true;
}
function fit(section,depth=0){
 const card=q('.slide-card',section);if(!card||depth>5||card.dataset.eduFit==='done')return;
 normalize(card);
 let need=naturalHeight(card),h=setHeight(card,Math.max(CFG.minH,Math.min(CFG.targetH,need+10)));
 for(let p=0;p<CFG.maxPasses&&overflow(card);p++){if(h<CFG.maxH){h=setHeight(card,Math.min(CFG.maxH,h+25));}else shrink(card,p+1);}
 if(overflow(card)){
   const split=splitTable(section,card)||splitList(section,card);
   if(split){card.dataset.eduFit='done';fit(section,depth+1);fit(section.nextElementSibling,depth+1);return;}
 }
 if(overflow(card)){card.classList.add('edu-dense');setHeight(card,CFG.maxH);}
 card.dataset.eduFit='done';
}
function fitAll(){
 const deck=q('.reveal .slides');if(!deck||qa(':scope > section',deck).length<2)return false;
 qa(':scope > section',deck).forEach(s=>fit(s));qa('.slide-card details',deck).forEach(d=>d.open=true);
 Reveal.sync?.();Reveal.layout?.();document.documentElement.classList.add('edu-autofit-ready');return true;
}
function boot(){let tries=0;const timer=setInterval(()=>{tries++;if(window.Reveal&&Reveal.isReady?.()&&q('.reveal .slides .classroom-slide')){clearInterval(timer);requestAnimationFrame(()=>requestAnimationFrame(fitAll));}else if(tries>100)clearInterval(timer)},100)}
window.EducatorAutoPresentation={run:fitAll};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
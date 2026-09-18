(()=>{
'use strict';
const CFG={cardH:545,minBody:18,minH2:32,minH1:44,maxPasses:10};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const overflow=c=>c.scrollHeight>c.clientHeight+3||c.scrollWidth>c.clientWidth+3;
const px=(el,p,v)=>el&&el.style.setProperty(p,v+'px','important');

function normalize(card){
 card.classList.add('edu-autofit');
 card.style.height=CFG.cardH+'px'; card.style.minHeight='0'; card.style.maxHeight=CFG.cardH+'px'; card.style.overflow='hidden';
 qa('details',card).forEach(d=>d.open=true);
 if(card.matches('details'))card.open=true;
}
function splitFigureContent(section,card){
 const fig=q('figure',card);
 if(!fig)return false;
 const movable=[...card.children].filter(el=>el!==fig&&!el.classList.contains('slide-meta')&&!el.matches('.kicker,h1,h2,h3')&&el.compareDocumentPosition(fig)&Node.DOCUMENT_POSITION_PRECEDING);
 if(!movable.length)return false;
 const clone=section.cloneNode(true),c2=q('.slide-card',clone),f2=q('figure',c2);
 if(f2)f2.remove();
 qa('.kicker,h1,h2,h3',c2).forEach((h,idx)=>{if(idx>0)h.remove()});
 const h=q('h1,h2,h3',c2); if(h)h.textContent=(h.textContent||'')+' · Continued';
 [...card.children].filter(el=>movable.includes(el)).forEach(el=>el.remove());
 section.after(clone); return true;
}
function splitList(section,card){
 const list=qa('ul,ol',card).find(x=>x.children.length>=6); if(!list)return false;
 const items=[...list.children],half=Math.ceil(items.length/2),clone=section.cloneNode(true),c2=q('.slide-card',clone);
 const lists=qa('ul,ol',c2),idx=qa('ul,ol',card).indexOf(list),l2=lists[idx]; if(!l2)return false;
 [...l2.children].slice(0,half).forEach(x=>x.remove()); items.slice(half).forEach(x=>x.remove());
 const h=q('h1,h2,h3',c2);if(h)h.textContent=(h.textContent||'')+' · Continued';
 section.after(clone);return true;
}
function shrink(card,pass){
 const ratio=Math.max(.70,1-pass*.03);
 qa('h1',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH1,58*ratio)));
 qa('h2',card).forEach(x=>px(x,'font-size',Math.max(CFG.minH2,46*ratio)));
 qa('h3',card).forEach(x=>px(x,'font-size',Math.max(26,31*ratio)));
 qa('p,li,td,th,summary,figcaption',card).forEach(x=>px(x,'font-size',Math.max(CFG.minBody,25*ratio)));
 px(card,'padding',Math.max(18,28-pass));
}
function fit(section,depth=0){
 const card=q('.slide-card',section);if(!card||depth>3)return;
 normalize(card);
 if(card.dataset.eduFit==='done')return;
 if(overflow(card)&&splitFigureContent(section,card)){card.dataset.eduFit='done';fit(section.nextElementSibling,depth+1);}
 for(let p=0;p<CFG.maxPasses&&overflow(card);p++)shrink(card,p+1);
 if(overflow(card)&&splitList(section,card)){card.dataset.eduFit='done';fit(section.nextElementSibling,depth+1);for(let p=0;p<CFG.maxPasses&&overflow(card);p++)shrink(card,p+1);}
 card.classList.toggle('edu-dense',overflow(card));
 card.dataset.eduFit='done';
}
function run(){
 const deck=q('.reveal .slides');if(!deck||qa(':scope > section',deck).length<2)return false;
 qa(':scope > section',deck).forEach(s=>fit(s));
 qa('.slide-card details',deck).forEach(d=>d.open=true);
 if(window.Reveal&&Reveal.isReady?.()){Reveal.sync();Reveal.layout();}
 document.documentElement.classList.add('edu-autofit-ready');return true;
}
function boot(){
 let tries=0;
 const timer=setInterval(()=>{tries++;const ready=window.Reveal&&Reveal.isReady?.()&&q('.reveal .slides .classroom-slide');if(ready&&run()||tries>80)clearInterval(timer)},100);
}
window.EducatorAutoPresentation={run};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
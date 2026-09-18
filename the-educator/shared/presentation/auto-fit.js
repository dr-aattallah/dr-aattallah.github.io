(()=>{
'use strict';
const CFG={pad:34,minBody:20,minCard:18,minLead:22,minH2:34,minH1:46,maxPasses:9};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function overflow(card){return card.scrollHeight>card.clientHeight+2||card.scrollWidth>card.clientWidth+2}
function set(el,prop,v){if(el)el.style.setProperty(prop,v+'px','important')}
function shrink(card,pass){
 const ratio=Math.max(.72,1-pass*.035);
 qa('h1',card).forEach(x=>set(x,'font-size',Math.max(CFG.minH1,66*ratio)));
 qa('h2',card).forEach(x=>set(x,'font-size',Math.max(CFG.minH2,48*ratio)));
 qa('.lead,.big',card).forEach(x=>set(x,'font-size',Math.max(CFG.minLead,30*ratio)));
 qa('.card,.question,.answer,.list',card).forEach(x=>set(x,'font-size',Math.max(CFG.minCard,25*ratio)));
 qa('.card strong',card).forEach(x=>set(x,'font-size',Math.max(20,28*ratio)));
 set(card,'padding',Math.max(18,28-pass));
}
function splitList(section,card){
 const list=q('ul.list,ol.list',card); if(!list||list.children.length<5)return false;
 const items=[...list.children],half=Math.ceil(items.length/2);
 const clone=section.cloneNode(true),c2=q('.slide-card',clone),l2=q('ul.list,ol.list',c2);
 [...l2.children].slice(0,half).forEach(x=>x.remove());
 items.slice(half).forEach(x=>x.remove());
 const h1=q('h1,h2',c2);if(h1)h1.textContent=h1.textContent.replace(/\s*·\s*\d+\s*of\s*\d+$/i,'')+' · Continued';
 section.after(clone); return true;
}
function splitGrid(section,card){
 const grid=qa('.grid4,.grid3,.grid2,.pqct,.tracks,.waterfall',card).find(g=>g.children.length>=5);
 if(!grid)return false; const kids=[...grid.children],half=Math.ceil(kids.length/2);
 const clone=section.cloneNode(true),g2=qa('.grid4,.grid3,.grid2,.pqct,.tracks,.waterfall',clone).find(g=>g.children.length>=5);
 [...g2.children].slice(0,half).forEach(x=>x.remove()); kids.slice(half).forEach(x=>x.remove());
 const h=q('h1,h2',clone);if(h)h.textContent=h.textContent+' · Continued';
 section.after(clone);return true;
}
function fit(section){
 const card=q('.slide-card',section);if(!card)return;
 card.classList.add('edu-autofit');card.style.height='545px';card.style.minHeight='0';card.style.overflow='hidden';
 [0,1,2,3,4,5,6,7,8].some(p=>{if(!overflow(card))return true;shrink(card,p+1);return false});
 if(overflow(card)&&(splitList(section,card)||splitGrid(section,card))){fit(section);const next=section.nextElementSibling;if(next)fit(next)}
 if(overflow(card)){card.classList.add('edu-overflow-safe');card.style.overflow='auto'}
}
function balance(card){
 if(!card||card.classList.contains('section-title'))return;
 const used=card.scrollHeight/card.clientHeight;
 if(used<.55)card.classList.add('edu-airy');
}
function run(){
 const deck=q('.reveal .slides');if(!deck)return;
 qa(':scope > section',deck).forEach(fit);
 qa(':scope > section .slide-card',deck).forEach(balance);
 if(window.Reveal){Reveal.sync();Reveal.layout();}
 document.documentElement.classList.add('edu-autofit-ready');
}
window.EducatorAutoPresentation={run};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(run),{once:true}):requestAnimationFrame(run);
})();
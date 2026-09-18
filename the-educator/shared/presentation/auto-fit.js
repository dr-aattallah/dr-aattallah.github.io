(()=>{'use strict';
const CFG={safeH:650,safeW:1210,minZoom:.72,maxZoom:1.08,step:.05};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
async function assets(card){const imgs=qa('img',card).filter(i=>!i.complete);await Promise.all(imgs.map(i=>new Promise(r=>{const done=()=>r();i.addEventListener('load',done,{once:true});i.addEventListener('error',done,{once:true})})));if(document.fonts?.ready)try{await document.fonts.ready}catch(e){}}
function normalize(card){card.classList.add('edu-autofit');qa('details',card).forEach(d=>d.open=true);card.style.removeProperty('zoom');card.dataset.eduZoom='1'}
function measure(card){return Math.min(1,CFG.safeH/Math.max(card.scrollHeight,1),CFG.safeW/Math.max(card.scrollWidth,1))}
function applyZoom(card,z){z=Math.max(CFG.minZoom,Math.min(CFG.maxZoom,z));card.style.setProperty('zoom',z,'important');card.dataset.eduZoom=String(z);card.classList.toggle('edu-dense',z<=CFG.minZoom+.01);return z}
async function fitCard(card){normalize(card);await assets(card);await nextFrame();const z=measure(card);applyZoom(card,z<.995?z*.985:1)}
async function fitAll(){const cards=qa('.reveal .slides .slide-card');if(!cards.length)return false;await Promise.all(cards.map(fitCard));qa('.slide-card details').forEach(d=>d.open=true);Reveal.sync?.();Reveal.layout?.();document.documentElement.classList.add('edu-autofit-ready');return true}
function currentCard(){return q('.reveal .slides section.present .slide-card')||q('.reveal .slides .slide-card')}
function manual(delta){const card=currentCard();if(!card)return;const now=parseFloat(card.dataset.eduZoom||getComputedStyle(card).zoom||1)||1;applyZoom(card,now+delta)}
function reset(){const card=currentCard();if(card)fitCard(card)}
function controls(){if(q('.edu-zoom-controls'))return;const box=document.createElement('div');box.className='edu-zoom-controls';box.setAttribute('aria-label','Slide size controls');box.innerHTML='<button type="button" data-z="-">−</button><button type="button" data-z="0" title="Fit slide">Fit</button><button type="button" data-z="+">+</button>';box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.dataset.z==='-'?manual(-CFG.step):b.dataset.z==='+'?manual(CFG.step):reset()});document.body.append(box)}
function boot(){let tries=0;const timer=setInterval(()=>{tries++;if(window.Reveal&&Reveal.isReady?.()&&q('.reveal .slides .slide-card')){clearInterval(timer);controls();fitAll();Reveal.on?.('slidechanged',e=>{const c=q('.slide-card',e.currentSlide);if(c)fitCard(c)});Reveal.on?.('ready',fitAll);window.addEventListener('resize',()=>{clearTimeout(window.__eduFitTimer);window.__eduFitTimer=setTimeout(fitAll,160)})}else if(tries>120)clearInterval(timer)},100)}
window.EducatorAutoPresentation={run:fitAll,zoomIn:()=>manual(CFG.step),zoomOut:()=>manual(-CFG.step),fit:reset};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()})();
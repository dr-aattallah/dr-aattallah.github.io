(()=>{
 const article=document.querySelector('article.content');if(!article)return;
 document.querySelectorAll('iframe').forEach(el=>el.remove());
 const file=location.pathname.split('/').pop()||'index.html';
 const page=Number(document.body.dataset.page||1);
 if(file==='index.html'){
   const story=article.querySelector('.anchor-story');
   if(story&&!story.querySelector('.scenario-visual')){
     const fig=document.createElement('figure');fig.className='scenario-visual';fig.innerHTML='<img src="assets/secnarionparcal.png" alt="Illustrated Smart Parcel Locker Pickup scenario"><figcaption>Smart Parcel Locker Pickup — the single anchor scenario used throughout Topic 10.</figcaption>';
     const h=story.querySelector('h2');if(h)h.insertAdjacentElement('afterend',fig);else story.prepend(fig);
   }
   const strip=story?.querySelector('.story-strip');if(strip)strip.remove();
   const txt=story?.querySelector('.scenario-text');if(txt){txt.insertAdjacentHTML('beforebegin','<div class="scenario-reading-label">READ THE SCENARIO ONCE · REUSE IT IN EVERY MODEL</div>');}
 }
 const imgs={2:['assets/usecaseparcl.png','Smart Parcel Locker Pickup UML Use Case Diagram','Use Case view — actors, goals, system boundary, and relationships.'],3:['assets/sequancepacel.png','Smart Parcel Locker Pickup UML Sequence Diagram','Sequence view — ordered interactions for Collect Parcel.'],4:['assets/stateparcel.png','Smart Parcel Locker Pickup UML State Diagram','State view — lifecycle, events, guards, and outcomes.'],5:['assets/activityparcl.png','Smart Parcel Locker Pickup UML Activity Diagram','Activity view — workflow, decisions, and responsibilities.']};
 const d=imgs[page];if(d){const code=article.querySelector('pre.plantuml');if(code){const label=code.previousElementSibling?.classList?.contains('code-label')?code.previousElementSibling:null;const fig=document.createElement('figure');fig.className='uml-solution-figure';fig.innerHTML=`<img src="${d[0]}" alt="${d[1]}"><figcaption><b>Model solution:</b> ${d[2]}</figcaption>`;code.replaceWith(fig);if(label)label.remove();}}
 if(file==='library-example.html'&&!article.querySelector('.taxonomy-note')){
   const banner=article.querySelector('.model-banner');if(banner){banner.insertAdjacentHTML('afterend','<div class="taxonomy-note"><b>Important distinction</b><p>The Use Case Diagram provides the <strong>goal and scenario context</strong> for behavioral modeling. Sequence, State, and Activity diagrams then describe the dynamic behavior in greater detail. Treat Use Case as the behavioral starting point—not as a substitute for those detailed views.</p></div>');}
 }
 if(file==='same-scenario.html'){
   const h1=article.querySelector('h1');if(h1)h1.textContent='Same Scenario, Five Complementary Models';
   const lead=article.querySelector('.lead');if(lead)lead.textContent='Connect goals, structure, interactions, lifecycle, and workflow without duplicating the same information in every model.';
   const grid=article.querySelector('.compare-grid');if(grid&&!grid.querySelector('.class-card')){const c=document.createElement('div');c.className='compare-card class-card';c.innerHTML='<b>🧱 Class</b><p><strong>Reveals:</strong> concepts, attributes, relationships, multiplicities.</p><p><strong>Key fact:</strong> Parcel, PickupCode, Locker, and Compartment share one structural vocabulary.</p>';grid.insertBefore(c,grid.children[1]||null);grid.classList.add('five');}
   const heading=[...article.querySelectorAll('h2')].find(x=>/Trace one requirement/i.test(x.textContent||''));if(heading){heading.textContent='Trace one requirement across five views';const tr=heading.nextElementSibling;if(tr&&tr.classList.contains('trace'))tr.innerHTML='<span>Requirement: only a valid active code opens the locker</span><i>→</i><span>Use Case: Validate Pickup Code</span><i>→</i><span>Class: PickupCode.expiration / Compartment</span><i>→</i><span>Sequence: validationOK()</span><i>→</i><span>State: [notExpired] → Accessible</span><i>→</i><span>Activity: valid + active branch</span>';}
 }
})();
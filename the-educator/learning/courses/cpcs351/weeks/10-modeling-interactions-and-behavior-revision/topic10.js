(()=>{
  const pages=[
    ['index.html','Smart Parcel Locker — Anchor Scenario','01 · ANCHOR SCENARIO'],
    ['library-example.html','Use Case View — Who Wants What?','02 · USER-GOAL LENS'],
    ['class-diagram.html','Class View — What Exists and Relates?','03 · STRUCTURE LENS'],
    ['state-revision.html','Sequence View — Who Interacts, and When?','04 · INTERACTION LENS'],
    ['activity-revision.html','State View — What Changes Over Time?','05 · LIFECYCLE LENS'],
    ['atm-example.html','Activity View — How Does Work Flow?','06 · WORKFLOW LENS'],
    ['same-scenario.html','Same Scenario, Five Complementary Models','07 · CONNECT THE VIEWS'],
    ['consistency.html','Consistency Across Models','08 · CROSS-MODEL REASONING'],
    ['integrated-case.html','Integrated Case Study','09 · TRANSFER THE METHOD'],
    ['model-selection.html','Model Selection Challenges','10 · CHOOSE THE VIEW'],
    ['studio.html','Integrated Modeling Studio','11 · PRACTICE STUDIO'],
    ['revision-check.html','Integrated Review & Exam Readiness','12 · MASTERY CHECK']
  ];
  const file=location.pathname.split('/').pop()||'index.html';
  const current=Math.max(0,pages.findIndex(p=>p[0]===file));
  document.body.dataset.topic='10';
  document.body.dataset.page=String(current+1);

  const side=document.getElementById('topic-sidebar');
  const mobile=document.getElementById('topic-mobile');
  const sideLinks=pages.map((p,i)=>`<a class="side-link ${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
  if(side)side.innerHTML=`<div class="side-head"><small>Topic 10</small><strong>Integrated UML Modeling</strong></div>${sideLinks}`;
  if(mobile)mobile.innerHTML=pages.map((p,i)=>`<a class="${i===current?'active':''}" href="${p[0]}">${String(i+1).padStart(2,'0')} · ${p[1]}</a>`).join('');

  const prev=document.getElementById('prev-link'),next=document.getElementById('next-link');
  if(prev&&current>0){prev.hidden=false;prev.href=pages[current-1][0]}
  if(next&&current<pages.length-1){next.hidden=false;next.href=pages[current+1][0]}
  const progress=document.querySelector('.hero-progress');
  if(progress){const n=progress.querySelector('span'),s=progress.querySelector('small');if(n)n.textContent=String(current+1);if(s)s.textContent='of 12 pages';}

  const article=document.querySelector('article.content');
  if(!article)return;
  const hero=article.querySelector('.hero');
  if(hero){const eyebrow=hero.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent=pages[current][2];const h1=hero.querySelector('h1');if(h1)h1.textContent=pages[current][1];}
  document.title=`${pages[current][1]} | Topic 10`;

  if(file==='index.html'){
    const h1=article.querySelector('.hero h1');if(h1)h1.textContent='Smart Parcel Locker Pickup — One Scenario, Five UML Views';
    const q=article.querySelector('.t10-question');if(q)q.innerHTML='We will model the <em>same scenario</em> through five complementary UML viewpoints.';
    const grid=article.querySelector('.lens-grid');
    if(grid){
      grid.classList.remove('four');grid.classList.add('five');
      if(!grid.querySelector('.lens.class-lens')){
        const c=document.createElement('div');c.className='lens class-lens';c.innerHTML='<span class="icon">🧱</span><b>Class Diagram</b>What domain concepts exist, what information do they own, and how are they related?';
        const seq=grid.querySelector('.sequence');grid.insertBefore(c,seq||null);
      }
    }
    const rule=article.querySelector('.remember p');if(rule)rule.textContent='Derive every model from the same requirements. Each view answers a different question, but all five must tell one consistent system story.';

    if(!document.getElementById('topic10-practice-lab-style')){
      const style=document.createElement('style');
      style.id='topic10-practice-lab-style';
      style.textContent=`
        .practice-lab-card{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:28px;margin:28px 0;padding:26px 28px;border-radius:22px;background:linear-gradient(135deg,#d90416 0%,#ef1727 58%,#b00012 100%);color:#fff;box-shadow:0 16px 34px rgba(176,0,18,.18)}
        .practice-lab-card::before,.practice-lab-card::after{content:"";position:absolute;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none}.practice-lab-card::before{width:180px;height:180px;right:-55px;top:-85px}.practice-lab-card::after{width:105px;height:105px;right:115px;bottom:-60px}
        .practice-lab-copy{position:relative;z-index:1;max-width:720px}.practice-lab-copy small{display:block;margin-bottom:6px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.88}.practice-lab-copy strong{display:block;font-size:1.25rem;line-height:1.3;margin-bottom:7px}.practice-lab-copy p{margin:0;color:rgba(255,255,255,.92);line-height:1.6}
        .practice-lab-link{position:relative;z-index:1;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:14px;background:#fff;color:#c90014;text-decoration:none;font-weight:800;box-shadow:0 8px 20px rgba(98,0,10,.18);transition:transform .18s ease,box-shadow .18s ease}.practice-lab-link:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(98,0,10,.24)}.practice-lab-link:focus-visible{outline:3px solid rgba(255,255,255,.8);outline-offset:4px}
        @media(max-width:760px){.practice-lab-card{align-items:flex-start;flex-direction:column;gap:18px;padding:22px}.practice-lab-link{width:100%}}
        @media(prefers-reduced-motion:reduce){.practice-lab-link{transition:none}}
      `;
      document.head.appendChild(style);
    }
    if(!article.querySelector('.practice-lab-card')){
      const card=document.createElement('section');
      card.className='practice-lab-card';
      card.setAttribute('aria-label','Practice Lab Topic 10');
      card.innerHTML=`<div class="practice-lab-copy"><small>Practice Lab · Topic 10</small><strong>Mission 10 — Make Five Models Tell One Story</strong><p>Review one smart-parking scenario across Use Case, Class, Sequence, State, and Activity views. Trace requirements, detect contradictions, choose the right UML view, and approve only a coherent model set.</p></div><a class="practice-lab-link" href="../../lab-practice/topic10.html">▶ Start Practice Lab</a>`;
      const firstStory=article.querySelector('.t10-story');
      if(firstStory)firstStory.insertAdjacentElement('afterend',card);else if(hero)hero.insertAdjacentElement('afterend',card);else article.prepend(card);
    }
  }

  if(file==='consistency.html'){
    const lead=article.querySelector('.lead');if(lead)lead.textContent='Use all five views as mutual checks. Contradictions often reveal missing, ambiguous, or misunderstood requirements.';
    const steps=article.querySelector('.step-grid');
    if(steps&&!steps.querySelector('.structure-check')){
      const d=document.createElement('div');d.className='step structure-check';d.innerHTML='<span class="num">2</span><b>Check structure</b>Classes and relationships should support the objects, data, and responsibilities used by behavioral views.';steps.insertBefore(d,steps.children[1]||null);
      [...steps.querySelectorAll('.step .num')].forEach((n,i)=>n.textContent=String(i+1));steps.classList.add('five');
    }
  }

  if(file==='integrated-case.html'){
    const lead=article.querySelector('.lead');if(lead)lead.textContent='Transfer the five-view method to a new system after mastering the Smart Parcel Locker example.';
    const grid=article.querySelector('.compare-grid');
    if(grid&&!grid.querySelector('.class-card')){const c=document.createElement('div');c.className='compare-card class-card';c.innerHTML='<b>🧱 Class candidate</b>Driver · ChargingStation · ChargingSession · Connector · Account · Payment.';grid.insertBefore(c,grid.children[1]||null);grid.classList.remove('four');grid.classList.add('five');}
  }

  if(file==='model-selection.html'){
    const lead=article.querySelector('.lead');if(lead)lead.textContent='Choose among Use Case, Class, Sequence, State, and Activity by first identifying the modeling question.';
    const choice=article.querySelector('.choice');
    if(choice&&!choice.querySelector('.class-choice')){const c=document.createElement('div');c.className='class-choice';c.innerHTML='<b>🧱 Class</b><p>Choose it when the question is: What concepts exist, what do they know, and how are they related?</p>';choice.insertBefore(c,choice.children[1]||null);choice.classList.remove('four');choice.classList.add('five');}
  }

  if(file==='studio.html'){
    const lead=article.querySelector('.lead');if(lead)lead.textContent='Build a coherent five-model set from one scenario. Do not start by drawing—first decide what each view must answer.';
    const steps=article.querySelector('.step-grid');
    if(steps&&!steps.querySelector('.class-step')){const d=document.createElement('div');d.className='step class-step';d.innerHTML='<span class="num">2</span><b>Class view</b>Extract the domain concepts, key attributes, and relationships that the behavioral views will reuse.';steps.insertBefore(d,steps.children[1]||null);[...steps.querySelectorAll('.step .num')].forEach((n,i)=>n.textContent=String(i+1));steps.classList.add('five');}
  }

  if(file==='revision-check.html'){
    const lead=article.querySelector('.lead');if(lead)lead.textContent='Confirm that you can select, read, connect, and critique all five UML views used in this integrated review.';
    const mastery=article.querySelector('.mastery');
    if(mastery&&!mastery.querySelector('.class-mastery')){const d=document.createElement('div');d.className='class-mastery';d.innerHTML='<b>Class</b><br>Identify concepts, attributes, associations, multiplicities, and structural relationships.';mastery.insertBefore(d,mastery.children[1]||null);mastery.classList.add('six');}
  }
})();
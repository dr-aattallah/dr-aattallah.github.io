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
  document.body.dataset.page=String(current+1);

  const side=document.getElementById('topic-sidebar'),mobile=document.getElementById('topic-mobile');
  const links=pages.map((p,i)=>`<a class="${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span>${p[1]}</a>`).join('');
  if(side)side.innerHTML=`<div class="side-title"><small>Topic 10</small><strong>Integrated UML Modeling</strong></div><nav class="side-nav">${links}</nav>`;
  if(mobile)mobile.innerHTML=`<select aria-label="Topic pages" onchange="location.href=this.value">${pages.map((p,i)=>`<option value="${p[0]}" ${i===current?'selected':''}>${i+1}. ${p[1]}</option>`).join('')}</select>`;

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
(()=>{if(!document.querySelector('script[data-cpcs-nav]')){const s=document.createElement('script');s.src='../../navigation-system.js';s.dataset.cpcsNav='1';document.head.append(s)}})();
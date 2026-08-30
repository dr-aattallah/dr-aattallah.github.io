(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){window.location.href='../../access.html';return;}

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const topicKey=()=>`cpcs351-topic-${Number(document.body.dataset.topic||0)}`;
  const safeText=s=>(s||'').replace(/\s+/g,' ').trim();
  const icon=name=>{
    const paths={
      search:'<circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path>',
      up:'<path d="m6 14 6-6 6 6"></path>',
      left:'<path d="m15 18-6-6 6-6"></path>',
      right:'<path d="m9 18 6-6-6-6"></path>',
      check:'<path d="m5 12 4 4L19 6"></path>',
      close:'<path d="M6 6l12 12M18 6 6 18"></path>'
    };
    return `<span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[name]||''}</svg></span>`;
  };

  function injectDesignSystem(){
    if(document.querySelector('link[data-cpcs351-design-system]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='../../design-system.css';
    link.dataset.cpcs351DesignSystem='true';
    document.head.append(link);
  }

  function a11y(){
    if(!$('#skip-link')){
      const a=document.createElement('a');
      a.id='skip-link';a.className='skip-link';a.href='#main-study-content';a.textContent='Skip to learning content';
      document.body.prepend(a);
    }
    const main=$('main');
    if(main){main.id='main-study-content';main.tabIndex=-1;}
    $$('iframe').forEach((f,i)=>{if(!f.title)f.title=`External learning reference ${i+1}`;f.loading='lazy';});
    $$('img').forEach(img=>{if(!img.hasAttribute('alt'))img.alt='';img.loading='lazy';img.decoding='async';});
    $$('a[href]').forEach(a=>{const h=a.getAttribute('href');if(h&&/^https?:/i.test(h)){a.target='_blank';a.rel='noopener noreferrer';}});
  }

  function normalizeTerminology(){
    const exact=new Map([
      ['Course home','Course Home'],['course home','Course Home'],
      ['Core lecture','Core Lecture'],['Worked example','Worked Example'],
      ['Visual model','Visual Model'],['Added example','Added Example'],
      ['Added practice','Added Practice'],['Added clarification','Added Clarification'],
      ['External UML reference','External UML Reference'],['Study boundary','Study Boundary'],
      ['Learning focus','Learning Focus']
    ]);
    $$('.kicker,.objective strong,.study-divider span').forEach(el=>{
      const t=safeText(el.textContent); if(exact.has(t))el.textContent=exact.get(t);
    });
    $$('.course-home,.home-link').forEach(el=>el.textContent='Course Home');
    const prev=$('.lesson-nav .prev,#prev-link');
    const next=$('.lesson-nav .next,#next-link');
    if(prev){prev.classList.add('prev');prev.innerHTML=`${icon('left')}<span>Previous Lesson</span>`;prev.setAttribute('aria-label','Previous lesson');}
    if(next){next.classList.add('next');next.innerHTML=`<span>Next Lesson</span>${icon('right')}`;next.setAttribute('aria-label','Next lesson');}
  }

  function normalizeStructure(){
    const content=$('.content'),hero=$('.hero'); if(!content||!hero)return;
    const topic=String(document.body.dataset.topic||'').padStart(2,'0');
    const h1=safeText($('.hero h1')?.textContent||document.title.split('|')[0]);
    if(!$('.breadcrumb')){
      const b=document.createElement('div');b.className='breadcrumb';
      b.innerHTML=`<a href="../../index.html">CPCS 351</a><span>›</span><span>Topic ${topic}</span><span>›</span><span>${h1}</span>`;
      content.insertBefore(b,hero);
    }
    if(!$('.study-key')){
      const key=document.createElement('div');key.className='study-key';
      key.innerHTML='<span><i class="dot core"></i> Core Lecture Content</span><span><i class="dot add"></i> Added Study Material</span>';
      const anchor=$('.learning-progress')||hero;
      anchor.insertAdjacentElement('afterend',key);
    }
  }

  function normalizeNavigation(){
    const sidebar=$('.sidebar'); if(!sidebar)return;
    const links=$$('.side-link,.side-nav a',sidebar);
    links.forEach(a=>a.classList.add('side-link'));
    const current=links.find(a=>a.classList.contains('active'))||links.find(a=>new URL(a.href,location.href).pathname===location.pathname);
    links.forEach(a=>{a.classList.toggle('active',a===current);if(a===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const mobile=$('.mobile-topic');
    if(mobile&&links.length){
      mobile.innerHTML='';
      mobile.setAttribute('aria-label','Topic lessons');
      links.forEach((a,i)=>{
        const m=document.createElement('a');m.href=a.getAttribute('href');m.className=a===current?'active':'';
        const label=safeText(a.textContent).replace(/✓$/,'').trim();
        m.textContent=label.match(/^\d{2}/)?label:`${String(i+1).padStart(2,'0')} ${label}`;
        if(a===current)m.setAttribute('aria-current','page');
        mobile.append(m);
      });
    }
  }

  function progress(){
    const hero=$('.hero'); if(!hero)return;
    const page=Number(document.body.dataset.page||1);
    const navLinks=$$('.side-link,.side-nav a');
    const total=Math.max(navLinks.length,Number(($('.hero-progress small')?.textContent.match(/of\s+(\d+)/i)||[])[1]||1));
    let store={};try{store=JSON.parse(localStorage.getItem(topicKey())||'{}')}catch{}
    const completed=new Set(store.completed||[]);
    const bar=document.createElement('section');bar.className='learning-progress';bar.setAttribute('aria-label','Learning progress');
    bar.innerHTML=`<div class="progress-copy"><strong>Topic Progress</strong><span aria-live="polite"></span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0"><i></i></div><button class="complete-btn" type="button"></button>`;
    hero.insertAdjacentElement('afterend',bar);
    const status=$('.progress-copy span',bar),track=$('.progress-track',bar),fill=$('.progress-track i',bar),btn=$('.complete-btn',bar);
    function render(){
      const count=completed.size;
      status.textContent=`${count} of ${total} pages completed`;
      track.setAttribute('aria-valuenow',String(count));fill.style.width=`${Math.min(100,count/total*100)}%`;
      const done=completed.has(page);btn.classList.toggle('is-complete',done);btn.innerHTML=done?`${icon('check')}<span>Completed</span>`:'<span>Mark Page Complete</span>';
      btn.setAttribute('aria-pressed',String(done));
      navLinks.forEach((a,i)=>{const d=completed.has(i+1);a.classList.toggle('is-complete',d);if(d)a.setAttribute('aria-label',`${safeText(a.textContent)} completed`);else a.removeAttribute('aria-label');});
    }
    btn.addEventListener('click',()=>{
      completed.has(page)?completed.delete(page):completed.add(page);
      localStorage.setItem(topicKey(),JSON.stringify({completed:[...completed].sort((a,b)=>a-b)}));
      render();
    });
    render();
  }

  function hook(){
    const hero=$('.hero'),h1=$('.hero h1'); if(!hero||!h1||$('.learning-hook'))return;
    const box=document.createElement('aside');box.className='learning-hook';
    box.innerHTML=`<span class="hook-label">Before You Start</span><strong>What problem does “${safeText(h1.textContent)}” help a software engineer solve?</strong><p>Keep a tentative answer in mind. Revisit it after the worked example or visual.</p>`;
    const progress=$('.learning-progress');(progress||hero).insertAdjacentElement('afterend',box);
  }

  function activeRecall(){
    const content=$('.content'); if(!content||$('.active-recall'))return;
    const h1=safeText($('.hero h1')?.textContent||document.title);
    const headings=$$('.section h2').map(x=>safeText(x.textContent)).filter(Boolean).slice(0,3);
    const box=document.createElement('section');box.className='section active-recall';
    box.innerHTML=`<div class="kicker">Active Recall · 2 Minutes</div><h2>Check your understanding before moving on</h2><div class="recall-grid">
      <details><summary>1 · Explain it without looking</summary><p>In your own words, explain <b>${h1}</b>. Compare your answer with the Learning Focus and the main sections.</p></details>
      <details><summary>2 · Connect the ideas</summary><p>${headings.length?`Explain how <b>${headings.join('</b>, <b>')}</b> fit together.`:'Identify the main idea, one example, and one decision this page helps you make.'}</p></details>
      <details><summary>3 · Apply it to a new case</summary><p>Create a different software-system example. A strong example changes the situation and still uses the same reasoning correctly.</p></details>
    </div><div class="feedback-note"><b>Self-Feedback:</b> A strong answer uses the concept correctly, explains <i>why</i>, and transfers it to a new scenario. If you can only repeat a definition, revisit the relevant section.</div>`;
    const nav=$('.lesson-nav');nav?nav.insertAdjacentElement('beforebegin',box):content.append(box);
  }

  function misconceptions(){
    if($('.misconception-auto')||!$('.content'))return;
    const box=document.createElement('section');box.className='misconception-auto';
    box.innerHTML='<strong>Common Learning Trap</strong><p>Recognizing a term is not the same as being able to use it. Before continuing, explain when the concept applies, justify one example, and identify one nearby concept it could be confused with.</p>';
    $('.active-recall')?.insertAdjacentElement('beforebegin',box);
  }

  function normalizeMedia(){
    $$('iframe').forEach(f=>f.classList.add('learning-media'));
    $$('iframe + p a').forEach(a=>a.classList.add('media-source-link'));
  }

  function tools(){
    if($('#study-tools'))return;
    const panel=document.createElement('div');panel.id='study-tools';panel.className='study-tools';
    panel.innerHTML=`<button type="button" data-action="search" aria-expanded="false">${icon('search')}<span>Find</span></button><button type="button" data-action="top">${icon('up')}<span>Top</span></button>`;
    const find=document.createElement('div');find.className='find-panel';find.hidden=true;
    find.innerHTML=`<label for="page-find-input">Find on This Page</label><div class="find-row"><input id="page-find-input" type="search" autocomplete="off"><button type="button" data-find="next">Find Next</button></div><span class="find-status" aria-live="polite">Enter a word or phrase, then choose Find Next.</span>`;
    document.body.append(panel,find);
    const searchBtn=$('[data-action="search"]',panel),input=$('input',find),status=$('.find-status',find);
    function toggleFind(show){find.hidden=!show;searchBtn.setAttribute('aria-expanded',String(show));if(show)setTimeout(()=>input.focus(),0);}
    searchBtn.addEventListener('click',()=>toggleFind(find.hidden));
    $('[data-action="top"]',panel).addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    $('[data-find="next"]',find).addEventListener('click',()=>{const q=input.value.trim();if(!q){status.textContent='Enter a word or phrase first.';return;}const found=window.find?.(q,false,false,true,false,true,false);status.textContent=found?'Match selected. Choose Find Next to continue.':'No further match was found.';});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('[data-find="next"]',find).click();}if(e.key==='Escape')toggleFind(false);});
  }

  function keyboard(){
    document.addEventListener('keydown',e=>{
      if(e.altKey&&e.key==='ArrowLeft')($('.lesson-nav .prev:not([hidden]),#prev-link:not([hidden])'))?.click();
      if(e.altKey&&e.key==='ArrowRight')($('.lesson-nav .next:not([hidden]),#next-link:not([hidden])'))?.click();
    });
  }

  function states(){document.body.classList.add('enhanced-study');}

  injectDesignSystem();
  window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
    a11y();normalizeStructure();normalizeNavigation();progress();hook();normalizeTerminology();normalizeMedia();activeRecall();misconceptions();tools();keyboard();states();
    const current=$('.mobile-topic .active');current?.scrollIntoView({inline:'center',block:'nearest'});
  },0));
})();
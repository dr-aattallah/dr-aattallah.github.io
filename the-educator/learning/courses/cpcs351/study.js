(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){location.href='../../access.html';return;}
  if(window.__CPCS351_STUDY__)return;window.__CPCS351_STUDY__=true;

  const BASE='/the-educator/learning/courses/cpcs351/';
  const TOPICS=[
    ['01','Introduction','01-introduction'],['02','Software Quality','02-software-quality'],['03','System Engineering','03-system-engineering'],['04','Process and Methodology','04-process-and-methodology'],['05','Requirements Elicitation & Use-Case Engineering','05-software-requirements-elicitation'],['06','Architectural Design & Software Design Principles','06-architectural-design-and-software-design-principles'],['07','Domain Modeling & UML Class Diagram','07-domain-modeling-and-uml-class-diagram'],['08','Object Interaction Modeling','08-object-interaction-modeling'],['09','Behavioral Modeling with UML','09-activity-modeling'],['10','Integrated UML Modeling','10-modeling-interactions-and-behavior-revision'],['11','Responsibility Assignment Patterns','11-responsibility-assignment-patterns'],['12','Software Testing','12-software-testing']
  ];
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const pagePath=()=>location.pathname.replace(/\/$/,'/index.html');
  const samePage=a=>{try{return new URL(a.href,location.href).pathname.replace(/\/$/,'/index.html')===pagePath()}catch{return false}};
  const topicSlug=()=>location.pathname.match(/\/weeks\/(\d{2}-[^/]+)\/?/)?.[1]||'';
  const topicInfo=()=>TOPICS.find(t=>t[2]===topicSlug());

  function ensureStyles(){
    [['cpcs351-design-system',BASE+'design-system.css'],['cpcs351-navigation-system',BASE+'navigation-system.css']].forEach(([id,href])=>{
      if(document.querySelector(`link[data-${id}]`)||[...document.styleSheets].some(s=>s.href&&s.href.includes(href)))return;
      const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset[id]='1';document.head.append(l);
    });
  }
  ensureStyles();

  function normalizeHeader(){
    const top=$('.topbar');if(!top)return;
    $$('.edu-global-nav').forEach(n=>n.remove());
    const brand=$('.brand',top);if(brand){let mark=$('.brand-mark',brand);if(!mark){mark=document.createElement('span');mark.className='brand-mark';brand.prepend(mark)}mark.textContent='';}
    let cid=$('.course-id',top);if(!cid){cid=document.createElement('div');cid.className='course-id';cid.textContent='CPCS 351 · Software Engineering I';brand?.insertAdjacentElement('afterend',cid)}
    let actions=$('.edu-top-actions',top);
    if(!actions){actions=document.createElement('nav');actions.className='edu-top-actions';actions.setAttribute('aria-label','Course navigation');actions.innerHTML=`<a href="${BASE}index.html"><span class="label-wide">Course Home</span><span aria-hidden="true">⌂</span></a><button type="button" data-topics-button aria-expanded="false"><span class="label-wide">Topics</span><span aria-hidden="true">☰</span></button><a href="${BASE}resources/"><span class="label-wide">Resources</span></a>`;top.append(actions);$('[data-topics-button]',actions)?.addEventListener('click',toggleTopics)}
  }

  function topicsPanel(){
    let p=$('.edu-nav-panel');if(p)return p;
    p=document.createElement('section');p.className='edu-nav-panel';p.hidden=true;p.setAttribute('aria-label','Course topics');
    p.innerHTML='<div class="edu-nav-panel-head"><strong>Course Topics</strong><button type="button" data-close-topics aria-label="Close topics">✕</button></div><input type="search" aria-label="Filter topics" placeholder="Filter topics…"><div class="edu-topic-map"></div>';
    document.body.append(p);$('[data-close-topics]',p).addEventListener('click',closeTopics);$('input',p).addEventListener('input',renderTopics);return p;
  }
  function renderTopics(){const p=topicsPanel(),q=clean($('input',p)?.value).toLowerCase(),cur=topicInfo();$('.edu-topic-map',p).innerHTML=TOPICS.filter(t=>!q||t[0].includes(q)||t[1].toLowerCase().includes(q)).map(t=>`<a href="${BASE}weeks/${t[2]}/" class="${cur&&cur[0]===t[0]?'current':''}"><span class="num">${t[0]}</span><span>${esc(t[1])}</span></a>`).join('')||'<p>No matching topics.</p>'}
  function toggleTopics(){const p=topicsPanel(),b=$('[data-topics-button]'),open=p.hidden;p.hidden=!open;b?.setAttribute('aria-expanded',String(open));if(open){renderTopics();requestAnimationFrame(()=>$('input',p)?.focus())}}
  function closeTopics(){const p=$('.edu-nav-panel');if(p)p.hidden=true;$('[data-topics-button]')?.setAttribute('aria-expanded','false')}

  function sidebarLinks(){const side=$('.sidebar');if(!side)return[];return $$('.side-link,.side-nav a',side)}
  function normalizeLocalNav(){
    const side=$('.sidebar');if(!side)return[];
    const links=sidebarLinks();if(!links.length)return[];
    let current=links.find(samePage)||links.find(a=>a.classList.contains('active'))||links[0];
    links.forEach((a,i)=>{
      a.classList.add('side-link');a.classList.remove('is-complete');
      [...a.children].forEach(ch=>{if(ch.matches('span')&&(/^\s*(?:\d{1,2}|★|☆|✓|✔)\s*$/.test(ch.textContent||'')||ch.classList.contains('edu-lesson-number')))ch.remove()});
      const n=document.createElement('span');n.className='edu-lesson-number';n.textContent=String(i+1).padStart(2,'0');a.prepend(n);
      const active=a===current;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');
    });
    side.setAttribute('aria-label','Topic lessons');syncMobile(links,current);syncProgress(links,current);return links;
  }
  function syncMobile(links,current){
    let mobile=$('.mobile-topic');if(!mobile){mobile=document.createElement('nav');mobile.className='mobile-topic';$('.shell')?.insertAdjacentElement('beforebegin',mobile)}
    if(!mobile)return;mobile.innerHTML='';mobile.setAttribute('aria-label','Topic lessons');
    links.forEach((a,i)=>{const x=document.createElement('a');x.href=a.getAttribute('href');x.textContent=`${String(i+1).padStart(2,'0')} ${clean(a.textContent).replace(/^\d{2}\s*/,'')}`;if(a===current){x.className='active';x.setAttribute('aria-current','page')}mobile.append(x)});
  }
  function syncProgress(links,current){const p=$('.hero-progress');if(!p)return;const i=Math.max(0,links.indexOf(current));const n=$('span',p),s=$('small',p);if(n)n.textContent=String(i+1);if(s)s.textContent=`of ${links.length} ${links.length===1?'page':'pages'}`}

  function normalizeBreadcrumbs(){
    const info=topicInfo(),content=$('.content'),hero=$('.hero');if(!info||!content||!hero)return;
    $$('.breadcrumb,.edu-breadcrumbs').forEach(x=>x.remove());
    const title=clean($('.hero h1')?.textContent||document.title.split('|')[0]);const b=document.createElement('nav');b.className='edu-breadcrumbs';b.setAttribute('aria-label','Breadcrumb');b.innerHTML=`<a href="${BASE}index.html">CPCS 351</a><span aria-hidden="true">›</span><a href="${BASE}weeks/${info[2]}/">Topic ${info[0]} · ${esc(info[1])}</a><span aria-hidden="true">›</span><span aria-current="page">${esc(title)}</span>`;content.insertBefore(b,hero);
  }

  function normalizeBottomNav(links){
    const info=topicInfo();if(!info||!links.length)return;const current=links.find(samePage)||links.find(a=>a.classList.contains('active'))||links[0],i=links.indexOf(current),ti=TOPICS.indexOf(info);
    let nav=$('.lesson-nav');if(!nav){nav=document.createElement('nav');nav.className='lesson-nav';($('article')||$('main'))?.append(nav)}nav.setAttribute('aria-label','Lesson navigation');nav.innerHTML='';
    const mk=(href,label,role)=>{const a=document.createElement('a');a.href=href;a.dataset.navRole=role;a.innerHTML=role==='prev'?`← <span>${esc(label)}</span>`:role==='next'?`<span>${esc(label)}</span> →`:`<span>${esc(label)}</span>`;return a};
    if(i>0)nav.append(mk(links[i-1].getAttribute('href'),'Previous Lesson','prev'));else if(ti>0)nav.append(mk(`${BASE}weeks/${TOPICS[ti-1][2]}/`,'Previous Topic','prev'));else nav.append(mk(BASE+'index.html','Course Home','prev'));
    nav.append(mk(`${BASE}weeks/${info[2]}/`,'Topic Home','home'));
    if(i<links.length-1)nav.append(mk(links[i+1].getAttribute('href'),'Next Lesson','next'));else if(ti<TOPICS.length-1)nav.append(mk(`${BASE}weeks/${TOPICS[ti+1][2]}/`,'Next Topic','next'));else nav.append(mk(BASE+'index.html','Course Home','next'));
  }

  function accessibility(){
    const main=$('main');if(main){main.id=main.id||'main-study-content';main.tabIndex=-1}
    $$('iframe').forEach((f,i)=>{if(!f.title)f.title=`External learning reference ${i+1}`;f.loading='lazy'});
    $$('img').forEach(img=>{if(!img.hasAttribute('alt'))img.alt='';if(!img.closest('.hero'))img.loading=img.loading||'lazy';img.decoding='async'});
    $$('a[href]').forEach(a=>{const h=a.getAttribute('href');if(/^https?:/i.test(h||'')){a.target='_blank';a.rel='noopener noreferrer'}});
  }
  function normalizeStudyKey(){const h=$('.hero'),c=$('.content');if(!h||!c||$('.study-key'))return;const k=document.createElement('div');k.className='study-key';k.innerHTML='<span><i class="dot core"></i> Core Lecture Content</span><span><i class="dot add"></i> Added Study Material</span>';h.insertAdjacentElement('afterend',k)}
  function removeLegacyArtifacts(){$$('.learning-progress,.active-recall,.feedback-note').forEach(x=>x.remove())}
  function tools(){if($('#study-tools'))return;const p=document.createElement('div');p.id='study-tools';p.className='study-tools';p.innerHTML='<button type="button" data-action="top" aria-label="Back to top">↑ <span>Top</span></button>';document.body.append(p);$('[data-action="top"]',p).addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}))}

  function topic05Repairs(){
    if(document.body.dataset.topic!=='05'||document.body.dataset.page!=='4')return;
    const target=$$('.visual-section').find(s=>/Actor\s*→\s*goal\s*→\s*system responsibility/i.test(s.textContent));
    if(target&&!target.dataset.repaired){target.dataset.repaired='1';target.innerHTML='<div class="kicker">Visual anchor · read the diagram from outside in</div><h2>Adventurer → quest goal → game responsibility</h2><p><strong>Read it from the outside in:</strong> the actor remains outside the system boundary; useful system goals stay inside it. The theme changes, but the UML meaning does not.</p>'}
    const imgs=[['https://www.uml-diagrams.org/examples/use-case-example-atm.png','Bank ATM UML use case diagram'],['https://www.uml-diagrams.org/examples/use-case-example-library-opac.png','Online library OPAC UML use case diagram'],['https://www.uml-diagrams.org/examples/use-case-example-online-shopping.png','Online shopping UML use case diagram'],['https://www.uml-diagrams.org/examples/use-case-example-pos.png','Point of Sale UML use case diagram'],['https://www.uml-diagrams.org/examples/use-case-example-hospital-reception.png','Hospital Reception UML use case diagram']];
    $$('.example-gallery .source-frame iframe').forEach((f,i)=>{if(!imgs[i])return;const img=document.createElement('img');img.src=imgs[i][0];img.alt=imgs[i][1];img.loading='lazy';img.decoding='async';f.replaceWith(img)});
  }

  function refresh(){
    ensureStyles();normalizeHeader();removeLegacyArtifacts();normalizeStudyKey();topic05Repairs();accessibility();const links=normalizeLocalNav();normalizeBreadcrumbs();normalizeBottomNav(links);tools();document.body.classList.add('enhanced-study');
  }
  window.CPCS351Navigation={refresh,closeTopics};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTopics()});document.addEventListener('click',e=>{const p=$('.edu-nav-panel');if(p&&!p.hidden&&!e.target.closest('.edu-nav-panel')&&!e.target.closest('[data-topics-button]'))closeTopics()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();

(()=>{
  if(window.__CPCS351_NAV__)return; window.__CPCS351_NAV__=true;
  const topics=[
    ['01','Introduction','01-introduction'],['02','Software Quality','02-software-quality'],['03','System Engineering','03-system-engineering'],['04','Process and Methodology','04-process-and-methodology'],['05','Requirements Elicitation & Use-Case Engineering','05-software-requirements-elicitation'],['06','Architectural Design & Software Design Principles','06-architectural-design-and-software-design-principles'],['07','Domain Modeling & UML Class Diagram','07-domain-modeling-and-uml-class-diagram'],['08','Object Interaction Modeling','08-object-interaction-modeling'],['09','Activity Modeling','09-activity-modeling'],['10','Interactions & Behaviour Revision','10-modeling-interactions-and-behavior-revision'],['11','Responsibility Assignment Patterns','11-responsibility-assignment-patterns'],['12','Software Testing','12-software-testing']
  ];
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const path=location.pathname;
  const match=path.match(/\/weeks\/(\d{2}-[^/]+)\/?/);
  const slug=match?.[1]||'';
  const topic=topics.find(t=>t[2]===slug);
  const topicIndex=topic?topics.indexOf(topic):-1;
  const base='/the-educator/learning/courses/cpcs351/';
  const isCourseHome=!topic && /\/cpcs351\/(?:index\.html)?$/.test(path);

  function ensureCSS(){if(document.querySelector('link[data-navigation-system]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=base+'navigation-system.css';l.dataset.navigationSystem='1';document.head.append(l)}
  function feedback(msg){let el=$('.edu-nav-feedback');if(!el){el=document.createElement('div');el.className='edu-nav-feedback';el.setAttribute('role','status');document.body.append(el)}el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1200)}

  function globalNav(){
    /* Course Home already has its own primary header. Do not duplicate it. */
    if(isCourseHome||$('.edu-global-nav'))return;
    const header=$('.topbar')||$('header');if(!header)return;
    const nav=document.createElement('nav');nav.className='edu-global-nav';nav.setAttribute('aria-label','Global course navigation');
    nav.innerHTML=`<div class="edu-nav-primary"><a href="${base}index.html" aria-label="CPCS 351 course home">⌂ <span class="label-wide">Course Home</span></a><button type="button" data-nav-panel="topics" aria-expanded="false">☰ <span>Topics</span></button>${topic?`<a class="edu-topic-chip is-current" href="${base}weeks/${topic[2]}/" aria-current="page">Topic ${topic[0]} · ${esc(topic[1])}</a>`:''}</div><div class="edu-nav-actions"><button type="button" data-nav-panel="search" aria-expanded="false">⌕ <span class="label-wide">Search</span></button><a href="${base}resources/">Resources</a></div>`;
    header.insertAdjacentElement('afterend',nav);
    nav.addEventListener('click',e=>{const b=e.target.closest('[data-nav-panel]');if(b)togglePanel(b.dataset.navPanel,b)})
  }

  function panel(){let p=$('.edu-nav-panel');if(p)return p;p=document.createElement('section');p.className='edu-nav-panel';p.hidden=true;p.setAttribute('aria-label','Course navigation panel');p.innerHTML=`<div class="edu-nav-panel-head"><strong>Course map</strong><button type="button" data-close-nav aria-label="Close navigation">✕</button></div><input type="search" aria-label="Filter topics" placeholder="Find a topic…"><div class="edu-topic-map"></div>`;document.body.append(p);$('[data-close-nav]',p).addEventListener('click',closePanel);$('input',p).addEventListener('input',renderMap);p.addEventListener('click',e=>{if(e.target.closest('a'))feedback('Opening selected topic')});return p}
  function renderMap(){const p=panel(),q=($('input',p).value||'').toLowerCase();$('.edu-topic-map',p).innerHTML=topics.filter(t=>!q||t[0].includes(q)||t[1].toLowerCase().includes(q)).map(t=>`<a href="${base}weeks/${t[2]}/" class="${topic&&t[0]===topic[0]?'current':''}"><span class="num">${t[0]}</span><span>${esc(t[1])}</span></a>`).join('')||'<p>No matching topics.</p>'}
  function togglePanel(kind,btn){const p=panel(),open=p.hidden;p.hidden=!open;$$('[data-nav-panel]').forEach(x=>x.setAttribute('aria-expanded','false'));if(open){btn.setAttribute('aria-expanded','true');renderMap();const input=$('input',p);input.placeholder=kind==='search'?'Search topics…':'Filter topics…';setTimeout(()=>input.focus(),0)}else btn.focus()}
  function closePanel(){const p=$('.edu-nav-panel');if(!p||p.hidden)return;p.hidden=true;const b=$('[data-nav-panel][aria-expanded="true"]');b?.setAttribute('aria-expanded','false');b?.focus()}

  function breadcrumbs(){if(!topic)return;const content=$('.content')||$('main');const hero=$('.hero');if(!content||!hero)return;$$('.breadcrumb').forEach(x=>x.remove());if($('.edu-breadcrumbs'))return;const title=($('.hero h1')?.textContent||document.title.split('|')[0]).trim();const b=document.createElement('nav');b.className='edu-breadcrumbs';b.setAttribute('aria-label','Breadcrumb');b.innerHTML=`<a href="${base}index.html">CPCS 351</a><span aria-hidden="true">›</span><a href="${base}weeks/${topic[2]}/">Topic ${topic[0]} · ${esc(topic[1])}</a><span aria-hidden="true">›</span><span aria-current="page">${esc(title)}</span>`;content.insertBefore(b,hero)}

  function localNav(){
    const side=$('.sidebar');if(!side)return;
    const links=$$('.side-link,.side-nav a',side);if(!links.length)return;
    const currentPath=location.pathname.replace(/\/$/,'/index.html');
    let current=links.find(a=>{try{return new URL(a.href,location.href).pathname.replace(/\/$/,'/index.html')===currentPath}catch{return false}})||links.find(a=>a.classList.contains('active'));
    links.forEach((a,i)=>{
      a.classList.add('side-link');
      /* Normalize all legacy/dynamic numbering to one badge only. */
      [...a.children].forEach(child=>{if(child.matches('span')&&/^\s*\d{1,2}\s*$/.test(child.textContent||''))child.remove()});
      const n=document.createElement('span');n.className='edu-lesson-number';n.dataset.navNumber='1';n.textContent=String(i+1).padStart(2,'0');a.prepend(n);
      const active=a===current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    side.setAttribute('aria-label','Topic lessons')
  }

  function bottomNav(){if(!topic)return;const side=$('.sidebar'),links=side?$$('.side-link,.side-nav a',side):[];const currentPath=location.pathname.replace(/\/$/,'/index.html');let i=links.findIndex(a=>{try{return new URL(a.href,location.href).pathname.replace(/\/$/,'/index.html')===currentPath}catch{return false}});let nav=$('.lesson-nav');if(!nav){nav=document.createElement('nav');nav.className='lesson-nav';($('article')||$('main'))?.append(nav)}nav.setAttribute('aria-label','Lesson navigation');nav.innerHTML='';const mk=(href,label,role)=>{const a=document.createElement('a');a.href=href;a.dataset.navRole=role;a.innerHTML=role==='prev'?`← <span>${esc(label)}</span>`:role==='next'?`<span>${esc(label)}</span> →`:`<span>${esc(label)}</span>`;return a};if(i>0)nav.append(mk(links[i-1].getAttribute('href'),'Previous Lesson','prev'));else if(topicIndex>0)nav.append(mk(`${base}weeks/${topics[topicIndex-1][2]}/`,'Previous Topic','prev'));else nav.append(mk(base+'index.html','Course Home','prev'));nav.append(mk(`${base}weeks/${topic[2]}/`,'Topic Home','home'));if(i>=0&&i<links.length-1)nav.append(mk(links[i+1].getAttribute('href'),'Next Lesson','next'));else if(topicIndex>=0&&topicIndex<topics.length-1)nav.append(mk(`${base}weeks/${topics[topicIndex+1][2]}/`,'Next Topic','next'));else nav.append(mk(base+'index.html','Course Home','next'))}

  function a11y(){
    /* Do not inject a visible Skip link. Existing keyboard focus and landmark semantics remain intact. */
    $('#skip-link')?.remove();
    const main=$('main');if(main){main.id=main.id||'main-study-content';main.tabIndex=-1}
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
    document.addEventListener('click',e=>{const p=$('.edu-nav-panel');if(p&&!p.hidden&&!e.target.closest('.edu-nav-panel')&&!e.target.closest('[data-nav-panel]'))closePanel()})
  }

  function auditRuntimeLinks(){const broken=[];$$('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!h||h.startsWith('#')||/^(https?:|mailto:|tel:|javascript:)/i.test(h))return;try{const u=new URL(h,location.href);if(u.origin!==location.origin)return;if(!a.dataset.navAudit){a.dataset.navAudit='checked';a.addEventListener('click',()=>feedback('Opening '+(a.textContent.trim()||'page')))}}catch{broken.push(h)}});if(broken.length)console.warn('Navigation link audit warnings:',broken)}
  function init(){ensureCSS();globalNav();localNav();breadcrumbs();bottomNav();a11y();auditRuntimeLinks()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,60));else setTimeout(init,60)
})();
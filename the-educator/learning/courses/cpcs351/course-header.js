(()=>{
  const BASE='/the-educator/learning/courses/cpcs351/';
  if(!document.querySelector('script[data-liquid-navigation]')){const s=document.createElement('script');s.src=BASE+'liquid-navigation.js';s.defer=true;s.dataset.liquidNavigation='1';document.head.append(s);}
  if(!document.querySelector('link[data-course-design-system]')&&!document.querySelector('link[href$="design-system.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href=BASE+'design-system.css';css.dataset.courseDesignSystem='1';document.head.append(css);}
  const path=location.pathname;
  const current=path.includes('/project/')?'project':path.includes('/research/')?'research':path.includes('/13-lab-learning-path/')?'labs':path.includes('/resources/')?'resources':path.includes('/lab-practice/')?'learning':path.endsWith('/cpcs351/')||path.endsWith('/cpcs351/index.html')?'home':'';
  const topicPage=!!document.body.dataset.topic;
  const labGuide=/\/weeks\/13-lab-learning-path\/lab\d{2}\.html$/i.test(path);
  let host=document.querySelector('[data-course-header],.resource-topbar,header.top,header.topbar,header.lab-topbar');
  // Lab guides already contain a purpose-built .bar header. Reuse it as the single course header
  // instead of prepending a second header above it.
  if(!host&&labGuide)host=document.querySelector('.bar');
  if(topicPage)host=null;
  if(!host){host=document.createElement('header');document.body.prepend(host);}
  host.className='course-header';host.setAttribute('data-course-header','');
  host.innerHTML=`<a class="course-header-brand" href="${BASE}index.html"><span class="brand-mark" aria-hidden="true"></span><span><strong>The Educator</strong><small>CPCS 351 · Software Engineering I</small></span></a><nav class="course-header-nav" aria-label="Course navigation"><a href="${BASE}index.html"${current==='home'?' aria-current="page"':''}>Course Home</a><a href="${BASE}index.html#learning-materials"${current==='learning'?' aria-current="page"':''}>Learning</a><a href="${BASE}project/"${current==='project'?' aria-current="page"':''}>Project</a><a href="${BASE}research/"${current==='research'?' aria-current="page"':''}>Research</a><a href="${BASE}weeks/13-lab-learning-path/"${current==='labs'?' aria-current="page"':''}>Labs</a><a href="${BASE}resources/"${current==='resources'?' aria-current="page"':''}>Resources</a></nav>`;
  let back=null;
  const practice=path.match(/\/lab-practice\/topic(\d{2})\.html$/i);
  const resource=path.includes('/resources/')&&!/\/resources\/(?:index\.html)?$/i.test(path);
  if(practice){
    const topics={01:'01-introduction',02:'02-software-quality',03:'03-system-engineering',04:'04-process-and-methodology',05:'05-software-requirements-elicitation',06:'06-architectural-design-and-software-design-principles',07:'07-domain-modeling-and-uml-class-diagram',08:'08-object-interaction-modeling',09:'09-activity-modeling',10:'10-modeling-interactions-and-behavior-revision',11:'11-responsibility-assignment-patterns',12:'12-software-testing'};
    const n=practice[1],slug=topics[n];if(slug)back={href:`${BASE}weeks/${slug}/`,label:`Back to Topic ${n}`};
  }else if(labGuide)back={href:`${BASE}weeks/13-lab-learning-path/`,label:'Back to Labs'};
  // Resource child pages already expose their parent through the breadcrumb. Add a separate
  // back row only on legacy/resource pages that do not provide that navigation themselves.
  else if(resource&&!document.querySelector('.breadcrumbs,[aria-label="Breadcrumb"]'))back={href:`${BASE}resources/`,label:'Back to Resources'};
  if(back){const row=document.createElement('div');row.className='course-context-row';row.innerHTML=`<a class="course-back-link" href="${back.href}">← ${back.label}</a>`;host.insertAdjacentElement('afterend',row);}
  if(current==='home'&&host.parentElement?.classList.contains('page'))document.body.prepend(host);
})();

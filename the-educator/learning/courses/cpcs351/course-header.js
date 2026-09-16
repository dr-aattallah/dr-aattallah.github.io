(()=>{
  const BASE='/the-educator/learning/courses/cpcs351/';
  if(!document.querySelector('link[data-course-design-system]')&&!document.querySelector('link[href$="design-system.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href=BASE+'design-system.css';css.dataset.courseDesignSystem='1';document.head.append(css);}
  const path=location.pathname;
  const current=path.includes('/project/')?'project':path.includes('/research/')?'research':path.includes('/13-lab-learning-path/')?'labs':path.includes('/resources/')?'resources':path.includes('/lab-practice/')?'learning':path.endsWith('/cpcs351/')||path.endsWith('/cpcs351/index.html')?'home':'';
  if(document.body.dataset.topic)return;
  let host=document.querySelector('[data-course-header],.resource-topbar,header.top,header.topbar,header.lab-topbar');
  if(!host){host=document.createElement('header');document.body.prepend(host);}
  host.className='course-header';host.setAttribute('data-course-header','');
  host.innerHTML=`<a class="course-header-brand" href="${BASE}index.html"><span class="brand-mark" aria-hidden="true"></span><span><strong>The Educator</strong><small>CPCS 351 · Software Engineering I</small></span></a><nav class="course-header-nav" aria-label="Course navigation"><a href="${BASE}index.html"${current==='home'?' aria-current="page"':''}>Course Home</a><a href="${BASE}index.html#learning-materials"${current==='learning'?' aria-current="page"':''}>Learning</a><a href="${BASE}project/"${current==='project'?' aria-current="page"':''}>Project</a><a href="${BASE}research/"${current==='research'?' aria-current="page"':''}>Research</a><a href="${BASE}weeks/13-lab-learning-path/"${current==='labs'?' aria-current="page"':''}>Labs</a><a href="${BASE}resources/"${current==='resources'?' aria-current="page"':''}>Resources</a></nav>`;
  if(current==='home'&&host.parentElement?.classList.contains('page'))document.body.prepend(host);
})();

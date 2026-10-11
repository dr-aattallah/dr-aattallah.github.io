/* Single Source of Truth: course navigation data, rendering and responsive behavior. */
(() => {
 const root=new URL('../../',document.currentScript.src),url=p=>new URL(p,root).href;
 const page=document.body.dataset.page||'',path=location.pathname;
 const category=document.body.dataset.category||(/\/units\/01\/(practice|transfer)\.html$/.test(path)?'practice':/\/units\/01\/workshop\.html$/.test(path)?'studios':/\/units\//.test(path)?'learn':'');
 const items=[
  ['home','Overview','Course home','index.html'],
  ['learn','Learn','Concepts & examples','learn/'],
  ['practice','Practice','Independent exercises','practice/'],
  ['studios','Studios','Collaborative engineering','studios/'],
  ['challenges','Challenges','Individual assessment','challenges/'],
  ['project','Project','Team project','project.html'],
  ['quick-checks','Quick Checks','Blackboard assessment','quick-checks/'],
  ['resources','Resources','Materials & downloads','resources.html'],
  ['syllabus','Syllabus','Course guide','syllabus.html']
 ];
 for(const file of ['assets/css/structure.css?v=20261011-beige-hero2','assets/css/navigation.css?v=20261010-nav7']){
   const link=document.createElement('link');link.rel='stylesheet';link.href=url(file);document.head.append(link);
 }
 const header=document.createElement('header');header.className='site-header course-header-v2';
 header.innerHTML=`<div class="course-header-inner"><a class="brand" href="${url('index.html')}" aria-label="CPCS 351 course home"><span class="brand-kicker">THE EDUCATOR · FCIT</span><strong>CPCS 351</strong><span class="brand-caption">SOFTWARE ENGINEERING I</span></a><details class="course-menu"><summary aria-label="Toggle course navigation">Explore <span aria-hidden="true">☰</span></summary><div class="course-menu-content"><nav class="unified-course-nav" aria-label="Course navigation">${items.map(([id,label,note,href])=>`<a class="course-nav-item" ${(page===id||category===id)?'aria-current="page"':''} href="${url(href)}"><span class="course-nav-title">${label}</span><span class="course-nav-note">${note}</span></a>`).join('')}</nav></div></details></div>`;
 const skip=document.querySelector('.skip');document.body.insertBefore(header,skip?skip.nextSibling:document.body.firstChild);
 const menu=header.querySelector('.course-menu'),mobile=matchMedia('(max-width:800px)');
 const sync=()=>{menu.open=!mobile.matches;};sync();
 mobile.addEventListener('change',sync);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.matches&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 document.addEventListener('click',e=>{if(mobile.matches&&menu.open&&!header.contains(e.target))menu.open=false;});
 const footer=()=>{const f=document.createElement('footer');f.className='site-footer';f.innerHTML='<div><b>The Educator</b> · CPCS 351 · Software Engineering I</div><div>King Abdulaziz University · Faculty of Computing &amp; Information Technology</div>';document.body.append(f);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',footer,{once:true});else footer();
})();
/* Shared accessible click-toggle for unit topic panels. */
(function(){
 function init(){
  const sidebar=document.querySelector('.unit-shell .unit-sidebar');
  if(!sidebar||sidebar.querySelector('.floating-unit-toggle'))return;
  const button=document.createElement('button');
  button.type='button';button.className='floating-unit-toggle';
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-label','Open unit topics');
  const id='floating-unit-topics';
  sidebar.id=sidebar.id||id;button.setAttribute('aria-controls',sidebar.id);
  button.innerHTML='<span class="toggle-icon" aria-hidden="true">☰</span><span>Unit topics</span><span class="toggle-arrow" aria-hidden="true">⌄</span>';
  sidebar.prepend(button);
  const setOpen=(open)=>{sidebar.classList.toggle('unit-nav-open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close unit topics':'Open unit topics');button.querySelector('.toggle-arrow').textContent=open?'⌃':'⌄';};
  button.addEventListener('click',()=>setOpen(!sidebar.classList.contains('unit-nav-open')));
  document.addEventListener('pointerdown',e=>{if(sidebar.classList.contains('unit-nav-open')&&!sidebar.contains(e.target))setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('unit-nav-open')){setOpen(false);button.focus();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* Central CLO-to-assessment display. Mappings from Assessment & Rubrics Handbook v1.1.
   Do not assign unmapped Quick Checks or exams by inference. */
(function(){
 const map=Object.freeze({
  M0:[1,5],M1:[2,3],M2:[3,4],M3:[5,6,7],
  RELEASE:[5,6,7],CHALLENGE1:[2],CHALLENGE2:[4,7],CHALLENGE3:[6,7]
 });
 const patterns=[
  [/\bM0\b|Project Proposal\s*&\s*Setup/i,'M0'],
  [/\bM1\b|Requirements\s*&\s*Analysis/i,'M1'],
  [/\bM2\b|Architecture\s*&\s*Design/i,'M2'],
  [/\bM3\b|Implementation\s*&\s*Testing/i,'M3'],
  [/Final (?:Engineering )?Release|Release\s*&\s*Demo/i,'RELEASE'],
  [/Challenge\s*1\b/i,'CHALLENGE1'],
  [/Challenge\s*2\b/i,'CHALLENGE2'],
  [/Challenge\s*3\b/i,'CHALLENGE3']
 ];
 function init(){
  const nodes=document.querySelectorAll('.timeline .week,.catalog-card,.grade-grid .grade,.project-places-grid a,.assessment-card,.task-hero,.page-hero,.task-heading,.milestone-card');
  for(const node of nodes){
   if(node.querySelector('.clo-mapping'))continue;
   const text=(node.querySelector('.w,.catalog-kicker,h3,h1')||node).textContent.trim();
   const matches=patterns.filter(([re])=>re.test(text));
   if(matches.length!==1)continue;
   const ids=map[matches[0][1]];
   const badge=document.createElement('span');
   badge.className='clo-mapping';
   badge.textContent='CLO '+ids.join(' · CLO ');
   badge.setAttribute('aria-label','Mapped course learning outcomes: '+ids.map(n=>'CLO '+n).join(', '));
   (node.querySelector('.catalog-kicker,.w,h3,h1')||node).insertAdjacentElement('afterend',badge);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

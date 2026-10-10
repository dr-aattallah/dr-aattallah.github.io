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
 for(const file of ['assets/css/structure.css?v=20261010-places1','assets/css/navigation.css?v=20261010-nav7']){
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
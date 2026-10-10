/* Single Source of Truth: course navigation data, rendering and responsive behavior. */
(() => {
 const root=new URL('../../',document.currentScript.src),url=p=>new URL(p,root).href;
 const page=document.body.dataset.page||'',path=location.pathname;
 const category=document.body.dataset.category||(/\/units\/01\/(practice|transfer)\.html$/.test(path)?'practice':/\/units\/01\/workshop\.html$/.test(path)?'studios':/\/units\//.test(path)?'learn':'');
 const primary=[['home','Overview','index.html'],['learning','Unit 01 · Pilot','units/01/'],['project','Project','project.html'],['syllabus','Syllabus','syllabus.html']];
 const places=[['learn','Learn','Concepts & examples','▤'],['practice','Practice','Independent exercises','✎'],['studios','Studios','Collaborative engineering','◈'],['challenges','Challenges','Individual assessment','◇'],['quick-checks','Quick Checks','Blackboard assessment','✓']];
 for(const path of ['assets/css/structure.css?v=20261010-places1','assets/css/navigation.css?v=20261010-nav2']){
   const link=document.createElement('link');link.rel='stylesheet';link.href=url(path);document.head.append(link);
 }
 const header=document.createElement('header');header.className='site-header course-header-v2';
 header.innerHTML=`<div class="course-header-inner"><a class="brand" href="${url('index.html')}" aria-label="CPCS 351 course home"><span class="brand-kicker">THE EDUCATOR · FCIT</span><strong>CPCS 351</strong><span class="brand-caption">SOFTWARE ENGINEERING I</span></a><details class="course-menu"><summary aria-label="Toggle course navigation">Explore <span aria-hidden="true">☰</span></summary><div class="course-menu-content"><nav class="site-nav" aria-label="Main course navigation">${primary.map(([id,label,p])=>`<a ${page===id?'class="active" aria-current="page"':''} href="${url(p)}">${label}</a>`).join('')}</nav><nav class="course-places" aria-label="Learning spaces">${places.map(([id,label,note,icon])=>`<a class="place-link place-${id}" ${category===id?'aria-current="location"':''} href="${url(id+'/')}"><span class="place-symbol" aria-hidden="true">${icon}</span><span class="place-text"><span class="place-title">${label}</span><small>${note}</small></span></a>`).join('')}</nav></div></details></div>`;
 const skip=document.querySelector('.skip');document.body.insertBefore(header,skip?skip.nextSibling:document.body.firstChild);
 const menu=header.querySelector('.course-menu'),mobile=matchMedia('(max-width:800px)');
 const sync=()=>{menu.open=!mobile.matches;};sync();
 mobile.addEventListener('change',sync);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.matches&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 document.addEventListener('click',e=>{if(mobile.matches&&menu.open&&!header.contains(e.target))menu.open=false;});
 const footer=()=>{const f=document.createElement('footer');f.className='site-footer';f.innerHTML='<div><b>The Educator</b> · CPCS 351 · Software Engineering I</div><div>King Abdulaziz University · Faculty of Computing &amp; Information Technology</div>';document.body.append(f);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',footer,{once:true});else footer();
})();
/* One course, five stable places. Content remains readable without this enhancement. */
(() => {
 const root=new URL('../../',document.currentScript.src),url=p=>new URL(p,root).href;
 const page=document.body.dataset.page||'',path=location.pathname;
 const category=document.body.dataset.category||(/\/units\/01\/(practice|transfer)\.html$/.test(path)?'practice':/\/units\/01\/workshop\.html$/.test(path)?'studios':/\/units\//.test(path)?'learn':'');
 const css=document.createElement('link');css.rel='stylesheet';css.href=url('assets/css/structure.css?v=20261010-places1');document.head.append(css);
 const places=[['learn','Learn','Concepts + examples','▤'],['practice','Practice','Ungraded exercises','✎'],['studios','Studios','Guided team work','◈'],['challenges','Challenges','Individual · graded','◇'],['quick-checks','Quick Checks','Blackboard · graded','✓']];
 const primary=[['home','Overview','index.html'],['learning','Unit 01 · Pilot','units/01/'],['project','Project','project.html'],['syllabus','Syllabus','syllabus.html']];
 const header=document.createElement('header');header.className='site-header';
 header.innerHTML=`<a class="brand" href="${url('index.html')}" aria-label="CPCS 351 home"><span class="brand-kicker">THE EDUCATOR / FCIT</span><strong>CPCS 351</strong></a><details class="course-menu"><summary>Explore course <span aria-hidden="true">⌄</span></summary><div class="course-menu-content"><nav class="site-nav" aria-label="Primary">${primary.map(([id,label,p])=>`<a ${page===id?'class="active" aria-current="page"':''} href="${url(p)}">${label}</a>`).join('')}</nav><nav class="course-places" aria-label="Course sections">${places.map(([id,label,note,icon])=>`<a class="place-link place-${id}" ${category===id?'aria-current="location"':''} href="${url(id+'/')}"><span class="place-symbol" aria-hidden="true">${icon}</span><span>${label}<small>${note}</small></span></a>`).join('')}</nav></div></details>`;
 const skip=document.querySelector('.skip');document.body.insertBefore(header,skip?skip.nextSibling:document.body.firstChild);
 const menu=header.querySelector('.course-menu'),mobile=matchMedia('(max-width:980px)');const sync=()=>{menu.open=!mobile.matches;};sync();mobile.addEventListener('change',sync);
 const footer=()=>{const f=document.createElement('footer');f.className='site-footer';f.innerHTML='<div><b>The Educator</b> · CPCS 351 · Software Engineering I</div><div>King Abdulaziz University · Faculty of Computing &amp; Information Technology</div>';document.body.append(f);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',footer,{once:true});else footer();
})();

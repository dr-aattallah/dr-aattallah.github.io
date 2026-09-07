(()=>{
  const topicLabel='Design Patterns & GRASP Responsibility Assignment';
  // Third value preserves the existing renderer page number for legacy dynamic lessons.
  const pages=[
    ['index.html','Foundations & Pattern Map',1],
    ['gof-singleton.html','Singleton',2],
    ['builder.html','Builder',3],
    ['factory-method.html','Factory Method',4],
    ['facade.html','Facade',5],
    ['adapter.html','Adapter',6],
    ['observer.html','Observer',7],
    ['design-principles.html','Design Principles',null],
    ['grasp-controller.html','GRASP Controller',8],
    ['controller-quality.html','Controller Quality',9],
    ['expert.html','Information Expert',10],
    ['creator.html','Creator',11],
    ['worked-example.html','Patterns Working Together',12],
    ['review.html','Review & Practice',13]
  ];
  const file=location.pathname.split('/').pop()||'index.html';
  const current=Math.max(0,pages.findIndex(p=>p[0]===file));
  document.body.dataset.topic='11';
  document.body.dataset.page=pages[current]?.[2]==null?'design-principles':String(pages[current][2]);

  const normalizeLabels=()=>{
    const bc=[...document.querySelectorAll('.edu-breadcrumbs a')];
    if(bc[1])bc[1].textContent=`Topic 11 · ${topicLabel}`;
    document.querySelectorAll('.edu-topic-map a').forEach(a=>{
      const num=a.querySelector('.num')?.textContent?.trim();
      if(num==='11'){
        const spans=a.querySelectorAll('span');
        if(spans[1])spans[1].textContent=topicLabel;
      }
    });
  };

  const rebuild=()=>{
    document.querySelectorAll('.crumbs,.legend').forEach(x=>x.remove());
    window.CPCS351Navigation?.refresh();
    normalizeLabels();
  };

  const mount=()=>{
    const side=document.getElementById('topic-sidebar');
    const links=pages.map((p,i)=>`<a class="side-link ${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
    if(side)side.innerHTML=`<div class="side-head"><small>Topic 11</small><strong>${topicLabel}</strong></div>${links}`;

    rebuild();

    const panel=document.querySelector('.edu-nav-panel');
    if(panel)new MutationObserver(normalizeLabels).observe(panel,{childList:true,subtree:true});
  };

  // Initial navigation build.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

  // Topic 11 renders several lessons dynamically after the initial DOM pass.
  // Rebuild once all scripts/images are settled so breadcrumbs, mobile rail,
  // active state, and Previous/Home/Next controls are consistent on every page.
  window.addEventListener('load',()=>{
    requestAnimationFrame(()=>requestAnimationFrame(rebuild));
  },{once:true});
})();
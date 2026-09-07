(()=>{
  const pages=[
    ['index.html','Foundations & Pattern Map'],
    ['gof-singleton.html','Singleton'],
    ['builder.html','Builder'],
    ['factory-method.html','Factory Method'],
    ['facade.html','Facade'],
    ['adapter.html','Adapter'],
    ['observer.html','Observer'],
    ['grasp-controller.html','GRASP Controller'],
    ['controller-quality.html','Controller Quality'],
    ['expert.html','Information Expert'],
    ['creator.html','Creator'],
    ['worked-example.html','Patterns Working Together'],
    ['review.html','Review & Practice']
  ];
  const file=location.pathname.split('/').pop()||'index.html';
  const current=Math.max(0,pages.findIndex(p=>p[0]===file));
  document.body.dataset.topic='11';
  document.body.dataset.page=String(current+1);

  const mount=()=>{
    const side=document.getElementById('topic-sidebar');
    const links=pages.map((p,i)=>`<a class="side-link ${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
    if(side)side.innerHTML=`<div class="side-head"><small>Topic 11</small><strong>Design Patterns & GRASP Responsibility Assignment</strong></div>${links}`;

    // Topic 11 previously rendered its own breadcrumb/key. The shared study system
    // already provides both, so remove the legacy copies before refreshing navigation.
    document.querySelectorAll('.crumbs,.legend').forEach(x=>x.remove());

    // Re-run the same shared navigation pipeline used by Topic 10 so sidebar numbering,
    // active state, mobile navigation, breadcrumbs, and Previous/Home/Next stay consistent.
    window.CPCS351Navigation?.refresh();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
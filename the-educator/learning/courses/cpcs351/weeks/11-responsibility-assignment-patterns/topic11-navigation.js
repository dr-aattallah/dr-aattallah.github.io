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
    const mobile=document.getElementById('topic-mobile');
    const links=pages.map((p,i)=>`<a class="side-link ${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
    if(side)side.innerHTML=`<div class="side-head"><small>Topic 11</small><strong>Design Patterns & GRASP Responsibility Assignment</strong></div>${links}`;
    if(mobile)mobile.innerHTML=pages.map((p,i)=>`<a class="${i===current?'active':''}" href="${p[0]}">${String(i+1).padStart(2,'0')} · ${p[1]}</a>`).join('');

    const crumbs=[...document.querySelectorAll('.crumbs')];
    if(crumbs.length>1)crumbs.slice(1).forEach(x=>x.remove());
    const legends=[...document.querySelectorAll('.legend')];
    if(legends.length>1)legends.slice(1).forEach(x=>x.remove());
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
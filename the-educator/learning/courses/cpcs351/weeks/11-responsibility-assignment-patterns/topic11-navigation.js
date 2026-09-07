(()=>{
  const topicLabel='Design Patterns & GRASP Responsibility Assignment';
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

  const mount=()=>{
    const side=document.getElementById('topic-sidebar');
    const links=pages.map((p,i)=>`<a class="side-link ${i===current?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
    if(side)side.innerHTML=`<div class="side-head"><small>Topic 11</small><strong>${topicLabel}</strong></div>${links}`;

    // Remove Topic 11's old local copies; the shared course system owns these elements.
    document.querySelectorAll('.crumbs,.legend').forEach(x=>x.remove());

    // Use the exact navigation pipeline used by Topic 10.
    window.CPCS351Navigation?.refresh();
    normalizeLabels();

    const panel=document.querySelector('.edu-nav-panel');
    if(panel)new MutationObserver(normalizeLabels).observe(panel,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
(()=>{
  const pages=[
    ['index.html','OIM Overview'],
    ['methodology-context.html','Methodology Context'],
    ['foreground-background.html','Foreground vs Background'],
    ['oim-process.html','OIM Process & Nontrivial Steps'],
    ['scenarios.html','Scenarios & Scenario Tables'],
    ['library-checkout.html','Library Checkout: Full Scenario'],
    ['sequence-diagrams.html','Scenario → Sequence Diagram'],
    ['analysis-design.html','Analysis vs Design'],
    ['message-semantics.html','Messages & Flow of Control'],
    ['control.html','Loops, Guards & Object Creation'],
    ['implementation.html','Sequence → Implementation'],
    ['worked-examples.html','Worked Examples'],
    ['practice.html','Practice Studio'],
    ['review.html','Review & Common Mistakes']
  ];

  const current=location.pathname.split('/').pop()||'index.html';
  const activeIndex=Math.max(0,pages.findIndex(p=>p[0]===current));

  document.querySelectorAll('[data-o8-nav]').forEach(nav=>{
    const isSidebar=nav.classList.contains('sidebar');
    if(isSidebar){
      const head='<div class="side-head"><small>Topic 08 · Chapter 9</small><strong>Object Interaction Modeling</strong></div>';
      const links=pages.map((p,i)=>`<a class="side-link ${i===activeIndex?'active':''}" href="${p[0]}"><span>${String(i+1).padStart(2,'0')}</span><span>${p[1]}</span></a>`).join('');
      nav.innerHTML=head+links;
    }else{
      nav.innerHTML=pages.map((p,i)=>`<a class="${i===activeIndex?'active':''}" href="${p[0]}">${String(i+1).padStart(2,'0')} · ${p[1]}</a>`).join('');
    }
  });

  const prev=document.querySelector('#prev-link');
  const next=document.querySelector('#next-link');
  if(prev&&activeIndex>0){
    prev.href=pages[activeIndex-1][0];
    prev.textContent='← '+pages[activeIndex-1][1];
    prev.hidden=false;
  }
  if(next&&activeIndex<pages.length-1){
    next.href=pages[activeIndex+1][0];
    next.textContent=pages[activeIndex+1][1]+' →';
    next.hidden=false;
  }
})();
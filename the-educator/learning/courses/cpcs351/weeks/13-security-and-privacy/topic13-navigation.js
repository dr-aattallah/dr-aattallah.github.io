(()=>{
  const topicLabel='Security & Privacy';
  const pages=[
    ['index.html','Security & Privacy'],
    ['privacy-security.html','Privacy & Information Security'],
    ['security-terms-user.html','Security Terms & User Security'],
    ['password-policy.html','Password Policy'],
    ['software-security.html','Software Security'],
    ['secure-design.html','Secure Software Design'],
    ['malware.html','Malware']
  ];
  const file=location.pathname.split('/').pop()||'index.html';
  const current=Math.max(0,pages.findIndex(p=>p[0]===file));
  document.body.dataset.topic='13';
  document.body.dataset.page=String(current+1);

  const normalizeLabels=()=>{
    const bc=[...document.querySelectorAll('.edu-breadcrumbs a')];
    if(bc[1])bc[1].textContent=`Topic 13 · ${topicLabel}`;
    document.querySelectorAll('.edu-topic-map a').forEach(a=>{
      const num=a.querySelector('.num')?.textContent?.trim();
      if(num==='13'){
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
    if(side)side.innerHTML=`<div class="side-head"><small>Topic 13</small><strong>${topicLabel}</strong></div>${links}`;
    rebuild();
    const panel=document.querySelector('.edu-nav-panel');
    if(panel)new MutationObserver(normalizeLabels).observe(panel,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(rebuild)),{once:true});
})();
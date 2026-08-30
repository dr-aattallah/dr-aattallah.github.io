(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){location.href='access.html';return;}
  const topics=[
    ['01','Introduction','weeks/01-introduction/'],
    ['02','Software Quality','weeks/02-software-quality/'],
    ['03','System Engineering','weeks/03-system-engineering/'],
    ['04','Process and Methodology','weeks/04-process-and-methodology/'],
    ['05','Software Requirements Elicitation','weeks/05-software-requirements-elicitation/'],
    ['06','Deriving Use Cases from Requirements','weeks/06-deriving-use-cases-from-requirements/'],
    ['07','Architectural Design and Software Design Principles','weeks/07-architectural-design-and-software-design-principles/'],
    ['08','Domain Modeling and UML Class Diagram','weeks/08-domain-modeling-and-uml-class-diagram/'],
    ['09','Object Interaction Modeling','weeks/09-object-interaction-modeling/'],
    ['10','Activity Modeling','weeks/10-activity-modeling/'],
    ['11','Modelling Interactions and Behaviour Revision','weeks/11-modeling-interactions-and-behavior-revision/'],
    ['12','Applying Responsibility Assignment Patterns','weeks/12-responsibility-assignment-patterns/'],
    ['13','Software Testing','weeks/13-software-testing/']
  ];
  const icon='<span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg></span>';
  const list=document.querySelector('#topic-list'),q=document.querySelector('#course-search'),summary=document.querySelector('#course-progress'),progress=document.querySelector('.progress');
  function done(n){try{return (JSON.parse(localStorage.getItem(`cpcs351-topic-${Number(n)}`)||'{}').completed||[]).length}catch{return 0}}
  function render(filter=''){
    const f=filter.toLowerCase().trim();
    list.innerHTML=topics.filter(t=>!f||t[1].toLowerCase().includes(f)||t[0].includes(f)).map(t=>{
      const count=done(t[0]);
      return `<a class="topic" href="${t[2]}"><span class="num">${t[0]}</span><span><strong>${t[1]}</strong><small>${count?`${count} Page${count===1?'':'s'} Completed`:'Not Started'}</small></span>${icon}</a>`;
    }).join('')||'<p class="empty">No Topic matches your search.</p>';
    const started=topics.filter(t=>done(t[0])>0).length;
    summary.textContent=`${started} of ${topics.length} Topics Started`;
    progress.setAttribute('aria-valuenow',String(started));
    progress.querySelector('i').style.width=`${started/topics.length*100}%`;
  }
  q.addEventListener('input',()=>render(q.value));
  render();
})();
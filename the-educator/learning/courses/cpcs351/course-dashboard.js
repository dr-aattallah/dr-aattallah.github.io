(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){location.href='access.html';return;}
  const topics=[
    ['01','Introduction','weeks/01-introduction/'],
    ['02','Software Quality','weeks/02-software-quality/'],
    ['03','System Engineering','weeks/03-system-engineering/'],
    ['04','Process and Methodology','weeks/04-process-and-methodology/'],
    ['05','Requirements Elicitation & Use-Case Engineering','weeks/05-software-requirements-elicitation/'],
    ['06','Architectural Design and Software Design Principles','weeks/07-architectural-design-and-software-design-principles/'],
    ['07','Domain Modeling and UML Class Diagram','weeks/08-domain-modeling-and-uml-class-diagram/'],
    ['08','Object Interaction Modeling','weeks/09-object-interaction-modeling/'],
    ['09','Activity Modeling','weeks/10-activity-modeling/'],
    ['10','Modelling Interactions and Behaviour Revision','weeks/11-modeling-interactions-and-behavior-revision/'],
    ['11','Applying Responsibility Assignment Patterns','weeks/12-responsibility-assignment-patterns/'],
    ['12','Software Testing','weeks/13-software-testing/']
  ];
  const icon='<span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg></span>';
  const list=document.querySelector('#topic-list'),q=document.querySelector('#course-search'),summary=document.querySelector('#course-progress'),progress=document.querySelector('.progress');
  const storageAliases={
    '06':['06','07'],
    '07':['07','08'],
    '08':['08','09'],
    '09':['09','10'],
    '10':['10','11'],
    '11':['11','12'],
    '12':['12','13']
  };
  function done(n){
    try{
      const keys=storageAliases[n]||[n];
      return Math.max(...keys.map(k=>(JSON.parse(localStorage.getItem(`cpcs351-topic-${Number(k)}`)||'{}').completed||[]).length),0);
    }catch{return 0}
  }
  function render(filter=''){
    const f=filter.toLowerCase().trim();
    list.innerHTML=topics.filter(t=>!f||t[1].toLowerCase().includes(f)||t[0].includes(f)).map(t=>{
      const count=done(t[0]);
      return `<a class="topic" href="${t[2]}"><span class="num">${t[0]}</span><span><strong>${t[1]}</strong><small>${count?`${count} Page${count===1?'':'s'} Completed`:'Not Started'}</small></span>${icon}</a>`;
    }).join('')||'<p class="empty">No Topic matches your search.</p>';
    const started=topics.filter(t=>done(t[0])>0).length;
    summary.textContent=`${started} of ${topics.length} Topics Started`;
    progress.setAttribute('aria-valuemax',String(topics.length));
    progress.setAttribute('aria-valuenow',String(started));
    progress.querySelector('i').style.width=`${started/topics.length*100}%`;
  }
  q.addEventListener('input',()=>render(q.value));
  render();
})();
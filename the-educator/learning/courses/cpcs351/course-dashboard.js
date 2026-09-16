(()=>{
  if(sessionStorage.getItem('cpcs351_access')!=='granted'){location.href='access.html';return;}
  const headerScript=document.createElement('script');headerScript.src='course-header.js';document.head.append(headerScript);
  const topics=[['01','Introduction','weeks/01-introduction/'],['02','Software Quality','weeks/02-software-quality/'],['03','System Engineering','weeks/03-system-engineering/'],['04','Process and Methodology','weeks/04-process-and-methodology/'],['05','Requirements Elicitation & Use-Case Engineering','weeks/05-software-requirements-elicitation/'],['06','Architectural Design and Software Design Principles','weeks/06-architectural-design-and-software-design-principles/'],['07','Domain Modeling and UML Class Diagram','weeks/07-domain-modeling-and-uml-class-diagram/'],['08','Object Interaction Modeling','weeks/08-object-interaction-modeling/'],['09','Behavioral Modeling with UML','weeks/09-activity-modeling/'],['10','Integrated UML Modeling','weeks/10-modeling-interactions-and-behavior-revision/'],['11','Applying Responsibility Assignment Patterns','weeks/11-responsibility-assignment-patterns/'],['12','Software Testing','weeks/12-software-testing/']];
  const icon='<span class="arrow" aria-hidden="true">›</span>';
  const list=document.querySelector('#topic-list');
  function render(){if(!list)return;list.innerHTML=topics.map(t=>`<a class="topic" href="${t[2]}"><span class="num">${t[0]}</span><span><strong>${t[1]}</strong><small>Open learning material</small></span>${icon}</a>`).join('')}
  render();
})();
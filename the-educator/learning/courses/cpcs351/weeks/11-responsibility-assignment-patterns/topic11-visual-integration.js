(()=>{
  const fig=(src,alt,caption)=>{const f=document.createElement('figure');f.className='t11-infographic';f.innerHTML=`<img src="assets/${src}" alt="${alt}" loading="lazy"><figcaption>${caption}</figcaption>`;return f};
  const removeSeq=(n=Infinity)=>{[...document.querySelectorAll('.seq-wrap')].slice(0,n).forEach(x=>x.remove())};
  const byHeading=(text)=>[...document.querySelectorAll('.section')].find(s=>(s.querySelector('h2')?.textContent||'').includes(text));
  const mount=()=>{
    if(document.body.dataset.topic!=='11') return;
    const page=document.body.dataset.page;
    if(page==='8'){
      const hero=document.querySelector('.p11-hero');
      if(hero) hero.replaceWith(fig('chechoutsquanceuml.png','Infographic showing the initial checkout sequence design, its presentation-layer coupling problems, and the design direction toward lower coupling.','Why a Controller is needed: the initial checkout design gives the GUI too many responsibilities and couples presentation directly to business objects.'));
      removeSeq();
      const controller=byHeading('Controller pattern');
      if(controller){controller.insertAdjacentElement('afterend',fig('controllerdespat.png','Infographic answering who should handle an actor request by introducing CheckoutController between the GUI and business logic.','Controller answers the system-event question: the GUI forwards the actor request to a dedicated controller, keeping presentation focused on interaction.'));}
    }
    if(page==='9'){
      const first=document.querySelector('.section');
      if(first) first.insertAdjacentElement('afterend',fig('checkousquancelumlanswer.png','Infographic combining the checkout class exercise with the completed Controller-based sequence design.','From exercise to completed design: CheckoutController receives the system event and coordinates DBMgr, Loan, and Document while the GUI stays simple.'));
    }
    if(page==='10'){
      const firstSeq=document.querySelector('.seq-wrap'); if(firstSeq) firstSeq.remove();
      const checkout=byHeading('Checkout: move availability behavior to Document'); if(checkout) checkout.remove();
      const hero=document.querySelector('.p11-hero');
      if(hero) hero.insertAdjacentElement('afterend',fig('experpattern.png','Infographic comparing an initial checkout design with an improved design using the Information Expert pattern.','Information Expert in action: Document owns availability information, so isAvailable() and setAvailable() belong to Document rather than DBMgr or the Controller.'));
    }
    if(page==='11'){
      const sections=[...document.querySelectorAll('.section')];
      sections.filter(s=>/Creator rule|chapter's Creator activity/i.test(s.querySelector('h2')?.textContent||'')).forEach(s=>s.remove());
      removeSeq(1);
      const hero=document.querySelector('.hero');
      if(hero) hero.insertAdjacentElement('afterend',fig('creatorpattern.png','Infographic explaining the GRASP Creator pattern with a Book creating Chapter objects and the criteria for assigning creation responsibility.','Creator pattern: give object-creation responsibility to the class that already contains, records, closely uses, aggregates, or has the data needed to create the new object.'));
      const bridge=document.createElement('div');bridge.className='t11-bridge';bridge.innerHTML='<strong>Course connection:</strong> in the checkout example, CheckoutController may create Loan because it has the required user/document information at that point in the collaboration. The rule is not “controllers create objects”; the rule is to choose the class with the strongest creation relationship or data.';
      const f=document.querySelector('.t11-infographic'); if(f) f.insertAdjacentElement('afterend',bridge);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
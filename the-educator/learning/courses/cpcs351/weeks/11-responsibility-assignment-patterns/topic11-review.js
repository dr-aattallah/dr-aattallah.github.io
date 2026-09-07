(()=>{
  const mount=()=>{
    if(!location.pathname.endsWith('/review.html'))return;
    const article=document.querySelector('article.content');
    if(!article)return;
    const nav=article.querySelector('.lesson-nav');
    [...article.querySelectorAll('.section,.rule')].forEach(x=>x.remove());
    const old=document.getElementById('topic11-review-v2');if(old)old.remove();
    const wrap=document.createElement('div');
    wrap.id='topic11-review-v2';
    wrap.innerHTML=`
      <section class="section">
        <h2>Topic 11 in one mental model</h2>
        <div class="pattern-grid">
          <div class="pattern-card creational"><b>Creational GoF</b><p><strong>Singleton · Builder · Factory Method</strong><br>Control how objects are created.</p></div>
          <div class="pattern-card structural"><b>Structural GoF</b><p><strong>Facade · Adapter</strong><br>Simplify or connect structures.</p></div>
          <div class="pattern-card behavioral"><b>Behavioral GoF</b><p><strong>Observer</strong><br>Organize reactions and communication.</p></div>
          <div class="pattern-card grasp"><b>GRASP</b><p><strong>Controller · Expert · Creator</strong><br>Assign responsibilities to the right objects.</p></div>
        </div>
      </section>
      <section class="section">
        <h2>Principles → responsibility decisions</h2>
        <table class="compact-table">
          <tr><th>If you notice…</th><th>Think about…</th><th>Then ask…</th></tr>
          <tr><td>One class doing unrelated jobs</td><td>SRP · High Cohesion</td><td>Which responsibilities belong elsewhere?</td></tr>
          <tr><td>Too many direct dependencies</td><td>Low Coupling · DIP</td><td>Can an abstraction, Facade, Adapter, or better responsibility assignment reduce dependency?</td></tr>
          <tr><td>UI performing domain work</td><td>Separation of concerns · High Cohesion</td><td>Should a Controller receive the event and delegate?</td></tr>
          <tr><td>Behavior placed away from its data</td><td>Information Expert</td><td>Which object already owns the information?</td></tr>
          <tr><td>Unclear object construction</td><td>Creator · Creational patterns</td><td>Who has the strongest relationship or creation data?</td></tr>
        </table>
      </section>
      <section class="section">
        <h2>Diagnose the design</h2>
        <div class="decision">
          <b>1 · CheckoutGUI queries Document, creates Loan, saves it, and updates availability.</b><span><strong>Diagnosis:</strong> presentation has too many responsibilities and high coupling. <strong>Direction:</strong> Controller receives the system event; domain work is delegated.</span>
          <b>2 · DBMgr answers isAvailable() even though availability belongs to Document.</b><span><strong>Diagnosis:</strong> misplaced responsibility. <strong>Direction:</strong> Information Expert → Document answers its own state.</span>
          <b>3 · StoreController handles product search, payment, customer updates, order creation, and status changes.</b><span><strong>Diagnosis:</strong> Bloated Controller / low cohesion. <strong>Direction:</strong> keep coordination in the controller and delegate domain work.</span>
          <b>4 · A reporting client must talk directly to six complex subsystem classes.</b><span><strong>Diagnosis:</strong> unnecessary subsystem coupling. <strong>Direction:</strong> consider Facade.</span>
          <b>5 · An existing client expects XML but a useful service accepts JSON.</b><span><strong>Diagnosis:</strong> incompatible interfaces. <strong>Direction:</strong> Adapter translates between them.</span>
          <b>6 · Many screens must update automatically when order status changes.</b><span><strong>Diagnosis:</strong> one-to-many change notification. <strong>Direction:</strong> Observer.</span>
        </div>
      </section>
      <section class="section">
        <h2>Fast retrieval check</h2>
        <table class="compact-table">
          <tr><th>Question</th><th>Answer to retrieve</th></tr>
          <tr><td>Exactly one controlled shared instance?</td><td>Singleton</td></tr>
          <tr><td>Complex step-by-step construction?</td><td>Builder</td></tr>
          <tr><td>Subclass decides the concrete product?</td><td>Factory Method</td></tr>
          <tr><td>One simple entry to a complex subsystem?</td><td>Facade</td></tr>
          <tr><td>Translate incompatible interfaces?</td><td>Adapter</td></tr>
          <tr><td>Notify subscribers when state changes?</td><td>Observer</td></tr>
          <tr><td>Who receives the system event?</td><td>Controller</td></tr>
          <tr><td>Who has the information needed?</td><td>Information Expert</td></tr>
          <tr><td>Who should create the object?</td><td>Creator</td></tr>
        </table>
      </section>
      <div class="rule"><b>Exam mindset:</b> do not start by naming a pattern. First diagnose the design problem, identify the responsibility or dependency causing it, then justify the principle or pattern that improves the design.</div>`;
    if(nav)nav.insertAdjacentElement('beforebegin',wrap);else article.append(wrap);
    window.CPCS351Navigation?.refresh();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));else setTimeout(mount,0);
})();
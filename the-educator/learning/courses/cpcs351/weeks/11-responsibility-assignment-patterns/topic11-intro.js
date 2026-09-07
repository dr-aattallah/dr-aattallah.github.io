(()=>{
  const mount=()=>{
    if(document.body.dataset.topic!=='11' || document.body.dataset.page!=='1') return;
    const hero=document.querySelector('.p11-hero');
    if(!hero || document.querySelector('#design-pattern-foundations')) return;
    const section=document.createElement('div');
    section.id='design-pattern-foundations';
    section.innerHTML=`
      <section class="section">
        <div class="pattern-banner" style="background:linear-gradient(135deg,#eef2ff,#f0fdfa);border-color:#c7d2fe">
          <span class="pattern-icon">🧭</span>
          <div><span class="pill">FOUNDATION</span><h2>Before the catalog: what is a Design Pattern?</h2><p>A design pattern is a reusable <strong>design idea</strong> for a problem that appears repeatedly in software design. It is a blueprint to adapt—not finished code to copy.</p></div>
        </div>
        <div class="decision">
          <b>Problem repeats</b><span>Different systems encounter similar design forces: object creation, incompatible interfaces, change notification, responsibility assignment, and more.</span>
          <b>Pattern captures experience</b><span>A proven arrangement is given a name, intent, structure, participants, consequences, and guidance about when it fits.</span>
          <b>You adapt it</b><span>The same pattern can lead to different code in different systems because a pattern describes a design concept rather than a fixed implementation.</span>
        </div>
        <div class="rule"><b>Pattern ≠ code snippet ≠ algorithm.</b> An algorithm prescribes steps to achieve a result; a design pattern describes a reusable organization of responsibilities and collaborators that you adapt to context.</div>
      </section>

      <section class="section">
        <h2>Why are Design Patterns important?</h2>
        <div class="hook-grid">
          <div class="hook crea-hook"><span class="big-icon">🧰</span><b>Reusable design knowledge</b><p>Start from a known solution family instead of rediscovering the same design from zero.</p></div>
          <div class="hook stru-hook"><span class="big-icon">💬</span><b>Shared vocabulary</b><p>Names such as Adapter, Observer, or Factory Method let a team communicate a larger design idea quickly.</p></div>
          <div class="hook beha-hook"><span class="big-icon">🧠</span><b>Better OO reasoning</b><p>Patterns teach how to distribute creation, structure, communication, and responsibilities among collaborating objects.</p></div>
        </div>
        <table class="compact-table">
          <tr><th>They help you…</th><th>But they do NOT mean…</th></tr>
          <tr><td>Recognize recurring design problems faster.</td><td>Every problem needs a pattern.</td></tr>
          <tr><td>Discuss trade-offs using a common design language.</td><td>A pattern is automatically the best solution.</td></tr>
          <tr><td>Reuse design experience across projects and languages.</td><td>Copy the same implementation everywhere.</td></tr>
          <tr><td>Improve flexibility when the problem genuinely matches the pattern.</td><td>Add abstraction just to make a design look sophisticated.</td></tr>
        </table>
      </section>

      <section class="section">
        <h2>Where did they come from—and why are they so widespread?</h2>
        <div class="flow"><span>🏛️ Christopher Alexander</span><i>→</i><span>📘 GoF · 1994</span><i>→</i><span>23 classic OO patterns</span><i>→</i><span>🌍 Shared software vocabulary</span></div>
        <p>The pattern idea came from architecture and was adapted to software. In 1994, Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides—the <strong>Gang of Four (GoF)</strong>—published <em>Design Patterns: Elements of Reusable Object-Oriented Software</em>. Their catalog of 23 object-oriented patterns made pattern-oriented design a standard part of software-design vocabulary. Modern catalogs such as Refactoring.Guru continue to teach the classic families with visual explanations and code examples.</p>
        <div class="source-note">Further reading: <a class="source-link" href="https://refactoring.guru/design-patterns/history" target="_blank" rel="noopener">History of patterns · Refactoring.Guru ↗</a></div>
      </section>

      <section class="section">
        <h2>How are patterns used in real design?</h2>
        <div class="steps">
          <div class="step"><span class="num">1</span><b>Recognize</b><p>Name the recurring design problem—not the pattern you want to force into the system.</p></div>
          <div class="step"><span class="num">2</span><b>Match</b><p>Compare the problem, context, and forces with a suitable pattern's intent and applicability.</p></div>
          <div class="step"><span class="num">3</span><b>Adapt</b><p>Map pattern roles to your classes and objects; tailor the structure to your system.</p></div>
          <div class="step"><span class="num">4</span><b>Evaluate</b><p>Check consequences: coupling, complexity, flexibility, testability, and future change.</p></div>
        </div>
        <div class="rule"><b>Good pattern use starts from the problem.</b> Do not begin with “Where can I use Singleton?” Begin with “What design problem and forces do I have?”</div>
      </section>

      <section class="section">
        <h2>Design Pattern vs Architectural Pattern</h2>
        <p>Both capture reusable design knowledge, but they operate at very different <strong>scales</strong>. Architectural patterns shape the organization of an application or major subsystems; GoF design patterns usually solve more localized object/class collaboration problems inside that architecture.</p>
        <table class="compact-table">
          <tr><th>Dimension</th><th>Architectural Pattern</th><th>Design Pattern</th></tr>
          <tr><td>Scale</td><td>System / application / major subsystem</td><td>Classes, objects, and collaborations</td></tr>
          <tr><td>Main question</td><td>How should the major parts of the system be organized?</td><td>How should a recurring design problem among objects/classes be solved?</td></tr>
          <tr><td>Impact</td><td>Broad; influences major components, dependencies, data/control flow, and evolution.</td><td>More local; influences creation, structure, communication, or responsibility assignment.</td></tr>
          <tr><td>Examples</td><td>Layered Architecture · Client–Server · MVC</td><td>Singleton · Builder · Factory Method · Adapter · Facade · Observer</td></tr>
          <tr><td>Relationship</td><td colspan="2"><strong>They can coexist.</strong> One architecture can contain many design patterns. A pattern does not replace architecture; it helps solve design problems within it.</td></tr>
        </table>
        <div class="flow"><span>🏙️ Architectural Pattern<br><small>whole-system organization</small></span><i>→ contains →</i><span>🏢 Components / Subsystems</span><i>→ use →</i><span>🧩 Design Patterns<br><small>object collaborations</small></span></div>
      </section>

      <section class="section">
        <h2>A useful scale map</h2>
        <div class="pattern-grid">
          <div class="pattern-card structural"><span class="big-icon">🏙️</span><b>Architectural Patterns</b><p>Highest scale in this comparison. Organize the architecture of an application.</p></div>
          <div class="pattern-card creational"><span class="big-icon">🧩</span><b>Design Patterns</b><p>Reusable object/class design solutions. This topic focuses mainly on GoF plus GRASP responsibility patterns.</p></div>
          <div class="pattern-card behavioral"><span class="big-icon">⌨️</span><b>Idioms</b><p>Lower-level recurring implementation techniques, often tied to a particular programming language.</p></div>
        </div>
        <div class="source-note">Classification reference: <a class="source-link" href="https://refactoring.guru/design-patterns/classification" target="_blank" rel="noopener">Classification of patterns · Refactoring.Guru ↗</a></div>
      </section>

      <section class="section">
        <h2>Then classify by intent: the GoF families</h2>
        <div class="pattern-grid">
          <div class="pattern-card creational"><span class="big-icon">🏗️</span><b>Creational</b><p><strong>Question:</strong> How should objects be created?</p><p>Examples here: Singleton · Builder · Factory Method.</p></div>
          <div class="pattern-card structural"><span class="big-icon">🧱</span><b>Structural</b><p><strong>Question:</strong> How should classes and objects be assembled?</p><p>Examples here: Facade · Adapter.</p></div>
          <div class="pattern-card behavioral"><span class="big-icon">📣</span><b>Behavioral</b><p><strong>Question:</strong> How should objects communicate and divide behavior?</p><p>Example here: Observer.</p></div>
        </div>
        <div class="source-note">Catalog reference: <a class="source-link" href="https://refactoring.guru/design-patterns/catalog" target="_blank" rel="noopener">Design Pattern Catalog · Refactoring.Guru ↗</a></div>
      </section>`;
    hero.insertAdjacentElement('afterend',section);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
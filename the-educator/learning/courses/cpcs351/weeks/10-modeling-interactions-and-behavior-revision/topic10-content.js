const P={
1:{title:'One System, Three Behavioral Views',eyebrow:'Topic 10 · Integrated Behavioral Modeling · 01',lead:'Start with one modern scenario. Then look at it through three different behavioral lenses.',body:`<section class="t10-story"><div class="kicker">ANCHOR EXAMPLE · SMART PARCEL LOCKER</div><h2>A parcel arrives. What happens next?</h2><p>A customer receives a pickup code, opens a smart locker, collects the parcel, and the system confirms pickup. If the code is invalid or expires, pickup is blocked.</p><div class="story-strip"><div class="story-beat"><span>📦</span><b>Parcel arrives</b>Locker assigned</div><div class="story-beat"><span>📲</span><b>Code sent</b>Customer notified</div><div class="story-beat"><span>🔐</span><b>Code entered</b>System validates</div><div class="story-beat"><span>🚪</span><b>Locker opens</b>Parcel collected</div><div class="story-beat"><span>✅</span><b>Pickup confirmed</b>Journey ends</div></div></section><div class="t10-question">Same scenario. Different question → different UML view.</div><div class="lens-grid"><div class="lens"><span class="icon">💬</span><b>Sequence</b>Who exchanges messages, and in what order?</div><div class="lens"><span class="icon">🔄</span><b>State</b>How does the Parcel Pickup change through its lifecycle?</div><div class="lens"><span class="icon">🧭</span><b>Activity</b>How does the pickup workflow branch and flow?</div></div><div class="remember"><strong>Big idea</strong><p>These diagrams do not compete. They answer different questions about the same behavior.</p></div>`},
2:{title:'From Scenario to Behavioral Questions',eyebrow:'02 · MODEL BEFORE YOU DRAW',lead:'Do not choose a UML diagram because it is familiar. Choose it because it answers your modeling question.',body:`<div class="model-banner"><div class="big">🧩</div><div><b>Scenario facts</b><p>Customer has a pickup code · locker validates it · valid code opens a compartment · invalid or expired code blocks pickup · successful collection is confirmed.</p></div></div><div class="step-grid"><div class="step"><span class="num">1</span><b>Find participants</b>Customer, Mobile App, Locker, Pickup Service.</div><div class="step"><span class="num">2</span><b>Find the tracked object</b>Pickup / parcel collection lifecycle.</div><div class="step"><span class="num">3</span><b>Find workflow choices</b>Valid? Expired? Parcel collected?</div><div class="step"><span class="num">4</span><b>Choose the lens</b>Sequence, State, or Activity.</div></div><section class="section"><h2>Behavioral question map</h2><div class="choice"><div><b>Who talks to whom?</b><br>→ Sequence Diagram</div><div><b>What condition is the object in?</b><br>→ State Diagram</div><div><b>What work happens next?</b><br>→ Activity Diagram</div></div></section>`},
3:{title:'Sequence View — Who Interacts?',eyebrow:'03 · INTERACTION LENS',lead:'Follow ordered messages among participants that collaborate to complete parcel pickup.',body:`<div class="model-banner"><div class="big">💬</div><div><b>Focus</b><p>Participants + messages + order. Do not turn states or workflow actions into extra lifelines.</p></div></div><div class="trace"><span>Customer</span><i>→</i><span>Locker</span><i>→</i><span>Pickup Service</span><i>→</i><span>Mobile App</span></div><div class="code-label"><b>PlantUML · Sequence Diagram</b><span>Anchor scenario</span></div><pre class="plantuml">@startuml
title Smart Parcel Locker Pickup - Sequence Diagram
actor Customer
participant "Smart Locker" as Locker
participant "Pickup Service" as Service
participant "Mobile App" as App

Customer -> Locker : enterPickupCode(code)
Locker -> Service : validateCode(code)
alt valid and active
  Service --> Locker : validationOK(parcelId)
  Locker -> Locker : unlockCompartment()
  Locker --> Customer : doorOpened
  Customer -> Locker : collectParcel()
  Locker -> Service : confirmPickup(parcelId)
  Service -> App : sendPickupConfirmation()
  App --> Customer : showConfirmation()
else invalid or expired
  Service --> Locker : validationFailed(reason)
  Locker --> Customer : showPickupBlocked(reason)
end
@enduml</pre>`},
4:{title:'State View — What Changes?',eyebrow:'04 · LIFECYCLE LENS',lead:'Track one subject—the Parcel Pickup—and show how events move it from one meaningful condition to another.',body:`<div class="model-banner"><div class="big">🔄</div><div><b>Tracked subject: Parcel Pickup</b><p>States are stable conditions. Transitions are triggered by events; guards refine when a transition may occur.</p></div></div><div class="trace"><span>Ready</span><i>→</i><span>Validating</span><i>→</i><span>Accessible</span><i>→</i><span>Collected</span></div><div class="code-label"><b>PlantUML · State Diagram</b><span>Same scenario, new lens</span></div><pre class="plantuml">@startuml
title Smart Parcel Pickup - State Diagram
hide empty description
[*] --> ReadyForPickup
ReadyForPickup --> Validating : codeEntered
Validating --> Accessible : codeValid [notExpired]
Validating --> Blocked : codeInvalid
Validating --> Expired : codeValid [expired]
Accessible --> Collected : parcelRemoved
Collected --> Confirmed : pickupRecorded
Confirmed --> [*]
Blocked --> ReadyForPickup : retryAllowed
Expired --> [*]
@enduml</pre>`},
5:{title:'Activity View — How Work Flows',eyebrow:'05 · WORKFLOW LENS',lead:'Model the work: actions, decisions, responsibility, and the route to success or failure.',body:`<div class="model-banner"><div class="big">🧭</div><div><b>Focus</b><p>Actions and control flow. Swimlanes clarify responsibility; guards clarify alternative paths.</p></div></div><div class="trace"><span>Enter code</span><i>→</i><span>Validate</span><i>◆</i><span>Open / Reject</span><i>→</i><span>Confirm</span></div><div class="code-label"><b>PlantUML · Activity Diagram</b><span>Same scenario, workflow lens</span></div><pre class="plantuml">@startuml
title Smart Parcel Locker Pickup - Activity Diagram
|Customer|
start
:Enter pickup code;
|Smart Locker|
:Send code for validation;
|Pickup Service|
:Validate code;
if (Code valid and active?) then (yes)
  |Smart Locker|
  :Unlock compartment;
  |Customer|
  :Collect parcel;
  |Smart Locker|
  :Detect parcel removal;
  |Pickup Service|
  :Record pickup;
  :Send confirmation;
else (no)
  |Smart Locker|
  :Display rejection reason;
endif
stop
@enduml</pre>`},
6:{title:'Same Scenario, Three Models',eyebrow:'06 · CONNECT THE VIEWS',lead:'Now compare what each model reveals—and what it intentionally leaves out.',body:`<div class="compare-grid"><div class="compare-card"><b>💬 Sequence</b><p><strong>Reveals:</strong> message order and collaboration.</p><p><strong>Leaves out:</strong> full object lifecycle.</p></div><div class="compare-card"><b>🔄 State</b><p><strong>Reveals:</strong> lifecycle, events and guards.</p><p><strong>Leaves out:</strong> detailed participant collaboration.</p></div><div class="compare-card"><b>🧭 Activity</b><p><strong>Reveals:</strong> workflow, decisions and responsibility.</p><p><strong>Leaves out:</strong> message-level protocol.</p></div></div><section class="section"><h2>Trace one fact across views</h2><div class="trace"><span>Scenario: valid code</span><i>→</i><span>Sequence: validationOK()</span><i>→</i><span>State: Accessible</span><i>→</i><span>Activity: [yes] branch</span></div></section><div class="warning-card"><b>Do not force identical content into every diagram.</b> Consistency means the views agree—not that they duplicate one another.</div>`},
7:{title:'Consistency Across Models',eyebrow:'07 · CROSS-MODEL REASONING',lead:'A good model set tells one coherent story. Contradictions are design clues.',body:`<div class="step-grid"><div class="step"><span class="num">1</span><b>Check vocabulary</b>Use the same domain concepts across views.</div><div class="step"><span class="num">2</span><b>Check events</b>A lifecycle-changing message should have a compatible state transition.</div><div class="step"><span class="num">3</span><b>Check alternatives</b>Important guards should not disappear from the workflow.</div><div class="step"><span class="num">4</span><b>Check outcomes</b>Success and failure must remain semantically compatible.</div></div><section class="section"><h2>Spot the inconsistency</h2><div class="warning-card">Sequence says an <b>expired code opens the locker</b>, while State says <b>expired → terminal Expired</b>. Both cannot describe the same requirement. Revisit the scenario before polishing either diagram.</div></section><div class="remember"><strong>Engineering habit</strong><p>Use disagreement between models to discover ambiguous or missing requirements.</p></div>`},
8:{title:'Integrated Case Study',eyebrow:'08 · FROM REQUIREMENT TO MODEL SET',lead:'Build a coherent behavioral model set from a compact scenario instead of three unrelated drawing exercises.',body:`<section class="t10-story"><div class="kicker">MINI CASE · EV CHARGING SESSION</div><h2>Plug in → authorize → charge → stop → pay</h2><p>A driver connects an EV. The station authorizes the account, starts charging if approved, stops when requested or complete, calculates cost, and records payment.</p></section><div class="trace"><span>Use case goal</span><i>→</i><span>Interaction messages</span><i>→</i><span>Session lifecycle</span><i>→</i><span>Charging workflow</span></div><div class="compare-grid"><div class="compare-card"><b>Sequence candidate</b>Driver ↔ Station ↔ Authorization Service ↔ Payment Service.</div><div class="compare-card"><b>State candidate</b>Idle → Authorizing → Charging → Completing → Paid.</div><div class="compare-card"><b>Activity candidate</b>Connect → authorize → [approved?] → charge → calculate → pay.</div></div><section class="section"><h2>Design rule</h2><p>Start from the scenario facts. Derive each view from the same source instead of inventing behavior independently in each diagram.</p></section>`},
9:{title:'Model Selection Challenges',eyebrow:'09 · CHOOSE BEFORE YOU DRAW',lead:'Practice identifying the modeling question before selecting notation.',body:`<div class="choice"><div><b>“Show how the app, API and payment gateway exchange calls.”</b><br><br>Best lens: <strong>Sequence</strong></div><div><b>“Show how an Order changes from Created to Delivered or Cancelled.”</b><br><br>Best lens: <strong>State</strong></div><div><b>“Show checkout steps, decisions and parallel fraud/payment checks.”</b><br><br>Best lens: <strong>Activity</strong></div></div><section class="section"><h2>Harder question</h2><p>A requirement says: “When payment succeeds, the order becomes Paid and fulfillment begins.” You may need <b>more than one view</b>: State for the lifecycle change, Activity for workflow continuation, and Sequence if message collaboration matters.</p></section>`},
10:{title:'Behavior Modeling Studio',eyebrow:'10 · LEARNING BY DOING',lead:'Model first. Compare later. The goal is reasoning, not copying a finished diagram.',body:`<div class="studio"><h2>Studio challenge · Ride-hailing pickup</h2><p>Rider requests a trip. The platform searches for a driver. A driver may accept or the request may time out. After acceptance, the driver travels to pickup, the rider boards, and the trip begins.</p><div class="step-grid"><div class="step"><span class="num">1</span><b>Sequence</b>Choose lifelines and key messages.</div><div class="step"><span class="num">2</span><b>State</b>Choose one tracked object and its states.</div><div class="step"><span class="num">3</span><b>Activity</b>Show decisions and responsibilities.</div><div class="step"><span class="num">4</span><b>Cross-check</b>Find one fact represented consistently in all views.</div></div></div><div class="remember"><strong>Submission test</strong><p>Can you explain why each element belongs in that diagram instead of another one?</p></div>`},
11:{title:'Integrated Review & Exam Readiness',eyebrow:'11 · SYNTHESIS',lead:'Finish by proving that you can select, read, connect and critique behavioral models.',body:`<div class="mastery"><div><b>1</b><br>Select the right view</div><div><b>2</b><br>Read messages</div><div><b>3</b><br>Trace states</div><div><b>4</b><br>Follow workflow</div><div><b>5</b><br>Check consistency</div></div><section class="section"><h2>60-second decision rule</h2><div class="choice"><div><b>WHO + MESSAGE ORDER?</b><br>Sequence</div><div><b>ONE OBJECT + LIFECYCLE?</b><br>State</div><div><b>WORK + BRANCHING/PARALLELISM?</b><br>Activity</div></div></section><section class="section"><h2>Final self-check</h2><ul class="study-list"><li>I can explain why multiple UML views are needed for one scenario.</li><li>I can derive Sequence, State and Activity views from shared requirements.</li><li>I can detect contradictions between behavioral models.</li><li>I can justify my model choice instead of choosing by habit.</li></ul></section><div class="remember"><strong>Takeaway</strong><p>Modeling is not drawing diagrams. Modeling is choosing a useful viewpoint, abstracting the right information, and keeping multiple views consistent.</p></div>`}}
;
(()=>{const n=Number(document.body.dataset.page||1),p=P[n],a=document.querySelector('article.content');if(!p||!a)return;document.title=`${p.title} | Topic 10`;a.innerHTML=`<div class="breadcrumb"><a href="../../index.html">CPCS 351</a><span>›</span><span>Topic 10 · Integrated Behavioral Modeling</span></div><section class="hero"><div class="hero-copy"><div class="eyebrow">${p.eyebrow}</div><h1>${p.title}</h1><p class="lead">${p.lead}</p></div><div class="hero-progress"><span>${n}</span><small>of 11 pages</small></div></section>${p.body}<nav class="lesson-nav"><a id="prev-link" hidden class="prev">← Previous</a><a href="../../index.html" class="course-home">Course home</a><a id="next-link" hidden class="next">Next →</a></nav>`})();
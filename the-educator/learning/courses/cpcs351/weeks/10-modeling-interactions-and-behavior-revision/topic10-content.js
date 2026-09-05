const P={
1:{title:'Smart Parcel Locker Pickup — One Scenario, Four UML Views',eyebrow:'Topic 10 · Integrated Modeling · 01',lead:'Begin with one complete scenario. Every diagram in the next pages is derived from this same source of truth.',body:`<section class="t10-story anchor-story"><div class="kicker">ANCHOR SCENARIO · SMART PARCEL LOCKER PICKUP SYSTEM</div><h2>The scenario we will model throughout Topic 10</h2><p class="scenario-text">An online retailer delivers customer parcels to a network of smart parcel lockers. When a courier arrives at a locker location, the courier identifies the parcel and the system assigns an available compartment that can accommodate it. The courier places the parcel inside, closes the door, and the system records that the parcel is ready for pickup. The customer is then notified through the mobile app and receives a unique pickup code with an expiration time. Later, the customer arrives at the locker and enters the pickup code. The smart locker sends the code to the pickup service for validation. If the code is valid and has not expired, the correct compartment is unlocked and the customer removes the parcel. The locker detects that the parcel has been collected, the pickup service records the successful pickup, and the mobile app shows a confirmation. If the code is invalid, the customer may retry while attempts remain. If the code has expired, pickup is blocked and the customer is instructed to request a new code. The system must never open a compartment for an invalid or expired code, and a successful pickup can be recorded only after the parcel has actually been removed.</p><div class="story-strip"><div class="story-beat"><span>🚚</span><b>Courier deposits</b>Parcel is placed in an assigned locker.</div><div class="story-beat"><span>📲</span><b>Customer notified</b>A time-limited pickup code is issued.</div><div class="story-beat"><span>🔐</span><b>Code validated</b>Valid, invalid, and expired paths differ.</div><div class="story-beat"><span>🚪</span><b>Locker opens</b>Only a valid active code unlocks it.</div><div class="story-beat"><span>✅</span><b>Pickup confirmed</b>Only after parcel removal is detected.</div></div></section><div class="t10-question">We will now model the <em>same scenario</em> from four different UML viewpoints.</div><div class="lens-grid four"><div class="lens usecase"><span class="icon">🎯</span><b>Use Case Diagram</b>Who uses the system, and what goals do they achieve?</div><div class="lens sequence"><span class="icon">💬</span><b>Sequence Diagram</b>Which participants exchange messages, and in what order?</div><div class="lens state"><span class="icon">🔄</span><b>State Diagram</b>How does one tracked subject change through its lifecycle?</div><div class="lens activity"><span class="icon">🧭</span><b>Activity Diagram</b>How does work flow across actions, decisions, and responsibilities?</div></div><div class="remember"><strong>Modeling rule</strong><p>Do not invent a new story for each diagram. Derive every view from the same requirements, then check that the views agree.</p></div>`},
2:{title:'Use Case View — Who Wants What?',eyebrow:'02 · USER-GOAL LENS',lead:'Review the system boundary, actors, goals, and include/extend relationships using the Smart Parcel Locker scenario.',body:`<div class="model-banner usecase-banner"><div class="big">🎯</div><div><b>Question answered by this view</b><p>Who interacts with the Smart Parcel Locker Pickup System, and which user goals does the system support?</p></div></div><div class="focus-grid"><div><b>Primary actors</b><span>Customer · Courier</span></div><div><b>System boundary</b><span>Smart Parcel Locker Pickup System</span></div><div><b>Main goals</b><span>Deposit parcel · Collect parcel</span></div><div><b>Supporting behavior</b><span>Assign locker · Validate code · Notify · Confirm pickup</span></div></div><section class="section"><h2>What we intentionally model</h2><p>The courier wants to <b>deposit a parcel</b>; the customer wants to <b>collect a parcel</b>. Internal services such as assigning a compartment, validating a code, opening the locker, and confirming pickup support those user goals. They are not separate actors when they are inside the system boundary.</p></section><div class="code-label"><b>PlantUML · Use Case Diagram</b><span>Solution derived from the anchor scenario</span></div><pre class="plantuml usecase-code">@startuml
title Smart Parcel Locker Pickup - Use Case Diagram
left to right direction

actor Customer
actor Courier

rectangle "Smart Parcel Locker Pickup System" {
  usecase "Deposit Parcel" as UC_Deposit
  usecase "Assign Locker\nCompartment" as UC_Assign
  usecase "Record Parcel\nReady for Pickup" as UC_Ready
  usecase "Notify Customer" as UC_Notify

  usecase "Collect Parcel" as UC_Collect
  usecase "Validate Pickup Code" as UC_Validate
  usecase "Open Locker\nCompartment" as UC_Open
  usecase "Confirm Pickup" as UC_Confirm
  usecase "Retry Pickup Code" as UC_Retry
  usecase "Request New Code" as UC_NewCode
}

Courier --> UC_Deposit
Customer --> UC_Collect
Customer --> UC_NewCode

UC_Deposit .> UC_Assign : <<include>>
UC_Deposit .> UC_Ready : <<include>>
UC_Ready .> UC_Notify : <<include>>

UC_Collect .> UC_Validate : <<include>>
UC_Collect .> UC_Open : <<include>>
UC_Collect .> UC_Confirm : <<include>>
UC_Retry .> UC_Collect : <<extend>>\n[invalid code & attempts remain]
UC_NewCode .> UC_Collect : <<extend>>\n[code expired]
@enduml</pre><div class="view-tip"><b>Review cue:</b> Use Case Diagram = <strong>actors + user goals + system boundary</strong>. It does not show message order or object states.</div>`},
3:{title:'Sequence View — Who Interacts, and When?',eyebrow:'03 · INTERACTION LENS',lead:'Zoom into the Collect Parcel use case and review ordered messages among the customer, locker, pickup service, and mobile app.',body:`<div class="model-banner sequence-banner"><div class="big">💬</div><div><b>Scenario slice</b><p>This page models the successful and unsuccessful message exchanges that occur when a customer tries to collect a parcel.</p></div></div><div class="trace"><span>Customer</span><i>→</i><span>Smart Locker</span><i>→</i><span>Pickup Service</span><i>→</i><span>Mobile App</span></div><section class="section"><h2>What this view adds</h2><p>Unlike the Use Case Diagram, the Sequence Diagram reveals <b>who sends each message</b>, <b>when validation occurs</b>, and <b>how alternative outcomes are handled</b>. The <code>alt</code> fragment separates valid, invalid, and expired-code behavior.</p></section><div class="code-label"><b>PlantUML · Sequence Diagram</b><span>Collect Parcel interaction</span></div><pre class="plantuml sequence-code">@startuml
title Smart Parcel Locker Pickup - Sequence Diagram

actor Customer
participant "Smart Locker" as Locker
participant "Pickup Service" as Service
participant "Mobile App" as App

Customer -> Locker : enterPickupCode(code)
Locker -> Service : validateCode(code)

alt valid and active
  Service --> Locker : validationOK(parcelId, compartment)
  Locker -> Locker : unlockCompartment(compartment)
  Locker --> Customer : doorOpened
  Customer -> Locker : removeParcel()
  Locker -> Locker : detectParcelRemoved()
  Locker -> Service : confirmPickup(parcelId)
  Service -> Service : markCollected()
  Service -> App : sendPickupConfirmation(parcelId)
  App --> Customer : showConfirmation()
else invalid and retry allowed
  Service --> Locker : validationFailed("invalid")
  Locker --> Customer : showRetryMessage()
else expired
  Service --> Locker : validationFailed("expired")
  Locker --> Customer : showExpiredMessage()
  Customer -> App : requestNewPickupCode()
  App -> Service : createReplacementCode()
  Service --> App : replacementCodeCreated()
  App --> Customer : showNewPickupCode()
end
@enduml</pre><div class="view-tip"><b>Review cue:</b> Sequence Diagram = <strong>participants + ordered messages + interaction alternatives</strong>.</div>`},
4:{title:'State View — What Changes Over Time?',eyebrow:'04 · LIFECYCLE LENS',lead:'Track one subject—the Parcel Pickup—and review how events and guards move it between meaningful states.',body:`<div class="model-banner state-banner"><div class="big">🔄</div><div><b>Tracked subject: Parcel Pickup</b><p>Do not model every action as a state. Keep only conditions that persist long enough to matter to the lifecycle.</p></div></div><div class="trace"><span>AwaitingPickup</span><i>→</i><span>Validating</span><i>→</i><span>Accessible</span><i>→</i><span>Collected</span><i>→</i><span>Confirmed</span></div><section class="section"><h2>What this view adds</h2><p>The State Diagram ignores detailed message collaboration and focuses on the changing condition of the pickup. Events such as <b>codeEntered</b> and <b>parcelRemoved</b> trigger transitions; guards distinguish valid, invalid, and expired-code outcomes.</p></section><div class="code-label"><b>PlantUML · State Diagram</b><span>Parcel Pickup lifecycle</span></div><pre class="plantuml state-code">@startuml
title Smart Parcel Locker Pickup - State Diagram
hide empty description

[*] --> AwaitingPickup : parcelReady

AwaitingPickup --> Validating : codeEntered

Validating --> Accessible : validationPassed [notExpired]
Validating --> RetryAllowed : validationFailed [attemptsRemain]
Validating --> Expired : validationPassed [expired]
Validating --> Blocked : validationFailed [noAttemptsRemain]

RetryAllowed --> Validating : codeReentered
Accessible --> Collected : parcelRemoved
Collected --> Confirmed : pickupRecorded

Confirmed --> [*]
Expired --> [*]
Blocked --> [*]
@enduml</pre><div class="view-tip"><b>Review cue:</b> State Diagram = <strong>one subject + states + events + guards + lifecycle outcomes</strong>.</div>`},
5:{title:'Activity View — How Does the Work Flow?',eyebrow:'05 · WORKFLOW LENS',lead:'Review actions, decisions, swimlane responsibility, and alternative workflow paths for parcel pickup.',body:`<div class="model-banner activity-banner"><div class="big">🧭</div><div><b>Workflow question</b><p>What happens from code entry until pickup succeeds, retries, expires, or is blocked—and who performs each action?</p></div></div><div class="trace"><span>Enter code</span><i>→</i><span>Validate</span><i>◆</i><span>Unlock / Retry / Expire</span><i>→</i><span>Collect</span><i>→</i><span>Confirm</span></div><section class="section"><h2>What this view adds</h2><p>The Activity Diagram emphasizes <b>work and responsibility</b>. Swimlanes distinguish Customer, Smart Locker, Pickup Service, and Mobile App. Decisions represent valid, invalid, and expired paths without turning them into object states.</p></section><div class="code-label"><b>PlantUML · Activity Diagram</b><span>Collect Parcel workflow</span></div><pre class="plantuml activity-code">@startuml
title Smart Parcel Locker Pickup - Activity Diagram

|Customer|
start
:Enter pickup code;

|Smart Locker|
:Send code for validation;

|Pickup Service|
:Validate pickup code;

if (Code valid?) then (yes)
  if (Code expired?) then (yes)
    |Smart Locker|
    :Display code expired;
    |Customer|
    :Request new pickup code;
    |Mobile App|
    :Request replacement code;
    |Pickup Service|
    :Create replacement code;
    |Mobile App|
    :Show new pickup code;
  else (no)
    |Smart Locker|
    :Unlock assigned compartment;
    |Customer|
    :Remove parcel;
    |Smart Locker|
    :Detect parcel removal;
    |Pickup Service|
    :Record successful pickup;
    |Mobile App|
    :Show pickup confirmation;
  endif
else (no)
  |Pickup Service|
  if (Attempts remain?) then (yes)
    |Smart Locker|
    :Display retry message;
  else (no)
    |Smart Locker|
    :Block pickup attempt;
  endif
endif

stop
@enduml</pre><div class="view-tip"><b>Review cue:</b> Activity Diagram = <strong>actions + control flow + decisions + responsibility</strong>.</div>`},
6:{title:'Same Scenario, Four Models',eyebrow:'06 · CONNECT THE VIEWS',lead:'Compare what each model reveals, what it intentionally hides, and how all four views remain consistent with one scenario.',body:`<div class="compare-grid four"><div class="compare-card usecase-card"><b>🎯 Use Case</b><p><strong>Reveals:</strong> actors, goals, system boundary.</p><p><strong>Key fact:</strong> Customer collects a parcel.</p></div><div class="compare-card sequence-card"><b>💬 Sequence</b><p><strong>Reveals:</strong> ordered message collaboration.</p><p><strong>Key fact:</strong> validateCode() happens before unlock.</p></div><div class="compare-card state-card"><b>🔄 State</b><p><strong>Reveals:</strong> lifecycle, events, guards.</p><p><strong>Key fact:</strong> valid active code leads to Accessible.</p></div><div class="compare-card activity-card"><b>🧭 Activity</b><p><strong>Reveals:</strong> workflow, decisions, responsibility.</p><p><strong>Key fact:</strong> valid/expired/invalid paths branch.</p></div></div><section class="section"><h2>Trace one requirement across all four views</h2><div class="trace"><span>Requirement: only valid active code opens locker</span><i>→</i><span>Use Case: Validate Pickup Code</span><i>→</i><span>Sequence: validationOK()</span><i>→</i><span>State: [notExpired] → Accessible</span><i>→</i><span>Activity: valid + not expired branch</span></div></section><div class="warning-card"><b>Consistency does not mean duplication.</b> Each diagram keeps only the information needed by its viewpoint.</div>`},
7:{title:'Consistency Across Models',eyebrow:'07 · CROSS-MODEL REASONING',lead:'Use the four views as mutual checks. A contradiction between diagrams often reveals an ambiguous or incorrect requirement.',body:`<div class="step-grid"><div class="step"><span class="num">1</span><b>Check goals</b>Use cases must match behavior implemented in the other views.</div><div class="step"><span class="num">2</span><b>Check messages</b>Lifecycle-changing messages should agree with state transitions.</div><div class="step"><span class="num">3</span><b>Check guards</b>Important conditions should remain compatible across State and Activity views.</div><div class="step"><span class="num">4</span><b>Check outcomes</b>Success, retry, expiry, and blocking must mean the same thing everywhere.</div></div><section class="section"><h2>Spot the contradiction</h2><div class="warning-card">Suppose the Sequence Diagram says an <b>expired code causes unlockCompartment()</b>, while the State Diagram says <b>Expired → final</b>. Both cannot satisfy the same scenario. Fix the requirement interpretation before polishing either diagram.</div></section><div class="remember"><strong>Engineering habit</strong><p>Use disagreements between models as evidence. They help expose missing, inconsistent, or misunderstood requirements.</p></div>`},
8:{title:'Integrated Case Study',eyebrow:'08 · TRANSFER THE METHOD',lead:'Apply the same four-view reasoning to a new system after mastering the Smart Parcel Locker example.',body:`<section class="t10-story ev-story"><div class="kicker">TRANSFER CASE · EV CHARGING SESSION</div><h2>Plug in → authorize → charge → stop → pay</h2><p>A driver connects an EV to a charging station. The station authorizes the account, starts charging if approved, stops when requested or when charging completes, calculates the cost, and records payment.</p></section><div class="compare-grid four"><div class="compare-card usecase-card"><b>🎯 Use Case candidate</b>Start charging session · Stop charging · Pay for session.</div><div class="compare-card sequence-card"><b>💬 Sequence candidate</b>Driver ↔ Station ↔ Authorization Service ↔ Payment Service.</div><div class="compare-card state-card"><b>🔄 State candidate</b>Idle → Authorizing → Charging → Completing → Paid.</div><div class="compare-card activity-card"><b>🧭 Activity candidate</b>Connect → authorize → [approved?] → charge → calculate → pay.</div></div><div class="remember"><strong>Transfer principle</strong><p>The diagram types stay the same; only the domain changes. Start from one scenario and derive all views from it.</p></div>`},
9:{title:'Model Selection Challenges',eyebrow:'09 · CHOOSE BEFORE YOU DRAW',lead:'Practice identifying the modeling question before selecting the UML view.',body:`<div class="choice four"><div><b>“Show what a Rider and Driver want from the ride-hailing system.”</b><br><br>Best lens: <strong>Use Case</strong></div><div><b>“Show how app, API and payment gateway exchange calls.”</b><br><br>Best lens: <strong>Sequence</strong></div><div><b>“Show how an Order changes from Created to Delivered or Cancelled.”</b><br><br>Best lens: <strong>State</strong></div><div><b>“Show checkout steps, decisions, and parallel checks.”</b><br><br>Best lens: <strong>Activity</strong></div></div><section class="section"><h2>Sometimes one question needs multiple views</h2><p>“When payment succeeds, the order becomes Paid and fulfillment begins” touches at least two views: <b>State</b> for the lifecycle change and <b>Activity</b> for workflow continuation. Add <b>Sequence</b> when message collaboration matters and <b>Use Case</b> when the user goal or system boundary is the question.</p></section>`},
10:{title:'Integrated Modeling Studio',eyebrow:'10 · LEARNING BY DOING',lead:'Model one scenario four ways. The goal is viewpoint selection and consistency—not copying a finished diagram.',body:`<div class="studio"><h2>Studio challenge · Ride-hailing pickup</h2><p>Rider requests a trip. The platform searches for a driver. A driver may accept or the request may time out. After acceptance, the driver travels to pickup, the rider boards, and the trip begins.</p><div class="step-grid"><div class="step"><span class="num">1</span><b>Use Case</b>Identify actors, goals, and boundary.</div><div class="step"><span class="num">2</span><b>Sequence</b>Choose lifelines and key messages.</div><div class="step"><span class="num">3</span><b>State</b>Choose one tracked object and lifecycle.</div><div class="step"><span class="num">4</span><b>Activity</b>Show decisions and responsibilities.</div></div></div><section class="section"><h2>Cross-check after drawing</h2><div class="trace"><span>Same actor names?</span><i>→</i><span>Same success/failure meaning?</span><i>→</i><span>Messages compatible with states?</span><i>→</i><span>Workflow guards compatible?</span></div></section><div class="remember"><strong>Submission test</strong><p>Can you explain why each element belongs in that diagram instead of another one?</p></div>`},
11:{title:'Integrated Review & Exam Readiness',eyebrow:'11 · SYNTHESIS',lead:'Finish by proving that you can select, derive, read, connect, and critique four UML views from one scenario.',body:`<div class="mastery"><div><b>1</b><br>Find actors & goals</div><div><b>2</b><br>Read messages</div><div><b>3</b><br>Trace states</div><div><b>4</b><br>Follow workflow</div><div><b>5</b><br>Check consistency</div></div><section class="section"><h2>60-second model-selection rule</h2><div class="choice four"><div><b>WHO + GOAL?</b><br>Use Case</div><div><b>WHO + MESSAGE ORDER?</b><br>Sequence</div><div><b>ONE SUBJECT + LIFECYCLE?</b><br>State</div><div><b>WORK + BRANCHING?</b><br>Activity</div></div></section><section class="section"><h2>Final self-check</h2><ul class="study-list"><li>I can derive four UML views from one shared scenario.</li><li>I can explain what each view includes and intentionally omits.</li><li>I can detect contradictions across use case, sequence, state, and activity models.</li><li>I can justify my diagram choice from the modeling question.</li></ul></section><div class="remember"><strong>Takeaway</strong><p>Modeling is not drawing four versions of the same picture. It is viewing one system through four purposeful abstractions while keeping the underlying story consistent.</p></div>`}}
;
(()=>{const n=Number(document.body.dataset.page||1),p=P[n],a=document.querySelector('article.content');if(!p||!a)return;document.body.classList.add(`t10-page-${n}`);document.title=`${p.title} | Topic 10`;a.innerHTML=`<div class="breadcrumb"><a href="../../index.html">CPCS 351</a><span>›</span><span>Topic 10 · Integrated UML Modeling</span></div><section class="hero"><div class="hero-copy"><div class="eyebrow">${p.eyebrow}</div><h1>${p.title}</h1><p class="lead">${p.lead}</p></div><div class="hero-progress"><span>${n}</span><small>of 11 pages</small></div></section>${p.body}<nav class="lesson-nav"><a id="prev-link" hidden class="prev">← Previous</a><a href="../../index.html" class="course-home">Course home</a><a id="next-link" hidden class="next">Next →</a></nav>`})();
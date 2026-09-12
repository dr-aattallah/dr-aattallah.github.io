export const topic06Mission = {
  id:'topic06-mission06',
  topic:'06',
  title:'Design the Architecture Before It Designs You',
  scenario:'A Jeddah healthcare company is building MediLink, a platform that connects patients, clinics, appointment services, notifications, billing, and medical-record integrations. You are the software architect. Your job is to turn requirements into architectural objectives, classify subsystem behavior, choose suitable styles, review flawed designs, and defend a structure that can evolve safely.',
  returnUrl:'../weeks/06-architectural-design-and-software-design-principles/',
  returnLabel:'Return to Topic 06',
  readyMessage:'You completed a 14-stage architectural design review from requirements and objectives through style selection, interfaces, design principles, future-proofing, and final architecture approval.',
  stages:[
    {
      id:'requirements-to-architecture', title:'Translate Requirements into Architecture Drivers', skill:'Architecture Drivers', level:'Apply', type:'classification',
      context:'MediLink requirements include both capabilities and quality constraints. Before choosing any structure, identify what should directly drive architectural decisions.',
      prompt:'Classify each item by the architectural concern it primarily creates.', categories:['Performance','Security','Change & Maintainability','Reliability / Recovery'],
      items:[
        {text:'Appointment search must remain responsive during peak clinic hours.',answer:'Performance'},
        {text:'Only authorized services may access medical-record data.',answer:'Security'},
        {text:'New clinic partners will be added frequently.',answer:'Change & Maintainability'},
        {text:'A failed notification component must not bring down appointment booking.',answer:'Reliability / Recovery'}
      ], checkLabel:'Check architecture drivers',
      feedback:{why:'Architecture should be justified by requirements and non-functional objectives, not by a favorite technology.',consequence:'If drivers are ignored, structural decisions may optimize the wrong quality attributes.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/index.html'
    },
    {
      id:'design-process', title:'Rebuild the Architectural Design Process', skill:'Architectural Design Process', level:'Apply', type:'sequence',
      context:'The architecture team has jumped straight into drawing components. Restore the decision sequence used in Topic 06.',
      prompt:'Place the architectural-design moves in the strongest order.',
      answer:['Define architectural objectives','Classify the system or subsystem type','Select/adapt a suitable style or design custom structure','Specify responsibilities, interfaces, and interactions','Review against requirements, objectives, principles, and constraints'],
      feedback:{why:'Topic 06 frames architecture as a decision pipeline: objectives → type → style/custom → specification → review.',consequence:'Selecting a style before understanding objectives and behavior encourages post-hoc justification.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/architectural-design-process.html'
    },
    {
      id:'system-types', title:'Recognize the Dominant System Type', skill:'System Classification', level:'Apply', type:'classification',
      context:'Different MediLink subsystems have different dominant behavior. Classify each before selecting a style.',
      prompt:'Match each subsystem description to its dominant type.', categories:['Interactive','Event-Driven','Transformational','Object-Persistence'],
      items:[
        {text:'Patient portal handles screens, user actions, business rules, and data access.',answer:'Interactive'},
        {text:'Alert service reacts to appointment-created, appointment-cancelled, and lab-result-ready events.',answer:'Event-Driven'},
        {text:'Billing batch reads claims, validates them, transforms records, then generates settlement output.',answer:'Transformational'},
        {text:'Medical-record adapter mainly stores and retrieves domain objects while hiding database technology.',answer:'Object-Persistence'}
      ], checkLabel:'Check system types',
      feedback:{why:'Dominant behavior narrows the set of sensible architectural candidates.',consequence:'Classifying first makes style selection an engineering decision instead of memorization.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/system-types.html'
    },
    {
      id:'map-styles', title:'Choose the Candidate Style', skill:'Architectural Styles', level:'Apply', type:'matching',
      context:'Use the course mappings as a starting point, then justify the fit.',
      prompt:'Match the system type to the style emphasized in Topic 06.',
      pairs:[['Interactive','N-Tier'],['Event-Driven','Event-Driven Architecture'],['Transformational','Main Program & Subroutines'],['Object-Persistence','Persistence Framework'],['Client-server','Client-Server'],['Distributed, decentralized','Peer-to-Peer'],['Heuristic problem-solving','Blackboard']],
      checkLabel:'Check style mapping',
      feedback:{why:'The lecture maps dominant system behavior to reusable high-level structures.',consequence:'The mapping is a starting point; real designs still require adaptation and trade-off reasoning.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/system-types-and-styles.html'
    },
    {
      id:'bad-style-choice', title:'Architecture Review 01 — Wrong Style for the Problem', skill:'Style Selection', level:'Analyze', type:'choice',
      context:'DRAFT A: The patient portal is highly interactive, changes UI frequently, and separates business rules from data access. The team proposes one giant Main Program with dozens of subroutines because “it is simple.”',
      prompt:'Which redesign is stronger?',
      options:['Use an N-Tier structure so presentation, coordination, business behavior, and persistence responsibilities can evolve independently.','Keep the giant Main Program because every system can use the same style.','Move all business logic into the database to reduce files.','Use Blackboard because users interact with the system.'], answer:0,
      feedback:{why:'An interaction-heavy subsystem benefits from clear separation of presentation, coordination, business, and persistence concerns.',consequence:'A style that fights the dominant behavior increases coupling and change cost.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/n-tier-architecture.html'
    },
    {
      id:'event-review', title:'Architecture Review 02 — Event Logic', skill:'Event-Driven Architecture', level:'Analyze', type:'multiselect',
      context:'DRAFT B: The alert service checks every database table every five seconds to discover whether something happened. The team calls this “event-driven.”',
      prompt:'Which redesign ideas better express event-driven logic?', instruction:'Select all that apply.',
      options:['Publish domain events such as AppointmentCancelled.','Let subscribers react to relevant events.','Keep tight polling loops as the main communication mechanism.','Define event payloads/contracts clearly.','Allow one failed subscriber to stop every producer.'], answer:[0,1,3], checkLabel:'Review event design',
      feedback:{why:'Event-driven systems react to events and should use clear event contracts with decoupled producers and consumers.',consequence:'Calling polling “event-driven” hides unnecessary coupling and timing dependencies.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/event-driven-architecture.html'
    },
    {
      id:'persistence-review', title:'Architecture Review 03 — Persistence Leakage', skill:'Persistence Architecture', level:'Analyze', type:'choice',
      context:'DRAFT C: Every service knows SQL table names, database vendor syntax, connection details, and storage-specific error codes.',
      prompt:'What is the strongest architectural correction?',
      options:['Introduce a persistence abstraction/framework so domain logic depends on stable persistence services rather than storage details.','Copy the SQL into more services for reuse.','Move UI code into the database.','Expose database credentials through every interface.'], answer:0,
      feedback:{why:'Persistence frameworks isolate storage technology behind services and interfaces.',consequence:'Leaking storage details increases coupling and makes technology change expensive.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/object-persistence-framework.html'
    },
    {
      id:'interfaces', title:'Specify Responsibilities and Interfaces', skill:'Interfaces & Responsibilities', level:'Analyze', type:'matching',
      context:'The team now has candidate components. Architectural value comes from clear responsibility boundaries and explicit interfaces.',
      prompt:'Match each design statement to the principle it best demonstrates.',
      pairs:[
        ['Appointment Service owns booking rules rather than UI rendering','Focused responsibility'],
        ['Patient Portal calls Appointment Service through a documented API','Explicit interface'],
        ['Notification Service receives a small event contract instead of reading booking tables','Information hiding'],
        ['Billing can be replaced without changing Patient Portal','Reduced coupling']
      ], checkLabel:'Check architecture boundaries',
      feedback:{why:'Architecture specifies what major parts own, how they communicate, and what details remain hidden.',consequence:'Without stable boundaries, decomposition becomes only a visual diagram.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/custom-design-review.html'
    },
    {
      id:'cohesion', title:'Design Review 04 — Cohesion Diagnosis', skill:'Cohesion', level:'Analyze', type:'choice',
      context:'DRAFT D: A UtilityManager module handles login, appointment pricing, PDF generation, database cleanup, SMS sending, and audit rules.',
      prompt:'What is the main design problem?',
      options:['Low cohesion: unrelated responsibilities are grouped in one module.','Low coupling: the module is too independent.','Too much abstraction because it has a name.','Too much portability.'], answer:0,
      feedback:{why:'Cohesion asks whether responsibilities inside a module belong together.',consequence:'Low cohesion makes a module harder to understand, test, reuse, and change safely.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/design-quality-cohesion-coupling.html'
    },
    {
      id:'coupling', title:'Design Review 05 — Coupling Diagnosis', skill:'Coupling', level:'Analyze', type:'multiselect',
      context:'DRAFT E: Changing the Appointment database schema forces edits in the portal, billing, notifications, reporting, and analytics modules.',
      prompt:'Which redesign actions would reduce coupling?', instruction:'Select all that apply.',
      options:['Hide persistence details behind a stable service interface.','Let every module query the same tables directly.','Pass smaller stable contracts between modules.','Move unrelated responsibilities into the Appointment module.','Reduce dependencies on internal data structures.'], answer:[0,2,4], checkLabel:'Reduce coupling',
      feedback:{why:'Low coupling limits what one module needs to know about another and reduces ripple effects.',consequence:'A small local change should not force system-wide edits.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/design-quality-cohesion-coupling.html'
    },
    {
      id:'kiss-abstraction', title:'Design Review 06 — KISS & Abstraction', skill:'KISS & Abstraction', level:'Analyze', type:'choice',
      context:'DRAFT F introduces twelve micro-layers, six factories, three message buses, and custom metaprogramming for a simple clinic lookup feature.',
      prompt:'Which review conclusion is strongest?',
      options:['The design may violate KISS; use only the abstraction needed to satisfy current architectural objectives.','More layers always mean better architecture.','Complexity is harmless if UML is clean.','Every small feature should use the most advanced pattern available.'], answer:0,
      feedback:{why:'KISS favors the simplest structure that satisfies requirements; abstraction hides detail only when that improves understanding and changeability.',consequence:'Unnecessary cleverness increases cognitive load and maintenance cost.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/design-quality-cohesion-coupling.html'
    },
    {
      id:'future-proofing', title:'Design for the Future', skill:'Reuse, Flexibility & Testability', level:'Analyze', type:'classification',
      context:'Before approval, evaluate choices that affect future change and long-term viability.',
      prompt:'Classify each design choice by the principle it most directly supports.', categories:['Reuse','Flexibility','Portability / Obsolescence','Testability'],
      items:[
        {text:'Use one maintained notification component instead of cloned copies in each service.',answer:'Reuse'},
        {text:'Depend on interfaces so a clinic integration can be replaced later.',answer:'Flexibility'},
        {text:'Avoid undocumented vendor-only features when standards meet the requirement.',answer:'Portability / Obsolescence'},
        {text:'Allow business services to be exercised without requiring the GUI.',answer:'Testability'}
      ], checkLabel:'Check future-facing design',
      feedback:{why:'Good design anticipates reuse, change, technology evolution, portability, and automated testing.',consequence:'A design that works only today can become expensive technical debt tomorrow.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/reuse-flexibility-testability.html'
    },
    {
      id:'traceability-review', title:'Architecture Review 07 — Can You Defend the Decision?', skill:'Rationale & Traceability', level:'Analyze', type:'matching',
      context:'Reviewers ask why each architectural decision exists. Match each decision to its strongest justification.',
      prompt:'Match the decision to the requirement/objective that should justify it.',
      pairs:[
        ['Separate authentication boundary','Protect sensitive patient data'],
        ['Use asynchronous events for notifications','Booking should not wait for slow notification channels'],
        ['Hide clinic adapters behind interfaces','Clinic partners change and new partners will be added'],
        ['Add recovery strategy for booking state','Booking must recover safely after failures']
      ], checkLabel:'Check rationale traceability',
      feedback:{why:'Architecture is not only structure; it includes rationale and traceability to the forces that shaped the structure.',consequence:'Unjustified decisions are difficult to review and easy to cargo-cult.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/index.html'
    },
    {
      id:'final-review', title:'Final Architecture Review — Approve or Reject', skill:'Integrated Architecture Reasoning', level:'Analyze', type:'choice',
      context:'DESIGN X derives objectives from requirements, classifies subsystem behavior, uses N-Tier for the portal, events for notifications, persistence abstraction for records, defines clear interfaces, keeps high cohesion/low coupling, and records rationale. DESIGN Y puts UI, SQL, notification logic, billing, and security in one shared application module because “one deployment is simpler.”',
      prompt:'Which design deserves architectural approval?',
      options:['DESIGN X, because its structure is driven by requirements, behavior, interfaces, design principles, and explicit rationale.','DESIGN Y, because fewer boxes always mean lower complexity.','DESIGN Y, because architecture is only about deployment count.','Either; architecture does not need traceability to requirements.'], answer:0,
      feedback:{why:'A defensible architecture connects objectives, system behavior, structural choices, interfaces, quality principles, and rationale.',consequence:'The strongest architecture is not the one with the most patterns or fewest boxes; it is the one whose structure best satisfies the problem and can be defended.'},
      lesson:'../weeks/06-architectural-design-and-software-design-principles/custom-design-review.html'
    }
  ]
};
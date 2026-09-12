export const topic05Mission = {
  id: 'topic05-mission05',
  topic: '05',
  title: 'Model the Real-Estate Experience',
  scenario: 'A Jeddah property company is building BaytLink, a digital real-estate platform for buyers, tenants, property owners, agents, and payment services. You are the requirements and use-case engineer. Your job is to turn stakeholder needs into a correct actor-centered UML use-case model—and to detect modeling mistakes before the design reaches the development team.',
  returnUrl: '../weeks/05-software-requirements-elicitation/',
  returnLabel: 'Return to Topic 05',
  readyMessage: 'You completed a 16-stage requirements and UML use-case design review: from stakeholder evidence and requirement elicitation to actors, goals, boundaries, relationships, diagram defects, traceability, and final model quality.',
  stages: [
    {
      id: 'need-to-requirement', title: 'From Property Problem to Requirement', skill: 'Requirements Elicitation', level: 'Recognize', type: 'classification',
      context: 'BaytLink begins with complaints from buyers, tenants, owners, and agents. Not every sentence is a software requirement.',
      prompt: 'Classify each statement by its engineering role.', categories: ['Business Problem','Stakeholder Wish','Software Requirement'],
      items: [
        {text:'Prospective tenants waste time contacting agents about properties that are no longer available.',answer:'Business Problem'},
        {text:'Make property searching much easier.',answer:'Stakeholder Wish'},
        {text:'The system shall allow a customer to filter available properties by district, price range, property type, and number of bedrooms.',answer:'Software Requirement'},
        {text:'Owners cannot easily track viewing requests for their listed properties.',answer:'Business Problem'}
      ], checkLabel:'Check the requirement meaning',
      feedback:{why:'Problems describe pain; wishes express desired improvement; requirements state a system commitment precise enough to design and test.',consequence:'A use-case diagram derived directly from vague wishes will inherit ambiguity.'}, lesson:'../weeks/05-software-requirements-elicitation/index.html'
    },
    {
      id:'elicit-from-evidence', title:'Elicit Requirements from Stakeholder Evidence', skill:'Requirement Elicitation', level:'Apply', type:'multiselect',
      context:'You interview a tenant, a property owner, and a real-estate agent. Their raw comments are messy: “I keep calling about flats that are already rented,” “Owners need to know who requested a viewing,” “The search should feel instant,” and “Agents should be alerted when someone books a visit.” The analyst proposes several candidate requirements.',
      prompt:'Which candidate statements are defensible requirements that can be derived from the stakeholder evidence?', instruction:'Select every statement that is specific enough to become an engineering commitment.',
      options:[
        'The system shall show only properties whose availability status is current at the time search results are produced.',
        'The system shall allow a property owner to view pending viewing requests for each listed property.',
        'The platform should be amazing and very easy for everyone.',
        'The system shall notify the assigned real-estate agent when a customer requests a property viewing.',
        'The system shall return property-search results within 2 seconds under the agreed normal workload.',
        'Use the newest technology possible.'
      ], answer:[0,1,3,4], checkLabel:'Check elicited requirements',
      feedback:{why:'Good elicitation converts stakeholder pain, goals, and quality expectations into specific, testable commitments. “Amazing” and “newest technology” are vague wishes or solution preferences, not defensible requirements.',consequence:'The analyst must interpret stakeholder evidence rather than copy statements verbatim; otherwise ambiguity simply moves into the specification.'}, lesson:'../weeks/05-software-requirements-elicitation/information-collection-analysis.html'
    },
    {
      id:'categorize-elicited-requirements', title:'Categorize the Elicited Requirements', skill:'Functional vs Non-functional Requirements', level:'Apply', type:'classification',
      context:'The elicitation session produced a small requirement set. Before deriving use cases, separate behavioral capabilities from quality and constraint requirements.',
      prompt:'Classify each elicited requirement as Functional or Non-functional.', categories:['Functional','Non-functional'],
      items:[
        {text:'The system shall allow a property owner to view pending viewing requests for each listed property.',answer:'Functional'},
        {text:'The system shall notify the assigned real-estate agent when a customer requests a property viewing.',answer:'Functional'},
        {text:'The system shall return property-search results within 2 seconds under the agreed normal workload.',answer:'Non-functional'},
        {text:'Only authenticated property owners may change the availability status of their listings.',answer:'Non-functional'},
        {text:'The system shall allow a customer to save a property to a favorites list.',answer:'Functional'},
        {text:'The service shall maintain the agreed availability level during published operating hours.',answer:'Non-functional'}
      ], checkLabel:'Classify elicited requirements',
      feedback:{why:'Functional requirements define system capabilities and information-processing behavior. Non-functional requirements constrain qualities such as performance, security, availability, interfaces, or implementation conditions.',consequence:'This distinction matters before use-case modeling because use cases primarily organize actor-centered functional goals, while NFRs usually constrain those goals.'}, lesson:'../weeks/05-software-requirements-elicitation/challenges-and-types.html'
    },
    {
      id:'requirement-types', title:'Capability or Quality?', skill:'Requirement Types', level:'Apply', type:'classification',
      context:'The first BaytLink requirements mix system behavior with quality constraints.', prompt:'Classify each requirement by its primary intent.', categories:['Functional','Non-functional'],
      items:[
        {text:'The system shall allow a buyer to request a property viewing.',answer:'Functional'},
        {text:'Property search results shall appear within 2 seconds under the agreed normal workload.',answer:'Non-functional'},
        {text:'Only authorized owners may modify their property listings.',answer:'Non-functional'},
        {text:'The system shall notify an agent when a customer requests a viewing.',answer:'Functional'}
      ], checkLabel:'Check requirement types', feedback:{why:'Functional requirements describe capabilities; non-functional requirements constrain quality, security, performance, interfaces, or implementation.',consequence:'Most use cases organize functional goals; NFRs normally constrain those goals rather than becoming separate use cases.'}, lesson:'../weeks/05-software-requirements-elicitation/challenges-and-types.html'
    },
    {
      id:'elicitation-flow', title:'Rebuild the Elicitation Process', skill:'Elicitation Process', level:'Apply', type:'sequence',
      context:'Interviews, workflow observations, draft requirements, feasibility questions, and reviews are happening at once.', prompt:'Put the Topic 05 elicitation activities in their core order.',
      answer:['Collect Information','Build Analysis Models','Derive Requirements','Evaluate Feasibility','Review the Specification'],
      feedback:{why:'Collect → Model → Derive → Feasibility → Review provides the core reasoning flow, while real work may iterate backward.',consequence:'The sequence keeps requirements grounded in evidence rather than assumptions.'}, lesson:'../weeks/05-software-requirements-elicitation/elicitation-process.html'
    },
    {
      id:'actors', title:'Who Is Really an Actor?', skill:'Actor Identification', level:'Apply', type:'classification',
      context:'A junior analyst proposes several “actors” for the BaytLink diagram. Some are external roles; others are parts of the system.', prompt:'Classify each candidate.', categories:['Actor','Not an Actor'],
      items:[
        {text:'Property Seeker — external role searching or requesting a viewing',answer:'Actor'},
        {text:'Property Owner — external role managing a listing',answer:'Actor'},
        {text:'Payment Gateway — external system exchanging payment information',answer:'Actor'},
        {text:'BaytLink Database — internal implementation component',answer:'Not an Actor'},
        {text:'Search Algorithm — internal software logic',answer:'Not an Actor'},
        {text:'Real-Estate Agent — external role coordinating viewings',answer:'Actor'}
      ], checkLabel:'Check actors', feedback:{why:'An actor is an external role—human, organization, device, or external system—that interacts with the system boundary.',consequence:'Putting databases or internal components outside the boundary confuses use-case modeling with architecture.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-foundations.html'
    },
    {
      id:'use-case-goals', title:'Goal or Implementation Step?', skill:'Use-Case Identification', level:'Apply', type:'classification',
      context:'The draft contains useful business goals mixed with UI clicks and implementation actions.', prompt:'Decide which candidates deserve to be use cases.', categories:['Valid Use-Case Candidate','Internal / UI Step'],
      items:[
        {text:'Search Properties',answer:'Valid Use-Case Candidate'},
        {text:'Request Property Viewing',answer:'Valid Use-Case Candidate'},
        {text:'Manage Property Listing',answer:'Valid Use-Case Candidate'},
        {text:'Click Search Button',answer:'Internal / UI Step'},
        {text:'Query Property Table',answer:'Internal / UI Step'},
        {text:'Send SQL Statement',answer:'Internal / UI Step'}
      ], checkLabel:'Check actor goals', feedback:{why:'Use cases represent useful actor goals, not screen gestures, algorithms, or database operations.',consequence:'A diagram full of low-level steps loses the stakeholder view that makes use-case modeling valuable.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-foundations.html'
    },
    {
      id:'boundary-error', title:'Diagram Review 01 — Broken Boundary', skill:'System Boundary', level:'Analyze', type:'choice',
      context:'DRAFT DIAGRAM A: [BaytLink System: Property Seeker actor + Search Properties + Request Viewing]   Outside: Payment Gateway. The analyst drew Property Seeker INSIDE the BaytLink rectangle.',
      prompt:'What is the most important UML defect?',
      options:['The external Property Seeker actor should be outside the system boundary.','Search Properties must be outside the boundary.','Payment Gateway must be inside the boundary.','Every use case needs its own system boundary.'], answer:0,
      feedback:{why:'Actors are external roles and stay outside the modeled system; use cases supplied by BaytLink belong inside its boundary.',consequence:'Boundary errors destroy the distinction between who requests behavior and what behavior the system owns.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-foundations.html'
    },
    {
      id:'bad-names', title:'Diagram Review 02 — Bad Use-Case Names', skill:'Use-Case Naming', level:'Analyze', type:'multiselect',
      context:'DRAFT DIAGRAM B contains these ovals: Property, Button, Database, Search Properties, Request Viewing, and Manage Listing.',
      prompt:'Which names are defensible actor-centered use-case names?', instruction:'Select all that should remain as use cases.',
      options:['Property','Button','Database','Search Properties','Request Viewing','Manage Listing'], answer:[3,4,5], checkLabel:'Review the names',
      feedback:{why:'Clear use cases normally use verb–object goal names. “Property,” “Button,” and “Database” name things or implementation details, not useful actor goals.',consequence:'Good naming lets a reviewer understand system responsibilities without reading implementation design.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-guidelines.html'
    },
    {
      id:'association-error', title:'Diagram Review 03 — Missing Association', skill:'Associations', level:'Analyze', type:'choice',
      context:'DRAFT DIAGRAM C: Property Seeker is outside BaytLink. Search Properties and Request Viewing are inside. The actor is connected only to Search Properties even though the agreed requirements say the seeker initiates both goals.',
      prompt:'What correction best reflects the requirements?',
      options:['Add an association between Property Seeker and Request Viewing.','Move Request Viewing outside the system.','Connect Search Properties to Request Viewing using actor generalization.','Delete Property Seeker and connect the two use cases directly.'], answer:0,
      feedback:{why:'A solid association shows that an external actor participates in a use case. The agreed requirement establishes participation in Request Viewing.',consequence:'Missing associations can hide which stakeholder actually initiates or participates in required behavior.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-foundations.html'
    },
    {
      id:'include-error', title:'Diagram Review 04 — «include» Direction', skill:'Use-Case Relationships', level:'Analyze', type:'choice',
      context:'DRAFT DIAGRAM D: Submit Rental Application always requires Verify Applicant Identity. The analyst draws: Verify Applicant Identity --«include»--> Submit Rental Application.',
      prompt:'How should the relationship be corrected?',
      options:['Submit Rental Application --«include»--> Verify Applicant Identity','Keep the arrow as drawn because included behavior points to its caller','Replace «include» with actor association','Move Verify Applicant Identity outside BaytLink'], answer:0,
      feedback:{why:'With «include», the base use case points toward the required included behavior. Submit Rental Application requires identity verification.',consequence:'Reversing the arrow reverses the reuse semantics and teaches the reader the wrong dependency.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-relationships.html'
    },
    {
      id:'extend-error', title:'Diagram Review 05 — «extend» or «include»?', skill:'Use-Case Relationships', level:'Analyze', type:'choice',
      context:'DRAFT DIAGRAM E: Request Property Viewing is complete by itself. If the customer asks for transportation, Arrange Viewing Transport is added conditionally. The analyst models Request Viewing «include» Arrange Transport.',
      prompt:'Which design is semantically stronger?',
      options:['Arrange Viewing Transport --«extend»--> Request Property Viewing','Request Property Viewing --«include»--> Arrange Viewing Transport','Property Seeker generalizes Arrange Viewing Transport','Merge both into one actor'], answer:0,
      feedback:{why:'Optional or conditional behavior extends an otherwise complete base use case. Required reused behavior is modeled with «include».',consequence:'Choosing relationships by appearance rather than semantics makes the UML diagram misleading.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-relationships.html'
    },
    {
      id:'generalization-error', title:'Diagram Review 06 — Actor Generalization', skill:'Generalization', level:'Analyze', type:'choice',
      context:'BaytLink has a general Property Seeker role. Buyer and Tenant are specialized roles that share Search Properties and Request Viewing, while each may have additional goals.',
      prompt:'Which design best expresses this?',
      options:['Buyer and Tenant specialize Property Seeker using actor generalization.','Property Seeker «include» Buyer and Tenant.','Buyer and Tenant must be represented as use cases.','Duplicate every shared use case and avoid a parent actor.'], answer:0,
      feedback:{why:'Generalization is appropriate when specialized actors inherit the participation of a more general role.',consequence:'Used carefully, actor generalization reduces duplication while preserving meaningful role differences.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-relationships.html'
    },
    {
      id:'overloaded-diagram', title:'Diagram Review 07 — Rescue the Overloaded Model', skill:'Diagram Clarity', level:'Analyze', type:'multiselect',
      context:'DRAFT DIAGRAM F has 8 actors, 23 ovals, database tables, screen names, every NFR as an oval, crossing lines everywhere, and no obvious system scope.',
      prompt:'Which redesign actions would improve the use-case diagram without losing requirements meaning?', instruction:'Select all appropriate redesign actions.',
      options:['Remove database/UI implementation details.','Keep NFRs as separate use cases because every requirement needs an oval.','Clarify and label the system boundary.','Keep actor-centered business goals as the main ovals.','Use relationships only when their semantics add value.','Add more crossing lines so all requirements appear on one picture.'], answer:[0,2,3,4], checkLabel:'Propose the redesign',
      feedback:{why:'A useful diagram communicates scope, external roles, actor goals, and meaningful relationships. It is not a container for every requirement or implementation artifact.',consequence:'Simplifying the model improves correctness and reviewability—not merely aesthetics.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-guidelines.html'
    },
    {
      id:'trace-model', title:'Diagram Review 08 — Does the Model Cover the Requirements?', skill:'Traceability', level:'Analyze', type:'matching',
      context:'The revised BaytLink diagram looks clean. Now prove that clean appearance did not hide missing or invented behavior.', prompt:'Match each review finding to its engineering interpretation.',
      pairs:[
        ['FR-04 Request Viewing has no mapped use case','Possible missing use case'],
        ['Use case Export Investor Analytics has no agreed requirement','Possible scope creep or undocumented need'],
        ['FR-01 Search Properties maps to Search Properties','Visible requirements coverage'],
        ['A security requirement constrains Manage Listing','NFR constrains behavior rather than becoming a separate goal']
      ], checkLabel:'Check model coverage',
      feedback:{why:'Traceability checks both directions: required behavior needs coverage, and modeled behavior needs justification.',consequence:'A visually correct UML diagram can still be requirements-incomplete or contain unjustified scope.'}, lesson:'../weeks/05-software-requirements-elicitation/deriving-use-cases.html'
    },
    {
      id:'final-design-review', title:'Final Challenge — Choose the Stronger Diagram', skill:'Integrated Use-Case Diagram Review', level:'Analyze', type:'choice',
      context:'Two teams submit final BaytLink models. DESIGN X places external actors outside one labeled BaytLink boundary, uses verb–object actor goals inside, connects actors by associations, uses «include» only for required reuse, «extend» for conditional additions, and traces functional goals to requirements. DESIGN Y puts users and the database inside the boundary, models Login Button and Update Table as use cases, converts performance/security requirements into ovals, and uses «include»/«extend» mainly to reduce crossing lines.',
      prompt:'Which design should pass the requirements/use-case review—and why?',
      options:['DESIGN X, because its boundary, actors, goals, relationships, and traceability express stakeholder-facing system responsibility.','DESIGN Y, because more ovals always mean more complete requirements.','DESIGN Y, because databases are important actors in every software system.','Either design; UML relationship semantics do not affect requirements meaning.'], answer:0,
      feedback:{why:'A strong use-case diagram is actor-centered, scope-aware, semantically correct, readable, and traceable to required behavior.',consequence:'The goal is not to draw more UML. The goal is to make system responsibility understandable enough to review, challenge, design, and test.'}, lesson:'../weeks/05-software-requirements-elicitation/use-case-guidelines.html'
    }
  ]
};
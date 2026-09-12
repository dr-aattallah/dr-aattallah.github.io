export const topic05Mission = {
  id: 'topic05-mission05',
  topic: '05',
  title: 'Turn Needs into Defensible Use Cases',
  scenario: 'SkyGate Experience System is being refined for a major theme park in Jeddah. Guests, parents, operators, emergency staff, and management all describe needs differently. You are the requirements engineer responsible for turning messy stakeholder reality into clear, feasible, traceable requirements and actor-centered use cases.',
  returnUrl: '../weeks/05-software-requirements-elicitation/',
  returnLabel: 'Return to Topic 05',
  readyMessage: 'You demonstrated the Topic 05 chain from stakeholder reality and requirement quality through actor goals, use-case relationships, traceability, feasibility, and validation.',
  stages: [
    {
      id: 'problem-wish-requirement',
      title: 'Separate Problem, Wish, and Requirement',
      skill: 'Requirements Elicitation',
      level: 'Recognize',
      type: 'classification',
      context: 'SkyGate stakeholders speak in frustrations and wishes. Your job is not to copy their words into the specification; you must identify what kind of statement each one represents.',
      prompt: 'Classify each statement by its engineering role.',
      categories: ['Business Problem', 'Stakeholder Wish', 'Software Requirement'],
      items: [
        { text: 'Families often miss attraction slots because current availability is difficult to see.', answer: 'Business Problem' },
        { text: 'Make reservations easier for guests.', answer: 'Stakeholder Wish' },
        { text: 'The system shall allow an eligible guest to reserve an available attraction time slot.', answer: 'Software Requirement' },
        { text: 'Operators cannot quickly communicate attraction closures to waiting guests.', answer: 'Business Problem' }
      ],
      checkLabel: 'Check requirement meaning',
      feedback: {
        why: 'Elicitation starts from real problems and stakeholder wishes, then converts them into precise system commitments. A wish such as “make it easier” is not yet specific enough to design or test.',
        consequence: 'Treating wishes as requirements creates ambiguity and downstream rework; engineering requires a testable capability or constraint.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/index.html'
    },
    {
      id: 'functional-nonfunctional',
      title: 'Classify the Requirement Type',
      skill: 'Requirement Types',
      level: 'Apply',
      type: 'classification',
      context: 'The team now has candidate requirements, but capability statements are mixed with quality and constraint statements.',
      prompt: 'Classify each statement by its primary engineering intent.',
      categories: ['Functional', 'Non-functional'],
      items: [
        { text: 'The system shall allow a guest to reserve an available attraction slot.', answer: 'Functional' },
        { text: 'Reservation confirmation shall be displayed within 3 seconds under the agreed typical workload.', answer: 'Non-functional' },
        { text: 'Only authorized operators may update attraction status.', answer: 'Non-functional' },
        { text: 'The system shall notify affected guests when an attraction closes.', answer: 'Functional' },
        { text: 'The guest application shall support the approved mobile platforms.', answer: 'Non-functional' }
      ],
      checkLabel: 'Check requirement types',
      feedback: {
        why: 'Functional requirements describe information-processing capabilities. Non-functional requirements express quality, performance, security, interface, or implementation constraints.',
        consequence: 'Both families matter: a system can provide the right feature and still fail because it is too slow, insecure, unavailable, or incompatible.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/challenges-and-types.html'
    },
    {
      id: 'elicitation-process',
      title: 'Rebuild the Elicitation Process',
      skill: 'Elicitation Process',
      level: 'Apply',
      type: 'sequence',
      context: 'The SkyGate team has interview notes, workflow sketches, candidate requirements, and technical concerns, but the work has become unordered.',
      prompt: 'Place the five major elicitation activities in the Topic 05 order.',
      answer: ['Collect Information', 'Build Analysis Models', 'Derive Requirements', 'Evaluate Feasibility', 'Review the Specification'],
      feedback: {
        why: 'The course organizes elicitation as Collect → Model → Derive → Feasibility → Review. In practice the team may loop backward when new evidence exposes misunderstanding.',
        consequence: 'A disciplined sequence helps the team connect evidence to commitments instead of inventing requirements from assumptions.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/elicitation-process.html'
    },
    {
      id: 'actor-goal-boundary',
      title: 'Find the Actor Goal',
      skill: 'Use-Case Foundations',
      level: 'Apply',
      type: 'classification',
      context: 'A draft diagram contains external roles, useful actor goals, and internal implementation actions. Clean the model before relationships are added.',
      prompt: 'Classify each item by what it represents in a use-case model.',
      categories: ['Actor', 'Use Case', 'Internal / UI Step'],
      items: [
        { text: 'Guest', answer: 'Actor' },
        { text: 'Reserve Attraction', answer: 'Use Case' },
        { text: 'Operator', answer: 'Actor' },
        { text: 'Update Database Row', answer: 'Internal / UI Step' },
        { text: 'Press Submit Button', answer: 'Internal / UI Step' },
        { text: 'Update Attraction Status', answer: 'Use Case' }
      ],
      checkLabel: 'Check actor goals',
      feedback: {
        why: 'Actors are external roles. Use cases are useful system behaviors that achieve actor goals. Database operations and button presses are implementation or interface steps, not complete actor goals.',
        consequence: 'Actor-centered modeling keeps the diagram focused on stakeholder value instead of internal design detail.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/use-case-foundations.html'
    },
    {
      id: 'validate-use-case',
      title: 'Validate the Use-Case Candidate',
      skill: 'Use-Case Derivation',
      level: 'Analyze',
      type: 'multiselect',
      context: 'The candidate “Reserve Attraction” was extracted from an agreed functional requirement. Before accepting it as a use case, apply the validation gate from the integrated derivation lesson.',
      prompt: 'Which checks must be satisfied for the candidate to be a defensible use case?',
      instruction: 'Select all validation checks required by the lesson.',
      options: [
        'It represents a complete business process rather than a click or algorithm.',
        'An external actor can initiate the process.',
        'The interaction ends with an observable outcome for the actor.',
        'The goal is useful to the actor.',
        'Its implementation must already be assigned to a database table.',
        'It must have at least one «include» relationship.'
      ],
      answer: [0,1,2,3],
      checkLabel: 'Check validation gate',
      feedback: {
        why: 'A valid candidate is a complete actor-centered business process that starts with an external role, returns an observable outcome, and creates useful value. UML relationships are optional modeling choices, not validity requirements.',
        consequence: 'The gate prevents low-level actions such as “Query Database” from being promoted into misleading use cases.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/deriving-use-cases.html'
    },
    {
      id: 'relationships',
      title: 'Choose the Relationship Semantics',
      skill: 'Use-Case Relationships',
      level: 'Analyze',
      type: 'matching',
      context: 'The basic actor goals are correct. Now refine the model only where the relationship adds real semantic value.',
      prompt: 'Match each modeling situation to the correct UML relationship.',
      pairs: [
        ['A base use case always requires a reusable sub-behavior', '«include»'],
        ['Optional or conditional behavior is added to an otherwise complete base use case', '«extend»'],
        ['VIP Guest is a specialized kind of Guest and inherits the general role', 'Generalization'],
        ['Guest directly participates in Reserve Attraction', 'Association']
      ],
      checkLabel: 'Check relationship semantics',
      feedback: {
        why: '«include» represents required reused behavior; «extend» represents optional or conditional behavior; generalization specializes a parent; association shows actor participation.',
        consequence: 'Using relationship arrows decoratively creates diagrams that look formal but communicate the wrong behavior.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/use-case-relationships.html'
    },
    {
      id: 'traceability',
      title: 'Prove Requirements Coverage',
      skill: 'Traceability',
      level: 'Analyze',
      type: 'matching',
      context: 'Before review, the team wants evidence that agreed functional requirements are covered by actor goals and that no use case has appeared without justification.',
      prompt: 'Match each traceability symptom with the most likely engineering interpretation.',
      pairs: [
        ['A functional requirement row has no mapped use case', 'Possible missing use case'],
        ['A use-case column has no mapped requirement', 'Possible scope creep or undocumented need'],
        ['FR-06 maps to Reserve Attraction', 'Visible requirements coverage'],
        ['Priority is carried from a requirement into the traceability view', 'Supports development planning']
      ],
      checkLabel: 'Check traceability reasoning',
      feedback: {
        why: 'Traceability works in both directions: requirements should have behavioral coverage, and use cases should have a business or requirements justification.',
        consequence: 'A traceability matrix turns coverage gaps and unjustified scope into visible review findings rather than hidden assumptions.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/deriving-use-cases.html'
    },
    {
      id: 'feasibility',
      title: 'Challenge the Commitment',
      skill: 'Feasibility',
      level: 'Analyze',
      type: 'classification',
      context: 'Several requirements are clear and testable, but management asks whether SkyGate can responsibly commit to them for the first release.',
      prompt: 'Classify each feasibility concern by the dimension it primarily tests.',
      categories: ['Technical', 'Schedule', 'Cost & Resources', 'External Constraints'],
      items: [
        { text: 'Can the proposed positioning technology reach the required accuracy in the park environment?', answer: 'Technical' },
        { text: 'Can the reservation capability be integrated before the announced launch date?', answer: 'Schedule' },
        { text: 'Do we have enough devices, infrastructure, and qualified staff within budget?', answer: 'Cost & Resources' },
        { text: 'Do privacy rules permit the proposed collection and use of guest location data?', answer: 'External Constraints' }
      ],
      checkLabel: 'Check feasibility',
      feedback: {
        why: 'Feasibility tests whether an otherwise clear requirement is realistic under technology, time, resources, cost, and external obligations.',
        consequence: 'Clarity is not enough: an infeasible requirement creates a commitment the project cannot responsibly satisfy.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/specification-feasibility.html'
    },
    {
      id: 'verification-validation',
      title: 'Review from the Right Perspective',
      skill: 'Requirements Quality',
      level: 'Analyze',
      type: 'matching',
      context: 'The specification is nearly ready. Different reviewers raise different questions, and the team must distinguish correctness of the artifact from correctness of the product intent.',
      prompt: 'Match each question or reviewer focus with the correct concept.',
      pairs: [
        ['Are the requirements complete, consistent, well formed, and conformant?', 'Verification'],
        ['Do these requirements describe what customers and users actually need?', 'Validation'],
        ['Check engineering defects and technical quality', 'Technical review'],
        ['Check domain rules, terminology, and assumptions', 'Expert review'],
        ['Check real goals, tasks, and priorities', 'Customer / User review']
      ],
      checkLabel: 'Check review perspectives',
      feedback: {
        why: 'Verification asks whether requirements and models are produced correctly; validation asks whether they describe the right product. Different review perspectives expose different defect classes.',
        consequence: 'No single reviewer can see every requirements defect; trustworthy requirements survive technical, domain, and customer scrutiny.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/reviews-and-agile.html'
    },
    {
      id: 'final-requirements-review',
      title: 'Final Requirements Engineering Review',
      skill: 'Integrated Requirements Reasoning',
      level: 'Analyze',
      type: 'choice',
      context: 'The SkyGate team now has stakeholder evidence, functional and non-functional requirements, use cases, relationships, traceability links, feasibility findings, and review comments.',
      prompt: 'Which statement best describes a defensible Topic 05 result?',
      options: [
        'A detailed UML diagram is enough even if its use cases cannot be traced to agreed requirements.',
        'Requirements engineering is complete once stakeholder wishes are written down verbatim.',
        'The result is defensible when stakeholder reality is converted into clear requirements, actor goals are derived and validated, coverage is traceable, feasibility is checked, and the specification survives multiple review perspectives.',
        'A use-case model should contain functional requirements, non-functional requirements, database operations, and UI clicks as separate use cases.'
      ],
      answer: 2,
      feedback: {
        why: 'Topic 05 is one evidence chain: elicit → understand → specify → model actor goals → trace → test feasibility → verify/validate → refine.',
        consequence: 'Good requirements work reduces downstream ambiguity because each commitment has a reason, a stakeholder meaning, and evidence that it is feasible and reviewable.'
      },
      lesson: '../weeks/05-software-requirements-elicitation/reviews-and-agile.html'
    }
  ]
};
export const topic01Mission = {
  id: 'topic01-mission01',
  topic: '01',
  title: 'From Idea to Engineered Software',
  scenario: 'KAU wants to launch a Smart Campus Service. The first instruction is simple: “The idea is clear. Start coding.” Your role is to turn that idea into an engineered software system.',
  stages: [
    {
      id: 'software-reality',
      title: 'Software Reality',
      skill: 'Software Nature',
      level: 'Recognize',
      type: 'matching',
      context: 'The first version is already running. Management calls a requested policy change “just one small edit.” Before approving it, connect the nature of software to the engineering response it creates.',
      prompt: 'Match each software property with the engineering consequence it should trigger.',
      pairs: [
        ['Easy to modify', 'Analyze impact and retest connected behavior'],
        ['Does not physically wear out', 'Control deterioration caused by repeated unmanaged change'],
        ['Labor-intensive to build', 'Use disciplined methods and coordinated teamwork']
      ],
      checkLabel: 'Check engineering links',
      feedback: {
        why: 'Software properties create engineering consequences. Easy editing can hide ripple effects; software deteriorates through unmanaged change rather than physical wear; and development depends heavily on human reasoning and coordination.',
        consequence: 'Treat software characteristics as reasons for engineering discipline, not as isolated facts to memorize.'
      },
      lesson: '../weeks/01-introduction/index.html'
    },
    {
      id: 'pqct-decision',
      title: 'The Management Decision',
      skill: 'SE & PQCT Reasoning',
      level: 'Distinguish',
      type: 'classification',
      context: 'Registration week is approaching. Management proposes reducing reviews and testing to launch earlier. Your job is to identify which PQCT dimension each consequence primarily affects.',
      prompt: 'Classify the consequences using the four PQCT dimensions.',
      categories: ['Productivity', 'Quality', 'Cost', 'Time to Market'],
      items: [
        { text: 'The service can be released earlier', answer: 'Time to Market' },
        { text: 'More defects may escape into production', answer: 'Quality' },
        { text: 'Post-release rework may increase', answer: 'Cost' },
        { text: 'The team completes less useful work per unit of effort because of rework', answer: 'Productivity' }
      ],
      feedback: {
        why: 'Software engineering evaluates Productivity, Quality, Cost and Time to Market together. Improving one dimension can create pressure on another.',
        consequence: 'Do not accept “faster” as automatically “better”; reason across the whole PQCT trade-off.'
      },
      lesson: '../weeks/01-introduction/what-is-se.html'
    },
    {
      id: 'scale',
      title: 'The Project Grows',
      skill: 'SE Reasoning',
      level: 'Apply',
      type: 'multiselect',
      context: 'The original service expands to authentication, student records, notifications, payments and several university integrations. Different teams now own different parts of the system.',
      prompt: 'Which signals show that this is now an engineering-at-scale problem rather than simply a larger coding task?',
      instruction: 'Select every signal that strengthens the need for software engineering.',
      options: [
        'Multiple teams must coordinate decisions across subsystem boundaries.',
        'Several external and university systems must integrate reliably.',
        'Shared requirements, models and processes are needed to keep a common understanding.',
        'The developers only need faster typing to handle the larger codebase.',
        'A larger monitor will reduce the intellectual complexity of the system.'
      ],
      answer: [0, 1, 2],
      feedback: {
        why: 'Scale increases intellectual complexity, dependencies and coordination needs. The core difficulty is not typing more code; it is keeping many people and parts aligned.',
        consequence: 'At scale, shared processes, models, communication mechanisms and coordinated responsibilities become essential engineering infrastructure.'
      },
      lesson: '../weeks/01-introduction/why-se.html'
    },
    {
      id: 'team-trouble',
      title: 'Team Trouble',
      skill: 'Teamwork',
      level: 'Apply',
      type: 'choice',
      context: 'The UI team describes the system around the student journey. The data team describes it around records and relationships. Both views are useful, but the teams disagree about the behavior of the whole service.',
      prompt: 'What is the primary teamwork challenge?',
      options: ['Conceptualization', 'Communication', 'Coordination', 'Maintenance'],
      answer: 0,
      feedback: {
        why: 'The core problem is building a coherent shared understanding of the whole system rather than isolated partial views.',
        consequence: 'Use shared processes and models to align the team before local decisions diverge further.'
      },
      lesson: '../weeks/01-introduction/teamwork.html'
    },
    {
      id: 'three-tracks',
      title: 'Engineering Control Room',
      skill: 'Life-Cycle Thinking',
      level: 'Apply',
      type: 'classification',
      context: 'The project is active on several fronts at once. Some work builds the product, some protects quality, and some controls delivery.',
      prompt: 'Classify each activity into Development, SQA or Project Management.',
      items: [
        { text: 'Design the software architecture', answer: 'Development' },
        { text: 'Review a requirements document for quality and conformance', answer: 'SQA' },
        { text: 'Estimate effort and schedule the release', answer: 'Project Management' }
      ],
      categories: ['Development', 'SQA', 'Project Management'],
      feedback: {
        why: 'Development creates the product, SQA checks process and artifact quality, and Project Management controls effort, schedule and administration.',
        consequence: 'Keep the three tracks conceptually distinct while remembering that they operate together throughout the life cycle.'
      },
      lesson: '../weeks/01-introduction/life-cycle.html'
    },
    {
      id: 'waterfall-sequence',
      title: 'Build the Lifecycle',
      skill: 'Lifecycle Sequence',
      level: 'Apply',
      type: 'sequence',
      context: 'A new team member has the development phases but has mixed up their order. Reconstruct the sequence used in Topic 01.',
      prompt: 'Assign a position to every Waterfall phase.',
      answer: [
        'System Engineering',
        'Software Requirements Analysis',
        'Software Design',
        'Coding & Unit Testing',
        'Integration & Integration Testing',
        'Acceptance Testing',
        'Maintenance'
      ],
      lesson: '../weeks/01-introduction/development-process.html'
    },
    {
      id: 'phase-evidence',
      title: 'Where Is the Evidence?',
      skill: 'Phase & Deliverables',
      level: 'Analyze',
      type: 'matching',
      context: 'The team says several phases are complete. Your job is to check whether each phase left useful engineering evidence behind.',
      prompt: 'Match each phase with representative evidence it should produce.',
      pairs: [
        ['Requirements Analysis', 'SRS or equivalent agreed requirements'],
        ['Software Design', 'Architecture and detailed design models/specifications'],
        ['Coding & Unit Testing', 'Source code, executable units and unit-test results'],
        ['Acceptance Testing', 'Acceptance results against agreed needs'],
        ['Maintenance', 'Change requests, fixes, revised artifacts and updated releases']
      ],
      lesson: '../weeks/01-introduction/development-process.html'
    },
    {
      id: 'final-review',
      title: 'Final Engineering Review',
      skill: 'Integrated Reasoning',
      level: 'Analyze',
      type: 'choice',
      context: 'The Smart Campus Service is approaching release. You must explain to stakeholders what makes the work software engineering rather than simply programming.',
      prompt: 'Which statement gives the strongest explanation?',
      options: [
        'The team has produced a large amount of source code.',
        'The system is organized around agreed needs, coordinated teamwork, lifecycle activities, quality evidence, project control and maintainable change.',
        'One developer understands the user interface very well.',
        'The project uses an object-oriented programming language.'
      ],
      answer: 1,
      feedback: {
        why: 'Engineered software is more than working code; it connects needs, process, quality, coordination and evolution.',
        consequence: 'The whole Topic 01 story is one causal chain from software nature to disciplined engineering.'
      },
      lesson: '../weeks/01-introduction/oose.html'
    }
  ]
};

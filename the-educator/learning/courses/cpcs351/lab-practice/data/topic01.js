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
      type: 'choice',
      prompt: 'The university adds one “small” approval rule after deployment. Why can the change still be risky?',
      options: [
        'Software is easy to copy, so every copy must be rebuilt.',
        'Software is easy to edit, but a local change can affect connected requirements, logic, tests and operations.',
        'Software physically wears out when users change it.',
        'Software changes are expensive mainly because new raw materials are required.'
      ],
      answer: 1,
      feedback: {
        why: 'Software is highly changeable but interconnected. Ease of editing is not the same as ease of understanding.',
        consequence: 'Treat even small changes as engineering changes: analyze impact, update artifacts, test and coordinate release.'
      },
      lesson: '../weeks/01-introduction/index.html'
    },
    {
      id: 'pqct-decision',
      title: 'The Management Decision',
      skill: 'SE & PQCT Reasoning',
      level: 'Distinguish',
      type: 'choice',
      prompt: 'Management proposes skipping reviews and testing to release before registration week. What is the best engineering response?',
      options: [
        'It improves every PQCT dimension because less work is always better.',
        'It may reduce time now, but can damage quality and increase later cost; the trade-off must be evaluated across PQCT.',
        'Only productivity matters in software engineering.',
        'Testing belongs to project management, so it can be skipped safely.'
      ],
      answer: 1,
      feedback: {
        why: 'Software engineering balances Productivity, Quality, Cost and Time to Market rather than optimizing one metric blindly.',
        consequence: 'A faster release is not an improvement if defects, rework or operational failures erase the gain.'
      },
      lesson: '../weeks/01-introduction/what-is-se.html'
    },
    {
      id: 'scale',
      title: 'The Project Grows',
      skill: 'SE Reasoning',
      level: 'Apply',
      type: 'choice',
      prompt: 'The service expands to authentication, records, notifications, payments and several integrations. Why does this strengthen the case for software engineering?',
      options: [
        'A larger codebase only needs faster typing.',
        'Scale increases intellectual complexity and requires coordinated teamwork, methods and tools.',
        'Large systems eliminate the need for requirements.',
        'Software engineering is only useful for embedded hardware.'
      ],
      answer: 1,
      feedback: {
        why: 'Scale changes the problem from individual programming to coordinated engineering.',
        consequence: 'The project needs shared models, defined processes, communication mechanisms and coordinated responsibilities.'
      },
      lesson: '../weeks/01-introduction/why-se.html'
    },
    {
      id: 'team-trouble',
      title: 'Team Trouble',
      skill: 'Teamwork',
      level: 'Apply',
      type: 'choice',
      prompt: 'The UI team and database team each have a correct view of their own part, but they disagree about how the whole system should behave. What is the primary challenge?',
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
      prompt: 'Classify activities into Development, SQA or Project Management.',
      items: [
        { text: 'Design the software architecture', answer: 'Development' },
        { text: 'Review a requirements document for quality and conformance', answer: 'SQA' },
        { text: 'Estimate effort and schedule the release', answer: 'Project Management' }
      ],
      categories: ['Development', 'SQA', 'Project Management'],
      lesson: '../weeks/01-introduction/life-cycle.html'
    },
    {
      id: 'waterfall-sequence',
      title: 'Build the Lifecycle',
      skill: 'Lifecycle Sequence',
      level: 'Apply',
      type: 'sequence',
      prompt: 'Reconstruct the Waterfall sequence used in Topic 01.',
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
      prompt: 'Match each phase with representative evidence it should leave behind.',
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
      prompt: 'Which statement best shows that the Smart Campus Service is being engineered rather than merely programmed?',
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

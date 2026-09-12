export const topic04Mission = {
  id: 'topic04-mission04',
  topic: '04',
  title: 'Choose the Development Strategy',
  scenario: 'KAU is planning a new Student Services Platform. Some requirements are stable, others are unclear, several teams must coordinate, and management wants visible progress without ignoring technical risk. You are the software engineer responsible for choosing and justifying how the project should be organized.',
  returnUrl: '../weeks/04-process-and-methodology/',
  returnLabel: 'Return to Topic 04',
  readyMessage: 'You demonstrated the Topic 04 reasoning chain from project pressure through process, methodology, model selection, Agile practices, and software paradigm.',
  stages: [
    {
      id: 'route-vs-recipe',
      title: 'Route or Recipe?',
      skill: 'Process vs. Methodology',
      level: 'Recognize',
      type: 'classification',
      context: 'The project team keeps using “process” and “methodology” as if they mean the same thing. Before planning starts, separate lifecycle structure from execution detail.',
      prompt: 'Classify each statement as Process or Methodology.',
      categories: ['Process', 'Methodology'],
      items: [
        { text: 'Defines phases, major activities, artifacts, milestones, and their order.', answer: 'Process' },
        { text: 'Specifies detailed steps, techniques, representations, and procedures.', answer: 'Methodology' },
        { text: 'Shows when requirements work, design, implementation, and testing occur.', answer: 'Process' },
        { text: 'Defines entry criteria, how work is performed, and exit criteria for an activity.', answer: 'Methodology' }
      ],
      checkLabel: 'Check route vs. recipe',
      feedback: {
        why: 'Process defines the lifecycle structure—what happens and when. Methodology defines how the work inside that structure is carried out.',
        consequence: 'A project needs both a coherent route and disciplined execution detail; confusing them makes planning and evaluation vague.'
      },
      lesson: '../weeks/04-process-and-methodology/index.html'
    },
    {
      id: 'project-pressure',
      title: 'Read the Project Pressure',
      skill: 'Development Challenges',
      level: 'Apply',
      type: 'matching',
      context: 'Different parts of the Student Services Platform create different engineering pressures. Your process should respond to the pressure that actually exists.',
      prompt: 'Match each project condition with the engineering need it creates.',
      pairs: [
        ['Users are not yet sure what workflow they really need', 'Learning & feedback'],
        ['Several departments and teams must coordinate interfaces', 'Coordination & integration'],
        ['Requirements change frequently during the semester', 'Adaptability'],
        ['A new identity technology has high technical uncertainty', 'Explicit risk reduction'],
        ['Regulatory reporting requirements are stable and approved', 'Up-front planning & staged control']
      ],
      checkLabel: 'Check pressure map',
      feedback: {
        why: 'Different process models exist because projects face different combinations of uncertainty, coordination, change, risk, and stability.',
        consequence: 'Do not choose a model by fashion. Start by identifying the dominant project pressure.'
      },
      lesson: '../weeks/04-process-and-methodology/development-challenges.html'
    },
    {
      id: 'model-signatures',
      title: 'Recognize the Process Logic',
      skill: 'Process Models',
      level: 'Distinguish',
      type: 'matching',
      context: 'Management asks for a quick comparison of the five process logics taught in Topic 04.',
      prompt: 'Match each model with its dominant engineering logic.',
      pairs: [
        ['Waterfall', 'Sequence & staged commitment'],
        ['Prototyping', 'Learn requirements before full commitment'],
        ['Evolutionary Development', 'Grow the working production product'],
        ['Spiral', 'Reduce important risk before greater commitment'],
        ['Agile', 'Adapt through short working increments and feedback']
      ],
      checkLabel: 'Check model signatures',
      feedback: {
        why: 'The models organize commitment, learning, risk, and feedback differently. Their names matter less than the development logic they represent.',
        consequence: 'Recognizing the dominant logic helps you reason about model fit instead of memorizing isolated definitions.'
      },
      lesson: '../weeks/04-process-and-methodology/process-models-overview.html'
    },
    {
      id: 'waterfall-fit',
      title: 'When Does Waterfall Fit?',
      skill: 'Waterfall Reasoning',
      level: 'Apply',
      type: 'multiselect',
      context: 'One subsystem handles formal regulatory reporting. Management proposes a plan-driven approach for that part of the project.',
      prompt: 'Which conditions strengthen the case for Waterfall characteristics?',
      instruction: 'Select every condition supported by the Topic 04 Waterfall lesson.',
      options: [
        'Requirements are well understood and unlikely to change frequently.',
        'Formal milestones, documentation, and staged approvals are important.',
        'Late changes would be expensive and should be minimized through early commitment.',
        'The team expects to discover core requirements only after many user experiments.',
        'The project needs constant reprioritization every few days.'
      ],
      answer: [0,1,2],
      checkLabel: 'Check Waterfall fit',
      feedback: {
        why: 'Waterfall gains value from stability, visible milestones, documentation, and staged commitment. Its weakness is the cost of changing earlier assumptions late in development.',
        consequence: 'Plan-driven structure is defensible when stability and control dominate—not simply because Waterfall is familiar.'
      },
      lesson: '../weeks/04-process-and-methodology/waterfall-model.html'
    },
    {
      id: 'prototype-or-evolve',
      title: 'Prototype or Evolve?',
      skill: 'Prototype vs. Evolutionary',
      level: 'Analyze',
      type: 'classification',
      context: 'The student-facing workflow is uncertain. Two teams propose different learning strategies: one wants to discard an early model, another wants to grow the real product through releases.',
      prompt: 'Classify each situation as Throwaway Prototype or Evolutionary Development.',
      categories: ['Throwaway Prototype', 'Evolutionary Development'],
      items: [
        { text: 'Build a clickable booking interface to learn what users need, then discard it.', answer: 'Throwaway Prototype' },
        { text: 'Release a small working booking service and strengthen the same product over time.', answer: 'Evolutionary Development' },
        { text: 'Keep the knowledge from the early model but engineer the production solution separately.', answer: 'Throwaway Prototype' },
        { text: 'Working versions become the path toward the final production system.', answer: 'Evolutionary Development' }
      ],
      checkLabel: 'Check learning strategy',
      feedback: {
        why: 'Throwaway prototyping preserves learning but discards the model. Evolutionary development preserves and strengthens the working product itself.',
        consequence: 'Do not let a learning prototype accidentally become production software without the engineering discipline needed for long-term growth.'
      },
      lesson: '../weeks/04-process-and-methodology/evolutionary-development.html'
    },
    {
      id: 'spiral-risk-loop',
      title: 'Build the Risk-Driven Loop',
      skill: 'Spiral Model',
      level: 'Apply',
      type: 'sequence',
      context: 'A new identity-verification technology may fail under campus conditions. Before major investment, the team decides to use risk-driven thinking.',
      prompt: 'Put the Spiral logic in the correct order for one cycle.',
      answer: [
        'Establish objectives and alternatives',
        'Identify, analyze, and reduce important risks',
        'Develop and validate the next product level',
        'Evaluate evidence and plan the next cycle'
      ],
      checkLabel: 'Check Spiral cycle',
      feedback: {
        why: 'Spiral is defined by risk-driven commitment: identify the important uncertainty, reduce it, then make the next engineering commitment using better evidence.',
        consequence: 'Iteration alone does not make a process Spiral; explicit risk reduction is the defining logic.'
      },
      lesson: '../weeks/04-process-and-methodology/spiral-model.html'
    },
    {
      id: 'agile-cycle',
      title: 'Create a Useful Agile Cycle',
      skill: 'Agile Process',
      level: 'Apply',
      type: 'sequence',
      context: 'Student-service rules change often. The team needs short cycles that produce working results and better-informed next decisions.',
      prompt: 'Reconstruct the Agile cycle emphasized in Topic 04.',
      answer: ['Plan', 'Build', 'Test', 'Review', 'Adapt'],
      checkLabel: 'Check Agile cycle',
      feedback: {
        why: 'A useful iteration produces a tested increment, stakeholder feedback, and updated understanding. Agile is disciplined adaptation—not simply repeated activity or “working fast.”',
        consequence: 'Each cycle should create both value and evidence that improves the next decision.'
      },
      lesson: '../weeks/04-process-and-methodology/agile-process-models.html'
    },
    {
      id: 'choose-the-model',
      title: 'Choose the Development Strategy',
      skill: 'Model Selection',
      level: 'Analyze',
      type: 'classification',
      context: 'Different parts of the overall program have different dominant uncertainties. Select the process logic that best attacks each one.',
      prompt: 'Choose the strongest process-model fit for each scenario.',
      categories: ['Waterfall', 'Prototyping', 'Evolutionary', 'Spiral', 'Agile'],
      items: [
        { text: 'Stable government-style reporting with controlled interfaces and heavy approvals.', answer: 'Waterfall' },
        { text: 'Users cannot explain the desired interface until they can react to a model.', answer: 'Prototyping' },
        { text: 'The real product should start small and grow through useful releases.', answer: 'Evolutionary' },
        { text: 'A high-consequence project has major uncertainty in a new technology.', answer: 'Spiral' },
        { text: 'Priorities change frequently and stakeholders can review working increments often.', answer: 'Agile' }
      ],
      checkLabel: 'Check model selection',
      feedback: {
        why: 'Model selection is an engineering decision based on requirements stability, risk, technology, feedback needs, documentation, schedule, cost, and team context.',
        consequence: 'The best answer is not a model name by itself; it is a justified fit between project conditions and process logic.'
      },
      lesson: '../weeks/04-process-and-methodology/choosing-process-model.html'
    },
    {
      id: 'agile-methods',
      title: 'Choose the Agile Emphasis',
      skill: 'Agile Methods',
      level: 'Apply',
      type: 'matching',
      context: 'The team decides to combine complementary Agile practices instead of treating Agile as one fixed recipe.',
      prompt: 'Match each need with the Agile method or approach whose emphasis best fits.',
      pairs: [
        ['Short-cycle planning, prioritized work, regular inspection and adaptation', 'Scrum'],
        ['Frequent testing, integration, refactoring, and strong technical discipline', 'Extreme Programming (XP)'],
        ['Reduce waste, waiting, and unnecessary handoffs while improving flow', 'Lean Development'],
        ['Small client-valued features drive short design/build cycles', 'Feature Driven Development'],
        ['People and communication are tailored to team size and project criticality', 'Crystal Clear']
      ],
      checkLabel: 'Check Agile emphasis',
      feedback: {
        why: 'Agile is a family. Different methods emphasize cadence, engineering discipline, flow, feature delivery, or people and communication.',
        consequence: 'Real teams can combine compatible practices when each solves a different engineering problem.'
      },
      lesson: '../weeks/04-process-and-methodology/agile-methods.html'
    },
    {
      id: 'paradigm-final-review',
      title: 'Final Strategy Review',
      skill: 'Paradigm & Integrated Reasoning',
      level: 'Analyze',
      type: 'multiselect',
      context: 'The architecture team now asks how Topic 04 fits together before the project moves into detailed requirements and design.',
      prompt: 'Which statements correctly reconstruct the Topic 04 engineering argument?',
      instruction: 'Select every statement that belongs in the final review.',
      options: [
        'Development challenges explain why different process strategies are needed.',
        'Process defines lifecycle structure; methodology defines execution detail.',
        'Process-model selection should follow project uncertainty, risk, feedback, control, and evidence needs.',
        'Agile is one single mandatory method with one fixed set of practices.',
        'A software paradigm is a conceptual lens such as procedural, object-oriented, or data-oriented.',
        'Paradigm and methodology are related but are not synonyms.',
        'The newest process model is automatically the best choice for every project.'
      ],
      answer: [0,1,2,4,5],
      checkLabel: 'Complete strategy review',
      feedback: {
        why: 'Topic 04 is one chain: project pressures create process needs; process and methodology organize work; models provide alternative lifecycle strategies; selection depends on context; Agile methods implement different emphases; paradigms provide conceptual lenses.',
        consequence: 'Strong process reasoning means choosing and justifying an engineering strategy—not memorizing slogans about “old” or “modern” models.'
      },
      lesson: '../weeks/04-process-and-methodology/software-paradigms.html'
    }
  ]
};
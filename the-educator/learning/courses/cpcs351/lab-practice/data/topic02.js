export const topic02Mission = {
  id: 'topic02-mission02',
  topic: '02',
  title: 'Build the Quality Case',
  scenario: 'A mobile banking team is preparing an instant international transfer release. You are the quality engineer responsible for building credible evidence that the release is correct, useful, measurable, and sustainable.',
  returnUrl: '../weeks/02-software-quality/',
  returnLabel: 'Return to Topic 02',
  readyMessage: 'You built a coherent quality case using cost-of-quality reasoning, verification and validation, static and dynamic evidence, review techniques, metrics, and quality attributes over time.',
  stages: [
    {
      id: 'quality-beyond-testing',
      title: 'Quality Is More Than Testing',
      skill: 'SQA Foundations',
      level: 'Recognize',
      type: 'multiselect',
      context: 'A manager says: “We already have testers, so SQA is covered.” Before release planning continues, you must correct the quality model.',
      prompt: 'Which activities can contribute to Software Quality Assurance in this course?',
      instruction: 'Select every activity that belongs in the broader SQA picture.',
      options: [
        'Verification of work products against specifications or standards.',
        'Validation against real customer or operational needs.',
        'Technical reviews and inspections of static artifacts.',
        'Testing executable software and observing behavior.',
        'Only executing the final system after coding is complete.'
      ],
      answer: [0,1,2,3],
      checkLabel: 'Check SQA model',
      feedback: {
        why: 'Testing is one SQA activity, not the whole of SQA. Quality evidence also comes from verification, validation, reviews, standards, measurements, and process-oriented quality work.',
        consequence: 'A release plan that waits until final testing leaves many preventable defects and quality questions unaddressed.'
      },
      lesson: '../weeks/02-software-quality/index.html'
    },
    {
      id: 'quality-cost',
      title: 'Pay Now or Pay Later',
      skill: 'Cost of Quality',
      level: 'Apply',
      type: 'classification',
      context: 'Budget pressure appears. The team must distinguish intentional quality investment from the costs created when defects escape.',
      prompt: 'Classify each cost as Prevention / Assurance or Failure Cost.',
      categories: ['Prevention / Assurance', 'Failure Cost'],
      items: [
        { text: 'Perform a requirements review before design starts.', answer: 'Prevention / Assurance' },
        { text: 'Maintain tools and processes used by the SQA framework.', answer: 'Prevention / Assurance' },
        { text: 'Developers lose time diagnosing a production transfer failure.', answer: 'Failure Cost' },
        { text: 'Customers lose productivity because transfers fail in operation.', answer: 'Failure Cost' },
        { text: 'The bank suffers reputation and liability damage after a serious defect.', answer: 'Failure Cost' }
      ],
      checkLabel: 'Check quality costs',
      feedback: {
        why: 'Quality spending does not disappear when prevention is cut. It shifts toward failure, where diagnosis, rework, customer impact, liability, and reputation can be much more expensive.',
        consequence: 'Early assurance is an economic engineering decision, especially because defects become more expensive as they escape later in the life cycle.'
      },
      lesson: '../weeks/02-software-quality/cost-of-quality.html'
    },
    {
      id: 'vv-questions',
      title: 'Ask the Right Quality Question',
      skill: 'Verification & Validation',
      level: 'Distinguish',
      type: 'classification',
      context: 'The transfer feature passes several checks, but the team keeps mixing specification conformance with real-world fitness.',
      prompt: 'Classify each quality question as Verification or Validation.',
      categories: ['Verification', 'Validation'],
      items: [
        { text: 'Does the design implement the approved transfer-limit requirement?', answer: 'Verification' },
        { text: 'Does the implemented authorization rule conform to the specification?', answer: 'Verification' },
        { text: 'Does the transfer workflow actually satisfy customer and regulatory needs?', answer: 'Validation' },
        { text: 'Is the product appropriate for the intended real-world use?', answer: 'Validation' }
      ],
      checkLabel: 'Check V&V questions',
      feedback: {
        why: 'Verification asks whether the work product conforms to specifications, standards, or preceding artifacts. Validation asks whether the result corresponds to the real need and intended use.',
        consequence: 'A system can verify perfectly against the wrong requirement and still fail validation.'
      },
      lesson: '../weeks/02-software-quality/verification-validation.html'
    },
    {
      id: 'evidence-mode',
      title: 'Choose the Evidence Mode',
      skill: 'Static & Dynamic Evidence',
      level: 'Apply',
      type: 'classification',
      context: 'The release is moving through requirements, design, code, and executable builds. Decide whether each activity needs execution.',
      prompt: 'Classify each activity as Static or Dynamic evidence gathering.',
      categories: ['Static', 'Dynamic'],
      items: [
        { text: 'Inspect the requirements document for ambiguity and inconsistency.', answer: 'Static' },
        { text: 'Review the transfer design against approved requirements.', answer: 'Static' },
        { text: 'Inspect source code for standards and suspicious anomalies.', answer: 'Static' },
        { text: 'Execute transfer scenarios and observe actual behavior.', answer: 'Dynamic' },
        { text: 'Run regression tests after a maintenance change.', answer: 'Dynamic' }
      ],
      checkLabel: 'Check evidence mode',
      feedback: {
        why: 'Static techniques examine representations without executing the software; dynamic evidence requires execution. These are evidence modes, not synonyms for verification and validation.',
        consequence: 'Quality work can begin before executable software exists, and both static and dynamic evidence may contribute to broader V&V questions.'
      },
      lesson: '../weeks/02-software-quality/lifecycle-vv.html'
    },
    {
      id: 'review-techniques',
      title: 'Choose the Review Technique',
      skill: 'Review Techniques',
      level: 'Apply',
      type: 'matching',
      context: 'Different artifacts and goals require different review techniques. Match the situation to the technique emphasized in the lecture.',
      prompt: 'Match each situation with the best-fitting technique.',
      pairs: [
        ['One engineer informally reads an artifact alone', 'Desk Checking'],
        ['The author guides peers through the work using scenarios or simple test data', 'Walkthrough'],
        ['Peers evaluate independently, then discuss findings with the developer', 'Peer Review'],
        ['A structured team checks the product against defined criteria, standards, and common-error lists', 'Inspection'],
        ['The software is executed to expose program errors', 'Testing']
      ],
      checkLabel: 'Check techniques',
      feedback: {
        why: 'Desk checking is individual and informal; walkthroughs are author-guided; peer review combines independent evaluation and discussion; inspection is structured and criterion-driven; testing executes software.',
        consequence: 'Choosing the technique by purpose and evidence type is more useful than memorizing five names in isolation.'
      },
      lesson: '../weeks/02-software-quality/reviews-inspections.html'
    },
    {
      id: 'metric-families',
      title: 'Measure the Signal',
      skill: 'Quality Metrics',
      level: 'Apply',
      type: 'classification',
      context: 'Management asks for measurable evidence. Your job is to place each metric in the lecture taxonomy before interpreting it.',
      prompt: 'Classify each metric into Requirements, Design, Implementation, or System / OO.',
      categories: ['Requirements', 'Design', 'Implementation', 'System / OO'],
      items: [
        { text: 'Requirements completeness', answer: 'Requirements' },
        { text: 'Fan-Out', answer: 'Design' },
        { text: 'Coupling between modules', answer: 'Design' },
        { text: 'Defects per KLOC', answer: 'Implementation' },
        { text: 'Cyclomatic complexity', answer: 'Implementation' },
        { text: 'Depth of inheritance tree', answer: 'System / OO' },
        { text: 'Response for a class', answer: 'System / OO' }
      ],
      checkLabel: 'Check metric families',
      feedback: {
        why: 'The lecture groups metrics into requirements, design, implementation, and system/object-oriented families. A metric is useful only when its definition, context, and interpretation are clear.',
        consequence: 'Numbers should support engineering judgment; they are not automatic proof of quality.'
      },
      lesson: '../weeks/02-software-quality/quality-metrics.html'
    },
    {
      id: 'quality-profile',
      title: 'Build the Quality Profile',
      skill: 'Quality Attributes',
      level: 'Analyze',
      type: 'matching',
      context: 'The transfer release “works,” but stakeholders report different quality concerns. Diagnose the quality dimension at stake.',
      prompt: 'Match each scenario with the primary quality attribute.',
      pairs: [
        ['Customers cannot understand the transfer workflow without help', 'Usability'],
        ['The feature consumes excessive memory and processing resources', 'Efficiency'],
        ['Transfers repeatedly fail under expected operating conditions', 'Reliability'],
        ['A regulatory rule change requires rewriting many unrelated modules', 'Maintainability'],
        ['The authentication component cannot be reused by another banking service', 'Reusability']
      ],
      checkLabel: 'Check quality profile',
      feedback: {
        why: 'Quality is multidimensional. Usability, efficiency, reliability, maintainability, and reusability describe different properties, and their importance depends on context.',
        consequence: '“It works” is not enough to establish that a software product is high quality.'
      },
      lesson: '../weeks/02-software-quality/quality-attributes.html'
    },
    {
      id: 'quality-horizon',
      title: 'Today vs. Tomorrow',
      skill: 'Quality Over Time',
      level: 'Analyze',
      type: 'classification',
      context: 'The release performs well for today’s traffic, but future regulation, transaction volume, and maintenance demands are expected to grow.',
      prompt: 'Classify each concern by the quality horizon emphasized in the lecture.',
      categories: ['Short-Term Quality', 'Long-Term Quality'],
      items: [
        { text: 'Does the feature satisfy the customer’s immediate transfer need?', answer: 'Short-Term Quality' },
        { text: 'Is performance acceptable for today’s transaction volume?', answer: 'Short-Term Quality' },
        { text: 'Can the system be changed safely when regulations evolve?', answer: 'Long-Term Quality' },
        { text: 'Can it scale to a much larger transaction volume?', answer: 'Long-Term Quality' },
        { text: 'Can it support realistic future customer needs without a rewrite?', answer: 'Long-Term Quality' }
      ],
      checkLabel: 'Check quality horizon',
      feedback: {
        why: 'Short-term quality focuses on current needs and current operating volume. Long-term quality emphasizes maintainability, future needs, and scalability.',
        consequence: 'A release can be acceptable today yet carry serious long-term quality risk.'
      },
      lesson: '../weeks/02-software-quality/short-long-term-quality.html'
    },
    {
      id: 'quality-release-review',
      title: 'Final Quality Release Review',
      skill: 'Integrated Quality Reasoning',
      level: 'Analyze',
      type: 'multiselect',
      context: 'The instant international transfer release reaches its final quality review. Build the strongest evidence-based release argument using the full Topic 02 story.',
      prompt: 'Which actions belong in a credible software-quality case for this release?',
      instruction: 'Select every action supported by Topic 02.',
      options: [
        'Invest early in requirements and design reviews where defects are cheaper to address.',
        'Verify transfer limits, authorization, and audit behavior against agreed specifications.',
        'Validate that the workflow satisfies real customer and regulatory needs.',
        'Use static reviews and dynamic execution as complementary evidence modes.',
        'Interpret relevant metrics as evidence rather than treating numbers as quality by themselves.',
        'Judge immediate usability/reliability together with long-term maintainability and scalability.',
        'Rely only on final testing because all other SQA activities duplicate testing.',
        'Choose the technically optimal solution regardless of cost, schedule, or engineering trade-offs.'
      ],
      answer: [0,1,2,3,4,5],
      checkLabel: 'Complete quality review',
      feedback: {
        why: 'A credible quality case combines prevention economics, correct V&V questions, static and dynamic evidence, appropriate reviews, interpreted metrics, and a multidimensional view of quality across time.',
        consequence: 'Software quality is built as a chain of evidence throughout engineering—not added as one final test gate.'
      },
      lesson: '../weeks/02-software-quality/se-vs-cs.html'
    }
  ]
};

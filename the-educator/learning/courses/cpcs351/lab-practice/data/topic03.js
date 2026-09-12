export const topic03Mission = {
  id: 'topic03-mission03',
  topic: '03',
  title: 'Engineer the Whole System',
  scenario: 'KAU is planning a Smart Campus Mobility System that combines mobile software, access gates, sensors, shuttles, operators, procedures, and external university services. You are the system engineer responsible for making the parts work as one dependable system.',
  returnUrl: '../weeks/03-system-engineering/',
  returnLabel: 'Return to Topic 03',
  readyMessage: 'You demonstrated the Topic 03 engineering chain from system boundary and requirements through architecture, allocation, integration, deployment, and controlled evolution.',
  stages: [
    {
      id: 'whole-system',
      title: 'See the Whole System',
      skill: 'System Thinking',
      level: 'Recognize',
      type: 'multiselect',
      context: 'A manager describes the project as “the shuttle app.” In reality, the service includes vehicles, gates, sensors, operators, procedures, networks, and external university systems.',
      prompt: 'Which observations show that this is a system-engineering problem rather than only a software project?',
      instruction: 'Select every observation supported by the Topic 03 definition of a system.',
      options: [
        'Multiple interrelated components must work together to accomplish one mission.',
        'The system interacts with people, devices, organizations, and external systems in its environment.',
        'Hardware, software, and human procedures create cross-discipline dependencies.',
        'The project can be treated as software-only because the mobile app contains the user interface.',
        'The system will evolve as technology, operating conditions, and university needs change.'
      ],
      answer: [0,1,2,4],
      checkLabel: 'Check system boundary',
      feedback: {
        why: 'System engineering starts from the whole: interacting components, subsystem hierarchy, environment, and evolution. Software is one subsystem within that broader mission.',
        consequence: 'A locally correct app cannot make the whole system successful if devices, procedures, interfaces, or external services are incompatible.'
      },
      lesson: '../weeks/03-system-engineering/index.html'
    },
    {
      id: 'se-process',
      title: 'Build the System Engineering Process',
      skill: 'System Engineering Process',
      level: 'Apply',
      type: 'sequence',
      context: 'The project team has the major system-engineering activities but has lost the process order. Reconstruct the flow from whole-system definition through operation and change.',
      prompt: 'Place the major system-engineering activities in the Topic 03 order.',
      answer: [
        'System Requirements Definition',
        'System Modeling & Design',
        'Subsystem Development',
        'System Integration & Testing',
        'Deployment',
        'Maintenance'
      ],
      feedback: {
        why: 'System engineering moves top-down from whole-system needs into decomposition and subsystem responsibilities, then bottom-up through integration, deployment, and maintenance.',
        consequence: 'The process preserves the connection between the original mission and the integrated operational system.'
      },
      lesson: '../weeks/03-system-engineering/system-engineering-process.html'
    },
    {
      id: 'needs-to-requirements',
      title: 'From Business Gap to System Requirement',
      skill: 'System Requirements',
      level: 'Apply',
      type: 'classification',
      context: 'Stakeholders provide a mix of goals, current problems, needs, and solution details. You must keep the reasoning chain clean before architecture begins.',
      prompt: 'Classify each statement by its role in requirements definition.',
      categories: ['Business Goal', 'Current Situation / Problem', 'Business Need', 'System Requirement'],
      items: [
        { text: 'Reduce average student waiting time for campus transportation.', answer: 'Business Goal' },
        { text: 'Students currently wait unpredictably because shuttle locations are not visible.', answer: 'Current Situation / Problem' },
        { text: 'Students need timely, traceable campus transportation information.', answer: 'Business Need' },
        { text: 'The system shall provide the current location and estimated arrival time of active shuttles.', answer: 'System Requirement' },
        { text: 'The system shall support an agreed measurable campus-wide service capacity.', answer: 'System Requirement' }
      ],
      checkLabel: 'Check requirement chain',
      feedback: {
        why: 'Business goals and the current situation expose a gap. That gap produces needs, and selected feasible needs are expressed as whole-system capabilities and constraints.',
        consequence: 'Requirements should define what the whole system owes stakeholders before responsibility is assigned to a specific app, device, or person.'
      },
      lesson: '../weeks/03-system-engineering/system-requirements.html'
    },
    {
      id: 'architecture-decisions',
      title: 'Design the System Architecture',
      skill: 'System Architecture',
      level: 'Analyze',
      type: 'matching',
      context: 'The project has reached architectural design. Your task is to make subsystem boundaries useful for separate teams while keeping integration realistic.',
      prompt: 'Match each architectural concern with the design principle it best represents.',
      pairs: [
        ['Each subsystem should own a coherent purpose rather than unrelated tasks', 'Well-defined functionality'],
        ['A change inside one subsystem should avoid unnecessary ripple effects elsewhere', 'Relative independence / loose coupling'],
        ['Subsystem boundaries should make independently developed parts practical to assemble later', 'Easy integration'],
        ['Responsibility should be distributed so system requirements have clear owners', 'Partition requirements'],
        ['The structure should make suitable commercial components practical to adopt', 'Facilitate COTS use']
      ],
      checkLabel: 'Check architecture decisions',
      feedback: {
        why: 'Good architecture creates cohesive, relatively independent parts with clear responsibilities and manageable interfaces. The objective is not simply to draw fewer boxes.',
        consequence: 'Architecture determines what parts exist and where boundaries lie; it shapes team ownership, interfaces, integration risk, and later allocation.'
      },
      lesson: '../weeks/03-system-engineering/system-architecture.html'
    },
    {
      id: 'allocate-responsibility',
      title: 'Allocate the Responsibility',
      skill: 'Requirements Allocation',
      level: 'Analyze',
      type: 'sequence',
      context: 'A whole-system requirement is too broad for implementation. You must refine it without losing traceability to the original system obligation.',
      prompt: 'Reconstruct the refinement logic used in requirements allocation.',
      answer: [
        'Define the high-level system requirement',
        'Allocate responsibility to one or more subsystems',
        'Refine the allocated responsibility into lower-level requirements',
        'Add measurable performance or quality targets where needed',
        'Trace and verify lower-level requirements against the parent requirement'
      ],
      feedback: {
        why: 'Allocation turns whole-system obligations into accountable subsystem/component responsibilities while preserving the parent-child requirement chain.',
        consequence: 'A lower-level requirement should not become an independent invention; together the refinements must still satisfy the original system intent.'
      },
      lesson: '../weeks/03-system-engineering/requirements-allocation.html'
    },
    {
      id: 'choose-diagram',
      title: 'Choose the Right Engineering View',
      skill: 'Architecture Diagrams',
      level: 'Apply',
      type: 'matching',
      context: 'Different stakeholders ask different structural questions. One diagram cannot communicate every relationship equally well.',
      prompt: 'Match each engineering question with the most suitable diagram type.',
      pairs: [
        ['Show managers the major subsystems and their high-level connections', 'Block Diagram'],
        ['Show software/components, ports, interfaces, and communication paths', 'UML Component Diagram'],
        ['Show formal whole-part composition of multidisciplinary system blocks', 'SysML Block Definition Diagram'],
        ['Show internal parts, ports, and flows inside one subsystem', 'SysML Internal Block Diagram'],
        ['Distinguish information movement from physical material movement', 'Data / Material Flow Diagram']
      ],
      checkLabel: 'Check diagram choices',
      feedback: {
        why: 'Each diagram is an abstraction chosen for a question: high-level structure, component interfaces, composition, internal flows, or information/material movement.',
        consequence: 'More detail is not automatically better; the useful view is the one that makes the relevant engineering relationship easiest to see.'
      },
      lesson: '../weeks/03-system-engineering/architecture-diagrams.html'
    },
    {
      id: 'integration-scope',
      title: 'Expand the Test Scope',
      skill: 'Integration & Deployment',
      level: 'Analyze',
      type: 'classification',
      context: 'Every subsystem has passed its local checks, but that does not prove the campus mobility system is ready. Diagnose the scope of each remaining test concern.',
      prompt: 'Classify each check by the system-engineering test scope it represents.',
      categories: ['Subsystem', 'Integration', 'Complete System', 'Target Environment'],
      items: [
        { text: 'Verify that the gate controller satisfies its allocated responsibility by itself.', answer: 'Subsystem' },
        { text: 'Check whether the gate controller and mobile service exchange identifiers using compatible formats.', answer: 'Integration' },
        { text: 'Verify that the assembled mobility system satisfies the agreed campus-wide system requirements.', answer: 'Complete System' },
        { text: 'Operate the deployed system under real campus Wi-Fi, traffic, staffing, and peak-hour conditions.', answer: 'Target Environment' }
      ],
      checkLabel: 'Check test scope',
      feedback: {
        why: 'Test scope expands from the local part to interfaces, then to the complete integrated system, and finally to real operational conditions.',
        consequence: 'Subsystem correctness alone cannot prove interoperability, whole-system compliance, or deployability in the real environment.'
      },
      lesson: '../weeks/03-system-engineering/integration-deployment.html'
    },
    {
      id: 'controlled-evolution',
      title: 'Control System Evolution',
      skill: 'Configuration Management',
      level: 'Analyze',
      type: 'classification',
      context: 'The system now has multiple app versions, gate firmware, sensor profiles, shuttle controllers, and operator procedures. A safe release is a compatible configuration, not a single software build.',
      prompt: 'Classify each activity by the configuration-management function it represents.',
      categories: ['Identification', 'Change Control', 'Auditing', 'Status Reporting'],
      items: [
        { text: 'Define which app, firmware, sensor profile, and procedure versions belong to release M3.', answer: 'Identification' },
        { text: 'Evaluate and approve a gate-firmware update before deployment.', answer: 'Change Control' },
        { text: 'Check that the installed campus configuration matches the approved M3 baseline.', answer: 'Auditing' },
        { text: 'Report which campus zones have migrated to M3 and which still run M2.', answer: 'Status Reporting' }
      ],
      checkLabel: 'Check configuration control',
      feedback: {
        why: 'System configuration management identifies compatible baselines, controls changes, audits the actual configuration, and reports deployment status across all relevant system elements.',
        consequence: 'Individually valid versions can form an invalid system if their compatibility and deployment state are not controlled together.'
      },
      lesson: '../weeks/03-system-engineering/configuration-management.html'
    }
  ]
};

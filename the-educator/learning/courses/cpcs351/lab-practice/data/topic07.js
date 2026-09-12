export const topic07Mission = {
  id:'topic07-mission07',
  topic:'07',
  title:'Model the Domain Before You Model the Software',
  scenario:'A Jeddah event-management company is building EventSphere, a platform for venues, organizers, events, bookings, tickets, attendees, staff, and payments. You are the domain modeler. Discover the important concepts, separate classes from attributes, inspect flawed UML class diagrams, correct relationship semantics, and defend a domain model that accurately represents the problem world.',
  returnUrl:'../weeks/07-domain-modeling-and-uml-class-diagram/',
  returnLabel:'Return to Topic 07',
  readyMessage:'You completed a 14-stage domain-modeling review from concept discovery through UML class notation, associations, multiplicity, inheritance, aggregation/composition, and final model approval.',
  stages:[
    {
      id:'domain-vs-solution', title:'Start in the Problem World', skill:'Domain Modeling Foundations', level:'Apply', type:'classification',
      context:'The EventSphere team has mixed real-world domain concepts with software implementation details.',
      prompt:'Classify each candidate as Domain Concept or Software-Solution Detail.', categories:['Domain Concept','Software-Solution Detail'],
      items:[
        {text:'Event',answer:'Domain Concept'},
        {text:'Venue',answer:'Domain Concept'},
        {text:'SQLConnectionPool',answer:'Software-Solution Detail'},
        {text:'Ticket',answer:'Domain Concept'},
        {text:'ReactComponent',answer:'Software-Solution Detail'},
        {text:'Organizer',answer:'Domain Concept'}
      ], checkLabel:'Check domain boundary',
      feedback:{why:'A domain model represents the problem world, not implementation technologies.',consequence:'Mixing software details into the domain model makes the conceptual model harder to communicate and reuse.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/index.html'
    },
    {
      id:'five-step-process', title:'Rebuild the Modeling Workflow', skill:'Domain Modeling Process', level:'Apply', type:'sequence',
      context:'The team started drawing UML before agreeing on the domain vocabulary.',
      prompt:'Put the five domain-modeling moves in the strongest order.',
      answer:['Collect domain information','Brainstorm candidate concepts','Classify and organize the candidates','Visualize the model with UML','Review and revise the model'],
      feedback:{why:'Topic 07 separates discovery from UML visualization: collect → brainstorm → classify → visualize → review.',consequence:'Drawing too early can cause notation choices to distort the domain analysis.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/five-step-process.html'
    },
    {
      id:'candidate-classes', title:'Discover Candidate Classes', skill:'Class Discovery', level:'Apply', type:'multiselect',
      context:'Stakeholders say: “An organizer creates an event at a venue. Customers make bookings. Each booking may generate tickets for attendees and a payment record.”',
      prompt:'Which noun phrases are strong candidate domain classes?', instruction:'Select all that apply.',
      options:['Organizer','Event','Venue','Customer','Booking','Ticket','Attendee','Payment','creates','may generate'],
      answer:[0,1,2,3,4,5,6,7], checkLabel:'Check candidate classes',
      feedback:{why:'Nouns and noun phrases produce candidates, while verbs usually describe relationships or behavior.',consequence:'Candidate discovery is intentionally broad; later stages decide whether each candidate remains a class or becomes an attribute.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/discovering-classes.html'
    },
    {
      id:'class-or-attribute', title:'Class or Attribute?', skill:'Class vs Attribute', level:'Analyze', type:'classification',
      context:'Not every noun deserves a box in the class diagram. Decide whether each item has independent domain existence or mainly describes another concept.',
      prompt:'Classify each candidate.', categories:['Class','Attribute'],
      items:[
        {text:'Venue',answer:'Class'},
        {text:'venueName',answer:'Attribute'},
        {text:'Event',answer:'Class'},
        {text:'eventDate',answer:'Attribute'},
        {text:'Ticket',answer:'Class'},
        {text:'ticketPrice',answer:'Attribute'},
        {text:'numberOfSeats',answer:'Attribute'}
      ], checkLabel:'Check class/attribute decisions',
      feedback:{why:'Objects/classes have independent conceptual existence; attributes mainly describe or store state about another concept.',consequence:'Promoting simple descriptive values to classes creates noise and weakens the model.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/discovering-classes.html'
    },
    {
      id:'domain-model-notation', title:'Inspect the Class Box', skill:'UML Class Notation', level:'Analyze', type:'choice',
      context:'DRAFT A shows a domain class Event with three compartments: class name, attributes, and operations such as publish(), cancel(), and calculateRevenue().',
      prompt:'What is wrong with this domain model representation?',
      options:['A domain model should show classes, attributes, and relationships but omit operations.','Every domain class must include at least three operations.','Attributes are forbidden in domain models.','Class names should be written as verbs.'], answer:0,
      feedback:{why:'Topic 07 distinguishes a general UML class diagram from a domain-model class diagram; domain models omit operations.',consequence:'Operations move the diagram toward software design instead of conceptual domain understanding.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/class-notation.html'
    },
    {
      id:'association-or-not', title:'Choose the Relationship Meaning', skill:'Association Semantics', level:'Apply', type:'classification',
      context:'The team has found several meaningful relationships among concepts.',
      prompt:'Classify each relationship by its primary semantic type.', categories:['Association','Inheritance / Generalization','Whole-Part Candidate'],
      items:[
        {text:'Organizer manages Event',answer:'Association'},
        {text:'VIPTicket is a Ticket',answer:'Inheritance / Generalization'},
        {text:'Booking contains Ticket',answer:'Whole-Part Candidate'},
        {text:'Event occurs at Venue',answer:'Association'},
        {text:'CorporateOrganizer is an Organizer',answer:'Inheritance / Generalization'}
      ], checkLabel:'Check relationship meaning',
      feedback:{why:'Relationship notation should follow domain meaning: related-to, IS-A, or whole-part.',consequence:'Choosing notation by visual preference rather than semantics produces misleading diagrams.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/association.html'
    },
    {
      id:'inheritance-review', title:'Diagram Review 01 — False Inheritance', skill:'Inheritance', level:'Analyze', type:'choice',
      context:'DRAFT B models Venue as a subclass of Event because every event happens at a venue.',
      prompt:'Which correction is strongest?',
      options:['Replace inheritance with an association such as Event occursAt Venue.','Keep inheritance because related concepts should share a triangle.','Make Event a subclass of Venue instead.','Use composition because every association is whole-part.'], answer:0,
      feedback:{why:'Inheritance requires a true IS-A relationship. An Event is not a Venue and a Venue is not an Event.',consequence:'False inheritance corrupts the conceptual meaning and can later force invalid software designs.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/inheritance.html'
    },
    {
      id:'multiplicity-reading', title:'Read Multiplicity Precisely', skill:'Multiplicity', level:'Apply', type:'matching',
      context:'EventSphere needs precise cardinality constraints.',
      prompt:'Match each multiplicity to its meaning.',
      pairs:[['1','Exactly one'],['0..1','Zero or one'],['*','Zero or more'],['1..*','One or more'],['2..5','From two to five']],
      checkLabel:'Check multiplicity meanings',
      feedback:{why:'Multiplicity constrains how many instances may participate at each association end.',consequence:'Missing or incorrect multiplicity leaves important business rules ambiguous.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/multiplicity.html'
    },
    {
      id:'multiplicity-review', title:'Diagram Review 02 — Wrong Cardinality', skill:'Multiplicity Reasoning', level:'Analyze', type:'choice',
      context:'Business rule: one Booking may generate one or more Tickets, and every Ticket belongs to exactly one Booking. DRAFT C shows Booking 1 — 0..1 Ticket.',
      prompt:'Which multiplicity is correct?',
      options:['Booking 1 — 1..* Ticket','Booking * — * Ticket','Booking 0..1 — 1 Ticket','Booking 1..* — 0 Booking'], answer:0,
      feedback:{why:'The rule says each booking has at least one ticket, while each ticket belongs to one booking.',consequence:'Verbalizing both ends of an association is a reliable way to catch multiplicity errors.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/multiplicity.html'
    },
    {
      id:'aggregation-composition', title:'Aggregation or Composition?', skill:'Whole-Part Relationships', level:'Analyze', type:'classification',
      context:'Evaluate whether the part can conceptually exist independently from the whole in this domain.',
      prompt:'Classify each relationship.', categories:['Association','Aggregation','Composition'],
      items:[
        {text:'Venue hosts Event; both exist independently.',answer:'Association'},
        {text:'Festival groups several Events, but an Event may continue independently of that Festival.',answer:'Aggregation'},
        {text:'Booking owns generated Ticket records; when the Booking is cancelled and removed, those Ticket records have no independent lifecycle in this model.',answer:'Composition'}
      ], checkLabel:'Check whole-part semantics',
      feedback:{why:'Aggregation is a weaker whole-part relation; composition expresses stronger ownership and shared lifecycle.',consequence:'Overusing diamonds makes ordinary associations look stronger than the domain actually requires.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/aggregation-composition.html'
    },
    {
      id:'diamond-side', title:'Diagram Review 03 — Diamond on the Wrong Side', skill:'Aggregation / Composition Notation', level:'Analyze', type:'choice',
      context:'DRAFT D models Booking ◆—— Ticket but places the black diamond beside Ticket.',
      prompt:'Where should the composition diamond be placed?',
      options:['On the Booking side, because Booking is the whole/owner.','On the Ticket side, because Ticket is the part.','At both ends.','Composition never uses a diamond.'], answer:0,
      feedback:{why:'The UML diamond belongs on the whole/aggregate side.',consequence:'Reversing the diamond reverses the meaning of ownership in the diagram.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/aggregation-composition.html'
    },
    {
      id:'bad-domain-model', title:'Diagram Review 04 — Find the Modeling Defects', skill:'Integrated UML Review', level:'Analyze', type:'multiselect',
      context:'DRAFT E contains these choices: Event has operations publish() and cancel(); ticketPrice is modeled as its own class; Venue inherits from Event; Booking—Ticket has no multiplicity; PaymentSQLTable appears as a domain class.',
      prompt:'Which items are defects in a conceptual domain model?', instruction:'Select all that apply.',
      options:['Operations shown in Event','ticketPrice modeled as a class','Venue inherits from Event','Missing multiplicity on Booking—Ticket','PaymentSQLTable modeled as a domain concept','Using Event as a class'], answer:[0,1,2,3,4], checkLabel:'Inspect flawed domain model',
      feedback:{why:'The draft mixes design behavior, weak class discovery, false inheritance, missing constraints, and implementation detail.',consequence:'A strong review checks both UML syntax and whether the diagram still represents the real domain faithfully.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/index.html'
    },
    {
      id:'choose-redesign', title:'Choose the Stronger Redesign', skill:'Domain Model Design', level:'Analyze', type:'choice',
      context:'DESIGN A contains classes Event, Venue, Organizer, Booking, Ticket, Attendee, Payment; attributes stay inside relevant classes; associations are named; multiplicities are stated; VIPTicket generalizes Ticket only if the IS-A rule holds; Booking–Ticket uses composition only when lifecycle ownership is intended. DESIGN B contains EventManager, SQLTable, Screen, buttonColor, and many operations mixed with domain classes.',
      prompt:'Which design is the stronger domain model?',
      options:['DESIGN A, because it models domain concepts and relationships while keeping implementation detail out.','DESIGN B, because more technical classes make a model more complete.','DESIGN B, because operations are mandatory in domain models.','Either; domain modeling and software design are identical activities.'], answer:0,
      feedback:{why:'A domain model is a conceptual representation of the problem world, not an implementation blueprint.',consequence:'Keeping the conceptual model clean makes it easier for stakeholders and developers to validate shared understanding.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/index.html'
    },
    {
      id:'final-review', title:'Final Domain Model Review', skill:'Integrated Domain Modeling', level:'Analyze', type:'multiselect',
      context:'Before approval, perform one last review of the EventSphere domain model.',
      prompt:'Which checks belong in the final review?', instruction:'Select all that apply.',
      options:['Every class represents a meaningful domain concept.','Attributes describe the right classes.','Operations are omitted from the domain model.','Relationships use correct semantic types.','Multiplicity reflects business rules.','Inheritance passes the IS-A test.','Aggregation/composition is used only for genuine whole-part semantics.','Database tables and UI widgets are included as domain classes.'], answer:[0,1,2,3,4,5,6], checkLabel:'Approve domain model',
      feedback:{why:'Final review should validate conceptual correctness, notation, constraints, and relationship semantics together.',consequence:'A reviewed domain model becomes a reliable shared foundation for later design and implementation.'},
      lesson:'../weeks/07-domain-modeling-and-uml-class-diagram/index.html'
    }
  ]
};
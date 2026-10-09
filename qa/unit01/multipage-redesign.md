# Unit 01 multipage redesign

Revision: `20261009-pages1`. Authorized scope: rebuild and publish Unit 01 as focused pages with internal navigation, content-type colors and larger text.

Student sequence: start, professional software, engineering discipline, quality/RoomNow example, process activities, context/challenges, system boundaries, professional responsibility/CampusCare example, foundation workshop, practice questions, independent transfer. Reference/takeaways and an instructor guide are separate supporting pages: 13 pages total.

Academic content was redistributed from the reviewed published revision `20261009-meetings3`. The academic baseline remains Sommerville, Software Engineering 10e, Chapter 1 sections 1.1–1.2 and the previously inventoried study references. No new topic breadth, assessment distribution or schedule change was introduced. Original diagrams, visible caveats, formative worksheet, practice question behavior and local text exports are preserved. Shared course styles and adjacent units are unchanged.

A static Unit 01 sidebar marks the current page; mobile readers can open a topic disclosure. Every page includes course breadcrumbs and previous/next navigation. Semantic content colors have visible labels: theory blue, example purple, exercise amber, questions teal, activity green. Neutral page surfaces keep content legible. Core paragraphs, exercise labels, quiz options and writing fields use 18px text, with larger headings.

Old single-page hash URLs redirect to the owning topic. No-JavaScript navigation remains usable, including static legacy recovery links. Instructor timing and debrief notes are in instructor.html, outside student reading. The prior monolithic audit remains historical; npm test now runs multipage-audit.cjs.

Local validation: 141 checks passed across 13 pages in Chromium 153. Includes six viewport/breakpoint sizes per page, active-page state, heading order, thirteen axe scans with zero violations, keyboard disclosures, both original images, worksheet and exit downloads, quiz reset, legacy redirect and no-JavaScript reading. Static validation checked 363 local references/fragments without missing targets or duplicate IDs. Screenshots were reviewed for desktop professional software and mobile quality/transfer, with the broader set retained outside the repository. External fonts were blocked in the browser test environment. These checks do not certify complete WCAG conformance or educational effectiveness. Published results are recorded separately.

Final typography refinement: workshop phase text and engineering-decision prompt paragraphs explicitly use 18px. A targeted local check at 320px verified the computed font size and absence of horizontal overflow on workshop and professional software pages; see font-refinement.json.

Hosting: GitHub Pages build and deployment succeeded for `b4dbec8ea196e626ef7b0fdea5197c171043ea3b`. The separate, previously failing Educator integrity workflow still reports failure; prior investigation identified its navigation audit as targeting the legacy cpcs351 course. The legacy course and that workflow were not modified in this Unit 01 redesign.

Published verification: 141 checks passed across the 13 live pages with revision `20261009-pages1`, including computed 18px decision/workshop paragraph sizes, footer placement, internal menu navigation, original illustrations, quiz reset, exports, old hash routing and no-JavaScript practice reading. Thirteen published axe scans reported zero violations. Browser: Chromium 153; external fonts were blocked. Full screenshots are retained outside the repository; compact evidence is committed here.

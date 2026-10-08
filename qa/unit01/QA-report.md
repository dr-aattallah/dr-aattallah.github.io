# CPCS351 Unit 01 — implementation and QA report

Audit date: 8 October 2026, Asia/Riyadh. Scope: Unit 01 only.

**NOT READY FOR GOLDEN MASTER APPROVAL.**

## Executive summary

The published baseline has phone overflow, two unavailable illustrations, serious contrast failures, broken Assessment/Resources header destinations, and accessibility/usability friction. The review implementation fixes the confirmed layout, navigation, contrast, keyboard, quiz-feedback and no-JavaScript issues. It preserves the existing academic explanations, examples, question answers, assessment distribution, learning outcomes and schedule.

The final local Playwright run passes **39 of 40 named checks**. The deliberately failing release gate is that both required original illustrations still have zero natural dimensions for anonymous visitors. Accessible textual descriptions now preserve the learning context when the artwork fails. The owner will supply the originals or enable anonymous access; no artwork was generated, replaced or downloaded into the production page.

Four local axe scans—desktop, mobile, answered quiz and instructor mode—report **zero violations** under the selected WCAG 2 A/AA, WCAG 2.1 AA and WCAG 2.2 AA tags. This is evidence of the automated checks, not a WCAG conformance certification. Native browser zoom, real assistive-technology speech, Firefox and WebKit remain verification limitations.

Changes exist on `qa/unit01-accessibility-responsive`, based on `c7bb047bc4e66a6b462a6e450b9934036cb80ccb`. They have not been merged or deployed. Published-site findings and local results are distinct throughout this report.

## Environment, dependencies and deployment

| Item | Evidence |
|---|---|
| Repository | `dr-aattallah/dr-aattallah.github.io`, branch `main` baseline |
| Published target | [Unit 01](https://dr-aattallah.github.io/the-educator/learning/courses/new-cpcs351/units/01/) |
| Local target | `http://127.0.0.1:8765/the-educator/learning/courses/new-cpcs351/units/01/` |
| OS/runtime | macOS, Node.js 24.19.0, Playwright 1.62.1 |
| Browser actually tested | Installed Google Chrome/Chromium 154.0.8037.98, headless |
| Additional engines | Firefox and WebKit launch checks found no installed Playwright executables; not tested |
| Accessibility engine | axe-core 4.10.3; manual DOM, keyboard and screenshot review |
| Build | Static HTML/CSS/JS; Python HTTP server for the local preview |
| Deployment | GitHub Pages API: legacy branch deployment, repository root `/`, branch `main`, status `built` |
| Source dependencies | Shared `assets/css/site.css`, shared `assets/js/navigation.js`, Google Fonts, two Drive thumbnails |
| Added dependencies | Test-only Playwright/axe-core; no production library added |

Repository instructions: no `AGENTS.md` found in the inspected checkout. Existing GitHub workflows largely concern attendance and resource maintenance; GitHub Pages configuration, rather than a guessed build workflow, establishes the publication route.

## Viewport coverage

Full-page screenshots exist for each row before and after. The first five required sizes include the exact desktop/laptop/tablet/mobile/small-mobile requirements. Additional widths and a landscape viewport were also rendered.

| Viewport | Published document width | Local document width | Result |
|---|---:|---:|---|
| 320 × 568 | 494 | 320 | Fixed |
| 375 × 812 | 494 | 375 | Fixed |
| 390 × 844 | 494 | 390 | Fixed |
| 430 × 932 | 494 | 430 | Fixed |
| 768 × 1024 | 768 | 768 | Pass |
| 1024 × 768 | 1024 | 1024 | Pass |
| 1280 × 800 | 1280 | 1280 | Pass |
| 1440 × 900 | 1440 | 1440 | Pass |
| 1920 × 1080 | 1920 | 1920 | Pass |
| 844 × 390 landscape | 844 | 844 | Pass |

Additional local reflow: 640px and 320px viewports model 200% and 400% zoom on a 1280px window. Both final checks pass. A first 640px check found 695px overflow in the takeaway grid; the final responsive grid fixes it. These are viewport equivalents, **not native browser zoom verification**. An attempted CSS-zoom full-page capture exhausted Chromium bitmap allocation; that failed artifact was discarded and is not counted as passing evidence.

## Severity-based findings

| ID | Description | Severity | Location / evidence | Fix | Verification |
|---|---|---|---|---|---|
| U01-01 | Process diagram forces four narrow columns through an inline style and expands phones to 494px | P1 | `#process`; baseline widths and mobile process screenshot | Remove inline grid constraint; scoped four/two/one-column breakpoints with minimum-zero tracks | Pass at all listed widths |
| U01-02 | Assessment and Resources point to nonexistent `assessment.html` and `resources.html` | P0 | Header; initial local HTTP checks returned 404; matching published source | Unit 01 only: Assessment → overview `#assessment`; Resources → syllabus `#downloads` | HTTP 200 and browser fragment checks pass |
| U01-03 | Both required Drive illustrations require sign-in and have `naturalWidth = 0` | P1 | RoomNow/CampusCare figures; baseline image records, final release gate, sign-in endpoint diagnosis | Preserve source artwork references; provide meaningful persistent text descriptions, hide broken image on error | Fallback passes; **original-image release gate fails** |
| U01-04 | Fifteen serious color-contrast nodes | P1 | Quality panels, story labels, engineer comparison, checkpoint and footer; `axe-before.json` | Darken gold/green panels and affected text; use opaque white instructional text | Four final axe scans: zero violations |
| U01-05 | Conflicting `!important` rules keep feedback at 10px; several instructional cards use 8–11px text | P1 | Quiz feedback, story questions, workshop instructions, diagrams | Unit-specific reading sizes and line heights; selected metadata labels enlarged | Rendered section review and quiz checks pass |
| U01-06 | Wrong-answer announcement omits the exact correct choice; visual correctness alone is insufficient for announcement | P1 | Quiz attempt note; Q2–Q5 reasoning does not repeat the full choice | Atomic status message includes result, exact correct answer and original explanation | All five correct/incorrect keyboard tests pass; accessibility tree saved |
| U01-07 | Sticky study strip crosses lesson content and has competing offsets | P2 | Baseline process screenshot | In-flow, wrapping Unit 01 study navigation with 44px link heights | Section headings no longer covered; all anchors resolve |
| U01-08 | JavaScript-disabled questions appear clickable but provide no usable answer path; course header absent | P1 | No-JavaScript page | `noscript` course links and clear offline practice instructions; show explanations, hide inactive choices | Five explanations visible; navigation/main content remain usable |
| U01-09 | Header insertion puts skip link after brand/navigation in keyboard order | P1 | Manual keyboard order | Unit 01 header insertion follows skip link; focusable main target | First Tab reaches skip link; Enter focuses `main` |
| U01-10 | Concept headings jump from h2 to h4 | P2 | Program/professional comparison and definition concepts | Preserve wording, use h3 with equivalent concept styling | One h1; no downward level jumps |
| U01-11 | Storyline disclosure targets measured only 22.5px high | P2 | Storyline summaries at 320px | Scoped 44px minimum disclosure targets | All visible interactive targets meet 24px minimum test |
| U01-12 | Takeaway grid overflows at the additional 640px reflow width | P1 | First 200% equivalent test: 640 → 695px | Two columns at intermediate widths, one on phones | Final 640/320 reflow checks pass |
| U01-13 | Shared navigation labels “Studio” and “Quick Check” obscure the local formative/graded distinction | P2 | Unit study strip | Labels “Foundation Workshop” and “Ungraded Practice”; explicit practice statement | UI clearly separates local practice from Blackboard QC1 |

No page crashes or uncaught page JavaScript errors were observed in the final local suite. Remote image failures remain expected and are documented, not treated as successful resource loads. No unrelated course units were edited. Existing broken header destinations on other pages retain their baseline behavior because the navigation adjustment is conditional on the Unit 01 body class.

## Functional results

Published baseline: a separate six-check run confirms all five quiz questions correctly handle correct and incorrect choices, lock further attempts, reset, support Enter/Space, and produce a final five-correct counter. Improvements are therefore specific to feedback accessibility, semantics, readability and focus rather than a claim that the original quiz was completely broken.

Local final run:

| Feature | Verification |
|---|---|
| Five questions | Each correct choice accepted; each wrong choice reported; original explanations preserved |
| Attempt locking | Guard prevents changing the current answer after activation; `aria-disabled` reflects the locked state |
| Reset | Restores choices/classes/state, hides feedback/reset, returns focus to first choice |
| Counter | Initial 0/5; first correct 1/5 and 1 correct; all correct 5/5 and 5 correct; reset 4/5 and 4 correct |
| Keyboard | Enter and Space activation, resets, all student disclosures |
| Disclosures | All 10 visible student details open/close by keyboard |
| Instructor mode | Both notes hidden normally; both visible and keyboard-expandable with `?instructor=1` |
| Navigation | All internal IDs resolve; browser destinations/fragment targets validated; course overview, syllabus, project, Unit 02 and guide load |
| No JavaScript | Content, course fallback navigation and five explanations available; instructor notes hidden |
| Reduced motion | Computed root scroll behavior becomes `auto` |
| Errors | Zero uncaught JavaScript page errors |
| Images | Forced network failure shows meaningful fallback and hides broken image; original anonymous rendering still fails |

Instructor mode is a display convenience. The notes remain in page source; the query parameter is not authentication or secure access control.

## Accessibility and manual review

Published mobile axe baseline: one violation rule, `color-contrast`, affecting 15 nodes, all serious. Final local desktop, mobile, answered and instructor scans: zero violations for the selected WCAG tags. Detailed JSON includes the incomplete checks and must be read alongside the manual results.

Keyboard review verifies skip navigation, main focus, visible focus outlines, native disclosures, answer selection and resets. The chosen answer remains focusable after activation; further attempts require reset. Each question has a group name tied to its heading. Its atomic status message includes the correct choice and explanation; the counter is also a status region. The answered quiz accessibility tree is included.

Semantic review verifies one h1, logical heading sequence, labeled study/primary navigation, main content and existing alt text. Touch checks at 320px find no visible interactive target smaller than 24px in either dimension; navigation, quiz and disclosure targets generally use 44px minimum heights. Text contrast fixes preserve the red/navy/cream identity.

Manual screenshot inspection covered hero, objectives, teaching map, study route, RoomNow storyline, puzzle, professional software, definition, quality, process, diversity, systems, challenges, ethics, Foundation Workshop, quiz, summary, sources and next-unit navigation. Representative process, quality, hero, workshop and fallback sections were viewed at useful resolution. Full-page images are too tall for comfortable reading and should be examined through the section captures/gallery.

Limitations: no VoiceOver/NVDA speech session was performed; live-region semantics and the browser accessibility tree were checked, but actual announcement timing across assistive technologies needs instructor-side confirmation. Native 200%/400% browser zoom was not completed. Firefox/WebKit were unavailable. No full WCAG conformance claim is made.

## Educational usability and academic integrity

**Student perspective.** Learning Focus clearly communicates explain/distinguish/reason/judge objectives. The delivery map supplies pre-class reading for Meetings 1–2, purposes and exit evidence, while Meeting 3 transfers to QC1/M0. RoomNow maintains continuity from prototype to campus service, risk and defensible decision. Essential concepts, scenarios, reflection prompts and examples remain separate. The workshop supplies roles, phase timings, priority-risk worksheet and success criteria. Practice is explicitly ungraded; Blackboard QC1 remains a separate individual graded assessment. Unit 01 supplies early M0 hypotheses and the next-unit path works.

**Instructor perspective.** Two instructor notes supply misconception prompts, reasoning and debrief targets. The workshop phases total 20–22 minutes (within the advertised 20–25-minute envelope), leaving part of Meeting 3 for systems/ethics and transfer. The three-meeting progression is coherent, but full-page reading in three 50-minute meetings would be unrealistic; the page explicitly asks instructors to select essential in-class discussion and use the remainder for independent study. Actual classroom pacing has not been field-tested.

The [published course syllabus](https://dr-aattallah.github.io/the-educator/learning/courses/new-cpcs351/syllabus.html) and [Instructor Delivery Guide](https://dr-aattallah.github.io/the-educator/learning/courses/new-cpcs351/instructor-guide.html) retain five 2-mark Blackboard quick checks, six formative Studios, QC1 in Week 1, M0 in Week 3 and Studio 1 in Week 2. Unit 01's Foundation Workshop is explicitly separate from the six formal Studios. The guide describes its schedule as proposed and defers actual dates to Blackboard and the approved syllabus; this audit does not certify formal approval.

The four quality attributes, four fundamental activities, system context and responsibility themes agree with the author's [Chapter 1 presentation linked from his book site](https://www.slideshare.net/slideshow/ch1-introduction-42645973/42645973). RoomNow and CampusCare are pedagogical applications of those ideas, not presented as textbook case studies. The cited SWEBOK edition is supported by the [IEEE Computer Society's V4.0a page](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4).

Content preservation check: all **178 original paragraph/list/heading blocks** remain in the modified HTML. Heading tags and presentation change, but academic wording is retained. New text adds practice clarification and image-learning-context descriptions. No outcomes, schedule entries, marks, correct choices or original explanations were changed.

Instructor review flags (not silently edited): clarify whether QC1 is completed asynchronously after Meeting 3, as Unit 01 states, or during the meeting's assessment/debrief slot in the operational guide. Confirm the amount of pre-class reading is realistic. For the AI-data question, clarify that sanitization requires organizational approval and adequate confidentiality protection; the existing “approved/sanitized” wording could be read as permission to self-authorize sanitization. These are review questions, not confirmed changes to approved academic policy.

## Evidence and before/after comparison

- `baseline.json`: published natural image dimensions, console errors, controls and widths.
- `published-functional.json`: existing quiz behavior.
- `axe-before.json`: published contrast nodes.
- `after/results.json`: final 39 passes and one image release-gate failure.
- `after/axe-{desktop,mobile,answered,instructor}.json`: final accessibility results.
- `after/links.json`, `after/network.json`, `after/images.json`, `after/viewports.json`: underlying evidence.
- `after/quiz-accessibility-tree.txt`: browser accessibility tree after answering.
- `content-integrity.json`: preserved original academic blocks.
- `before-WIDTHxHEIGHT.png` and `after/full-WIDTHxHEIGHT.png`: full-page pairs.
- `before-mobile-{hero,process,quiz,workshop}.png`: readable baseline sections.
- `after/section-{390,1440}-*.png`: 20 important sections at each size.
- `after/image-fallback.png`: deliberate network-failure fallback.
- `screenshot-gallery.html`: linked screenshot comparison index.

Before: process cards remain squeezed into four columns, overflow the phone, and sticky navigation intersects the content. After: cards stack clearly; the page stays within the viewport and study navigation is in the document flow. Before: small workshop labels and instructions. After: readable instructions and explicit formative navigation. Before: blank/broken illustration regions. After: meaningful text context and captions, while original artwork access remains unresolved.

## Quality scores

Scores are review judgments from the evidence, not automated grades or academic approval. “Local” evaluates the proposed implementation, including its unresolved image limitation.

| Dimension | Published baseline | Local | Rationale |
|---|---:|---:|---|
| Scientific content integrity | 8.0 | 8.0 | Core concepts match author material; all original blocks retained; instructor flags remain |
| Educational structure | 8.0 | 8.2 | Coherent progression, practice/graded distinction and actionable transfer; pacing unobserved |
| Instructor usability | 7.0 | 8.0 | Notes and workshop evidence usable; real delivery and QC1 timing require review |
| Student usability | 6.0 | 8.0 | Phone reading, practice feedback and fallbacks improve; artwork missing |
| Visual design | 6.5 | 8.0 | Established identity preserved, diagram layout/readability refined; missing artwork |
| Responsive design | 4.5 | 8.5 | 494px phone overflow fixed; tested widths and landscape/reflow pass; no native zoom certification |
| Accessibility | 4.5 | 8.0 | Serious contrast failures fixed, keyboard/semantics improve; actual AT speech and native zoom untested |
| Functional reliability | 7.0 | 8.2 | Quiz baseline works; final interactions pass; remote image gate fails |
| Navigation and integration | 5.0 | 8.5 | Unit 01 header destinations repaired, anchors/related pages verified; shared adjacent behavior unchanged |
| Overall readiness | 5.5 | 7.8 | 39 checks pass but required artwork unavailable; instructor and AT/browser checks remain |

## Modified files and recommendations

Production files:

1. `the-educator/learning/courses/new-cpcs351/units/01/index.html`: unit hooks, semantic headings, accessible no-JS path, descriptions, clarity labels and script extraction.
2. `the-educator/learning/courses/new-cpcs351/units/01/unit01.css`: scoped layout, reading sizes, contrast, focus, fallback and responsive rules.
3. `the-educator/learning/courses/new-cpcs351/units/01/unit01.js`: accessible original-image fallback and practice state/feedback.
4. `the-educator/learning/courses/new-cpcs351/assets/js/navigation.js`: conditional Unit 01 destinations and skip-link order only.

Test/review files: `qa/unit01/audit.cjs`, `package.json`, `README.md`, `.gitignore`, report and selected evidence. Shared `site.css` and Units 02–10 are untouched.

Next steps: review the pull request; supply/publicize the same two original images, then store them locally and rerun the gate; check native zoom and VoiceOver announcements; resolve instructor pacing/assessment wording questions. Only an approved merge/deployment followed by anonymous published-site retesting can establish deployed readiness. This report recommends review of the fixes, **not Golden Master approval**.

## Commit references

Implementation and reproducible tests: [`d5be67a`](https://github.com/dr-aattallah/dr-aattallah.github.io/commit/d5be67ade1735c0df4d3343b46312e0e3fd1144f). A subsequent documentation commit records this report and selected before/after evidence.

## Pull-request screenshot samples

| Section | Published before | Local after |
|---|---|---|
| Hero | [Before](evidence/before-hero.png) | [After](evidence/after-hero.png) |
| Process | [Before](evidence/before-process.png) | [After](evidence/after-process.png) |
| Quiz | [Before](evidence/before-quiz.png) | [After](evidence/after-quiz.png) |
| Workshop | [Before](evidence/before-workshop.png) | [After](evidence/after-workshop.png) |

[Accessible image fallback](evidence/image-fallback.png) · [Final test results](evidence/results.json)

The full screenshot set is in the separately delivered evidence archive.

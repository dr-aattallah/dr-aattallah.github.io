# Unit 01 focused educational revision — 2026-10-09

## Authorized scope

The instructor explicitly directed work on the published version and authorized all review recommendations. This revision incorporates the tested PR #18 accessibility/responsive fixes into main, then improves only Unit 01 and its QA tooling. No Unit 02–10, course-wide CSS, assessment distribution or calendar changes. The official QC1 remains 2 marks in Week 1 and M0 remains due Week 3.

## Educational changes

- One observable learning target connects symptom, hypothesis, stakeholder, response and verification.
- Three 50-minute meeting allocations distinguish essential in-class work, independent reading and exit evidence. The detailed plan and older story overview are optional disclosures, preserving the content.
- A worked RoomNow decision contrasts weak, developing and defensible answers; its observations are explicitly fictional. It includes a transfer attempt and model response.
- Foundation Workshop now has fictional E1/E2/E3 evidence, explicit unknowns, a 22-minute allocation, paired defenses and a sampled instructor debrief.
- Two editable risk worksheets export local TXT notes without submission, network upload or grading.
- Instructor calibration includes an E1 model, alternative priorities and five feedback criteria. Instructor-only display remains presentation filtering, not access control.
- Five practice questions use plausible alternatives and option-specific explanations. Questions connect quality/product, boundaries, process/disciplines, context/constraints and responsibility. Sanitization no longer implies upload authorization.
- Workshop/Practice naming is consistent. The 2-minute exit response is distinct from the longer independent CampusCare transfer task.
- Programming/engineering overlap and selected system-type examples are clarified.

## Original illustrations

The PNGs are unchanged. Both have full-size links opening in a new tab with explicit labels. Nearby text corrects the universal trade-off claim, identifies overlapping acquisition/licensing/hosting dimensions, treats the depicted cloud decision as a hypothesis, clarifies misprinted terms and distinguishes notification channels from receipt evidence. No image generation, replacement or re-encoding.

## Design

Preserved palette, typography and scientific sections. Reduced hero height, made long planning material opt-in, styled worked responses and evidence, provided mobile stacked tables and accessible labelled worksheet fields, and improved illustration captions. Scoped CSS/JS are revision-keyed to avoid stale browser caches.

## Executed local verification

Playwright 1.62.1 / Chromium 153.0.8010.0 / axe-core 4.10.3: 43 checks passed, 0 failed. Four selected-WCAG axe scans: zero violations. Includes ten viewport overflow checks; 640/320px reflow equivalents; all five questions and selected-option feedback; both original renders and full-size popup navigation; worksheet export contents; nested disclosure keyboard use; instructor notes; no-JavaScript reading; links and fragments; forced image failure; and no uncaught JS errors.

Reviewed mobile/desktop screenshots, plus open mobile planning tables, artwork interpretation, worksheet and instructor calibration. Corrected the narrow mobile table-caption layout following visual review.

## Executed published verification

Published product commit: `148df7ee333ea97b35fe22e495c29aefbe9c94c6`. PR #18 is merged. The public page exposes revision `20261009-education1`. Anonymous HTTP responses for HTML, scoped CSS and scoped JS are 200 and their SHA-256 digests match the tested local files exactly.

The final published audit at `https://dr-aattallah.github.io/the-educator/learning/courses/new-cpcs351/units/01/` completed with 43 passed, 0 failed. All four selected-WCAG axe scans have zero violations; seven navigation URLs return 200; all ten tested viewport widths have no horizontal overflow. Required illustrations, full-size popup links, question feedback, worksheet export, nested keyboard disclosures, instructor notes, forced image failures and no-JavaScript reading passed on the published page. Compact evidence is in `evidence/deployed-educational-revision/`.

Verified HTML SHA-256: `7a8ebc1b837c9b74acc8ee2ae3e7a051b031c0298fb0bb2b49d3cfc11c88f3f0`.

Google Fonts endpoints were unreachable in this audit environment and explicitly blocked; the published run therefore exercised the real page’s fallback fonts. Browser TLS verification was skipped only in the test context because the environment proxy intercepts TLS; no product TLS setting was changed. Navigation checks wait for DOM readiness and valid fragments; they do not certify external illustrations on other course pages. A revision gate rejects tests against an older page while deployment propagates.

Reviewed live mobile hero and desktop practice screenshots in addition to the local visual review. Firefox/WebKit, native browser zoom and actual screen-reader speech remain unverified. Browser testing through a TLS-intercepting environment proxy is not certificate/security certification. This is not Golden Master approval or evidence of measured student learning gains.

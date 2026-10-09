# Unit 01 conflict resolution and image verification — 2026-10-09

## Repository state and resolution

Inspected PR #18 head `f5ea8adc0f7f718b6acb2e725324ff4f55267d0e` and current main `eb7c5944a6b6a70544eb84bb6c3d25032880f831`. Main differs from the merge base only in two image references and two PNG files. The PR head referenced local paths but contained no corresponding PNG blobs. Both conflicts are in the quality/ethics section lines.

Merged main into the review branch, retained the PR accessibility/responsive/quiz improvements and both accessible failure descriptions, and selected the canonical filenames already on main. All 178 academic paragraph/list/heading blocks from current main remain present with identical normalized text. No assessment, schedule, Unit 02–10 or shared CSS changes were introduced in this follow-up.

## Original artwork integrity

Downloaded both originals using the university Drive connection and compared their complete bytes with the repository images. Both match exactly:

| Asset | Bytes | SHA-256 |
|---|---:|---|
| RoomNow | 2295148 | c48e56a6528862cc01d819b0d6560b01e8b0332f6bc826aa03e72d7e63e67e5b |
| CampusCare | 2486511 | ee854bee23979ff02d5b77e8cea0a10acf322e4ad06cf9a55d3ddeded98e73fc |

No artwork was generated, redrawn or re-encoded. Both images use course-local relative paths with meaningful alt text.

## Executed validation

Playwright 1.62.1; axe-core 4.10.3; Chromium 153.0.8010.0 (from @sparticuz/chromium 153.0.0). The standard Playwright browser download returned invalid archives; a separately extracted Chromium binary was supplied through CHROME_PATH. This run is independent of the earlier Chromium 154 evidence.

40 passed, 0 failed. Includes both required image renders; ten viewport overflow checks; 640/320px reflow equivalents; all five question correct/incorrect/lock/reset/keyboard/live-feedback tests; navigation and fragments; instructor notes; no-JavaScript fallback; forced image failure; and four axe scans with zero selected WCAG-tag violations. The forced-image failure route was updated from Drive to the canonical local PNG pattern.

Reviewed screenshots of the mobile hero, mobile quality section with RoomNow illustration, and desktop practice section. Compact JSON evidence is in `evidence/follow-up/`; screenshot review was performed on local audit output. Earlier evidence remains unchanged and is historical.

## Remaining review and limits

- Firefox/WebKit, native browser zoom and actual screen-reader speech are unverified.
- The responsive/accessibility improvements are tested locally; they remain undeployed until PR approval and merge.
- Dense illustration text remains small on a phone; a dedicated full-size viewer could improve usability without changing the artwork.
- Instructor review still needs to confirm Week 1 pacing/QC1 release and the approved/sanitized-data wording in Q5. Sanitation alone must not imply permission to send institutional data to public AI services.
- Challenge scheduling differences remain an instructor decision outside this Unit 01 repair; no schedule edits were made.

Provisional critical score: 8.8/10. Functionality and reflow have concrete evidence, but this is not a full independent scientific source audit or Golden Master approval. No P0/P1 failure was found in the executed suite. Final approval remains with the instructor after review and deployed regression testing.

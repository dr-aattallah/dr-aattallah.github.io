# Five stable course spaces

User-authorized course-wide navigation and content reorganisation, 10 October 2026.

Learn (blue): concepts and worked examples. Practice (teal): ungraded independent attempts. Studios (amber): six formative team activities plus separately labelled foundation workshop. Challenges (purple): three individual graded-task preparation briefs. Quick Checks (rose): five preparation pages; assessed attempts remain in Blackboard.

Existing Unit 01 workshop/questions/transfer URLs are intentionally canonical and linked from the corresponding indexes. No duplicate quizzes or worksheets. Legacy Unit 02–10 activity anchors remain as wayfinding blocks. Concept text and worked examples remain in unit pages. Full moved prompts and expected evidence are mapped in migration.json. No grading, dates or released assessment papers changed. Challenge 2/3 and Quick Check pages are preparation guidance, not claims that assessment packages are released.

The course-wide restructuring is explicitly authorized by the user; it supersedes the earlier Unit 01-only correction boundary for this task. This is not Golden Master approval or evidence of measured learning effectiveness.

## Verification

Run from the repository root: `node qa/course-structure/audit.cjs`. Start a static HTTP server on port 8765 in the same execution environment first, or provide `BASE_URL`. Set `CHROME_PATH` only when a Chromium executable is not installed through Playwright. Set `OUTPUT_DIR` for raw results/screenshots. `BLOCK_EXTERNAL_FONTS=1` explicitly uses fallback fonts; the evidence records this limitation. `BROWSER_PROXY` is optional. TLS validation is enabled by default; `PROXY_TLS_INTERCEPTION=1` is only an explicit diagnostic option for an intercepting test proxy, never a production site setting.

The course audit checks 62 pages, source-byte agreement, original paragraph and moved-prompt preservation, six widths (320/390/768/980/981/1440), desktop axe and mobile axe with navigation expanded, heading order, filters, no-JS catalogs, keyboard menu/skip navigation, seven independent attempts, five ungraded quiz questions, legacy Unit 01 routing and both exports. Unit 01's existing regression audit now follows the relocated attempt links instead of expecting independent exercises inside theory pages.

Local results: 763 course-structure checks and 150 Unit 01 regression checks passed. These overlap and are not distinct WCAG criteria. Ten additional axe checks verified the final harmonised Unit 01 palette. All 345 original substantial unit paragraphs were located in the restructured course; none were missing. This is content preservation, not fresh scientific peer review. Fonts were blocked in these local runs. Only Chromium was used; real Safari, browser-native zoom, screen-reader speech and classroom outcomes are not established by this work.

36 new HTML pages provide five course indexes, ten unit-practice pages, seven focused Unit 01 exercise pages, six Studio pages, three Challenge preparation briefs and five Quick Check preparation pages. Existing Unit 01 activity URLs remain canonical. The curriculum, marks, semester timing, source images and graded assessment packages are unchanged.

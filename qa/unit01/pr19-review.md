# PR #19 review and repairs

Starting main: c822eaa; inspected PR head: 9c8670425af02fe4c9cfb63733d8eebb62d54256. The branch was rebased onto current main without changing production files. All PR paths are under qa/unit01/. Inspected evidence contains public font URLs, public image hashes, fixtures and screenshots; no credentials, signed download links, private textbook bytes or raw curriculum documents.

Confirmed: script-relative routes; Playwright default browser unless CHROME_PATH is supplied; Google Fonts and TLS validation enabled by default; complete image download plus decode; nonzero status on failed assertions. Image byte checks compare the full response with original SHA-256 and size. Counts overlap across suites.

Repairs made before merge:

- All three incorrect alternatives are now exercised for every quiz question; missing or empty choice-specific reasoning fails the check.
- Old results are removed at startup, and a fatal run writes completed:false with its failures.
- Fatal-error handlers close the browser. The negative-control run initially exposed a hanging browser; after repair, an intentionally invalid localhost target exits 1 and writes 17 failed requests plus a fatal navigation, rather than retaining the earlier success artifact.
- Results explicitly record completion and TLS validation state.

Positive validation on the unchanged Unit 01: 150 local primary checks pass; 185 published supplemental checks pass, including all fifteen incorrect alternatives. The primary script was invoked from outside qa/unit01 to verify working-directory independence. A negative control was run after seeding an old successful results file; its new result is completed:false and process exit status is 1. These are runner tests, not production failures.

No additional PR merge is authorized by this review. Product corrections belong to the separately authorized Unit 01 repair and deployment work. Academic approval remains with the instructor.

# Unit 01 audit

Run a static server from the repository root:

```sh
python3 -m http.server 8765
```

In another terminal:

```sh
cd qa/unit01
npm install
npx playwright install chromium
npm test
```

Optional environment variables:

- `BASE_URL`: default `http://127.0.0.1:8765`; use the published origin to audit the deployed version.
- `CHROME_PATH`: installed Chromium/Chrome executable instead of Playwright's bundled browser.
- `BROWSER_PROXY`: optional HTTP proxy server for a published-site browser run.
- `PROXY_TLS_INTERCEPTION`: set `1` only when the audit environment’s proxy intercepts TLS; this skips browser certificate validation for that test context and is not a TLS certification.
- `BLOCK_EXTERNAL_FONTS`: set `1` when Google Fonts are unreachable; tests then use the real page’s fallback fonts and do not certify web-font loading.
- `AXE_PATH`: alternate axe-core script path.
- `OUTPUT_DIR`: evidence destination (default `results/`).

The suite exits nonzero if either original illustration fails to render. Accessible descriptions mitigate a loading failure but do not pass the required-image gate. The forced-failure check intercepts the local PNG requests. Historical evidence in `evidence/` describes the earlier audit; consult the follow-up report for the current result.

Firefox and WebKit availability is recorded; the current audit ran in Chromium only. The 200%/400% checks use 640px/320px viewport equivalents of a 1280px window and do not certify native browser zoom or assistive-technology speech output.

No production build step is needed for this static page. GitHub Pages currently publishes the repository root from `main`; creating a review branch does not deploy the changes.

The original illustrations are stored in `assets/images/u01-roomnow-quality-boundary.png` and `assets/images/u01-campuscare-judgment.png` under the course directory. Their bytes match the originals fetched from Drive. Keep meaningful alt text/captions and the failure fallback. Do not substitute generated artwork.

Current educational revision: [report](educational-revision-report.md), [local results](evidence/educational-revision/results.json). Earlier follow-up evidence is retained as history.

Published verification: [43-check results](evidence/deployed-educational-revision/results.json). The suite requires the expected revision marker and rejects a stale page before auditing. Navigation uses DOM readiness so unrelated external image requests do not block link/fragment verification.

## Independent current verification — 9 October 2026

See [final verification](final-verification-20261009.md) for the actual repository state: PR #18 is already merged, both original images are deployed and match the Drive originals byte for byte.

The current multipage suite resolves routes relative to its script, uses Playwright's browser unless `CHROME_PATH` is supplied, and only blocks Google Fonts or bypasses TLS validation when the documented environment flags explicitly request it. It waits for complete image loading and `decode()` before accepting illustration rendering.

Run `npm run test:verify` for additional anonymous byte-integrity checks, ten viewport configurations on all thirteen pages, mobile axe scans, correct/incorrect keyboard quiz paths, counters, and deliberate image-failure fallbacks. This suite defaults to port 8766; set `BASE_URL=http://127.0.0.1:8765` to share the standard local server. Set `BASE_URL=https://dr-aattallah.github.io` for published verification. It compares served Unit 01 bytes to the checked-out source, so intentionally rejects an unmatched or stale deployment.

Final recorded results: 150 local checks, 150 published checks, and 185 supplemental published checks pass. Counts overlap across suites and are not independent WCAG criteria. Native browser zoom, actual screen-reader speech and classroom effectiveness remain unverified; final academic approval belongs to the instructor.

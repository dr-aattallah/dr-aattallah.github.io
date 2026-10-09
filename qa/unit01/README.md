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
- `AXE_PATH`: alternate axe-core script path.
- `OUTPUT_DIR`: evidence destination (default `results/`).

The suite exits nonzero if either original illustration fails to render. Accessible descriptions mitigate a loading failure but do not pass the required-image gate. The forced-failure check intercepts the local PNG requests. Historical evidence in `evidence/` describes the earlier audit; consult the follow-up report for the current result.

Firefox and WebKit availability is recorded; the current audit ran in Chromium only. The 200%/400% checks use 640px/320px viewport equivalents of a 1280px window and do not certify native browser zoom or assistive-technology speech output.

No production build step is needed for this static page. GitHub Pages currently publishes the repository root from `main`; creating a review branch does not deploy the changes.

The original illustrations are stored in `assets/images/u01-roomnow-quality-boundary.png` and `assets/images/u01-campuscare-judgment.png` under the course directory. Their bytes match the originals fetched from Drive. Keep meaningful alt text/captions and the failure fallback. Do not substitute generated artwork.

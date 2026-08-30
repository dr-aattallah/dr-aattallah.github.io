# CPCS 351 — 43-Criteria Educational Design Audit

## Scope
Topics 01–13 and the CPCS351 course home were reviewed as one learning system. The shared `study.css` and `study.js` layer is intentionally used to enforce common UX, accessibility, progress and active-learning behavior across every topic page without destroying topic-specific visual identity.

## Improvements implemented

### 1–17 Content and learning
- Existing topic/page learning objectives and short content chunks are preserved.
- Every study page now receives an opening retrieval **hook** before the content.
- Topic-specific examples, visuals and enrichment already present remain visible and visually separated from core lecture material.
- Every page receives a three-part **active recall** checkpoint: explain, connect and apply.
- Self-feedback explains what a strong answer should contain rather than giving only correct/incorrect status.
- A common-learning-trap prompt explicitly challenges recognition-without-application.
- Page completion supports deliberate progression rather than passive scrolling.
- Existing Topic review/practice pages remain the stronger end-of-topic assessments where available.

### 18–27 UX and navigation
- Persistent topic progress is stored locally in the browser.
- Completed pages are marked in topic navigation.
- Previous/Next/Course Home remain available; Alt+Left/Alt+Right provide keyboard navigation.
- Course Home now includes topic search/findability and course-level progress.
- Floating Find and Back-to-top tools reduce interaction cost.
- No page relies on a dead end: existing lesson navigation remains the exit/next-step mechanism.

### 28–34 Visual design and consistency
- Shared typography, spacing, cards, visual blocks, buttons, progress, feedback and focus states are standardized.
- Topic accent colors remain available through CSS custom properties to avoid visual monotony.
- Readable line length is constrained for prose.
- Interactive elements have hover and visible keyboard-focus states.
- Completion state is communicated with a checkmark and text/ARIA, not color alone.

### 35–43 Technical and accessibility
- Responsive breakpoints support desktop, tablet and mobile.
- Interactive controls use touch-friendly minimum heights.
- A skip link and main-content focus target were added.
- Keyboard focus uses `:focus-visible`; reduced-motion preferences are respected.
- Images receive lazy loading/async decoding and safe fallback alt handling; iframes receive lazy loading and fallback titles.
- External links open safely with `noopener noreferrer`.
- External UML iframes are lazy-loaded to reduce initial-page cost.
- Progress updates provide immediate visible feedback after the action.
- Find failures provide an explicit recovery message.

## Important limits / follow-up QA
- WCAG 2.2 conformance cannot be claimed from code inspection alone. It still requires automated and manual accessibility testing (keyboard-only, screen reader, zoom/reflow, contrast, target size, focus order).
- Core Web Vitals require measurement on the deployed site under real/network-throttled conditions; the code changes reduce likely cost but do not prove LCP/INP/CLS targets.
- Source-specific learning-outcome alignment remains dependent on the lecture/source materials used to build each topic. The shared layer must not invent missing course outcomes.
- External sites may block iframe embedding through their own security headers; pages should retain direct-source links as fallback.

## Design rule for future topics
Every new topic should use the shared study layer and include: measurable learning focus, opening hook, short chunks, examples, a memorable visual, active practice with explanatory feedback, misconception guidance, end review, Previous/Next navigation, and accessible external UML references where UML is involved.

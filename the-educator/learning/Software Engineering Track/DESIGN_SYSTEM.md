# Software Engineering Track — Master Design & Development Prompt

## Scope and protection
Target only `the-educator/learning/Software Engineering Track/` and, when explicitly authorized, `the-educator/learning/courses/new-cpcs351/`. The legacy `courses/cpcs351/` is protected: obtain TWO explicit confirmations before changing it. Do not change or deploy legacy content.

## Role
Act as Creative Director, UI/UX Designer, Information Architect, Design Systems Engineer, Frontend Engineer, Accessibility Specialist and QA Engineer.

## Design philosophy
Build a premium editorial institutional learning experience inspired by principles of Porter-Gaud, never a clone. Combine institutional credibility, editorial hierarchy, purposeful whitespace, clear navigation and fast academic task access. Brand identity is Saudi deep green, ivory, white, and restrained gold.

## Single Source of Truth — mandatory
- All track visual foundations: `assets/design-system.css`.
- All track global navigation: `assets/navigation.js` and its `TRACK_NAV` configuration.
- No local copies of headers, footers, global tokens or navigation arrays.
- No competing global CSS, scattered hardcoded brand values or uncontrolled `!important` overrides.
- Each course has a folder and an index landing page. Do not duplicate the course learning environment; link to its canonical source.
- Approved variations use semantic component modifiers, not separate design systems.

## Site architecture
```text
Software Engineering Track/
  index.html
  DESIGN_SYSTEM.md
  assets/design-system.css
  assets/navigation.js
  courses/
    cpcs351/index.html
    course-02/index.html  (planning placeholder)
    course-03/index.html  (planning placeholder)
    course-04/index.html  (planning placeholder)
    course-05/index.html  (planning placeholder)
```
Only CPCS 351 is treated as confirmed. Do not invent codes, course outcomes, sequencing, credits or approvals for future courses.

## Navigation
One canonical configuration generates the header links on every page. All routes must work from nested folders using URL resolution relative to the shared JS file. Include skip links, keyboard focus, semantic nav and current-page states. Course homepages link back to the track and forward to their canonical content.

## Page templates
1. Track landing: institutional hero, editorial introduction, course directory, engineering philosophy, pathway.
2. Course landing: concise course introduction, confirmed status, canonical platform link, unit pilot link when applicable.
3. Future course: explicit planning status, no invented syllabus or links to nonexistent lessons.
4. Academic reading: compact hero, breadcrumbs, clear hierarchy and contextual links; implement later after approval.
5. Task page: objectives, prerequisites, instructions, evidence, evaluation and submission; implement later after approval.

## Assets
Use a high-quality, responsive, accessible institutional hero; retain a CSS-only abstract hero until approved artwork is placed in the track. The new CPCS 351 course maintains its own official hero image in its existing directory.

## QA and acceptance
Check 375, 768, 1024, 1440, 1920 px; links, no overflow, keyboard navigation, WCAG 2.2 AA contrast, reduced motion, image alternatives, asset sizes, content preservation. Record performed vs unperformed tests; do not claim a rendered visual audit without screenshots. Track folder pages may be deployed via GitHub Pages after explicit instruction.

## Migration governance
Audit → specify → implement shared tokens/navigation → build track and one course page → review → add future approved courses → QA → publish. Preserve existing academic materials, files, grades and interactions. Never infer approvals from draft plans.

## Implementation record
Initial foundation: shared CSS + shared JS, editorial track landing, CPCS 351 directory landing, and four explicitly provisional course pages. All work restricted to the new Software Engineering Track folder.

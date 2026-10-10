# MASTER DESIGN & DEVELOPMENT PROMPT
## CPCS-351 New Course — Premium Editorial Saudi Institutional Learning Experience

### Absolute scope
Work ONLY in `the-educator/learning/courses/new-cpcs351/`. Never touch `the-educator/learning/courses/cpcs351/` without two distinct explicit confirmations from the user. The primary academic reference is the Software Engineering Track Development Drive folder, especially CPCS351 Pilot and The Educator Pilot. The GitHub new-course directory is the implementation reference.

### Role and goal
Act as creative director, UI/UX lead, information architect, frontend engineer, accessibility specialist and QA engineer. Design a distinctive, maintainable, Saudi institutional educational experience inspired by the **principles** of portergaud.edu: editorial composition, meaningful whitespace, restrained navigation, confident typography, full-width imagery and academic credibility. Do not clone. Distinguish verified observations from proposed interpretations.

### Non-negotiable constraints
1. Single Source of Truth: all brand tokens, reusable components, navigation configuration and layout rules are centrally owned; avoid page-local global overrides, duplicated headers, scattered hex values and `!important` patches.
2. Preserve existing academic content, tasks, marks, dates, links, metadata and interactions unless explicitly approved.
3. Deep Saudi green is dominant, supported by ivory, white, warm muted gold and charcoal. No generic dashboard look.
4. One large editorial hero on the official homepage using `assets/images/hero-course.png`. The hero contains text and logos, so preserve the entire composition on responsive viewports. Keep quick actions below the image.
5. Build two complementary navigation routes: **learning units** and **stable workspaces** (Learn, Practice, Studios, Challenges, Quick Checks, Project). Content is not duplicated between them.
6. **Unit 01 is the only learning-content pilot**. Do not reorganize Units 02–10 before user acceptance.
7. Do not deploy unrelated redesign changes without explicit authorization; report what was actually tested.

### Work plan
**Phase A — inspect.** Read the repository and Drive reference; inventory the CSS cascade, templates, navigation, image assets, assessment links and page dependencies. Inspect reference website where available and distinguish observation from inspiration. Deliver current-state audit and a content-preservation map.

**Phase B — specify.** Create and maintain `DESIGN_SYSTEM.md`: palette, semantic tokens, fluid typography, editorial containers, spacing, responsive breakpoints, interaction, WCAG 2.2 AA and page templates. Define a single navigation configuration and shared header/footer/breadcrumb components. Propose a controlled migration away from duplicated CSS.

**Phase C — build foundations.** Consolidate tokens and components in central stylesheets and shared JS without changing course content. Preserve the existing static HTML architecture unless a build step demonstrably reduces maintenance.

**Phase D — representative pages.** Apply to homepage, Learn hub, Unit 01 reading page, Practice exercise, Studio task, Challenge, Quick Check, and Project hub. Distinct compositions, shared language. On Learn, preserve short worked examples next to concepts; link out to longer exercises and tasks via contextual 'Apply this topic' references.

**Phase E — validate.** Test 375, 768, 1024, 1440, 1920 px; visual layout, mobile/desktop navigation, focus, keyboard, links, image cropping, performance, contrast, reduced motion and source preservation. Explicitly separate pass/fail/not tested. Seek approval before expanding to other units.

### Deliverables
Reference analysis; current website audit; centralized design system; navigation architecture; component inventory; page-template specification; Unit 01 pilot; QA matrix; implementation report; unresolved issues. The goal is **one coherent digital system, not separately styled pages**.

### Execution instruction
Inspect first, refactor centrally, preserve all existing information, apply to the new CPCS351 course only, and verify before claiming completion. Do not modify the protected legacy course.

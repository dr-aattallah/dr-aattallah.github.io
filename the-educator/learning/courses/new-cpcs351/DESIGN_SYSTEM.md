# DESIGN_SYSTEM.md — CPCS 351 (NEW COURSE)

## Scope and protection
Applies **only** to `the-educator/learning/courses/new-cpcs351/`. The legacy `cpcs351/` site is protected and requires two separate explicit user confirmations before any change.

## Single Source of Truth (SSOT)
- **Academic content and requirements:** CPCS351 Pilot and The Educator Pilot documents in the Software Engineering Track Development Google Drive.
- **Source code:** this GitHub directory. Never copy assets or styles from the legacy course by assumption.
- **Design tokens and global visual rules:** `assets/css/structure.css` (current canonical CSS entrypoint alongside existing `assets/css/site.css`). **Migration target:** move all tokens into `assets/css/tokens.css`, then import centrally; do not add new page-local overrides.
- **Shared navigation:** `assets/js/navigation.js`; no page-specific copies of the global header, menu or footer.
- **Official hero asset:** `assets/images/hero-course.png`; referenced by `index.html`. Original working asset: `06 - The Educator Pilot / 06b - Site Assets & Visuals / CPCS351-New-Hero.png` on Drive.
- **Pilot scope:** Unit 01. Do not migrate Units 02–10 before validation and approval.

## Visual philosophy
Premium editorial institutional design inspired by high-quality academic websites, not a clone. Saudi deep green anchors the identity; restrained warm ivory, white, muted gold, and readable charcoal provide contrast. The homepage may be immersive; daily study pages must remain focused and scannable. Avoid dashboard-like repeated cards and uncontrolled decorative effects.

## Semantic tokens — target values (proposed)
| Role | Token | Value |
|---|---|---|
| Deep brand | `--color-brand-deep` | `#032b20` |
| Brand primary | `--color-brand` | `#07442f` |
| Brand action | `--color-action` | `#126143` |
| Muted gold | `--color-accent` | `#c5a96a` |
| Canvas | `--color-canvas` | `#f6f4ee` |
| Surface | `--color-surface` | `#ffffff` |
| Ink | `--color-ink` | `#142c23` |
| Secondary text | `--color-muted` | `#51655b` |
| Border | `--color-border` | `#d8e1d9` |

Other tokens: `--font-display`, `--font-body`, `--text-display`, `--text-h1`, `--text-h2`, `--space-section`, `--container-wide`, `--container-reading`, `--focus-ring`, `--motion-standard`. Introduce these centrally during migration, replacing existing aliases rather than stacking `!important` overrides.

## Shared components
Header, desktop/mobile navigation, breadcrumbs, footer, page hero, editorial section, content container, resource/download link, activity brief, related-work links, previous/next. Navigation must derive from a single JS configuration and support active states, keyboard and mobile.

## Page templates
1. **Course landing:** image-led hero, quick actions, learning pathways, project, official resources.
2. **Section landing:** compact heading, orientation, filtered index, contextual links.
3. **Academic reading:** breadcrumbs, focused long-form concepts, adjacent short worked examples, topic-linked practice, previous/next.
4. **Task:** objective, prerequisites, instructions, evidence, deliverables, evaluation, submission.
5. **Resources:** categorised downloads and references.

## Learning IA
Two entry routes to the same source: sequential unit path and stable course-wide Learn / Practice / Studios / Challenges / Quick Checks / Project workspaces. Long independent exercises live in Practice; short worked examples remain adjacent to Learn concepts. Studios, Challenges and Quick Checks have their own indexed tasks and links to precise prerequisite concepts. Avoid duplicate content.

## Hero guidance
The approved banner image includes institutional marks and course title. Render with `width:100%;height:auto` without cropping text or logos; keep semantic alt text. Prefer an image with separate HTML text in future if the user approves a redesign.

## Governance and QA
- Before edits, inventory links, downloads, assessments, content, JS and assets.
- No independent navigation or competing brand palettes; no hardcoded new brand colors in page-local styles.
- Check widths 375, 768, 1024, 1440 and 1920; keyboard, contrast, text readability, responsive hero, broken links, layout shift, and reduced motion.
- Keep Unit 01 as the pilot and record tested/not-tested separately. Preserve all existing content unless the user authorizes edits.
- Document changes and commit only within the new course folder.

## Known technical debt (audit, not yet remediated)
The existing `structure.css` has appended rules, duplicated brand declarations and multiple `!important` overrides; several pages also have inline style blocks. Consolidation requires a separate controlled refactor and visual regression tests, not another override layer. The hero image is now published through the canonical new-course asset path.

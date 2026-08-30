# CPCS 351 — Web Design & Content Consistency Standard

This document defines the consistency rules for The Educator CPCS 351 study experience. The goal is not visual sameness; it is predictable behavior, shared terminology, and a recognizable product identity across Topics 01–13 and future Topics.

## 1. Design System

### Product identity
- Product brand: **The Educator**.
- Course identity: **CPCS 351 · Software Engineering I**.
- Primary UI color: `#2f80ed` (brand blue).
- Secondary brand color: `#69d6ba` (mint).
- Topic colors may be used for learning visuals, diagrams, objectives, and conceptual memory cues, but not to redefine primary interaction behavior.
- All interactive controls use the shared brand-blue interaction language.

### Typography
- Font stack: Inter / system UI / Segoe UI fallback.
- Page title: strongest visual level.
- Section headings: one consistent visual level across all Topics.
- Body text uses a constrained reading measure (about 76 characters) wherever practical.
- UI labels use concise Title Case; explanatory prose uses normal sentence capitalization.

### Spacing & layout
- Shared spacing rhythm: 8, 16, 24, 32, 40, 48, and 64 px.
- Shared control height: minimum 48 px for important clickable/touch targets.
- Main study pages use the same header, sidebar position, content measure, page-navigation pattern, and mobile navigation behavior.
- Topic-specific diagrams may vary in composition, but they remain inside the same visual container system.

### Radius & surfaces
- Small radius: 8 px.
- Controls/navigation: 12 px.
- Cards/content blocks: 16 px.
- Large visual/learning panels: 24 px.

### Iconography
- Use one minimalist line-icon family generated as inline SVG.
- Do not mix decorative emoji, filled cartoon icons, and thin line icons for interface actions.
- Brand mark is the same plus symbol in a blue-to-mint tile throughout the course.

## 2. Interaction Consistency

- The header stays in the same location.
- The sidebar behaves identically on desktop.
- Mobile Topic navigation is always rendered as horizontal lesson chips; Topic-specific `<select>` menus are normalized away.
- Current lesson uses `aria-current="page"` and the same active visual treatment.
- Completed lessons use the same completion state.
- Previous/Next controls are always called **Previous Lesson** and **Next Lesson**.
- The course landing link is always **Course Home**.
- Completion is always **Mark Page Complete** / **Completed**.
- Find and Back-to-Top tools use the same controls and line-icon family.
- Completion feedback updates immediately without reloading the page.

## 3. Content Voice

The Educator voice is:
- academically accurate,
- concise,
- instructional,
- student-facing,
- application-oriented,
- never unnecessarily corporate or conversationally casual.

Pages should explain ideas as engineering decisions: what the concept means, what problem it solves, when it applies, and how it changes a design or testing decision.

## 4. Terminology

Use these forms consistently when applicable:
- **Course Home**
- **Topic**
- **Lesson**
- **Learning Focus**
- **Core Lecture** / **Core Lecture Content**
- **Visual Model**
- **Worked Example**
- **Added Clarification**
- **Added Example**
- **Added Practice**
- **Study Boundary**
- **Remember**

Domain terminology must preserve the terminology of the course source material. Do not rename technical concepts merely for stylistic consistency.

## 5. Formatting Structure

A normal study page follows this recognizable sequence when applicable:
1. Breadcrumb.
2. Topic / Lesson identity.
3. Page title and lead.
4. Topic progress.
5. Opening hook.
6. Learning key / Learning Focus.
7. Core content chunks.
8. Visual or worked example.
9. Remember / key memory cue when it adds real value.
10. Added teaching clarification or practice, clearly separated from source-derived content.
11. Previous Lesson / Course Home / Next Lesson navigation.

Not every page needs every block, but blocks must keep the same name, styling, and purpose when used.

### Prohibited generic end-of-page blocks
- Do **not** automatically add a generic **Active Recall · 2 Minutes / Check your understanding before moving on** block.
- Do **not** automatically add the generic **Self-Feedback: A strong answer...** paragraph associated with that block.
- Do **not** automatically add a generic **Common Learning Trap** block.
- Do **not** add a large content callout labeled **Next Topic** at the end of a page. The persistent Previous/Next navigation is sufficient.
- Topic-specific questions, feedback, misconceptions, or practice are still allowed when they are genuinely tied to the concept and designed as part of that lesson rather than as a repeated template.

## 6. Media Consistency

- UML external references use `uml-diagrams.org` when appropriate, following the established course rule.
- External references use the same framed treatment, border radius, lazy loading, title attribute, and source-link style.
- Images should use meaningful alt text when informative; decorative images use empty alt text.
- Low-quality stock imagery is avoided. Conceptual diagrams and instructional visuals are preferred.
- Topic visual diversity is encouraged only when it improves memory or explanation; UI chrome remains consistent.

### Mandatory visual anchors for enumerations
- **Important enumerations must not be presented as text-only bullets or cards.** When the course introduces types, categories, techniques, roles, phases, models, tracks, or major sections, each important item receives its own memorable **Visual Anchor**.
- A Visual Anchor may be an instructional image, illustration, miniature diagram, symbolic scene, or inline SVG. It must communicate or reinforce the meaning of the item, not merely decorate the card.
- When the original lecture uses imagery to distinguish items, the web version preserves that instructional function even if the artwork is redrawn in the course visual language.
- The anchors within one enumeration should share a coherent illustration style while remaining visually distinct enough for recognition and recall.
- Text labels and explanations remain present; the visual never becomes the only carrier of meaning.
- This requirement applies throughout current and future CPCS 351 Topics, not only to UML content.

## 7. Accessibility & States

- Minimum important touch target: 48 px.
- Strong visible focus state on links, buttons, summaries, inputs, and selects.
- Hover, focus, active, disabled, complete, success, warning, and error states must not rely on color alone when meaning is important.
- Reduced-motion preferences are respected.
- Skip link and keyboard navigation are available.
- Iframes have titles; external links are identified by placement/text and open safely.

## 8. Governance Rule for Future Topics

Future Topics must reuse `study.css`, `study.js`, and `design-system.css`. New Topic-specific CSS should only define educational accent colors or concept-specific diagrams. It must not redefine global navigation, typography, button behavior, spacing rhythm, accessibility states, or shared terminology.

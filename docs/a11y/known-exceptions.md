# Known Accessibility Exceptions & Triage Decisions

This document records accessibility scanner warnings and findings that were investigated and formally accepted as intentional, benign, or false positives, along with their technical rationale.

---

## F1. Color Contrast Enhanced (WCAG AAA Advisory)

- **Rule:** `color-contrast-enhanced` (WCAG AAA SC 1.4.6)
- **Status:** **Accepted Advisory / Non-blocker**
- **Target Standard:** WCAG 2.2 Level AA
- **Review Date:** 2026-11-05
- **Evidence:** Verified across all routes via axe-core automated audit and manual color picker sampling. All body and interactive text meets AA threshold (>= 4.5:1).
- **Details:**
  Automated auditing extensions (such as Axe DevTools or WAVE in strict mode) may flag secondary metadata, subtle borders, and muted keyboard shortcut badges that meet the WCAG 2.2 AA requirement (4.5:1 for regular text, 3:1 for large text/graphical objects) but fall short of the stricter AAA requirement (7:1).
- **Rationale:**
  The platform strictly enforces and guarantees WCAG 2.2 Level AA compliance across all routes and interactive states. WCAG AAA contrast for secondary helper text and borders is an advisory goal where feasible, but strict AAA contrast across muted elements can reduce visual hierarchy for users with certain cognitive or visual conditions.

---

## F2. CodeMirror Scroller Keyboard Focus (`scrollable-region-focusable`)

- **Rule:** `scrollable-region-focusable` (WCAG 2.1.1)
- **Status:** **Accepted Architectural Implementation**
- **Affected Elements:** `.cm-scroller` inside CodeMirror 6 code editor instances (`HTML` and `CSS` panels).
- **Review Date:** 2026-11-05
- **Evidence:** Verified in `tests/editor.test.ts` and `e2e/editor.spec.ts`. Scroller contains inner `.cm-content` with `role="textbox"` and `tabindex="0"`.
- **Details:**
  Axe may flag `.cm-scroller` because the outer `div` has `overflow: scroll` or `auto` without an explicit `tabindex="0"`.
- **Rationale:**
  CodeMirror 6 implements full WAI-ARIA textbox semantics on `.cm-content` with `role="textbox"` and manages internal caret movements, line jumps, scrolling, and keyboard focus via standard keys (arrows, Home/End, PageUp/PageDown). Making the intermediate scroll container `.cm-scroller` also focusable with `tabindex="0"` would introduce an extra, redundant tab stop for keyboard and screen reader users before reaching the actual editable surface, degrading keyboard navigation ergonomics. Keyboard accessibility is fully supported through the editor's inner focusable element and the dedicated Escape-key focus exit pattern.

---

## F3. Accessibility Tree Virtual / Flattened List (`aria-required-children`)

- **Rule:** `aria-required-children` / focus-order heuristic
- **Status:** **Accepted Component Implementation**
- **Affected Elements:** Accessibility Tree inspector panel rows and tree view representation.
- **Review Date:** 2026-11-05
- **Evidence:** Verified in `tests/workbench-keys.test.ts` and `tests/findings-normalize.test.ts`. Focus navigates correctly via arrow keys and Enter/Space activates nodes.
- **Details:**
  Certain linters flag custom roving tabindex implementations or list containers when tree item rows contain composite status badges, tags, or disclosure toggles.
- **Rationale:**
  The playground's tree inspection panel uses explicit accessible names, roving tabindex on interactive item rows, and clear expansion states (`aria-expanded`) to represent parsed DOM and virtual a11y trees without locking screen reader users into rigid, legacy tree widget constraints. All nodes are operable via keyboard and announce their role, name, and hierarchical depth.

---

## F4. Code Editor Horizontal Scrolling (WCAG 1.4.10 Reflow Exception)

- **Rule:** `reflow` (WCAG 2.1 / 2.2 SC 1.4.10)
- **Status:** **Accepted Standard Exception**
- **Affected Elements:** CodeMirror code editor surface (`.cm-editor`, `.cm-scroller`).
- **Review Date:** 2026-11-08
- **Evidence:** Tested at 320px viewport and 400% zoom emulation in `e2e/responsive.spec.ts`.
- **Details:**
  At 320px viewport width or under 400% zoom, code lines may require horizontal scrolling when word wrap is disabled or for long unbroken tokens.
- **Rationale:**
  WCAG 2.2 SC 1.4.10 explicitly exempts parts of the content which require two-dimensional layout for usage or meaning, specifically noting: "Examples of content requiring two-dimensional layout are images, maps, diagrams, video, games, electronic presentations, data tables, and interfaces where it is necessary to keep toolbars in view while manipulating content, and code editor windows where line formatting is essential to code comprehension." Line wrap toggle is also provided in the editor options menu for user preference.

---

## F5. Preview Frame Sandboxed Viewport Simulation (WCAG 1.4.10 Reflow Exception)

- **Rule:** `reflow` (WCAG 2.1 / 2.2 SC 1.4.10)
- **Status:** **Accepted Standard Exception**
- **Affected Elements:** Sandboxed preview iframe and viewport emulation container (`PreviewFrame`).
- **Review Date:** 2026-11-08
- **Evidence:** Tested at narrow pane widths (<320px) and fixed device emulation modes (768px, 1280px) in `e2e/responsive.spec.ts`.
- **Details:**
  When users simulate specific device widths (e.g. 768px tablet, 1280px desktop, or 320px mobile inside a pane narrower than 320px), the preview container allows horizontal scrolling (`overflow-auto`) with a status notification.
- **Rationale:**
  Viewport simulation tools intentionally render simulated fixed canvas viewports inside flexible developer panes to inspect reflow and responsiveness of author content. Under WCAG SC 1.4.10, two-dimensional layout is permitted when essential to the testing and evaluation of fixed canvas renderings.

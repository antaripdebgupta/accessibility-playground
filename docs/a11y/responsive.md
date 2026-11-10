# Responsive Architecture & Accessibility Guide

This document details the responsive design architecture, breakpoint strategy, container query implementations, WCAG SC 1.4.10 reflow exceptions, and the manual QA checklist across viewport sizes.

---

## 1. Breakpoint Strategy

The application combines layout-level media queries with component-level container queries to support viewports from 320px up to 4K displays without loss of information or functionality.

### Viewport Breakpoints

| Breakpoint | Target Devices & Scenarios                                              | Layout Behavior                                                                                        |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `< 400px`  | Ultra-compact mobile (320px–360px, iPhone SE, Galaxy Fold outer screen) | Brand prefix hidden, `.wrap` padding clamped to 14px–20px, single-column grids, dropdown width clamped |
| `< 640px`  | Standard smartphones                                                    | Single-column challenges grid, wrapped hero CTA, single-column contrast test cards                     |
| `< 860px`  | Large smartphones & compact tablets                                     | Single-column comparison & capability grid, single-column checker grid                                 |
| `< 900px`  | Tablets (portrait)                                                      | Responsive mobile disclosure navigation menu in header (`.menu-toggle`)                                |
| `< 1024px` | Small laptops & tablets (landscape)                                     | Workbench switches from 3-pane split layout to tabbed mobile panes (Editor / Preview / Analysis)       |
| `≥ 1024px` | Desktop & large displays                                                | 3-pane split layout (`SplitPane`) with drag handles and collapsible challenge side strip               |

---

## 2. Container Query Components

Components that adapt to their parent pane's width rather than the browser window use CSS Container Queries (`@container`):

1. **`AnalysisTabs` (`src/features/playground/AnalysisTabs.tsx`)**:
   - Uses `@container` on the tab bar wrapper.
   - At `@[30rem]` (~480px pane width), tab triggers display full labels (e.g., "Accessible Name", "A11y Tree", "Focus Order").
   - Below `@[30rem]`, triggers display compact labels (e.g., "Name", "Tree", "Focus") while preserving full accessible names for screen readers via `aria-hidden` and `.sr-only`.
   - The strip strictly preserves a single row with horizontal scrolling (`overflow-x-auto`) and linear gradient mask fade hints.
2. **`ManualTestsPanel` (`src/features/playground/ManualTestsPanel.tsx`)**:
   - Status counters use `grid-cols-2 @[24rem]:grid-cols-4` to prevent cramped metrics at narrow pane sizes (~250px).
3. **`CompareView` (`src/features/playground/CompareView.tsx`)**:
   - Metrics cards use `grid-cols-1 @[20rem]:grid-cols-3` to flow cleanly inside narrow split panes.

---

## 3. WCAG SC 1.4.10 (Reflow) Exceptions

Under WCAG 2.2 Success Criterion 1.4.10 Reflow (Level AA), content must reflow without loss of information or functionality and without requiring scrolling in two dimensions at a width equivalent to 320 CSS pixels, except for parts of the content which require two-dimensional layout for usage or meaning.

Two intentional and standard-compliant exceptions apply to the Accessibility Playground:

1. **Code Editor Surface (`CodeEditor.tsx`)**:
   - Code lines require horizontal scrolling when word wrap is disabled to preserve code indentation and visual structure.
   - Line wrapping can be toggled on/off in the editor options menu.
2. **Sandboxed Preview Viewport Simulator (`PreviewFrame.tsx`)**:
   - When the user selects a fixed simulated viewport (320px, 768px, or 1280px) and the simulator container is narrower than the simulated dimension, the container scrolls horizontally (`overflow-auto`) with a persistent status notification to allow evaluating fixed author content.

Both exceptions are documented in [docs/a11y/known-exceptions.md](file:///home/antarip/workspace/accessibility-playground/docs/a11y/known-exceptions.md).

---

## 4. Manual Accessibility & Responsiveness Checklist

Run this checklist during release verification:

- [ ] **iOS Safari (Mobile WebKit)**:
  - Dynamic address bar / toolbar collapse does not clip bottom workbench controls (`min-h-dvh`).
  - Pinch-to-zoom is enabled and operable up to 200%.
  - Mobile header disclosure navigation opens, traps focus, and closes on Escape.
  - Active challenge collapsible panel opens and displays hints, solution, and reset.
- [ ] **Android Chrome**:
  - Virtual keyboard opening does not displace workbench tabs unexpectedly.
  - Touch targets for all buttons and tabs meet or exceed 24×24px (and 36×36px coarse pointer targets).
- [ ] **200% and 400% Browser Zoom (Desktop)**:
  - At 400% zoom (1280px browser width scaled down to 320px effective viewport), no unhandled horizontal page overflow occurs on any route.
  - All toolbar actions remain reachable via the "More" dropdown menu.
- [ ] **Landscape Smartphone (e.g. 667×375 or 844×390)**:
  - Mobile pane tabs remain pinned and content remains scrollable within the viewport.
- [ ] **Text Spacing Bookmarklet (WCAG 1.4.12)**:
  - Line height = 1.5, spacing below paragraphs = 2, letter spacing = 0.12, word spacing = 0.16.
  - No text overlaps or cuts off across hero headers, cards, or inspector panels.

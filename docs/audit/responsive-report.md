# Responsive & Accessibility Audit Report

This report documents the verification, measurements, remediation, regression testing, and current compliance status across viewports and devices for the Accessibility Playground.

---

## 1. Executive Summary

| Phase      | Scope                         | Status                  | Key Deliverables & Fixes                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ----------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Part A** | Analysis Tabs & Sub-panels    | **Complete & Verified** | Container query labels (`@[30rem]`), scroller wrapper with mask fade hint, single-row tab strip, `scrollIntoView({ inline: "nearest", block: "nearest" })`, full accessible names via `.sr-only`, roving tabindex on `MobilePaneTabs`, adaptive counter grids (`ManualTestsPanel`, `CompareView`), sequential heading hierarchy (`h3`).                                                                                      |
| **Part B** | Whole-App Responsive Pass     | **Complete & Verified** | Dynamic viewport height (`min-h-dvh` on body), mobile collapsible `ChallengeStrip`, Editor Toolbar overflow menu ("Editor settings") for hidden toggles, sandboxed `PreviewFrame` horizontal scroller with simulated width status alert, `SnippetsMenu` and `InspectorSelectedHeader` clamped widths, wrapped `StatusBar` with AA color contrast, responsive `homepage.css` (`min-width: 0`), single-column challenges grid. |
| **Part C** | Regression Suite & Exceptions | **Complete & Verified** | Playwright regression net `e2e/responsive.spec.ts` covering 12 routes × 6 viewports (72 viewport configurations), 200%/400% zoom emulation, mobile feature reachability suite, axe-core automated audit across widths, `docs/a11y/responsive.md`, and SC 1.4.10 reflow exception filings in `docs/a11y/known-exceptions.md`.                                                                                                 |

---

## 2. Measurement Table (Before vs. After)

Measurement script: `e2e/responsive.spec.ts` visiting routes at **320px, 360px, 390px, 768px, 1024px, 1280px** and under **200% / 400% zoom emulation**:

| Route                             | Viewport Width         | Before Status                          | After Status            | Root Cause & Remediation                                                                                        |
| --------------------------------- | ---------------------- | -------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/` (Homepage)                    | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | Fluid `.wrap` padding and responsive capability rows.                                                           |
| `/about`                          | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | Text flow reflows cleanly without horizontal page scroll.                                                       |
| `/challenges`                     | 320px–360px            | Potential card overflow (minmax 340px) | **Pass (0px overflow)** | Updated `.challenges-grid` to `repeat(auto-fill, minmax(min(100%, 300px), 1fr))` and single-column below 640px. |
| `/challenges` (filtered)          | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | Group sections and badges wrap cleanly.                                                                         |
| `/contrast`                       | 320px                  | **Failed (diff = +75px)**              | **Pass (0px overflow)** | Added `min-width: 0` to `.panel` and `.hex-input`, clamped `.wrap` and `.panel` padding at small viewports.     |
| `/contrast`                       | 360px                  | **Failed (diff = +35px)**              | **Pass (0px overflow)** | Same as 320px; `.hex-input` flex shrink enabled with `min-width: 0`.                                            |
| `/contrast`                       | 390px–1280px           | Minor edge clipping                    | **Pass (0px overflow)** | Single-column checker grid below 860px.                                                                         |
| `/learn`                          | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | Responsive article card grid (1 col < 640px).                                                                   |
| `/learn/semantic-html`            | 320px–1280px           | Long inline code overflow              | **Pass (0px overflow)** | Added `overflow-wrap: anywhere` to `code:not(pre code)` and `overflow-x: auto` to `pre`.                        |
| `/learn/aria`                     | 320px–1280px           | Long inline code overflow              | **Pass (0px overflow)** | Code blocks scroll within container without page scroll.                                                        |
| `/playground`                     | 320px–1024px           | Tab wrapping / floating maximize       | **Pass (0px overflow)** | Replaced wrapping `TabsList` with scroller `div` + container query labels. Maximize pinned right.               |
| `/playground?challenge=image-alt` | < 1024px               | Challenge instructions unreachable     | **Pass (0px overflow)** | Added collapsible `ChallengeStrip` accordion above mobile tabs.                                                 |
| `/playground?s=<share>`           | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | Shared snippet decodes safely and renders without layout break.                                                 |
| `/not-found-test` (404)           | 320px–1280px           | No overflow                            | **Pass (0px overflow)** | 404 error page reflows cleanly.                                                                                 |
| All routes @ 200% & 400% zoom     | 320px (effective 400%) | Pass                                   | **Pass (0px overflow)** | Satisfies WCAG 1.4.10 Reflow without 2D scrolling except permitted editors.                                     |

---

## 3. Mobile Feature Reachability Audit (320px Viewport)

All features previously lost or obscured below 1024px were verified keyboard-accessible at 320px:

| Feature                    | Desktop Location               | Mobile Location (≤ 390px)     | Accessible Name                                        | Keyboard Operable               |
| -------------------------- | ------------------------------ | ----------------------------- | ------------------------------------------------------ | ------------------------------- |
| **Start Fresh**            | Inline toolbar button          | Workbench "More actions" menu | `Start Fresh`                                          | Yes (Enter / Space)             |
| **Reset Example**          | Inline toolbar button          | Workbench "More actions" menu | `Reset Example`                                        | Yes (Enter / Space)             |
| **Format Document**        | Inline editor toolbar button   | Inline editor toolbar         | `Format — format document with Prettier`               | Yes (Shift+Alt+F / Tab)         |
| **Tailwind Toggle**        | Inline editor toolbar checkbox | Editor "Editor settings" menu | `Tailwind CSS`                                         | Yes (Menuitem trigger)          |
| **Tab Indents Toggle**     | Inline editor toolbar checkbox | Editor "Editor settings" menu | `Tab indents`                                          | Yes (Menuitem trigger)          |
| **Line Wrap Toggle**       | Editor status bar              | Editor status bar             | `Wrap` / `No Wrap`                                     | Yes (Status indicator & toggle) |
| **Layout Options**         | Inline layout menu dropdown    | Workbench "More actions" menu | `Layout`                                               | Yes (Menuitem trigger)          |
| **Export Report**          | Inline export dropdown         | Workbench "More actions" menu | `Export JSON (.json)`, `Export CSV`, `Export Markdown` | Yes (Menuitem trigger)          |
| **Set/Update Baseline**    | Inline toolbar button          | Workbench "More actions" menu | `Set Baseline` / `Update Baseline`                     | Yes (Menuitem trigger)          |
| **Challenge Instructions** | Fixed right desktop strip      | Collapsible panel above tabs  | `Challenge: <title>`                                   | Yes (Collapsible disclosure)    |

---

## 4. Commands Executed & Verification Matrix

| Command                                         | Purpose                                                    | Result   | Notes                                           |
| ----------------------------------------------- | ---------------------------------------------------------- | -------- | ----------------------------------------------- |
| `npm run check`                                 | ESLint, TypeScript (`tsc --noEmit`), Prettier check        | **PASS** | 0 lint errors, 0 type errors, 100% formatted.   |
| `npm test`                                      | Vitest unit and integration test suite                     | **PASS** | 36 test files passed, 310 tests passed.         |
| `npm run build`                                 | Next.js Turbopack production build & static generation     | **PASS** | All 24 static pages generated cleanly.          |
| `npx playwright test e2e/analysis-tabs.spec.ts` | Part A Analysis tabs behavior & axe suite                  | **PASS** | 8/8 tests passed across Desktop and Mobile.     |
| `npx playwright test e2e/responsive.spec.ts`    | Part B & C Responsive measurement, zoom, reachability, axe | **PASS** | 150/150 tests passed across Desktop and Mobile. |

---

## 5. SC 1.4.10 Reflow Exceptions Filed

Under WCAG 2.2 SC 1.4.10, two intentional exceptions requiring two-dimensional layout were documented in [docs/a11y/known-exceptions.md](file:///home/antarip/workspace/accessibility-playground/docs/a11y/known-exceptions.md):

1. **F4. Code Editor Horizontal Scrolling**: CodeMirror surface (`.cm-editor`, `.cm-scroller`) permits horizontal scrolling when line wrap is disabled to maintain code syntax hierarchy and indentation integrity.
2. **F5. Sandboxed Preview Viewport Simulation**: Preview frame viewport simulator (`PreviewFrame.tsx`) allows horizontal scrolling when simulated widths (320px, 768px, 1280px) exceed the available pane width, displaying a clear status notification.

---

## 6. Noticed, Not Changed

1. **Browser Native Color Picker Popups**: The `<input type="color">` widget in `ColorField.tsx` opens the OS-native color selection dialog. Its appearance and internal focus ring are controlled entirely by the user agent and cannot be restyled via CSS.
2. **Virtual Keyboard Resize on Android**: On Android Chrome, the virtual keyboard opening temporarily reduces `dvh`. The workbench `h-dvh` / `min-h-dvh` adapts automatically without breaking header alignment.

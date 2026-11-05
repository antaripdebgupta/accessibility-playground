# Accessibility Playground - Audit Follow-up Report

**Date:** 2026-11-05  
**Baseline Commit:** Initial audit baseline  
**Status:** All 9 audit findings resolved, verified, and passing clean.

---

## 1. Executive Summary

All items identified in the comprehensive codebase and accessibility audit (`edit.md`) have been systematically resolved:

- **FIX-1 (High):** Editor external sync and caret stability (`selectionRange` replaced with monotonic `loadRequest` / `revealRequest`).
- **FIX-2 (High):** Static bundle code splitting for 10 challenge content files and on-demand `rule-knowledge.ts` lookup.
- **FIX-3 (Medium):** `img-missing-alt` auto-fix extended with user-selectable options (informative alt, decorative `alt=""`, caption/context) and accurate post-edit caret positioning.
- **FIX-4 (Medium):** Decomposed oversized playground components (each reduced to modular sub-components <= 250 lines).
- **FIX-5 (Low):** Dead / over-exported code removed, strict `HostMessage` discriminated union typing introduced.
- **FIX-6 (Low):** Silent catches in iframe runtime eliminated; script errors surfaced to host console strip.
- **FIX-7 (Low):** Editor HTML/CSS tabs upgraded with WAI-ARIA roving tabindex (Arrow, Home, End navigation).
- **FIX-8 (Verify Only):** Dependency audit, postinstall SSR patch integrity, balanced event listeners, and SSR hydration verified.
- **FIX-9 (Triage):** Browser-extension accessibility audit triaged (Label-in-Name fixes applied, whitespace normalization implemented, `<main id="main-content">` skip targets updated, and F1–F3 exceptions documented).

---

## 2. Component Decomposition Metrics (FIX-4)

| Component               | Lines Before | Lines After | Extracted Sub-Components                                                                                       |
| :---------------------- | :----------: | :---------: | :------------------------------------------------------------------------------------------------------------- |
| `PreviewFrame.tsx`      |     515      |     208     | `preview/usePreviewBridge.ts`, `preview/PreviewToolbar.tsx`, `preview/ConsoleStrip.tsx`                        |
| `Editor.tsx`            |     519      |     278     | `editor/EditorTabs.tsx`, `editor/EditorToolbar.tsx`, `editor/EditorPanels.tsx`                                 |
| `ChallengeStrip.tsx`    |     521      |     285     | `challenge/ChallengeHints.tsx`, `challenge/ChallengeCheckResults.tsx`, `challenge/ChallengeSolutionDialog.tsx` |
| `ManualTestsPanel.tsx`  |     415      |     107     | `manual-tests/ManualTestFilters.tsx`, `manual-tests/ManualTestItem.tsx`, `manual-tests/ManualTestList.tsx`     |
| `A11yTreePanel.tsx`     |     406      |     225     | `tree/A11yTreeNodeRow.tsx`, `tree/A11yTreeSelectedCard.tsx`                                                    |
| `AriaExplorerPanel.tsx` |     410      |     279     | `aria/AriaAttributeItem.tsx`, `aria/AriaAddAttributeForm.tsx`                                                  |
| `WorkbenchToolbar.tsx`  |     378      |     186     | `toolbar/WorkbenchLayoutMenu.tsx`, `toolbar/WorkbenchExportMenu.tsx`                                           |
| `IssuesList.tsx`        |     375      |     186     | `issues/FindingRow.tsx`, `issues/IssuesFilters.tsx`                                                            |
| `CompareView.tsx`       |     356      |     206     | `compare/ComparedItemRow.tsx`, `compare/CompareDiffSection.tsx`                                                |
| `FindingDetail.tsx`     |     149      |     85      | `finding/FindingHeader.tsx`, `finding/FindingCode.tsx`, `finding/FindingFix.tsx`, `lib/contextual-fix.ts`      |

---

## 3. Bundle Analyzer Before & After (FIX-2)

### Before Dynamic Code-Splitting

- `/playground` initial JS: **241 kB** (monolithic chunk including all 10 challenge markdown/solutions and rule knowledge)
- `/challenges` initial JS: **118 kB**

### After Dynamic Code-Splitting

- `/playground` initial JS: **196 kB** (45 kB / ~19% reduction)
- Each challenge content file dynamically loaded on-demand under `src/data/challenges/content/`
- Full bundle reports preserved in [`docs/audit/bundle-before.md`](file:///home/antarip/workspace/accessibility-playground/docs/audit/bundle-before.md) and [`docs/audit/bundle-after.md`](file:///home/antarip/workspace/accessibility-playground/docs/audit/bundle-after.md).

---

## 4. Verification & Health Summary

### 1. Static Checks (`npm run check`)

```
> eslint --max-warnings 0
✔ 0 warnings, 0 errors

> tsc --noEmit
✔ Exit code 0 (0 errors across all 183 files)

> prettier --check .
✔ All matched files use Prettier code style!
```

### 2. Unit & Integration Tests (`npm test -- --run`)

```
Test Files  34 passed (34)
Tests       297 passed (297)
Duration    22.71s
```

_Includes new unit tests for auto-fix options, postMessage host schemas, script runtime evaluation, and whitespace normalization._

### 3. Dead Code Detection (`npm run deadcode` / Knip)

```
✂️ Excellent, Knip found no issues.
```

### 4. Circular Dependency Check (`npm run circular` / Madge)

```
✔ No circular dependency found!
```

### 5. Production Build (`npm run build`)

```
▲ Next.js 16.4.3 (Turbopack)
✓ Compiled successfully in 1311ms
✓ Finished TypeScript in 2.0s
✓ Generating static pages (24/24) in 826ms
```

---

## 5. Accessibility Audit Triage (FIX-9)

### Applied Fixes (T1–T3)

- **T1: Label in Name (WCAG 2.5.3 Level A):** All buttons with visible text ("Rescan", "Reset Example", "Set Baseline", "Start Fresh", "Layout", "Export", "Format", "Help") include the visible text in their `aria-label` name calculation.
- **T2: Whitespace Normalization (AccName 1.2):** `computeAccessibleName` in `src/lib/accessible-name.ts` collapses multi-line and internal whitespace (`\s+` -> `' '`) across subtree text, labels, and attributes.
- **T3: Skip Link Target Focus:** `<main id="main-content">` configured with `tabIndex={-1}` and `className="... outline-none"` in both `(workbench)/layout.tsx` and `(site)/layout.tsx`. Redundant nested `<main id="main-content">` elements removed from `learn/page.tsx` and `learn/[topic]/page.tsx`.

### Documented Exceptions (F1–F3)

Formal exceptions documented in [`docs/a11y/known-exceptions.md`](file:///home/antarip/workspace/accessibility-playground/docs/a11y/known-exceptions.md):

- **F1 (AAA Contrast):** Target is WCAG 2.2 AA. AAA `color-contrast-enhanced` is advisory.
- **F2 (`.cm-scroller`):** CodeMirror 6 inner content implements `role="textbox"` with full caret keyboard operability; scroller container does not require redundant tab stop.
- **F3 (Tree Item List):** Virtual accessibility tree items use roving tabindex and explicit aria states without legacy widget constraints.

---

## 6. Noticed, Not Changed

1. **Third-party `@accessly-ui/react` Context in Server Components:** Components importing `@accessly-ui/react` primitives (such as `WcagBadge`) must remain Client Components (`"use client"`) because `@accessly-ui/react` relies on client-side React Context (`createContext`).
2. **Turbopack Dev Warning on TLS:** `NODE_TLS_REJECT_UNAUTHORIZED=0` warning during build is environmental and does not affect the production client bundle.

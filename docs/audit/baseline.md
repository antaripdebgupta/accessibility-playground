# Audit Baseline Report — Accessibility Playground

Date: 2026-11-02
Batch: Batch 0 (Baseline)

## 1. Tooling & Environment Verification

- **Next.js:** 16.4.3 (Turbopack / App Router, React 19.3.0)
- **TypeScript:** Strict mode enabled (`noUncheckedIndexedAccess: true`)
- **Typecheck (`tsc --noEmit`):** 1.85s (0 errors)
- **ESLint (`eslint --max-warnings 0`):** 0 errors, 0 warnings
- **Circular Dependencies (`madge --circular --extensions ts,tsx src`):** 0 circular dependencies detected across 133 source files.
- **Unit & Integration Test Suite (`vitest run`):** 30 test files, 296 tests passed (including new baseline snapshot suite).

## 2. Route & Bundle Baseline

Client bundle sizes generated via Webpack Bundle Analyzer (`npm run analyze`):

- `/` (Home page): **8.5 KB** client chunk (`.next/static/chunks/app/(site)/page-*.js`) — _Currently completely `"use client"` due to inline demo._
- `/about`: **183 B** client chunk
- `/challenges`: **7.0 KB** client chunk
- `/contrast`: **12 KB** client chunk
- `/learn`: **274 B** client chunk
- `/playground`: **5.5 KB** client wrapper chunk (with dynamic imports for workbench panels)

Total Prerendered Static Routes: 24 routes (including 15 `/learn/[topic]` paths).

## 3. Knip Dead Code Analysis (Initial Snapshot)

- **Unused files (2):**
  - `public/axe.min.js` (vendored runtime script used inside iframe template; note: do not delete, used at runtime via `<script src="/axe.min.js">` inside iframe)
  - `src/features/playground/editor/extensions/settings.ts` (dead re-export shim)
- **Unused dependencies (5):**
  - `@accessly-ui/primitives` (verify peer/transitive dep)
  - `@accessly-ui/utils` (verify peer/transitive dep)
  - `@codemirror/lang-javascript` (verify embedded script usage in html)
  - `axe-core` (needed to build/refresh `public/axe.min.js`)
  - `shiki` (check for repo usage)
- **Unused devDependencies (2):**
  - `lint-staged` (used by Husky pre-commit)
  - `madge` (now referenced in `package.json` scripts)
- **Unused exports (24) & types (19):**
  - `readOnlyCompartment`, `setRevealEffect`, `revealDecoration`, `computeEditorStatus`, `MAX_DOCUMENT_BYTES`, `getElementStructuralPath`, `AUTO_FIXABLE_RULE_IDS`, `parseWcagRefs`, `IMPACT_META`, `DEDUP_RULE_MAP`, `IframeRuntimeErrorMessageSchema`, `HostMessageSchema`, `getNodeSnippet`, `SnippetExportSchema`, `MAX_SHARE_URL_ENCODED_LENGTH`, `isShareableLength`, `HostMessage`, `AnalysisState`, etc.

## 4. Snapshot Tests Locked (Batch 0 Safety Gate)

- `tests/baseline-snapshots.test.ts` added and passing:
  1. Findings output for every starter template (19 templates).
  2. Findings output for every challenge (both starter HTML and solution HTML).
  3. Rendered HTML structure and landmarks for the marketing home page (`/`).

## 5. E2E Baseline Status (Pre-existing Failures Noted)

Running `playwright test` revealed 8 pre-existing test issues:

1. **WCAG 2.5.3 (Label in Name) in WorkbenchToolbar:**
   - Buttons have visible text ("Run Scan", "Share") but mismatched `aria-label` ("Run accessibility scan", "Copy shareable permalink") which axe flags under `label-content-name-mismatch`.
2. **Footer Landmark Scope:**
   - `e2e/smoke.spec.ts` asserts `footer` count is 0 on `/about`, but `(site)/layout.tsx` or `/about` renders a footer.
3. **Splitter Keyboard Navigation:**
   - `e2e/splitter.spec.ts` assumes step calculation and expects splitters on mobile (mobile uses tabbed layout where splitters are hidden).
4. **Hydration Spec:**
   - Expects specific "52 lines" text from a previous template version.

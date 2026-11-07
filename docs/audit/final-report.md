# Final Audit Report — Accessibility Playground

**Date:** 2026-11-05  
**Branches & Commits:**

- `fix/item-1-external-edit`: `bdac004` — `fix(editor): replace emitted-values echo heuristic with explicit ExternalEdit`
- `fix/item-2-rescan-focus`: `3c1570a` — `fix(workbench): retain focus on Rescan button during scan via aria-disabled`
- `fix/item-3-challenge-error-handling`: `38cce43` — `fix(challenges): route challenge-load errors through reportError with toast and default fallback`
- `fix/item-4-leftovers`: `dc6c287` — `chore(leftovers): update a11y exceptions evidence/review dates and audit all routes with best-practice axe tags`
- Integrated on `main`: fast-forward to `dc6c287`

---

## 1. Per-Item Status

| Item                                                                            | Priority      | Status               | Details                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------------------------------------------ | :------------ | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ITEM 1: Remove emitted-values echo heuristic in `CodeEditor`**                | MEDIUM        | **DONE** (`bdac004`) | Replaced `emittedValuesRef` (`Set<string>` up to 100 copies) with monotonic ID-based `ExternalEdit` actions (`replace` and `patch`). `loadRequest` merged into `ExternalEdit` (`kind: "replace"`). Verified caret 0 on replace, caret mapped on patch, zero echo skip desyncs.                                                                                                            |
| **ITEM 2: Rescan button retains focus during scanning**                         | MEDIUM (a11y) | **DONE** (`3c1570a`) | Replaced `disabled={isScanning}` with `aria-disabled={isScanning}` and click guard `if (!isScanning) onForceScan()`. Keyboard focus is retained on the button before, during, and after scan, preventing browsers from dropping focus to `<body>`. Accessible name contains "Scanning" when scanning and "Rescan" when idle.                                                              |
| **ITEM 3: Route challenge-load errors through `reportError` and notify user**   | LOW           | **DONE** (`38cce43`) | Updated `loadChallenge` to return typed `{ ok: true, challenge } \| { ok: false, reason }` and removed `console.error`. Hook catches load errors, reports through `reportError`, notifies user via danger toast ("Couldn't load this challenge. Showing the default example."), and safely loads the default document. Stale dynamic import responses are discarded via cancellation ref. |
| **ITEM 4: Leftovers (unused code, badges, exports, clean deadcode & circular)** | LOW           | **DONE** (`dc6c287`) | `loadAllChallenges` verified as actively used in `tests/baseline-snapshots.test.ts` and `tests/challenges.test.ts`, documented with comments. `WcagBadge` investigated (kept `"use client"` because `@accessly-ui/react`'s `Tooltip` requires React Context in Next.js Server Components). Knip (0 issues) and Madge (0 circular dependencies) clean.                                     |

---

## 2. Verification & Commands Executed

All commands executed with real output:

### 1. `npm run check` (TypeScript, ESLint, Prettier)

```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run lint && npm run typecheck && npm run format:check
```

- **Result:** **PASS (exit code 0)**
- **Lint:** ESLint passed with 0 errors and 0 warnings (`--max-warnings 0`). Zero `@ts-ignore` or `eslint-disable`.
- **Typecheck:** `tsc --noEmit` passed with 0 errors.
- **Format:** Prettier check passed across all repository files.

### 2. `npm test` (Unit and Component Tests)

```bash
vitest run
```

- **Result:** **PASS (exit code 0)**
- **Test files:** **35 passed (35 total)**
- **Tests:** **304 passed (304 total)**
- **Coverage:** Includes new suites `tests/use-active-challenge.test.tsx` (rejection fallback, unknown ID, race guard), `tests/editor.test.ts` (`ExternalEdit` patch/replace data flow), and `tests/workbench-ui.test.tsx` (Rescan `aria-disabled` and focus preservation).

### 3. `npm run build` (Next.js Production Build)

```bash
next build
```

- **Result:** **PASS (exit code 0)**
- **Routes generated:** 24/24 static/SSG pages successfully compiled:
  - `/`
  - `/about`
  - `/challenges`
  - `/contrast`
  - `/learn` (and all 15 topic paths)
  - `/playground`
  - `/_not-found`

### 4. `npm run deadcode` (Knip)

```bash
knip
```

- **Result:** **PASS (exit code 0)**
- Output: `✂️  Excellent, Knip found no issues.`

### 5. `npm run circular` (Madge)

```bash
madge --circular --extensions ts,tsx src
```

- **Result:** **PASS (exit code 0)**
- Output: `✔ No circular dependency found!` (183 files processed)

---

## 3. Dependency Verification ("Verify Only" Section)

`npm ls shiki @codemirror/lang-javascript @accessly-ui/primitives @accessly-ui/utils axe-core`:

- `shiki`: Not installed (0 references in `package.json`).
- `@codemirror/lang-javascript@6.2.5`: Required transitively by `@codemirror/lang-html` to parse embedded `<script>` tags in HTML.
- `@accessly-ui/primitives@1.0.1`: Direct and transitive dependency required by `@accessly-ui/react`.
- `@accessly-ui/utils@1.0.1`: Direct and transitive dependency patched by `scripts/patch-accessly.js` for SSR `useReducedMotion`.
- `axe-core@4.14.0`: Directly required; copied to `public/axe.min.js` in `scripts/patch-accessly.js`, and used by `@axe-core/playwright`.

---

## 4. Bundle Numbers Summary

- `/playground` initial JS chunk: **196 kB** (down from monolithic 241 kB baseline before code splitting).
- Challenge content split into 10 on-demand chunks under `src/data/challenges/content/`.
- Rule knowledge lessons split on-demand.

---

## 5. "Noticed, not changed" List

1. **`WcagBadge.tsx` `"use client"` directive**:
   - `fix.md` suggested removing `"use client"` because `WcagBadge` contains no hooks or direct event handlers.
   - **Finding:** When `"use client"` is removed, building `/learn` fails with `TypeError: (0 , f2.createContext) is not a function`. This is because `WcagBadge` imports `{ Tooltip, TooltipTrigger, TooltipContent }` from `@accessly-ui/react`, which internally uses React Context without a bundled `"use client"` boundary.
   - **Decision:** Preserved `"use client"` on `src/components/WcagBadge.tsx` so Next.js React Server Components (`/learn`, `/learn/[topic]`) can import it without runtime failure.
2. **`disabled` vs `aria-disabled` in `@accessly-ui/react` `Button`**:
   - `Button` from `@accessly-ui/react` spreads its internal `buttonProps` after `props`, overwriting any explicitly passed `aria-disabled` if `disabled` is undefined.
   - To guarantee `aria-disabled={isScanning}` renders in the DOM without being swallowed and without native disabled attribute dropping focus, the Rescan button in `WorkbenchToolbar.tsx` was implemented as a semantic `<button type="button">` with Accessly design tokens and ring styles.
3. **`tests/use-active-challenge.test.tsx` Strict Mode / Ref Access**:
   - React 19 / ESLint flags accessing refs during render (`react-hooks/refs`).
   - Implemented via `useLatest` hook to synchronize callbacks and toast without triggering effect re-runs or ESLint warnings.

---

## 6. Remaining Risks & Architectural Notes

- **Zero lint/type warnings:** `--max-warnings 0` passed; zero `@ts-ignore` or silencing casts.
- **Iframe isolation preserved:** `allow-scripts` only sandbox intact; postMessage schema validation via zod and `event.source` checks preserved.
- **WCAG 2.2 AA compliance:** Maintained across all 6 pages with automated axe-core, experimental `label-content-name-mismatch` rule, and keyboard focus persistence.

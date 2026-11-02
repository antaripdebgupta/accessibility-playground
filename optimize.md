# Next.js Codebase Audit & Optimization — Accessibility Playground

> Your generic audit prompt, rewritten for **this** codebase. I read the latest source export (134 files, ≈22,700 lines) and ran an import-graph / usage analysis. The findings in §2 are **verified from the code**, with file names. The AI must still re-verify each one before changing anything (the export has no `package.json`, ESLint/tsconfig, `next.config`, or test files, so dependency and tooling checks must be done in the real repo).
>
> Give the AI **one batch at a time** (§4). After every batch: `npm run check && npm test && npm run build`, review the diff, commit. This is an **npm** project (`package-lock.json`) — never use pnpm/yarn, never create another lockfile.

---

## Safeguards

### Project safeguards (keep these green; do not weaken them)

- **Package manager:** npm only. Use `npm ci` for clean installs, `npm i`/`npm uninstall` for changes. Do not delete or regenerate `package-lock.json` to "fix" things.
- **Quality gate:** `npm run lint` uses `--max-warnings 0` — a single warning fails it. `npm run check` = lint + typecheck + prettier. Husky + lint-staged run on commit (`eslint --fix`, `prettier --write`): **never** bypass with `--no-verify`, never edit `.husky/*` or `lint-staged` to skip checks.
- **`postinstall` runs `scripts/patch-accessly.js`** (patches Accessly UI). Do not remove or edit it; do not upgrade `@accessly-ui/*` as part of this audit; after any `npm install`, confirm the patch still applied (build + a11y e2e).
- **Pinned runtimes:** `next@16.4.3` and `react`/`react-dom@19.3.0` are exact versions. No upgrades, no `^` changes, no downgrades.
- **Config files are off-limits** unless a finding requires it: `tsconfig.json` (keep `strict` and `noUncheckedIndexedAccess`), `eslint.config.*`, `knip.json`, `next.config.*`, `playwright.config.*`, `vitest.config.*`. If you must change one, explain why in the PR and make that a separate commit.
- **Generated/vendored files:** do not hand-edit `public/axe.min.js` or anything under `node_modules`.
- **Git hygiene:** work on a branch (`chore/audit-batch-N`), one batch per PR, no force-push, no history rewriting, never commit `.env*`, secrets or build output.

### AI safeguards (rules for the AI doing this work)

1. **Plan first, then act.** Before each batch, output the exact list of files you will modify/delete and the evidence for each deletion. Do not exceed that list without saying so.
2. **No guessing.** If you cannot verify a claim (unused file, dependency, "this is a leak") by reading code or running a command, say "unverified" and leave it alone. Never invent file names, APIs, flags or package versions — check `package.json` and `node_modules` first.
3. **No destructive shortcuts.** No `rm -rf` outside `.next`/`coverage`, no `git reset --hard`, `git clean -fd`, `git push --force`, no mass search-and-replace across the repo without reviewing the diff, no codemods you have not dry-run.
4. **Never make checks pass by weakening them.** Do not delete or skip failing tests (`it.skip`, `.only`), loosen assertions, update snapshots blindly, raise thresholds, add ESLint ignores, or edit knip's ignore list to hide findings. A failing test means the refactor changed behaviour — fix the code.
5. **One concern per change; stop at the batch boundary.** Do not "also fix" nearby things. Anything extra goes into a "Noticed, not changed" list in the report.
6. **Behaviour-preservation proof.** Any refactor of logic (rules, parsing, merge/normalize, report, storage) needs a test written **before** the change that passes both before and after. Refactors of UI need an e2e or screenshot comparison.
7. **Security stays intact.** Never loosen the iframe `sandbox`, add `allow-same-origin`, relax the `event.source` check or zod schemas, add `dangerouslySetInnerHTML`, `eval`/`new Function`, or widen CSP. Never add network calls, telemetry or new third-party scripts.
8. **Secrets and data.** Do not print, log or commit environment variables or tokens; do not send repository contents to external services.
9. **Ask when ambiguous, or choose the least destructive option.** If two readings of a finding exist, take the one that deletes/changes less, and record the decision.
10. **Report honestly.** Say what was run, what passed, what failed, and what was **not** run. Never claim "all tests pass" or a size improvement without the command output/numbers.

---

## 0. Role and rules

Act as a Senior Frontend Architect, Principal React Engineer and Next.js expert auditing an **existing** Next.js 16 (App Router, Turbopack) / React 19 / strict-TypeScript app. Stack: Accessly UI, Tailwind v4 with CSS-variable tokens, CodeMirror 6, zod, axe-core inside a sandboxed iframe, lucide-react, `next/font`.

Rules (non-negotiable):

1. **Audit before changing.** Read the files named in each finding first.
2. **Verify before deleting.** For every deletion: search for static imports, dynamic imports (`import()`, `next/dynamic`), string references, re-exports, and test usage. Record the evidence in the PR description.
3. **Preserve behaviour and UI.** No visual or functional change unless a finding says so and explains why.
4. **No suppression.** Do not add `any`, `@ts-ignore`, `eslint-disable`, or loosen `tsconfig`/ESLint to make checks pass. (Three `eslint-disable` comments already exist — §2 F-07, F-08 asks you to remove them properly.)
5. **No new dependency** except dev-only analysis tools listed in Batch 0.
6. **No abstraction without a second real use.** Do not wrap things "for later". Do not `map()` over data when only two items exist and they differ structurally.
7. **Small, reviewable commits**, one concern each. Keep the app working after each commit.
8. **Measure.** Capture before/after numbers (bundle size per route, build time, `tsc` time, test count). No claimed improvement without a number.
9. The app teaches accessibility — **it must stay WCAG 2.2 AA itself**. Any refactor of interactive UI must keep roles, names, focus order and keyboard behaviour (run axe + the keyboard e2e tests).

---

## 1. Codebase snapshot (verified)

- **Routes:** `(site)` = `/`, `/about`, `/contrast`, `/learn`, `/learn/[topic]`, `/challenges`; `(workbench)` = `/playground` (chrome-less, `ssr:false` boundary in `PlaygroundClient.tsx`).
- **Size hot-spots (lines):** `PlaygroundView.tsx` 690 · `ChallengeStrip.tsx` 521 · `PreviewFrame.tsx` 515 · `Editor.tsx` 505 · `FindingDetail.tsx` 433 · `ManualTestsPanel.tsx` 415 · `AriaExplorerPanel.tsx` 410 · `A11yTreePanel.tsx` 406 · `WorkbenchToolbar.tsx` 379 · `IssuesList.tsx` 376 · `CompareView.tsx` 357. Data: `rule-knowledge.ts` 1177 · `learn-topics.ts` 1005 · `challenges.ts` 1005 · `wcag.ts` 574.
- **Hook weight:** `CodeEditor.tsx` 13 `useEffect`; `PreviewFrame.tsx` 5 effects / 6 states; `PlaygroundView.tsx` 28 hook declarations (8 `useMemo`, 12 `useCallback`, 5 `useState`).
- **Tests in the export:** none.
- **Already good (see §5 "Do not touch"):** sandboxed iframe with `event.source` check + zod message schemas, `next/font`, no `<img>` in app UI, error boundaries (`PanelBoundary`, `app/error.tsx`, `(workbench)/error.tsx`), lazy-loaded analysis panels.

---

## 2. Findings register

Severity: **Critical** = wrong behaviour/security; **High** = architecture/perf cost that blocks scaling; **Medium** = duplication/maintainability; **Low** = hygiene. (No Critical issues were found by static reading; re-check at runtime.)

### HIGH

**F-01 — `PlaygroundView.tsx` is a 690-line god component.**
It owns layout, document state, scan state, selection, parse, rules, merge, normalize, baseline/compare, challenge mode, report export, toolbar wiring, mobile tabs, status bar and F6 key handling.
_Action:_ split without changing behaviour:

- `usePlaygroundAnalysis(html, css, scanResults)` → `{ ast, instrumentedHtml, parseError, focusOrder, customFindings, findings, violationCount }` (pure derivations, memoised once).
- `useReportExport(...)` (JSON/CSV/Markdown + toasts).
- `useWorkbenchKeys(...)` (F6 / Esc).
- `WorkbenchStatusBar.tsx`, `MobilePaneTabs.tsx` (data-driven from `["editor","preview","analysis"]`).
- Keep `PlaygroundView` as a composition root ≤ 250 lines.
  _Acceptance:_ no behaviour change (e2e green); each extracted unit has a test; no new prop-drilling beyond 2 levels (use a small context only for selection).

**F-02 — Two findings pipelines run on the same inputs.**
`PlaygroundView` computes `mergeFindings(customFindings, axeViolations)` **and** `normalizeFindings(customFindings, axeViolations, axeIncomplete)`. `lib/merge-findings.ts` is a compatibility shim: it re-exports a duplicate `isEquivalentRule` (the real one is in `lib/findings/normalize.ts`, driven by `Rule.equivalentAxeIds`), and keeps a stale `DEDUP_RULE_MAP` that nothing uses and that can disagree with the rule definitions.
_Action:_ make `Finding[]` the single source of truth. Derive the legacy `AxeFinding[]` view (used by the Issues UI/auto-fix) from it, or migrate the consumers and **delete `merge-findings.ts`** and `DEDUP_RULE_MAP`. Keep one `isEquivalentRule`.
_Acceptance:_ same findings output for all 19 templates and all challenges (snapshot test **before** the change, identical **after**); one dedup implementation remains.

**F-03 — Home page is entirely a Client Component.**
`app/(site)/page.tsx` (325 lines) starts with `"use client"` only because of a small "inspector demo" (`useState` for tab, announce value, flash colour, one `useRef`). The whole marketing page ships as client JS.
_Action:_ make `page.tsx` a Server Component; extract the demo to `features/home/InspectorDemo.tsx` (`"use client"`), keep everything else server-rendered. Remove the `eslint-disable jsx-a11y/no-static-element-interactions, click-events-have-key-events` at line ~137 **by fixing the markup** (use a real `<button>` for the fake button, or make it non-interactive).
_Acceptance:_ route JS for `/` drops (record before/after from `next build` output); visual and keyboard behaviour unchanged; axe clean.

**F-04 — Unneeded `"use client"` directives.**
`app/not-found.tsx`, `app/(workbench)/playground/loading.tsx`, `components/WcagBadge.tsx` contain no hooks/event handlers in the exported source I read. (`app/error.tsx` and `(workbench)/error.tsx` **must** stay client — error boundaries.)
_Action:_ remove the directive where Accessly UI components used inside are themselves client-safe from a Server Component (check their package entry for `"use client"`; if not, keep it and note why). `Header.tsx` uses `usePathname` presumably — keep.
_Acceptance:_ build passes with no "hooks in Server Component" errors; HTML output identical.

**F-05 — Large static data may be shipped to the playground client bundle.**
`PlaygroundView` imports `getChallengeById` from `data/challenges.ts` (1005 lines including every challenge's starter **and solution** HTML) even when no `?challenge=` is present; `rule-knowledge.ts` (1177 lines) is imported by `FindingDetail`, which is reachable from the statically imported Issues tab.
_Action:_ measure first with `@next/bundle-analyzer`. If confirmed: split `challenges.ts` into a light index (id, title, difficulty, summary) and per-challenge content loaded via `import()` only when selected; lazy-load `rule-knowledge` (dynamic import inside `FindingDetail` or a `useRuleKnowledge(ruleId)` hook with a small cache). `learn-topics.ts` is only used by server pages — confirm it never leaks into a client chunk.
_Acceptance:_ playground route first-load JS reduced (record numbers); challenge and finding lessons still render with a loading state; no waterfall visible on slow 3G throttling for the common path.

### MEDIUM

**F-06 — Dead and over-exported code (verified by import graph).**

- **Delete (zero references):** `features/playground/editor/extensions/settings.ts` (a re-export shim nothing imports); `readOnlyCompartment` (`compartments.ts`); `computeAnnouncement` (`lib/announcement.ts` — only `computeAnnouncementDetails` is used); `DEDUP_RULE_MAP` (see F-02); `isShareableLength` (`lib/snippet-share.ts`); type `HostMessage` (`postmessage-schema.ts`) and `AnalysisState` (`types/a11y.ts`) if truly unused after your own search.
- **Un-export (used only inside their own file):** e.g. `getNodeSnippet`, `escapeCsvCell`, `computeMinimalDiff`, `computeEditorStatus`, `revealDecoration`, `setRevealEffect`, `AUTO_FIXABLE_RULE_IDS`, `calculateContrastRatio`/`hexToRgb` (careful: the unit tests and the contrast page may need them — grep tests first; if tests use them, keep the export and say so), `MAX_DOCUMENT_BYTES`, `IMPACT_META`.
- **Do NOT delete** Next.js convention exports (`default`, `generateMetadata`, `generateStaticParams`), `*Props` types used by consumers, or anything referenced by tests.
  _Action:_ run **knip** (`npm run deadcode`, already installed) and reconcile its output with this list; also check `package.json` for unused dependencies. From my read of `src/`: **`shiki`** and **`@codemirror/lang-javascript`** have no direct import (the latter may be needed by `lang-html` for embedded `<script>` — check its dependency tree before removing; `shiki` may be used from `scripts/`, `public/` or config — search the whole repo); `@accessly-ui/primitives` and `@accessly-ui/utils` have no direct import but are probably peer/transitive deps of `@accessly-ui/react` — **keep unless proven otherwise**; `axe-core` is needed to produce `public/axe.min.js` (check the script before touching). Remove a dependency only with `npm uninstall <pkg>` after proof, and commit `package.json` + `package-lock.json` together and unused Tailwind tokens/CSS in `homepage.css` and `globals.css` (it is large — check each rule is referenced).
  _Acceptance:_ knip reports zero unused files/exports/dependencies (with a documented `knip.json` for convention files); build and tests pass.

**F-07 — `CodeEditor.tsx`: 13 effects and a `react-hooks/exhaustive-deps` suppression.**
Each setting (font size, tab size, indent unit, wrap, line numbers, autocomplete, read-only, language, label, Tailwind…) has its own `useEffect` that reconfigures a compartment; one effect carries `// eslint-disable-next-line react-hooks/exhaustive-deps`.
_Action:_ introduce `useCompartment(viewRef, compartment, extension)` (one tiny hook, used ≥ 8 times — a justified abstraction), and read volatile callbacks through a `useLatest` ref so no suppression is needed.
_Acceptance:_ zero `eslint-disable` in the file; ≤ 4 effects; editor still reconfigures only the changed compartment (regression test from the editor prompt: 0 full reconfigures while typing).

**F-08 — Other lint suppressions.**
`components/workbench/SplitPane.tsx:141` suppresses `jsx-a11y/no-noninteractive-element-interactions`. A window-splitter must use `role="separator"` + `aria-valuenow/min/max` + `tabIndex=0` + key handlers. Use the correct interactive-role pattern so no suppression is required, or document precisely why the rule is a false positive in the file and in ESLint config scoped to that file.

**F-09 — Inconsistent storage access.**
`lib/storage.ts` is the intended wrapper, but `SplitPane.tsx`, `useWorkbenchLayout.ts` call `localStorage` directly and `useBaseline.ts` calls `sessionStorage` directly with `parsed as BaselineData` (an unchecked cast; every other persisted shape uses zod).
_Action:_ extend `storage` with a session variant and `getJSON(key, schema)`; add a zod schema for `BaselineData`; route all persistence through it; add key versioning for anything you keep.
_Acceptance:_ `grep -rn "localStorage\|sessionStorage" src` shows only `lib/storage.ts`; corrupted storage never throws and falls back cleanly; unit tests for each persisted shape (valid, corrupt JSON, wrong shape, quota error).

**F-10 — Silently swallowed errors.**
`lib/storage.ts` (`catch {}` ×2), `lib/iframe-template.ts` runtime script (`catch (err) {}` ×3 around `scrollIntoView`/`focus`/other).
_Action:_ storage failures → `reportError` in development (and expose a `storage.isAvailable` flag so the UI can say "changes won't be saved" instead of lying); in the iframe script, keep best-effort calls but send a throttled `runtime-error`/diagnostic message for unexpected failures. Do not add `console.*` noise in production.

**F-11 — Duplicated UI patterns.**

- Tab-button markup is hand-written in `app/(site)/page.tsx` (3), `Editor.tsx` (2), `PlaygroundView.tsx` (mobile pane tabs), `ManualTestsPanel.tsx` (4 near-identical buttons). _Action:_ a small `SegmentedTabs` (or reuse Accessly `Tabs`) driven by an array; keep ARIA tab semantics and arrow-key navigation (roving tabindex).
- Severity/impact icon + label mapping repeated in `AriaExplorerPanel`, `IssuesPanel`, `IssuesList`, `FindingStatusBadge`, `FocusOrderPanel`. _Action:_ one `<ImpactBadge impact />` / `<SeverityIcon />` built on `getImpactMeta` (`lib/impact.ts` is already the source of truth); icon + text, never colour-only.
- Repeated long class strings: the "small heading label" class (8 uses in 4 files), icon-button class (3), bordered stat tile (4). _Action:_ extract `components/ui/` primitives (`SectionLabel`, `IconButton`, `StatTile`) — only for strings repeated ≥ 3 times.
  _Acceptance:_ net negative line count; identical rendered HTML apart from class de-duplication (compare with Playwright screenshots on desktop and 390 px).

**F-12 — Oversized feature components.**
`PreviewFrame.tsx` (515: iframe lifecycle + message bridge + toolbar + viewport + simulations + console strip), `ChallengeStrip.tsx` (521), `Editor.tsx` (505: toolbar, tabs, menus, status), `FindingDetail.tsx` (433), `ManualTestsPanel.tsx` (415), `AriaExplorerPanel.tsx` (410), `A11yTreePanel.tsx` (406).
_Action:_ split each by responsibility, **not by size alone**. Examples: `usePreviewBridge` (messages, scan id, focus positions) vs `PreviewToolbar` vs `ConsoleStrip`; `EditorToolbar` vs `EditorTabs`; `FindingDetail` sections as small components fed from `RuleKnowledge`. Target ≤ 250 lines each. Keep message-origin validation (`event.source === iframe.contentWindow`) exactly as is.

### LOW

**F-13 — `key={index}`** (10 sites). Static, never-reordered lists are fine — **leave them**. Fix only where the list can reorder/filter/insert: `ChallengeStrip` (hints/steps if filterable), `CompareView` (diff lines — use a stable composite key such as `${type}:${lineNo}`).

**F-14 — Placeholder text inserted by auto-fix.**
`lib/auto-fix.ts` inserts `alt="TODO: describe this image"` when a caption exists. That passes axe but is a poor accessibility outcome and ships "TODO" into user code. _Action:_ leave the alt empty **and** focus it with a selection range, or insert `alt=""` only when the user confirms the image is decorative; show a warning in the fix preview. Update the rule's knowledge entry and tests.

**F-15 — `console.*` usage** (3 files: `iframe-template`, `postmessage-schema`, `report-error`). Keep only the dev-guarded one in `postmessage-schema`; route the rest through `report-error`.

**F-16 — `"use client"` on pure hook files** (`useDebounce`, `useMediaQuery`, …). Harmless; leave unless a lint rule complains. Don't churn.

**F-17 — Missing tests.** The export contains none. Add the suites described in the testing prompt (unit for `lib/*`, rules, report, compare, storage, snippet-share; Playwright for playground flows, editor, axe on all routes). Coverage target: `lib/**` ≥ 85 % lines, every rule has 4 fixtures.

---

## 3. Mapping to your original audit checklist

1. **Code quality & reusability** → F-02, F-11, F-12 (DRY only where ≥ 2–3 real uses).
2. **Architecture** → F-01, F-02, F-03, F-04; run **madge** (already installed: `npx madge --circular --extensions ts,tsx src`) and report cycles (suspects: `lib/findings/normalize.ts` ↔ `lib/rules/*` ↔ `lib/merge-findings.ts`); enforce layering: `data` and `lib` never import from `features`/`components`; `features` never import from `app`.
3. **Unused/dead code** → F-06, plus unused CSS in `homepage.css` / `globals.css`, unused design tokens, unused icons, unused npm packages.
4. **Error handling & edge cases** → F-09, F-10; also verify: iframe failure recovery (message timeout → show "Preview crashed, Reload" instead of a spinner forever), `scan-error` path, corrupt share link (`?s=` malformed → toast + fall back to the default template, no throw), unknown `?challenge=`/`?pattern=`, `/learn/[unknown]` → `notFound()`, oversize document, storage unavailable (Safari private mode), `navigator.clipboard` denied (already handled for copy-link — check every other call).
5. **Performance** → F-03, F-05, F-07; review the 8 `useMemo`/12 `useCallback` in `PlaygroundView` — remove those that guard cheap work or primitives; keep those that protect AST/rule computation. Profile with React DevTools: typing in the editor must not re-render the Analysis tabs until the 400 ms debounce fires. Check `React.memo` on `AnalysisTabs` actually works (its props include inline functions from the parent — stabilise them or the memo is useless). Check long lists (`IssuesList`, `A11yTreePanel` with ≈5,000 nodes) — virtualise only if measured > 50 ms render.
6. **Scalability & reliability** → race conditions: stale `scanId` results discarded; debounced HTML vs immediate `rawHtml` used inconsistently (parse uses `debouncedHtml`, but `instrumentedHtml` fallback uses `rawHtml` when oversize — confirm no mismatch); listener cleanup (20 `addEventListener` vs 12 `removeEventListener` — **audit every one**; some may be `{ once: true }`/AbortSignal, the rest are leaks); 8 timers — each needs cleanup on unmount.
7. **TypeScript & styling** → no `any` found (good); audit `as` casts (`parsed as BaselineData`, DOM casts), non-null `!`, `Record<string,string>` that should be unions; consolidate Tailwind class duplication (F-11); remove unused tokens; confirm responsive at 390/768/1280 and 400 % zoom.
8. **Maintainability & testing** → F-01, F-12, F-17; naming consistency (`*Panel`, `*Strip`, `*View`); one place per concern (`useSelection` is the only selection owner).
9. **Execution & validation** → §4 and §6.

---

## 4. Execution plan (batches)

**Batch 0 — Baseline (no code changes to the app)**

- `knip` and `madge` are already devDependencies (`npm run deadcode`; `npx madge …`). Add **only** `@next/bundle-analyzer` as a devDependency (`npm i -D @next/bundle-analyzer`, wired behind `ANALYZE=true` in `next.config`) and a script `"analyze": "ANALYZE=true next build"` and `"circular": "madge --circular --extensions ts,tsx src"`. If Next 16's build output does not print per-route sizes, use the analyzer (or `next experimental-analyze` if available in 16.4) to get them.
- Record: `npm run build` output / analyzer report (per-route client JS), `tsc` time, ESLint warnings count, test count, Lighthouse (desktop + mobile) for `/`, `/playground`, `/learn`, `/contrast`.
- Add snapshot tests that lock current behaviour: findings output for every template and challenge (F-02), rendered HTML of `/` (F-03).
- Output: `docs/audit/baseline.md`.

**Batch 1 — Dead code (F-06, F-16 skip, parts of F-15)** · lowest risk, biggest clarity win.
**Batch 2 — Server/client boundaries (F-03, F-04)**.
**Batch 3 — Single findings pipeline (F-02)**.
**Batch 4 — Storage + error handling (F-09, F-10, error-path audit from §3.4)**.
**Batch 5 — `CodeEditor` hygiene + lint suppressions (F-07, F-08)**.
**Batch 6 — Split big components (F-01, F-12)** — one component per commit, e2e green after each.
**Batch 7 — UI primitives & dedupe (F-11, F-13)**.
**Batch 8 — Bundle/perf work (F-05 + §3.5 profiling)**.
**Batch 9 — Tests and docs (F-17, F-14)**.

---

## 5. Do NOT touch (verified good — preserve)

- Sandboxed iframe: `sandbox="allow-scripts"` (no `allow-same-origin`), inbound `event.source` check, zod validation on every message, host→iframe message schemas.
- `ssr:false` boundary in `PlaygroundClient.tsx` (prevents the earlier hydration mismatch) and the guarded storage reads.
- `useSyncExternalStore` usage in `useWorkbenchLayout` and `ContrastChecker`.
- Lazy loading of AriaExplorer / AccessibleName / FocusOrder / Announcement panels and the CodeMirror editor.
- `PanelBoundary` error isolation; `app/error.tsx` and `(workbench)/error.tsx` client directives.
- Rule architecture (`lib/rules/*` with `Rule` objects, `equivalentAxeIds`) and the deterministic structural ids + fingerprints.
- Token-based theming (`var(--color-*)`) and `next/font` setup.

---

## 6. Validation and reporting

After each batch run, in order: `npm run lint` → `npm run typecheck` → `npm run format:check` (or just `npm run check`, which runs all three with a 4 GB heap) → `npm test` → `npm run test:e2e` → `npm run build` → `npm run deadcode` → `npm run circular`. Then manually verify: `/`, `/about`, `/contrast`, `/learn`, `/learn/<topic>`, `/challenges`, `/playground` (type, scroll, select element, open each inspector, export report, challenge mode) at **1280, 768 and 390 px**, keyboard-only, and with 200 % zoom.

Final deliverable (`docs/audit/report.md`):

1. Findings table: ID, severity, status (done / deferred / won't fix + reason), commit.
2. Before/after: First Load JS per route, total lines, number of files, unused exports/files/deps removed, `tsc`/build time.
3. Any behaviour change (there should be none except F-14) with justification.
4. Remaining risks and a prioritised backlog.
5. Updated architecture note (layers, where each concern lives, how to add a rule / challenge / completion source without touching `PlaygroundView`).

**Definition of done:** all High findings closed or explicitly deferred with reasons; zero `eslint-disable`/`@ts-ignore`; one findings pipeline; knip and madge clean; playground and home route JS measurably smaller; no persisted-state access outside `lib/storage.ts`; tests and axe green; no UI regression.

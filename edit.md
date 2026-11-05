# Follow-up Fixes Prompt — Accessibility Playground (after the audit batches)

> Based on a read of the latest source export (145 files) after the audit and editor fixes were applied. Static reading only: nothing here was run. The export excluded test files, so re-check coverage yourself.
> Give the AI **one fix at a time** (FIX-1 … FIX-9). After each: `npm run check && npm test && npm run build`, then `npm run test:e2e` where the fix says so, review the diff, commit.

---

## 0. Safeguards (apply to every fix)

**Project**

- npm only (`package-lock.json`); never pnpm/yarn; never regenerate the lockfile.
- `npm run lint` is `--max-warnings 0`. Do not bypass Husky/lint-staged (`--no-verify`); do not edit `.husky/*` or `lint-staged` config.
- Do not touch `scripts/patch-accessly.js`, the `@accessly-ui/*` versions, `next@16.4.3` or `react`/`react-dom@19.3.0`.
- Do not change `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`), ESLint, knip, Next, Playwright or Vitest config unless a fix says so (separate commit, explain why).
- Work on a branch (`fix/<id>`), one fix per PR, no force-push, no history rewrite, no `.env*` or secrets in commits.

**AI**

1. Before editing, list the exact files you will change and why. Do not exceed the list without saying so.
2. Do not guess. If you cannot verify a claim by reading code or running a command, write "unverified" and leave it.
3. Never make a check pass by weakening it: no `it.skip`/`.only`, no loosened assertions, no blind snapshot updates, no ESLint ignores, no `any`, `@ts-ignore`, or `as` casts to silence types.
4. Write the regression test **first**, watch it fail (when the fix is a bug fix), then make it pass.
5. Keep the iframe security model intact: `sandbox="allow-scripts"` only, `event.source` check, zod validation on inbound messages. No `dangerouslySetInnerHTML`, `eval`, new network calls or third-party scripts.
6. Keep the app WCAG 2.2 AA: roles, names, focus order, keyboard behaviour and visible focus must not regress (run the axe e2e).
7. One concern per commit. Anything extra you notice goes in a "Noticed, not changed" list in your report.
8. Report only what you actually ran, with outputs. Never claim a size or performance gain without numbers.

---

## FIX-1 (HIGH) — Editor value is synced twice; external edits reset the caret

**Where:** `features/playground/CodeEditor.tsx`, `editor/extensions/external-value.ts`, `editor/createEditor.ts`.

**Problem (verified from the code and `@uiw/react-codemirror` 4.25 source):**
`CodeEditor` passes `value={value}` to `<CodeMirror>`. The wrapper has its own effect that replaces the **whole document** whenever `value` differs from the doc. That effect lives in the child component, so it runs **before** the parent's `applyExternalValue` effect. Consequences:

1. Your minimal-diff logic never runs (the doc already equals `value`), so template loads, auto-fix, and ARIA-explorer edits reset the caret/scroll.
2. The wrapper's replace is annotated with _its own_ annotation, not your `isExternalChange`, so the `updateListener` in `createEditor.ts` treats it as a user edit and echoes it through the bus → parent `onChange` → `setRawHtml(sameValue)` → `onDocumentChange` → an unnecessary "scanning" cycle.

**Fix:**

- Make the wrapper's value **constant**: `const [initialValue] = React.useState(value)` and pass `value={initialValue}`. Your own Effect 2 (`applyExternalValue`) becomes the only sync path.
- Keep the stable no-op `onChange` for the wrapper.
- Add a `loadRequest?: { id: number }` prop (or reuse the existing parent signal) so template/snippet/challenge loads call `applyExternalValue(view, value, { isFullReplace: true })` (caret to 0, scroll to top, one undo step), while ordinary external edits (auto-fix, ARIA edits) use the minimal diff. Today nothing passes `isFullReplace`.
- Ensure every external transaction carries `isExternalChange` so it never echoes.
- Do not re-introduce `value`/`onChange` identity churn (the wrapper reconfigures on `onChange` identity changes).

**Tests (write first):**

- Unit (real `EditorView`): `applyExternalValue` keeps and maps the caret for a change before, inside, and after it; `isFullReplace` sets caret 0; neither fires the `docChange` bus event.
- Playwright: type a document, put the caret mid-document, apply an ARIA attribute edit from the ARIA Explorer → caret position unchanged (±mapped), no extra "Scanning…" flash; load a template → caret at 0, scroll top, Ctrl+Z restores the previous document; typing 200 chars quickly → exact text, no echo, no reconfigure.

**Done when:** all of the above pass and the wrapper never performs a full replace after mount.

---

## FIX-2 (HIGH) — Large static data still ships in the playground client bundle

**Where:** `features/playground/hooks/useActiveChallenge.ts` (imports `getChallengeById` from `data/challenges.ts`, 1,005 lines including every starter and solution); `features/playground/FindingDetail.tsx` (statically imports `data/rule-knowledge.ts`, 1,176 lines).

**Step 1 — measure.** `npm i -D @next/bundle-analyzer`; wire it in `next.config` behind `ANALYZE=true`; add script `"analyze": "ANALYZE=true next build"`. Record the `/playground` client JS and the chunks containing `challenges`/`rule-knowledge`. Save to `docs/audit/bundle-before.md`.

**Step 2 — challenges.**

- Split into `data/challenges/index.ts` (light metadata used by `/challenges`: id, title, difficulty, summary, objectives count…) and one content module per challenge (`startHtml/Css`, `hints`, `solutionHtml/Css`, `verify`, `manualSteps`).
- `loadChallenge(id): Promise<Challenge | null>` using a static map of `() => import("./content/<id>")` entries (so bundlers can split; no dynamic template strings).
- `useActiveChallenge` loads on demand and exposes `status: "idle" | "loading" | "ready" | "error"`; unknown id → toast + default template; never throw.
- Keep the build-time challenge validity test (starter triggers expected rules; solution removes them) working against the new structure.

**Step 3 — rule knowledge.**

- Move the lesson body of `FindingDetail` into `RuleLesson.tsx` and load it with `next/dynamic` (`ssr:false`, small skeleton). Only the lesson body needs `rule-knowledge`; the finding header, status and "Open in inspector" stay immediate.
- Keep graceful fallback ("No detailed lesson yet") for unknown ids.

**Step 4 — measure again** and save `docs/audit/bundle-after.md`.

**Tests:** challenge loads and renders hints/solution; unknown `?challenge=` falls back cleanly; `FindingDetail` shows the skeleton then the lesson; Playwright with slow network throttling: the editor and preview are interactive before the lesson loads.

**Done when:** the playground initial chunk no longer contains challenge solutions or rule lessons (show analyzer evidence) and behaviour is unchanged.

---

## FIX-3 (MEDIUM) — Auto-fix for missing `alt` can make informative images invisible

**Where:** `lib/auto-fix.ts` (`computeFixPreview` and `applyAutoFixToHtml`, case `img-missing-alt`), `data/rule-knowledge.ts` entry for `img-missing-alt`, `FindingDetail.tsx` fix preview.

**Problem:** the fix inserts `alt="TODO: describe this image"` when a caption is nearby and `alt=""` otherwise. A literal "TODO" passes axe but is wrong content shipped into the user's code; `alt=""` silently declares the image **decorative**, which is wrong for most images.

**Fix:**

- Default action: insert `alt=""` **only if** the user explicitly picks "Mark as decorative" in the fix preview (add a two-option control: _Decorative image_ / _Informative image_).
- _Informative image:_ insert `alt=""` with the **caret placed between the quotes** and the editor focused (use `revealRange` + a selection dispatch triggered by the explicit user action), plus a preview note "Describe what the image shows and why it's there."
- If the nearby caption already describes the image (`<figcaption>`/`aria-labelledby`), offer "Use caption" → `alt=""` is acceptable only when the caption conveys the same info; explain in the preview.
- Never write the string `TODO` into user code. Update the rule's knowledge entry and the unit tests.

**Tests:** preview for each option; apply decorative → `alt=""`, apply informative → caret inside quotes; the string "TODO" never appears in any output; auto-fix of images with `aria-labelledby` unchanged.

---

## FIX-4 (MEDIUM) — Split the remaining oversized components

Split by **responsibility**, not by line count. Keep behaviour identical; one component per commit; e2e green after each.

| Component (lines)                                                             | Split into                                                                                                                                                                               |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PreviewFrame.tsx` (515)                                                      | `usePreviewBridge` (messages, scan id, focus positions, stale-result guard, origin/source checks **unchanged**), `PreviewToolbar`, `ConsoleStrip`, `PreviewFrame` (iframe + composition) |
| `Editor.tsx` (503)                                                            | `EditorToolbar`, `EditorTabs` (HTML/CSS tablist with roving tabindex), `EditorPanels`, `Editor` (composition)                                                                            |
| `ChallengeStrip.tsx` (521)                                                    | `ChallengeHints`, `ChallengeCheckResults`, `ChallengeSolutionDialog`, `ChallengeStrip`                                                                                                   |
| `FindingDetail.tsx` (433)                                                     | small section components (`FindingHeader`, `FindingCode`, `FindingFix`, `FindingVerify`) + `RuleLesson` (FIX-2)                                                                          |
| `ManualTestsPanel.tsx` (415)                                                  | `ManualTestList`, `ManualTestItem`, `ManualTestFilters`; render the four filter tabs from an array                                                                                       |
| `AriaExplorerPanel.tsx` (410), `A11yTreePanel.tsx` (406)                      | row/detail subcomponents + a `useTreeKeyboardNavigation` hook if duplicated                                                                                                              |
| `WorkbenchToolbar.tsx` (379), `IssuesList.tsx` (376), `CompareView.tsx` (357) | extract only repeated sub-blocks; stop at ≤ ~250 lines each                                                                                                                              |

Rules: no new prop-drilling beyond two levels; no abstraction used once; memoise only where profiling shows a re-render problem (check `React.memo` on `AnalysisTabs` still works — its props must be stable). Preserve ARIA tab semantics (arrow keys, `aria-selected`, `aria-controls`) when extracting tabs.

**Tests:** existing e2e + axe unchanged; a screenshot comparison at 1280/768/390 px before/after each split; component tests for the new hooks.

---

## FIX-5 (LOW) — Dead and over-exported code

- **Delete if still unreferenced** (verify with knip and a repo-wide search incl. tests): `computeAnnouncement` in `lib/announcement.ts` (only `computeAnnouncementDetails` is used); `HostSelectNodeMessageSchema`, `HostRunScanMessageSchema`, `HostFocusElementMessageSchema` in `lib/postmessage-schema.ts` — or **use** them: type the host→iframe `postMessage` calls in `PreviewFrame` with `HostMessage` (preferred, it adds compile-time safety for free).
- **Remove the deprecated `selectionRange` prop** from `CodeEditor.tsx` and from `Editor.tsx` (and the Effect-3 branch that uses it). Only `revealRequest` remains.
- **Un-export** symbols used only inside their own file (≈39; `npm run deadcode` lists them). If a unit test imports one, keep the export and note why.
- **Remove `"use client"`** from `components/WcagBadge.tsx` (no hooks/handlers). Keep it on `app/(workbench)/playground/loading.tsx` unless Accessly's `Skeleton` is confirmed Server-Component-safe (check the package entry for `"use client"`).
- `hooks/useSelection.ts` (112) and `features/playground/hooks/usePlaygroundSelection.ts` (129), `hooks/useChallengeMode.ts` and `useActiveChallenge.ts`: confirm each layer has a distinct responsibility (selection state vs. reveal/caret/fix wiring; progress vs. loading). If one only forwards to the other, merge; otherwise add a one-line header comment on each explaining the split.

**Done when:** `npm run deadcode` and `npx madge --circular --extensions ts,tsx src` are clean, with no knip ignore-list edits.

---

## FIX-6 (LOW) — Silent catches in the iframe runtime

**Where:** `lib/iframe-template.ts` (two empty `catch` blocks: `sendParent` and the focus/scroll helper).

- `sendParent`: keep best-effort, but add a comment stating the parent may be gone during teardown.
- The other: report unexpected errors through the existing throttled `reportIframeError` instead of swallowing.
- No new `console.*` in production paths.

**Test:** unit test that the generated script string parses (`new Function` **only in the test**, never in app code) and contains no empty `catch`.

---

## FIX-7 (LOW) — `Editor.tsx` load semantics and a11y of the editor tabs

- Template/snippet/challenge/“Start fresh” → full replace (FIX-1). Auto-fix/ARIA edits → minimal diff.
- After a full replace announce "Template loaded: <name>" in a polite live region (not per keystroke).
- Verify the HTML/CSS tabs use roving tabindex with Arrow/Home/End, `aria-controls` ↔ panel ids, and that the inert inactive panel keeps its scroll, caret and undo history when switched back (e2e).

---

## FIX-8 (VERIFY ONLY) — Items the static read could not confirm

Run these and report results; fix only if they fail.

1. `npm ls shiki @codemirror/lang-javascript @accessly-ui/primitives @accessly-ui/utils axe-core` and a repo-wide search (including `scripts/`, `public/`, configs). **Remove a dependency only with proof** (`shiki` and `@codemirror/lang-javascript` have no direct import in `src/`; the latter may be needed by `lang-html` for embedded `<script>`). Commit `package.json` + `package-lock.json` together.
2. Confirm `postinstall` (`patch-accessly.js`) still applies after any `npm install` (build + axe e2e).
3. Confirm listener balance: every `addEventListener` has a matching removal or `{ once: true }`/`AbortSignal`; every `setTimeout`/`setInterval` is cleared on unmount.
4. Confirm `usePlaygroundDocument` still reads `window`/storage only behind the `ssr:false` boundary and that the hydration regression e2e exists.
5. Confirm tests exist for `lib/**` (rules: 4 fixtures each; report exporters; compare; storage; snippet-share), the editor behaviours (caret stability, scroll, tab switch), and axe on `/`, `/about`, `/contrast`, `/learn`, `/challenges`, `/playground`.

---

## FIX-9 — Browser-extension a11y report: triage (real issues vs false positives)

**Source:** an a11y browser-extension export for `http://localhost:3000/playground` (axe-core 4.13.0 in the extension; 7 rules, 82 nodes; plus 2 "needs review" rules). The screenshot shows the extension's orange `AAA · n.nn` overlay badges; those badges are **injected by the extension**, not part of the app.

**How to read this report (important):**

- The extension's **score "68 / C"** is not a conformance measure. This project deliberately has no accessibility score; ignore it.
- Several rules are **not axe-core rules**; they are the extension's own heuristics (tag `cat.a11y-simulator`): `text-spacing-whitespace`, `aria-label-matches-visible-text`, `focus-order-dom-visual-mismatch`, `skip-link-functional`. Treat them as hints, verify before acting.
- It runs **AAA** and **experimental** rules (`wcag2aaa`, `experimental`). The project target is **WCAG 2.2 AA**.
- Findings were produced on the page with the extension overlay injected. Confirm everything in a clean profile / Playwright before changing code.

### Triage table (verified against the exported JSON and the source)

| #   | Rule (nodes)                                                                                                 | Verdict                                              | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | `label-content-name-mismatch` (5) + `aria-label-matches-visible-text` (3) — WCAG **2.5.3 Label in Name (A)** | **TRUE POSITIVE — fix**                              | Visible text is not contained in the accessible name, so voice-control users saying "click Rescan" fail. Buttons: **Rescan** (`aria-label="Run accessibility scan (Ctrl+Enter)"`, `WorkbenchToolbar.tsx`), **Reset Example** (`"Reset current example to its original state"`), **Set Baseline** (`"Snapshot current findings as baseline"`), **Copy link** (`"Copy shareable permalink to clipboard"`, `Editor.tsx`), and the shortcuts button (`"Open keyboard shortcuts (F1)"`, `editor/EditorStatusBar.tsx`). |
| T2  | `text-spacing-whitespace` (6)                                                                                | **TRUE, but different cause — fix in the inspector** | Not "spaces used for layout". The A11y Tree panel prints computed names in `span.truncate`, and `lib/accessible-name.ts` builds names with `textContent.trim()`, which does **not collapse internal whitespace/newlines**. Per the accessible-name algorithm, whitespace must be collapsed.                                                                                                                                                                                                                       |
| T3  | `skip-link-functional` (1)                                                                                   | **TRUE (minor) — fix**                               | `<main id="main-content">` has no `tabIndex={-1}`, so the skip link target cannot receive programmatic focus in every browser.                                                                                                                                                                                                                                                                                                                                                                                    |
| F1  | `color-contrast-enhanced` (64)                                                                               | **FALSE POSITIVE for the AA target**                 | This is SC 1.4.6 (AAA). I checked all 64 measured ratios: min **4.74**, max **6.94**, so every one passes AA 4.5:1. Not a defect. See the optional token tweak below.                                                                                                                                                                                                                                                                                                                                             |
| F2  | `focus-order-dom-visual-mismatch` (2)                                                                        | **FALSE POSITIVE (verify manually)**                 | One hit is a `role="treeitem" tabindex="-1"` button: roving tabindex in a tree is the intended APG pattern (one tab stop, arrow keys inside). The other is the runtime-console toggle (`aria-controls="preview-runtime-console"`), which sits after the iframe in the DOM **and** below it visually.                                                                                                                                                                                                              |
| F3  | `scrollable-region-focusable` (1, `.cm-scroller`)                                                            | **FALSE POSITIVE (CodeMirror)**                      | The scroller has `tabindex="-1"`, but the editor's `.cm-content` is a focusable `contenteditable` textbox, so keyboard users can Tab in and scroll with arrows/PageUp/PageDown (SC 2.1.1 met). Axe does not count contenteditable as focusable content here. **Do not** add `tabindex="0"` to the scroller: that creates a second tab stop and breaks the Esc-then-Tab pattern.                                                                                                                                   |
| R1  | needs review: `color-contrast` (1, a CodeMirror syntax token)                                                | **Manual**                                           | Background can't be computed (overlapped element). Check the token pair with the app's contrast tool.                                                                                                                                                                                                                                                                                                                                                                                                             |
| R2  | needs review: `color-contrast-unknown` (6)                                                                   | **Mostly not applicable**                            | `a.sr-only` and `h1.sr-only` are visually hidden (no contrast requirement). For `span` "Use arrow keys to navigate…", `span.font-mono` "Role & Name Hierarchy" and the tree-item buttons, background is undetermined; text colour `#4b5563` on `#f6f5f3` is 6.94:1, so expect a pass — confirm in DevTools.                                                                                                                                                                                                       |

### Fixes to make

**T1 — Label in Name (do this one first; it is a Level A issue).**
For each button above, the accessible name must **contain the visible text, ideally at the start**. Preferred pattern: remove the long `aria-label`, let the visible text be the name, and move extra info to `aria-describedby` and `aria-keyshortcuts`:

```tsx
<button aria-keyshortcuts="Control+Enter" aria-describedby="rescan-hint">Rescan</button>
<span id="rescan-hint" className="sr-only">Run the accessibility scan on the current HTML and CSS.</span>
```

- Rescan → name "Rescan"; Reset Example → "Reset Example"; Set Baseline → "Set Baseline"; Copy link → "Copy link" (when the label changes to "Copied!", the name changes with it; keep the polite toast/live region for announcement); shortcuts button → name must include its visible label text (read the markup first: if it shows only an icon, then `aria-label` is correct and this one is **not** a violation — confirm which it is).
- Icon-only buttons keep `aria-label`; the rule only applies where there is visible text.
- Test (Vitest or Playwright): for every `button, [role=button], a` with an `aria-label` and visible text, assert the normalised visible text is a substring of the accessible name. Use `@axe-core/playwright` with the experimental rule enabled (see CI below) as a second check.

**T2 — Accessible-name whitespace.**
In `lib/accessible-name.ts` (and anywhere else names are derived: `a11y-tree.ts`), normalise every computed name: `value.replace(/\s+/g, " ").trim()`. Apply to name-from-content, `aria-labelledby` joins, native labels, `alt`, `title`. Add unit tests: text with newlines/tabs/multiple spaces, `&nbsp;` (keep as a single space or document), empty after trim, and the real strings from the report ("© 2026 Sandbox Lab …", "Open Confirmation Dialog…"). Also **verify** (and note in the report if not fixed here) that name-from-content uses `textContent`, which ignores `aria-hidden`/`display:none` children and child `img[alt]`/`aria-label`; if so open a separate accuracy issue to implement recursion per the accessible-name algorithm.

**T3 — Skip link target.**
Add `tabIndex={-1}` (and `className="outline-none"` or an equivalent so programmatic focus draws no ring) to every `<main id="main-content">`: `(workbench)/layout.tsx`, `(site)/layout.tsx`, `(site)/learn/page.tsx`, `(site)/learn/[topic]/page.tsx`. E2E: press Tab on load → skip link appears and is focused → Enter → `document.activeElement.id === "main-content"` and the next Tab lands on the first interactive element inside it.

**F1 — AAA contrast: do not chase it blindly.**
Record in `docs/a11y/known-exceptions.md` that AAA (1.4.6) is out of scope. _Optional, low risk, your call:_ darken `--color-text-secondary` from `#4b5563` to about `#454e5b` (7.01:1 on the darkest surface `#eceae6`, 7.7:1 on `#f6f5f3`). If you do this, re-run the contrast page tests and check dark/forced-colours states. Separately, the `⌘K` hint uses `opacity-60`; opacity lowers contrast of text that is still visible (4.74:1 today, passes AA). Prefer a solid token colour over opacity for any text.

**F2 / F3 — Do not "fix" these in app code.**
Do **not** remove `tabindex="-1"` from tree items, reorder the DOM, add `aria-hidden`, change roles, or add `tabindex="0"` to `.cm-scroller` just to satisfy a tool. Document each as a known exception (below) and cover them with manual and e2e keyboard tests: tree reachable with one Tab stop and arrows; editor reachable with Tab and scrollable with the keyboard.

### False-positive policy (applies to this and every future report)

1. **Classify with evidence** before touching code: true positive / false positive / needs manual check, citing the WCAG SC and what you verified (DevTools, keyboard, screen reader or computed values).
2. **Never silence a tool by degrading the UI**: no `aria-hidden` on real content, no role changes, no removing focusability, no global rule disabling, no lint/test skips.
3. **Record every accepted exception** in `docs/a11y/known-exceptions.md`: rule id, selector/component, SC, reason it is a false positive, how it was verified manually, who/when, and a review date. Keep exceptions as narrow as possible (one selector, one rule).
4. **Report only measured facts**: no score, no grade, no "compliant".
5. If you cannot tell whether something is a false positive, mark it **needs manual check** and leave the code alone.

### CI: make our own axe run match the target

In the Playwright axe helper (`tests/e2e/axe.ts` or equivalent) use:

```ts
new AxeBuilder({ page })
  .withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "wcag22aa",
    "best-practice",
  ])
  .options({ rules: { "label-content-name-mismatch": { enabled: true } } }) // experimental, catches SC 2.5.3 regressions
  .analyze();
```

- This excludes AAA rules (`color-contrast-enhanced`), so the 64 AAA nodes never fail CI.
- Handle F3 with a **narrow filter in the test**, not by excluding the editor from all rules:
  ```ts
  const real = results.violations.filter(
    (v) =>
      !(
        v.id === "scrollable-region-focusable" &&
        v.nodes.every((n) => n.target.join(" ").includes(".cm-scroller"))
      )
  );
  expect(real).toEqual([]);
  ```
  with a comment linking to `known-exceptions.md`, plus a separate test that Tab reaches `.cm-content` and that `PageDown` scrolls a long document.
- Run axe on `/`, `/about`, `/contrast`, `/learn`, `/challenges`, `/playground`, in a clean browser context (no extensions), with the editor focused, the Issues tab open, and the finding-detail view open.

**Acceptance for FIX-9:** T1–T3 fixed with tests; the extension's `label-content-name-mismatch`, `aria-label-matches-visible-text`, `text-spacing-whitespace` and `skip-link-functional` entries disappear on re-run; F1–F3 documented in `known-exceptions.md` with evidence; the CI axe run is green on all routes; no UI semantics were degraded to silence a tool.

---

## Final report (required)

`docs/audit/followup-report.md` with: per-fix status (done / deferred + reason), commit hashes, before/after bundle numbers (FIX-2), commands run with pass/fail, "Noticed, not changed" list, and remaining risks.

**Definition of done:** FIX-9 true positives (T1–T3) fixed and false positives documented; FIX-1 and FIX-2 verified by tests/analyzer output; no auto-fix writes placeholder text; zero `eslint-disable`/`@ts-ignore`; knip and madge clean; no component over ~300 lines without a stated reason; axe, keyboard e2e and the hydration regression green; no UI regression at 1280/768/390 px.

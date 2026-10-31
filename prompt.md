# Accessibility Playground — New Features Build Prompt

This implements the 6 highest-value gaps identified against your real codebase (screen-reader announcement preview, permalink sharing, editable ARIA Explorer, auto-fix with diff view, expanded WCAG dataset, React/TSX toggle), plus the two stretch items (saved-snippet library, EyeDropper), plus **Tailwind CSS support in the Playground preview**, which you asked for separately. Everything below is grounded in your actual files from the latest export (52 files) — exact paths, exact existing types, exact existing patterns to extend.

Work top to bottom. Each section is independently shippable — commit after each one, run `npm run check` before moving on.

---

## 0. Scope discipline

A few of these could balloon if you don't bound them. Read each section's "Scope" note before starting — I've deliberately cut corners that don't matter for a portfolio/teaching tool, so you don't rabbit-hole on generalized correctness the project doesn't need.

---

## 1. Screen-reader announcement preview (new Playground tab)

**New file: `src/lib/announcement.ts`**

You already compute everything this needs — `A11yNode` (`src/types/a11y.ts`) has `role`, `accessibleName`, and `ariaAttributes`. This feature is pure composition, no new scanning logic.

```ts
import type { A11yNode } from "@/types/a11y";

const STATE_PHRASES: Array<{
  match: (attrs: Record<string, string>) => boolean;
  phrase: (attrs: Record<string, string>) => string;
}> = [
  { match: (a) => a["aria-checked"] === "true", phrase: () => "checked" },
  { match: (a) => a["aria-checked"] === "false", phrase: () => "not checked" },
  {
    match: (a) => a["aria-checked"] === "mixed",
    phrase: () => "partially checked",
  },
  { match: (a) => a["aria-expanded"] === "true", phrase: () => "expanded" },
  { match: (a) => a["aria-expanded"] === "false", phrase: () => "collapsed" },
  { match: (a) => a["aria-selected"] === "true", phrase: () => "selected" },
  { match: (a) => a["aria-pressed"] === "true", phrase: () => "pressed" },
  {
    match: (a) => a["aria-disabled"] === "true" || "disabled" in a,
    phrase: () => "dimmed",
  },
  { match: (a) => a["aria-invalid"] === "true", phrase: () => "invalid entry" },
  {
    match: (a) => a["aria-required"] === "true" || "required" in a,
    phrase: () => "required",
  },
  { match: (a) => a["aria-current"] === "page", phrase: () => "current page" },
];

export function computeAnnouncement(node: A11yNode): string {
  const parts: string[] = [];
  if (node.hasAccessibleName && node.accessibleName.trim()) {
    parts.push(node.accessibleName.trim());
  }
  parts.push(node.role);

  const allAttrs = { ...node.attributes, ...node.ariaAttributes };
  for (const { match, phrase } of STATE_PHRASES) {
    if (match(allAttrs)) parts.push(phrase(allAttrs));
  }

  return parts.join(", ");
}
```

**New file: `src/features/playground/AnnouncementPanel.tsx`** — mirror the structure of `AccessibleNamePanel.tsx` (same empty-state pattern when `selectedNode` is null). Body renders the computed string in a large mono block, plus a breakdown list showing which parts contributed (name → role → each matched state), and a **mandatory disclaimer** since this is a simulation, not a guarantee:

> This approximates common NVDA/VoiceOver conventions. Actual announcements vary by assistive technology, browser, and verbosity settings. Always verify with a real screen reader before shipping.

**Wire into `src/features/playground/PlaygroundView.tsx`**: add a 5th `TabsTrigger` after `focus` (line ~444):

```tsx
<TabsTrigger value="announce">Announcement</TabsTrigger>
```

and a matching `<TabsContent value="announce">` rendering `<AnnouncementPanel selectedNode={selectedNode} />`, same pattern as the existing `accname`/`focus` tabs.

---

## 2. Permalink — share a snippet via URL

**Scope**: zero new dependencies for the MVP. `btoa`/`atob` with `encodeURIComponent` is sufficient; don't reach for `lz-string` unless you find URLs are actually too long in practice (flag it as a fast-follow if so).

**New file: `src/lib/snippet-share.ts`**

```ts
export function encodeSnippet(html: string, css: string): string {
  const payload = JSON.stringify({ h: html, c: css });
  return btoa(
    encodeURIComponent(payload).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  );
}

export function decodeSnippet(
  encoded: string
): { html: string; css: string } | null {
  try {
    const binary = atob(encoded);
    const percentEncoded = binary
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    const payload = JSON.parse(decodeURIComponent(percentEncoded));
    if (typeof payload.h !== "string") return null;
    return {
      html: payload.h,
      css: typeof payload.c === "string" ? payload.c : "",
    };
  } catch {
    return null;
  }
}
```

**`PlaygroundView.tsx`** — your existing `rawHtml`/`rawCss` initial-state resolution (lines ~31–63) already has a priority chain: `patternParam` → `localStorage` → default template. Insert a shared-snippet check **above** `patternParam`, since an explicit share link should win over everything:

```ts
const sharedParam = searchParams.get("s");
// inside both useState initializers, check sharedParam first:
if (sharedParam) {
  const decoded = decodeSnippet(sharedParam);
  if (decoded) return decoded.html; // or decoded.css in the CSS initializer
}
```

Also set `setRestoredNotice(false)` when loading from a share link — a shared snippet isn't "your last session," so don't show that notice.

**UI**: in `src/features/playground/Editor.tsx`, add a "Copy link" button in the toolbar's right-hand control group (near the Templates dropdown, line ~113). On click: `encodeSnippet(html, css)`, build `${location.origin}/playground?s=${encoded}`, `navigator.clipboard.writeText(...)`. For the success feedback, your app already has `ToastProvider` from `@accessly-ui/react` wrapping everything in `Providers.tsx` — check Accessly UI's docs for its `useToast`/`toast()` export and use that instead of inventing a new toast system. If Accessly UI doesn't expose a programmatic toast hook, fall back to a simple `aria-live="polite"` text swap on the button itself ("Copied!" for 2s), same pattern your `CopyCodeButton.tsx` likely already uses — check that file first and reuse its exact approach for consistency.

---

## 3. Editable ARIA Explorer

**Scope**: this is the most architecturally involved item. Keep the mutation strategy simple and robust rather than building a general HTML AST-to-source mapper: you already track `sourceRange` on every `A11yNode` (`src/types/a11y.ts` line 17) for editor-selection sync — reuse it.

**New file: `src/lib/mutate-html.ts`**

```ts
import type { A11yNode } from "@/types/a11y";

/** Set or replace an attribute within a node's own opening tag, using its sourceRange. */
export function setAttributeInSource(
  html: string,
  node: A11yNode,
  attrName: string,
  attrValue: string
): string {
  if (!node.sourceRange) return html;
  const [start, end] = node.sourceRange;
  const nodeSource = html.slice(start, end);

  // Match just the opening tag (up to the first > that isn't inside a quoted attribute value).
  const openTagMatch = nodeSource.match(
    /^<[a-zA-Z][a-zA-Z0-9-]*((?:\s+[^<>]*?)?)\s*(\/?)>/
  );
  if (!openTagMatch) return html;

  const attrPattern = new RegExp(`\\s${attrName}\\s*=\\s*"[^"]*"`);
  let newOpenTag: string;
  if (attrPattern.test(openTagMatch[0])) {
    newOpenTag = openTagMatch[0].replace(
      attrPattern,
      ` ${attrName}="${attrValue}"`
    );
  } else {
    newOpenTag = openTagMatch[0].replace(
      /(\/?)>$/,
      ` ${attrName}="${attrValue}"$1>`
    );
  }

  const newNodeSource =
    nodeSource.slice(
      0,
      openTagMatch[0].length === nodeSource.length ? nodeSource.length : 0
    ) || nodeSource; // guard
  const rebuilt = newOpenTag + nodeSource.slice(openTagMatch[0].length);
  return html.slice(0, start) + rebuilt + html.slice(end);
}

export function removeAttributeFromSource(
  html: string,
  node: A11yNode,
  attrName: string
): string {
  if (!node.sourceRange) return html;
  const [start, end] = node.sourceRange;
  const nodeSource = html.slice(start, end);
  const newNodeSource = nodeSource.replace(
    new RegExp(`\\s${attrName}\\s*=\\s*"[^"]*"`),
    ""
  );
  return html.slice(0, start) + newNodeSource + html.slice(end);
}
```

Test this against nested elements with similar attribute names before wiring it up — regex-based tag rewriting is the known fragile point here. If you hit edge cases (attributes containing `>` inside quoted strings, self-closing void elements), fix the regex rather than redesigning the approach; the `sourceRange`-scoped rewrite is the right strategy for this codebase.

**`AriaExplorerPanel.tsx` changes**: add an `onUpdateAttribute?: (attr: string, value: string) => void` and `onRemoveAttribute?: (attr: string) => void` prop. In the attributes table (lines ~117–168), make the "Value" cell (line 132) a click-to-edit field — clicking turns it into a small `<input>` that commits on blur/Enter and calls `onUpdateAttribute`. Add a trash icon button per row calling `onRemoveAttribute`. Add an "Add attribute" row below the table with a `<select>` populated from the role's allowed ARIA properties — `src/lib/aria-explorer.ts` already has the role→allowed-props model backing `validateAriaAttribute`; export that lookup table (or a new helper) for this dropdown instead of duplicating it.

**`PlaygroundView.tsx` wiring**: pass down

```tsx
onUpdateAttribute={(attr, value) => {
  if (!selectedNode) return;
  setRawHtml((html) => setAttributeInSource(html, selectedNode, attr, value));
  setIsScanning(true);
}}
```

to `<AriaExplorerPanel>` in the `accname`... no — the `aria` tab's `<TabsContent>`. This reuses the exact same `setRawHtml` + `setIsScanning(true)` pattern your `Editor`'s `onHtmlChange` already uses (line ~364), so the debounced re-parse → re-scan pipeline picks it up automatically with no new plumbing.

---

## 4. Auto-fix suggestions with before/after diff

**Scope**: only auto-apply fixes that are mechanically unambiguous. Do **not** attempt to auto-fix `input-no-label` or `empty-interactive-name` — those require real label text only a human can supply, and a fabricated placeholder label would be actively misleading in a teaching tool. Auto-fixable set, cross-referenced against your actual rule IDs in `src/lib/custom-rules.ts`:

| Rule ID (from `custom-rules.ts`) | Auto-fix                                                                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `positive-tabindex`              | Rewrite `tabindex="N"` → `tabindex="0"`                                                                                                                                                                   |
| `aria-hidden-focusable`          | Remove the `aria-hidden="true"` attribute                                                                                                                                                                 |
| `img-missing-alt`                | Insert `alt=""` — **only** when the image also has no visible caption nearby; otherwise insert a `TODO`-flagged `alt="TODO: describe this image"` so it's obviously incomplete rather than silently wrong |

Each of these maps directly onto `setAttributeInSource`/`removeAttributeFromSource` from §3 — no new mutation logic needed.

**`IssuesPanel.tsx` changes**: for findings whose `id` is in the auto-fixable set above, render an "Apply fix" button next to the existing "Inspect in tree" button (near line ~191). On click, call a new `onApplyFix?: (finding: AxeFinding) => void` prop.

**Diff view (keep it simple — no new dependency)**: before applying, show a small inline before/after comparison using two `<pre>` blocks (old tag vs. new tag), not a full-document diff — you only need to show the single opening tag changing, which `CodeSnippet.tsx` (you already have this component) can render twice, labeled "Before" / "After", inside a lightweight confirm step (reuse Accessly UI's `Dialog`/`AlertDialog` if it has one, otherwise a simple inline expand under the button). Resist building a character-level diff algorithm — the change is always a single attribute on a single tag, so a two-block before/after is honest and sufficient.

**`PlaygroundView.tsx` wiring**: same shape as §3 —

```tsx
onApplyFix={(finding) => {
  const node = findA11yNodeById(ast, finding.nodes[0]?.targetId ?? "");
  if (!node) return;
  // dispatch based on finding.id to the right mutate-html.ts call
  setIsScanning(true);
}}
```

---

## 5. Expand the WCAG dataset

**File: `src/data/wcag.ts`** (currently 16 entries, against ~56 A/AA criteria in WCAG 2.2). This is mechanical, not architectural — follow the exact existing `WcagCriterion` shape (`id`, `name`, `level`, `principle`, `summary`, `url`) and work through the W3C Quick Reference (https://www.w3.org/WAI/WCAG22/quickref/) filtered to Level A and AA, adding every criterion your app's own badges already reference by ID but can't currently resolve inline.

Before writing new entries, grep for which criterion IDs your codebase actually cites but aren't yet in `wcag.ts`:

```bash
grep -rohE '"[0-9]\.[0-9]\.[0-9]+"' src/lib/custom-rules.ts src/data/patterns.ts | sort -u
```

Prioritize those first — they're the ones currently falling back to an external link in `WcagBadge.tsx` instead of showing an inline popover. Check `WcagBadge.tsx`'s lookup logic to confirm it does fall back gracefully for missing IDs (it should, given the component already exists) — expanding the dataset just converts more external-link badges into inline ones, it doesn't fix a bug.

---

## 6. React/TSX toggle — Pattern Library only, not the Playground

**Scope**: deliberately **not** added to the open-ended Playground editor. The Playground accepts arbitrary, often intentionally-broken HTML — a lossy HTML→JSX transform on untrusted/malformed input would produce confusing or wrong output. The Pattern Library's `badCode`/`goodCode` snippets in `src/data/patterns.ts`, by contrast, are hand-authored and well-formed, making a simple transform safe and useful there.

**New file: `src/lib/html-to-jsx.ts`** — a deliberately minimal transform, not a general HTML parser:

- `class="..."` → `className="..."`
- `for="..."` → `htmlFor="..."`
- inline `style="prop: val; prop2: val2"` → `style={{ prop: 'val', prop2: 'val2' }}` (camelCase the CSS properties)
- self-close known void elements (`img`, `input`, `br`, `hr`) if not already self-closed
- leave everything else (including `data-*`, `aria-*`, which are already valid JSX as-is) untouched

Don't reach for an npm package here — the input surface is small and controlled (your own authored patterns), so a ~40-line regex-based transform is more maintainable than a dependency.

**`PatternDetailView.tsx` / `CopyCodeButton.tsx` changes**: add an HTML/JSX toggle (same tab-pair visual pattern as the Editor's HTML/CSS tabs in `Editor.tsx`) above each code block; apply `htmlToJsx()` to the displayed/copied string when JSX is selected.

---

## 7. Saved-snippet library (beyond the current single-session autosave)

**New file: `src/lib/snippet-library.ts`**, storage key `a11y-playground:snippets` (distinct from the existing `a11y-playground:last-html`/`last-css` autosave keys in `PlaygroundView.tsx` — don't collide with those):

```ts
export interface SavedSnippet {
  id: string;
  name: string;
  html: string;
  css: string;
  savedAt: number;
}

export function listSnippets(): SavedSnippet[] {
  /* read + JSON.parse, [] on failure */
}
export function saveSnippet(
  name: string,
  html: string,
  css: string
): SavedSnippet {
  /* ... */
}
export function deleteSnippet(id: string): void {
  /* ... */
}
```

**UI**: a second dropdown in `Editor.tsx`'s toolbar, "My Snippets", built the same way as the existing `DropdownMenu`/`STARTER_TEMPLATES` pattern (lines ~127–170) — list saved snippets with name + relative saved time, a delete icon per row, and a "Save current as..." entry at the top that prompts for a name (use a real input, not `window.prompt`, for consistency with the rest of the app's custom UI).

---

## 8. EyeDropper API (progressive enhancement)

**`ContrastChecker.tsx` changes**: feature-detect:

```tsx
const supportsEyeDropper =
  typeof window !== "undefined" && "EyeDropper" in window;
```

When true, render a small eyedropper icon button next to each color-picker input (lines ~154–160, ~200–206). On click:

```tsx
const eyeDropper = new (window as any).EyeDropper();
const result = await eyeDropper.open();
setFgHex(result.sRGBHex); // or setBgHex for the background field
```

Wrap in try/catch — the API rejects its promise when the user presses Escape, which is expected behavior, not an error to surface. When unsupported (Safari, Firefox as of your training data — verify current support before shipping), simply don't render the button; no fallback message needed, the native color-picker input already covers that case.

---

## 9. Tailwind CSS support in the Playground preview

This is the one feature here that changes your security/privacy posture, so read this section fully before implementing — don't just wire it in silently.

**The tension**: your `/about` page currently states "No external CDN requests are made during runtime auditing" (`src/app/about/page.tsx`, the "Vendored axe-core Execution" card) as a deliberate privacy/offline guarantee. Tailwind's browser build (`cdn.tailwindcss.com`) is a hosted script with no local-vendoring equivalent as simple as what you did for axe-core — vendoring a full Tailwind JIT compiler for the browser is a materially bigger undertaking than copying one `.js` file. **Recommendation: ship this as an explicit opt-in, off by default, with an honest in-UI disclosure** — don't silently load a third-party script into every preview.

**`src/lib/iframe-template.ts` changes**: add a parameter to `generatePreviewSrcDoc`:

```ts
export function generatePreviewSrcDoc(
  instrumentedHtml: string,
  css = "",
  axeUrl = "/axe.min.js",
  useTailwind = false
): string {
  // ...
  const tailwindScript = useTailwind
    ? `<script src="https://cdn.tailwindcss.com"></script>`
    : "";
  // insert tailwindScript into <head>, BEFORE the <style id="user-css"> block,
  // so user CSS can still override Tailwind utilities if needed
}
```

**`PreviewFrame.tsx` changes**: add a `useTailwind?: boolean` prop, pass through to `generatePreviewSrcDoc` inside the existing `srcDoc` `useMemo` (line ~59), and add it to that `useMemo`'s dependency array.

**`Editor.tsx` / `PlaygroundView.tsx` changes**: add a small labeled checkbox in the Editor toolbar — "Tailwind CSS (loads cdn.tailwindcss.com)" — the label text itself should disclose the network request, don't hide it behind a tooltip. Persist the toggle state in `PlaygroundView.tsx`'s existing `localStorage` pattern (a new key, e.g. `a11y-playground:use-tailwind`) so it's sticky across sessions but still defaults to `false` for a first-time visitor.

**Offline/CSP consideration**: when this toggle is on and the user's network can't reach `cdn.tailwindcss.com` (offline, corporate proxy, or your own build sandbox's restricted network — you've hit exactly this kind of restriction before with `fonts.googleapis.com`), the iframe will render unstyled Tailwind-class markup rather than failing loudly. Consider adding a short timeout-based check (e.g., listen for the script's `onerror`, or check `typeof window.tailwind === "undefined"` a second after load) that posts a `scan-error`-style warning back to the host so the user sees _why_ their classes aren't applying, rather than silently getting an unstyled preview.

**Starter templates**: add 2 new entries to `src/data/templates.ts` authored with Tailwind utility classes (e.g., a Tailwind-styled accessible form field, a Tailwind-styled tab pattern), gated so they only make sense with the toggle on — note this in each template's `description` field (e.g., "Requires the Tailwind preview toggle").

**`/about` page update**: add one sentence to the existing "Vendored axe-core Execution" card (or a new 4th card) clarifying the scope of the offline guarantee now that Tailwind is opt-in: _"Accessibility scanning itself never leaves your browser. An optional Tailwind CSS preview mode, off by default, does load Tailwind's hosted script when explicitly enabled."_ Don't let the existing blanket claim become inaccurate once this ships.

---

## Definition of done

- [ ] §1: Announcement tab renders a plausible string for at least 5 manually tested elements (button, checked checkbox, expanded disclosure, invalid required input, current-page link); disclaimer is visible, not buried.
- [ ] §2: A copied permalink, pasted into a fresh tab, reproduces the exact HTML+CSS that was shared.
- [ ] §3: Editing an ARIA attribute value in the explorer visibly rewrites the HTML in the editor and re-triggers a scan; tested on at least one nested-element case to confirm the regex isn't rewriting a sibling's attribute by mistake.
- [ ] §4: Each of the 3 auto-fixable rule IDs applies correctly and only those 3 — `input-no-label`/`empty-interactive-name` do **not** get an "Apply fix" button.
- [ ] §5: `grep` confirms every WCAG ID your own code cites now resolves in `WCAG_CRITERIA`.
- [ ] §6: JSX toggle only appears in the Pattern Library, not the Playground; spot-check the transform against all 5 existing pattern pairs.
- [ ] §7: Saved snippets persist across a page reload and don't collide with the existing autosave keys.
- [ ] §8: EyeDropper button is absent (not disabled — absent) in a browser that doesn't support the API.
- [ ] §9: Tailwind toggle defaults to off; the label text discloses the network request; `/about` page copy no longer overstates the offline guarantee.
- [ ] `npm run check` and `npm run build` pass clean.

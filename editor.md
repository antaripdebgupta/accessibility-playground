# Code Editor Fix & VS Code-Parity Prompt — Accessibility Playground

> Give this whole file to the AI as **one task**. It is ordered: root-cause fixes first (Part A), then VS Code parity (Part B), then edge cases and tests (Parts C–D). Do not start Part B until every Part A test passes.

## 0. Role and rules

Act as a senior frontend engineer who knows CodeMirror 6 internals well. You are fixing an **existing** editor in a Next.js 16 / React 19 / strict-TS app that uses `@uiw/react-codemirror` 4.25 and `@codemirror/*` 6.

**Symptoms reported by the user**

1. Cannot scroll the editor up/down.
2. Backspace does not work correctly.
3. HTML syntax/typing behaviour is wrong or unreliable.
4. Goal: a developer must be able to use the editor **as smoothly as VS Code**.

Rules:

- Fix root causes. No timeouts, no `setTimeout(…, 0)` hacks, no `// eslint-disable`, no `any`, no `@ts-ignore`.
- Keep it accessible (WCAG 2.2 AA): no keyboard trap, visible focus, screen-reader label, reduced motion respected.
- Prefer CodeMirror's own packages (`@codemirror/commands`, `search`, `autocomplete`, `lint`, `language`). Add a new dependency only when listed in Part B and justify it in the PR.
- Existing features must keep working: completions (ARIA, id-refs, a11y snippets, CSS a11y, Tailwind), templates menu, snippets menu, Cmd/Ctrl+Enter rescan, element ↔ source sync, maximise, status bar.
- Add tests (Part D). A fix without a regression test is not done.

Files to read first: `features/playground/CodeEditor.tsx`, `Editor.tsx`, `PlaygroundView.tsx`, `hooks/useSelection.ts`, `editor/extensions/*` (theme, settings, keymaps), `editor/useEditorSettings.ts`, `editor/EditorStatusBar.tsx`, `components/workbench/SplitPane.tsx`, `hooks/usePlaygroundDocument.ts`.

---

# PART A — Root causes (verified by reading the code and the library source)

## A1. The selection feedback loop — causes broken Backspace, caret jumping, scroll yanking

This is the main bug. In `CodeEditor.tsx`:

```ts
React.useEffect(() => {
  if (selectionRange && editorRef.current?.view) {
    ...
    view.dispatch({ selection: { anchor: start, head: end }, scrollIntoView: true });
  }
}, [selectionRange]);
```

and `PlaygroundView.tsx` passes `selectionRange={selectedNode?.sourceRange ?? null}`.

Why it breaks typing:

1. `useSelection` **always** returns a node: when nothing is selected it falls back to `ast.children[0]`. So `selectionRange` is **never null**.
2. `parseHtmlToA11yTree` runs 400 ms after every edit and creates **new** `sourceRange` arrays. The effect's dependency changes → the effect fires **after every pause in typing**.
3. The effect **replaces the user's real selection** with the whole opening tag of the selected element (`anchor: start, head: end`) and scrolls it into view.
4. Result: you type, pause, and the editor selects an element's tag. The next keystroke or **Backspace deletes/overwrites that whole selected tag** (looks like "backspace is wrong"), and the viewport jumps to that element (looks like "can't scroll").
5. It also loops: the dispatch triggers `onCaretChange` → `handleCaretChange` → `handleSelect(node.id, "editor")` → new `selectedNode` → effect fires again.

**Fix (design):**

- The user's caret/selection is **owned by the user**. Application code must never move it implicitly.
- Replace the effect with an explicit, one-shot **reveal command**:
  - `useSelection` already knows the `source` of the last selection. Only reveal when `source` is `"tree" | "preview" | "issue" | "focus"` — **never** when `source === "editor"` or `"initial"`.
  - Pass a `revealRequest: { id: number; range: [number, number] } | null` (increment `id` per user action) instead of the derived `selectionRange`. The editor reacts to a **new `id`**, not to a new array identity.
  - On reveal: scroll the range into view with `EditorView.scrollIntoView(range.from, { y: "nearest", yMargin: 24 })` and show a **decoration** (see below). Do **not** change `view.state.selection`, and do **not** call `view.focus()` unless the user pressed an explicit "Show in code" button.
- Highlight with a `StateField` + `Decoration.mark({ class: "cm-a11y-selected" })` over the range (cleared on the next doc change that touches it, on Escape, or when selection changes). Style with a token colour + underline/outline (not colour-only).
- The caret → element mapping (`handleCaretChange`) must:
  - run only on `selectionSet && !docChanged`,
  - be throttled (≈100 ms trailing) so holding an arrow key doesn't flood React,
  - **not** feed back into the editor (guaranteed by the rule above),
  - skip when the editor is not focused (programmatic selection changes).
- Remove the "fallback to first child" from the **editor-facing** path (keep it for inspectors if you want, but the editor must not derive anything from it).

## A2. `onChange`/callback identity reconfigures the whole editor on every render

`@uiw/react-codemirror` runs `view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) })` whenever **any** of `extensions`, `onChange`, `onUpdate`, `height`, `theme`, … changes identity (see `useCodeMirror.ts`, the effect with that dependency list).

Your code passes inline arrows down (`onHtmlChange={(val) => setRawHtml(val)}`) and builds `extensions` in a `useMemo` that depends on `onCaretChange` (which depends on `ast` and `activeNodeId`). So **every keystroke and every re-parse tears down and rebuilds all plugins**: the autocomplete popup closes/flickers, tooltips disappear, search panel state resets, composition (IME) can break, and the editor feels laggy.

**Fix:**

- Keep `extensions` **referentially stable for the lifetime of the editor** (empty/primitive deps only). Put everything that can change into **Compartments** (`@codemirror/state`) and update with `view.dispatch({ effects: compartment.reconfigure(...) })` in a small effect per concern: language, tab size/indent unit, wrapping, line numbers, font size, autocomplete, Tailwind completions, read-only, a11y label.
- Read volatile callbacks through refs: `const onChangeRef = useLatest(onChange)` and call `onChangeRef.current(...)` from listeners. Pass a **stable** `onChange` (`useCallback` with `[]`) to `<CodeMirror>`.
- `extensions/settings.ts` already defines Compartments but they are **unused** (and `settings.fontSize`, `settings.tabSize` are read from storage but never applied). Wire them up.
- Test: render the editor, type 50 characters, assert `view.state` reconfigure count is 0 after mount (spy on `StateEffect.reconfigure` usage or count plugin instances).

## A3. The editor has no height → it grows instead of scrolling

`<CodeMirror>` is rendered without `height`; `@uiw/react-codemirror` defaults `height` to `null`, so the host div is auto-height. The theme sets `"&": { height: "100%" }` but the host wrapper has no definite height to resolve against. Parents are `overflow-hidden` (`SplitPane`), so long documents are **clipped and cannot be scrolled**.

**Fix:**

- Pass `height="100%"` and `className="h-full"` to `<CodeMirror>`, and make every ancestor in the chain `h-full min-h-0` (flex children need `min-h-0` to be allowed to shrink): `SplitPane` slot → `section#code-editor-pane` → `Editor` root → editor body → `tabpanel` → `CodeMirror` host.
- `.cm-editor { height: 100% }` and `.cm-scroller { overflow: auto; overscroll-behavior: contain; }` so wheel scrolling at the end of the editor doesn't scroll the page.
- Keep the scroller keyboard-focusable only if CodeMirror's own content is not (don't add `tabindex=0` on `.cm-scroller` if it creates a second tab stop; verify with axe `scrollable-region-focusable` and keep a single tab stop — the `.cm-content` is already focusable).
- Test: with a 500-line document, `scrollTop` changes on wheel and on `PageDown`; the last line is reachable; the editor does not exceed its pane height.

## A4. Hidden tab panels break measuring

HTML and CSS editors are both mounted; the inactive one uses `className="hidden"` (`display: none`). CodeMirror cannot measure a `display:none` editor; after switching tabs it can render blank, mis-sized, or with wrong scroll.

**Fix (choose one, document it):**

- **Preferred:** keep both mounted but hide with `visibility:hidden; position:absolute; inset:0; pointer-events:none` (still measurable), and on activation call `view.requestMeasure()` and restore scroll position; **or**
- Use one `EditorView` and swap `EditorState`s per tab (keeps per-tab undo history and scroll, like VS Code tabs).
- Also set `aria-hidden`/`inert` on the inactive panel so it is not reachable by keyboard or screen reader.
- Preserve per-tab **undo history, selection and scroll position** when switching tabs. Test it.

## A5. Whole-document replace on external value changes

When `value` differs from the document, the library dispatches `changes: { from: 0, to: length, insert: value }` — a full replace. That resets the caret, scroll and undo granularity. It happens on template load, snippet load, ARIA-explorer attribute edits, auto-fix.

**Fix:** write `applyExternalValue(view, next)` that computes a **minimal diff** (common prefix/suffix, or reuse `lib/diff.ts`) and dispatches a single small change, mapping the existing selection through it, with `annotations: ExternalChange.of(true)` (the library's) or a custom annotation so it doesn't echo to `onChange`. For template/snippet loads (intentional full replace) use `selection: { anchor: 0 }` and `scrollIntoView: true`, and add it to **history** so Ctrl+Z restores the previous document.

## A6. Smaller defects found while reading

| #   | Issue                                                                                                                                               | Fix                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a   | `indentWithTab` defaults **off**. Developers expect Tab to indent.                                                                                  | Default **on**. Keep accessibility: `Escape` then `Tab` moves focus out (CodeMirror pattern), show it in the status bar, announce mode change in a polite live region, persist the setting. |
| b   | Window-level `Cmd/Ctrl+K` handler calls `preventDefault()` even when the editor is focused — breaks VS Code chords (`Ctrl+K Ctrl+C` comment, etc.). | Only handle it when focus is **outside** the editor, or rename the shortcut (e.g. `Ctrl/Cmd+Shift+T` for templates).                                                                        |
| c   | `lintKeymap: false` while the app wants diagnostics.                                                                                                | Enable `lintKeymap` once diagnostics exist (see B7).                                                                                                                                        |
| d   | `ViewPlugin.define` sets `tabindex=0` on `.cm-scroller` once, but CodeMirror may re-create DOM.                                                     | Use `EditorView.scrollHandler`/theme-safe approach or remove if axe passes without it.                                                                                                      |
| e   | `onCaretChange` and `onForceScan` identities change every render → see A2.                                                                          | Stable via refs.                                                                                                                                                                            |
| f   | Both editors are always mounted → double memory; large docs lag.                                                                                    | Lazy-mount the CSS editor on first activation.                                                                                                                                              |
| g   | Status bar shows only lines/bytes.                                                                                                                  | Show `Ln X, Col Y`, selection length, indent mode (`Spaces: 2`), language, wrap on/off, EOL — like VS Code. Update on `selectionSet`, throttled.                                            |

---

# PART B — VS Code parity

Target: a developer should not have to think about the editor. Implement the following; each bullet needs a test.

## B1. Keymap (use CodeMirror commands; map `Mod` = Cmd on macOS, Ctrl elsewhere)

| Action                    | Keys                                                                                                                                                           | Source                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Undo / Redo               | `Mod-z` / `Mod-Shift-z`, `Ctrl-y` (Win)                                                                                                                        | `history`                                        |
| Select all                | `Mod-a`                                                                                                                                                        | default                                          |
| Delete line               | `Mod-Shift-k`                                                                                                                                                  | `deleteLine`                                     |
| Move line up/down         | `Alt-↑` / `Alt-↓`                                                                                                                                              | `moveLineUp/Down`                                |
| Copy line up/down         | `Shift-Alt-↑` / `Shift-Alt-↓`                                                                                                                                  | `copyLineUp/Down`                                |
| Insert line below / above | `Mod-Enter` is **taken by rescan** → use `Mod-Alt-Enter` / `Mod-Shift-Enter` for line insertion, keep rescan on `Mod-Enter` only when no conflict; document it |
| Indent / outdent          | `Tab` / `Shift-Tab`, `Mod-]` / `Mod-[`                                                                                                                         | `indentMore/Less`                                |
| Toggle comment            | `Mod-/` (HTML `<!-- -->`, CSS `/* */`), block `Shift-Alt-a`                                                                                                    | `toggleComment`, `toggleBlockComment`            |
| Select next occurrence    | `Mod-d`                                                                                                                                                        | `selectNextOccurrence` from `@codemirror/search` |
| Select all occurrences    | `Mod-Shift-l`                                                                                                                                                  | `selectSelectionMatches`                         |
| Add cursor                | `Alt-click`, `Mod-Alt-↑/↓`                                                                                                                                     | `addCursorAbove/Below`                           |
| Expand selection          | `Shift-Alt-→` / `←`                                                                                                                                            | `selectParentSyntax` / `simplifySelection`       |
| Find / replace            | `Mod-f`, `Mod-h` (replace), `F3` / `Shift-F3`, `Esc` closes                                                                                                    | `searchKeymap`, `search({ top: true })`          |
| Go to line                | `Mod-g` or `Ctrl-g`                                                                                                                                            | `gotoLine`                                       |
| Fold / unfold             | `Mod-Shift-[` / `]`, `Mod-Alt-[` / `]`                                                                                                                         | `foldKeymap`                                     |
| Jump to matching bracket  | `Mod-Shift-\`                                                                                                                                                  | `cursorMatchingBracket`                          |
| Home (smart), End         | `Home` toggles first non-blank                                                                                                                                 | `cursorLineBoundaryBackward`                     |
| Delete word left/right    | `Mod-Backspace` / `Mod-Delete`                                                                                                                                 | `deleteGroupBackward/Forward`                    |
| Format document           | `Shift-Alt-f`                                                                                                                                                  | B5                                               |
| Trigger completion        | `Ctrl-Space`                                                                                                                                                   | `startCompletion`                                |
| Rescan accessibility      | `Mod-Enter`                                                                                                                                                    | existing                                         |

Ship a **keyboard shortcuts dialog** (`?` or `F1`) listing these, as a real accessible dialog (focus trap, Esc, return focus).

## B2. Typing behaviour (the "feels like VS Code" part)

- **Auto close tags** (`<div>` → `</div>`), **auto rename paired tag** (editing `div` in `<div>` updates `</div>`): lang-html's `autoCloseTags` is on; add `matchClosingTags` (on) and implement paired-tag rename (a small `ViewPlugin`/transaction filter) — optional if complex, but must not corrupt text.
- **Auto close brackets/quotes**, with **type-over** the closing char, and **backspace deletes the pair** when empty (`closeBrackets` + `closeBracketsKeymap`). Quote auto-close must **not** trigger inside words (`don't`).
- **Wrap selection**: typing `"`, `'`, `(`, `[`, `{`, `<` with a selection wraps it.
- **Smart indent**: Enter between `<div>|</div>` produces an indented blank line and puts `</div>` on its own line (`insertNewlineAndIndent` + html language indent). Enter inside `{|}` in CSS does the same.
- **Indent on paste**: pasted code is re-indented to the caret (`@codemirror/commands` doesn't do this by default — implement a `EditorView.inputHandler`/`clipboardInputFilter` or leave raw paste but document it; raw paste must **never** mangle text).
- **Trailing whitespace** is preserved while typing; offer optional trim on format.
- **Tab size / indent unit** (2 or 4 spaces, or tab) applied via `EditorState.tabSize` + `indentUnit` compartments, driven by the existing setting.
- **Line wrapping** setting honoured; with wrapping on, `Home`/`End` and Up/Down move by visual line like VS Code.
- **Bracket matching** highlight and **matching tag** highlight (`matchBrackets`, lang-html `matchClosingTags`).
- **Highlight selection matches** and **active line** (present). Ensure highlight colours meet 3:1 against the background.
- **Indentation guides** (optional, light) and **visible whitespace** toggle (`highlightWhitespace`) — optional.
- **Emmet** (optional, recommended): `@emmetio/codemirror6-plugin` for `ul>li*3` + Tab in HTML and `m10` style abbreviations in CSS. This is the one allowed new dependency; ship it behind the `autocomplete` setting and lazy-load it.

## B3. Embedded languages and syntax

- HTML document must highlight and complete **embedded `<style>`** (CSS) and **`<script>`** (JS). `@codemirror/lang-html` does this when `@codemirror/lang-css` and `@codemirror/lang-javascript` are installed — add `@codemirror/lang-javascript` if missing and confirm via a test that `<script>const a = 1</script>` gets JS token classes and `<style>a{color:red}</style>` gets CSS tokens.
- Inline `style="…"` attribute values complete CSS properties (lang-html supports this via `nestLanguages`; verify).
- Attribute names/values completion, tag completion, entity completion (`&amp;`) — verify the built-in HTML completion still works **together with** the custom sources (A11y/ARIA/id-ref/Tailwind). Custom sources must return `null` quickly outside their context, must not shadow built-ins, and must not block typing (cap work; no regex over the whole doc per keystroke — scope to the current tag).
- Completion UX like VS Code: `Enter` **and** `Tab` accept; `Esc` closes; `↑/↓` navigate; popup never covers the caret line; `activateOnTyping`; `maxRenderedOptions` ≥ 50; **no popup inside comments or inside text content** unless triggered with `Ctrl-Space`.
- Selected-option screen-reader announcement (CodeMirror sets `aria-activedescendant`/`aria-selected`; verify with a test).

## B4. Search

`search({ top: true })`, keep the panel accessible (labels, buttons with names, `aria-live` match count "3 of 12"), regex/case/whole-word toggles, replace/replace-all, `Esc` returns focus to the editor. Style the panel with the app tokens.

## B5. Format document

`Shift-Alt-f` and a toolbar button. Use `prettier/standalone` with `parser-html` and `parser-postcss` (lazy-loaded; second allowed dependency). Rules: preserves caret position (map through the diff), single undo step, never runs on a document over the size cap, shows a toast on parse failure and leaves the text untouched. Respect the indent setting.

## B6. Folding, gutter, minimap-lite

- Fold gutter with accessible fold controls (already `foldGutter: true`; verify names and keyboard).
- Line numbers toggle (exists). Sticky active-line gutter highlight (exists).
- No minimap.

## B7. Diagnostics inside the editor (ties to the product)

Use `@codemirror/lint` to underline findings **at their `sourceRange`** from the existing rules, with the severity icon + text (not colour-only), `lintGutter()`, `Ctrl/Cmd-.` quick fix applying existing `auto-fix` where available, and `F8`/`Shift+F8` next/previous diagnostic. Diagnostics update from the **debounced** parse only (never on every keystroke), are cleared when stale, and **never move the caret**. Hover tooltip: rule title + a "Learn more" button that opens the finding in the Issues tab. If the DOM parse fails, show a single "HTML parse warning" diagnostic, not a crash.

---

# PART C — Edge cases that must work (write a test for each)

**Input & editing**

1. Hold Backspace/Delete across a 5,000-char document: no dropped keys, no selection jump.
2. Backspace after an auto-closed pair (`<>`, `()`, `""`) removes both; after a character removes one.
3. Backspace at line start joins lines; at indent boundary removes one indent unit (`indentUnit`).
4. Select-all + type replaces everything; Select-all + Delete empties; Undo restores in **one** step.
5. Typing right **before and during** the 400 ms debounced re-parse must not alter the caret or selection (this is the A1 regression).
6. Rapid typing (`userEvent.type` at 0 ms delay, 200 chars): final document equals input exactly (no lost/reordered characters).
7. Paste: plain text, multi-line, 200 KB (up to the cap), text containing `\r\n`, tabs, emoji, RTL text, zero-width chars, `</script>`. Normalise `\r\n` to `\n` consistently; never lose characters.
8. Drag-and-drop text within the editor and from outside; drop a file → ignored with a clear message (no navigation).
9. Cut/copy with no selection copies/cuts the **whole line** (VS Code behaviour) — implement with `EditorView.clipboardOutputFilter`/keymap if not default; verify.
10. IME composition (CJK, accented chars via dead keys): no mid-composition re-render or reconfigure (A2). Add a Playwright test using `page.keyboard.insertText` + composition events.
11. Multi-cursor typing, backspace and undo behave consistently.
12. Undo/redo across: typing, paste, format, auto-fix, template load (A5), tab switch (A4).

**Scrolling & layout** 13. Wheel, trackpad, scrollbar drag, `PageUp/PageDown`, `Ctrl+Home/End` all work in a 500+ line document; horizontal scroll works with wrapping off. 14. Caret stays visible while typing at the bottom (scroll margin), and on window resize / pane resize via the splitter / maximise / restore. 15. Switching HTML ↔ CSS preserves scroll, caret and undo per tab (A4). 16. Mobile (≤ 1024 px tab layout): the editor fills its pane, on-screen keyboard doesn't hide the caret (use `visualViewport` / `scrollIntoView` margins), no page scroll trap, touch selection handles work. 17. Zoom 200 % and 400 % (reflow): toolbar wraps, editor remains usable. 18. High-contrast / forced-colours mode: caret, selection, active line, gutters, popup remain visible (`forced-colors` media query adjustments; don't rely on background colour alone).

**Content edge cases** 19. Empty document; single-line 100 k-char minified HTML (performance: no freeze; fallback to disabling highlight past a threshold with a notice). 20. Unclosed tags, unmatched quotes, stray `<`, `<!DOCTYPE>`, comments (`<!-- -->`), CDATA, `<svg>`/`<math>` namespaces, custom elements (`<my-el>`), boolean/unquoted attributes, attribute values containing `>` or newlines, entities, `<textarea>`/`<pre>` whitespace, templates `<template>`. 21. `<script>` containing `</` strings and template literals; `<style>` with `}` in strings; inline `style="…"`. 22. Very long lines with wrapping on and off; tabs vs spaces mixed; CRLF documents. 23. Non-BMP characters (emoji) and combining marks: caret moves by grapheme, Backspace deletes a whole grapheme cluster.

**State & integration** 24. External updates while the user is typing (template click, auto-fix, ARIA attribute edit): applied via minimal diff, caret mapped, no lost keystrokes (the library defers updates during typing — keep that behaviour). 25. Two quick external updates in a row do not clobber each other. 26. Element ↔ source sync: clicking a tree node/preview element **scrolls** to and **highlights** its source without moving the caret or stealing focus; "Show in code" button moves caret + focuses; caret movement selects the element in the tree without any write-back (A1). 27. Selection of an element that was deleted: highlight cleared, no exception. 28. Reload with saved session: content restored, scroll at top, no hydration warning (keep the `ssr:false` boundary). 29. Oversize doc (> 200 KB): editing remains responsive, analysis paused with a notice, no crash. 30. Settings (font size, tab size, wrap, line numbers, autocomplete, indent-with-tab) persist, apply live without reconfiguring the whole editor (A2), and survive reload.

**Accessibility** 31. Editor has an accessible name, role `textbox`, `aria-multiline`, and a visible focus ring ≥ 3:1. 32. No keyboard trap: `Esc` then `Tab` leaves; shortcut is documented in the status bar and announced. 33. Completion popup, search panel, shortcuts dialog and diagnostics tooltip are screen-reader operable; live-region messages are polite and not repeated per keystroke. 34. Respect `prefers-reduced-motion` (no animated scrolling; `EditorView.scrollIntoView` instant). 35. Text-spacing override (SC 1.4.12) doesn't clip text in gutters or the status bar. 36. axe: zero violations on `/playground` with the editor focused and with the completion popup open.

---

# PART D — Tests (required)

**Unit (Vitest + jsdom, using a real `EditorView` — no DOM mocks of CodeMirror):**

- `applyExternalValue` minimal-diff: prefix/suffix cases, selection mapping, no change when equal.
- Reveal command: dispatches a scroll effect + decoration and leaves `state.selection` **unchanged**.
- Caret→node mapping throttle and "no echo" guard.
- Compartments: changing tab size/wrap/font size does not recreate the view and does not change the document.
- Completion sources return `null` outside their context and never throw on malformed HTML.

**E2E (Playwright, real Chromium; also run on WebKit and Firefox for scrolling and IME):**

1. **A1 regression:** type `<p>hi</p>`, wait 600 ms (debounce + parse), assert the selection is still a collapsed caret at the end and that typing `x` appends rather than replacing a tag; then Backspace removes exactly one character.
2. **Scroll:** load a template, paste 600 lines, `mouse.wheel` → `scrollTop` increases; `Control+End` reaches the last line; the editor's bounding box height ≤ the pane's.
3. **Tab switch:** scroll HTML to line 300, switch to CSS and back → same scroll and caret; undo history intact.
4. **Keymap suite:** each row of the B1 table.
5. **Auto-close/type-over/backspace-pair** sequences from Part C 2.
6. **Completion:** `<bu` + Tab → `<button`; `aria-` list appears; `Esc` closes; no popup in comments.
7. **Paste/drag** cases from Part C 7–8.
8. **Element sync:** click an element in the preview → editor scrolls and highlights, caret unchanged, focus unchanged; move the caret into a different tag → the tree selection updates, the editor selection does not change.
9. **Mobile viewport (390×844):** type, scroll, switch panes.
10. **axe-core** on `/playground` (editor focused; popup open; search panel open; shortcuts dialog open).
11. **Performance:** 5,000-line document: key-to-paint p95 < 50 ms for typing in the middle; no long task > 200 ms during a 10-second typing script (use `PerformanceObserver` `longtask`).

A phase is done only when `lint`, `tsc --noEmit`, unit tests and the E2E suite all pass on CI.

---

# PART E — Suggested structure after the refactor

```
features/playground/editor/
  CodeEditor.tsx              // thin React wrapper, stable props, no business logic
  createEditor.ts             // builds the base extension array once (stable)
  compartments.ts             // language, tabSize/indentUnit, wrap, fontSize, autocomplete, readOnly, label
  extensions/
    keymap.ts                 // B1 table
    reveal.ts                 // StateField + effect for "reveal element" (A1)
    external-value.ts         // applyExternalValue (A5)
    diagnostics.ts            // lint source from findings (B7)
    format.ts                 // prettier standalone (B5)
    status.ts                 // Ln/Col/selection listener (throttled)
    theme.ts                  // existing, plus forced-colors rules
    completions/              // existing sources
  EditorStatusBar.tsx         // Ln/Col, indent, wrap, language
  ShortcutsDialog.tsx
  useEditorSettings.ts        // existing
```

`PlaygroundView` passes only: `value`, `onChange` (stable), `language`, `revealRequest`, `diagnostics`, `settings`.

# PART F — Acceptance criteria

- No implicit caret/selection changes by the app code, ever (A1 test passes).
- The editor reconfigures **zero** times while typing (A2 test passes).
- Long documents scroll with wheel, keyboard and scrollbar in all three layouts (desktop split, maximised, mobile).
- Backspace/Delete behave like VS Code in every Part C case.
- Tab switching and external updates preserve caret, scroll and undo.
- Keyboard table in B1 works; shortcuts dialog lists it.
- HTML with embedded CSS/JS highlights and completes correctly.
- Diagnostics appear inline without moving the caret.
- axe reports 0 violations; no keyboard trap; forced-colours and 400 % zoom usable.
- 5,000-line document stays responsive.
- Docs updated (`docs/editor.md`: architecture, compartments, reveal model, how to add a completion source, keyboard map).

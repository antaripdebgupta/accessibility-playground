# Accessibility Playground Code Editor Architecture

This document describes the CodeMirror 6 editor architecture, state management, extension design, keyboard map, and completion extension guide for the Accessibility Playground.

---

## 1. Architecture Overview

The editor is built with CodeMirror 6 and `@uiw/react-codemirror` in Next.js 16 / React 19.

### Key Directory Structure

```
src/features/playground/
  CodeEditor.tsx                # Thin React wrapper with stable props and Compartment updates
  Editor.tsx                    # Multi-mode editor container (HTML/CSS tabs, toolbar, status bar)
  PlaygroundView.tsx            # Host workbench view orchestrating AST, preview, and selection
  editor/
    compartments.ts             # Dynamic compartments (language, tabSize, fontSize, wrap, autocompletion, etc.)
    createEditor.ts             # Referentially stable base extensions array assembler
    EditorStatusBar.tsx         # VS Code parity status bar (Ln, Col, selection, encoding, language, shortcuts)
    ShortcutsDialog.tsx         # Accessible dialog listing all keyboard shortcuts (F1 / ?)
    useEditorSettings.ts        # Persistent editor settings hook (storage synced)
    extensions/
      reveal.ts                 # One-shot element reveal StateField & decoration (no caret hijacking)
      external-value.ts         # applyExternalValue minimal diff synchronization
      diagnostics.ts            # @codemirror/lint integration with a11y findings and quick fixes
      format.ts                 # Prettier standalone formatter with cursor mapping
      keymaps.ts                # VS Code keymap table and bracket/quote selection wrapping
      status.ts                 # Throttled Ln/Col and selection length tracker
      theme.ts                  # High-contrast, WCAG 2.2 AA compliant theme + forced-colors support
      completions/              # Custom completion sources (ARIA, ID refs, a11y snippets, Tailwind, CSS)
```

---

## 2. Root Cause Fixes & Stability

### A1: One-Shot Reveal Model vs Selection Feedback Loop

- **Problem**: Previous implementations moved the user's caret (`selection: { anchor, head }`) on every debounced re-parse whenever an AST node was selected. When typing, after 400ms pause, the AST re-parsed, triggering an effect that replaced the user's cursor with the element's tag. Typing or pressing Backspace then destroyed the entire tag.
- **Solution**: The user's caret is strictly owned by the user. Programmatic element selection from the preview, tree, or issues tab dispatches an explicit `revealRange` command using `StateField` and `Decoration.mark({ class: "cm-a11y-selected" })` with `EditorView.scrollIntoView`. `view.state.selection` is **never** altered by programmatic selection.
- **Clearing**: The decoration automatically clears on Escape key, when the document changes in the highlighted region, or when the user moves their cursor.

### A2: Extension Compartments & Reconfigure Elimination

- `@uiw/react-codemirror` previously reconfigured the entire extension tree on every keystroke because inline callback functions changed identity.
- **Solution**: Base extensions are assembled **once** with empty dependency array using `createEditorBaseExtensions`. Dynamic settings (language, tab size, font size, line wrapping, line numbers, autocomplete, indent with tab, aria-label) are isolated in `@codemirror/state` `Compartment` instances. When a setting changes, only its specific compartment is reconfigured via `view.dispatch({ effects: comp.reconfigure(...) })`.
- **Decoupled Callbacks**: An `EventTarget` bus decouples events from render cycles, ensuring zero ref accesses during render and 100% compliance with React 19 rules.

### A3: Pane Height & Scrolling

- CodeMirror is given `height="100%"` with ancestors explicitly having `h-full min-h-0`.
- `.cm-scroller` has `overflow: auto` and `overscroll-behavior: contain`.

### A4: Tab Preservation & Measuring

- Inactive editor tabs (HTML / CSS) are not unmounted or hidden with `display: none` (which breaks CodeMirror geometry measurement).
- They use `invisible absolute inset-0 pointer-events-none` with `inert` and `aria-hidden="true"`.
- This preserves undo/redo history, scroll position, and selection per tab.

### A5: Minimal Diff External Value Updates

- When external changes occur (template loads, snippets, auto-fix), `applyExternalValue` computes the common prefix and suffix.
- It dispatches a single minimal change transaction annotated with `isExternalChange`, mapping existing caret position smoothly without resetting scroll or selection.

---

## 3. Keyboard Map (VS Code Parity)

| Action                        | Shortcut (macOS / Windows / Linux)      | Command Source                               |
| ----------------------------- | --------------------------------------- | -------------------------------------------- |
| **Rescan Accessibility**      | `Cmd+Enter` / `Ctrl+Enter`              | Playground scan trigger                      |
| **Format Document**           | `Shift+Alt+F`                           | Prettier standalone                          |
| **Quick Fix**                 | `Cmd+.` / `Ctrl+.`                      | CodeMirror diagnostic action                 |
| **Next / Prev Diagnostic**    | `F8` / `Shift+F8`                       | `@codemirror/lint`                           |
| **Undo / Redo**               | `Cmd+Z` / `Cmd+Shift+Z` (`Ctrl+Y`)      | `@codemirror/commands` history               |
| **Select All**                | `Cmd+A` / `Ctrl+A`                      | `selectAll`                                  |
| **Delete Line**               | `Cmd+Shift+K` / `Ctrl+Shift+K`          | `deleteLine`                                 |
| **Move Line Up / Down**       | `Alt+↑` / `Alt+↓`                       | `moveLineUp` / `moveLineDown`                |
| **Copy Line Up / Down**       | `Shift+Alt+↑` / `Shift+Alt+↓`           | `copyLineUp` / `copyLineDown`                |
| **Insert Line Below**         | `Cmd+Alt+Enter` / `Ctrl+Alt+Enter`      | Line break insertion below                   |
| **Insert Line Above**         | `Cmd+Shift+Enter` / `Ctrl+Shift+Enter`  | Line break insertion above                   |
| **Indent / Outdent**          | `Tab` / `Shift+Tab`, `Cmd+]` / `Cmd+[`  | `indentMore` / `indentLess`                  |
| **Toggle Comment**            | `Cmd+/` / `Ctrl+/`                      | `toggleComment` (`<!-- -->` / `/* */`)       |
| **Toggle Block Comment**      | `Shift+Alt+A`                           | `toggleBlockComment`                         |
| **Select Next Occurrence**    | `Cmd+D` / `Ctrl+D`                      | `selectNextOccurrence`                       |
| **Select All Occurrences**    | `Cmd+Shift+L` / `Ctrl+Shift+L`          | `selectSelectionMatches`                     |
| **Find / Replace**            | `Cmd+F` / `Cmd+H` (`Ctrl+F` / `Ctrl+H`) | `openSearchPanel`                            |
| **Find Next / Previous**      | `F3` / `Shift+F3`                       | `findNext` / `findPrevious`                  |
| **Add Cursor Above / Below**  | `Cmd+Alt+↑` / `Cmd+Alt+↓`               | `addCursorAbove` / `addCursorBelow`          |
| **Expand / Shrink Selection** | `Shift+Alt+→` / `Shift+Alt+←`           | `selectParentSyntax` / `simplifySelection`   |
| **Jump to Matching Bracket**  | `Cmd+Shift+\` / `Ctrl+Shift+\`          | `cursorMatchingBracket`                      |
| **Go to Line**                | `Cmd+G` / `Ctrl+G`                      | `gotoLine`                                   |
| **Fold / Unfold Code**        | `Cmd+Shift+[` / `Cmd+Shift+]`           | `foldCode` / `unfoldCode`                    |
| **Fold / Unfold All**         | `Cmd+Alt+[` / `Cmd+Alt+]`               | `foldAll` / `unfoldAll`                      |
| **Delete Word Left / Right**  | `Cmd+Backspace` / `Cmd+Delete`          | `deleteGroupBackward` / `deleteGroupForward` |
| **Trigger Autocomplete**      | `Ctrl+Space`                            | `startCompletion`                            |
| **Exit Editor (No Trap)**     | `Esc` then `Tab`                        | Accessible focus exit                        |
| **Open Shortcuts Dialog**     | `F1` or Toolbar `Help`                  | `ShortcutsDialog` modal                      |

---

## 4. How to Add a Completion Source

All completion sources live in `src/features/playground/editor/extensions/completions/`.

To add a new completion source:

1. Create a function matching `(ctx: CompletionContext) => CompletionResult | null`:

   ```ts
   import type {
     CompletionContext,
     CompletionResult,
   } from "@codemirror/autocomplete";

   export function myCustomCompletionSource(
     ctx: CompletionContext
   ): CompletionResult | null {
     // 1. Return null quickly if outside desired context
     const word = ctx.matchBefore(/my-prefix:[\w-]*/);
     if (!word && !ctx.explicit) return null;

     // 2. Return completions with range, options, and validation regex
     return {
       from: word ? word.from : ctx.pos,
       options: [
         {
           label: "my-prefix:example",
           type: "keyword",
           detail: "Example suggestion",
         },
       ],
       validFor: /^my-prefix:[\w-]*$/,
     };
   }
   ```

2. Register the source in `createEditor.ts` under `createHtmlLanguageExtension` or `createCssLanguageExtension`:

   ```ts
   htmlLanguage.data.of({
     autocomplete: myCustomCompletionSource,
   });
   ```

3. Ensure:
   - Return `null` immediately when outside context (e.g. inside comments or unrelated tags).
   - Never throw exceptions on malformed HTML/CSS.
   - Limit regex searches to the local context (`ctx.matchBefore`) rather than scanning the entire document per keystroke.

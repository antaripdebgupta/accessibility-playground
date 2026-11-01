import { keymap, type KeyBinding, EditorView } from "@codemirror/view";
import {
  undo,
  redo,
  selectAll,
  deleteLine,
  moveLineUp,
  moveLineDown,
  copyLineUp,
  copyLineDown,
  indentMore,
  indentLess,
  toggleComment,
  toggleBlockComment,
  addCursorAbove,
  addCursorBelow,
  selectParentSyntax,
  simplifySelection,
  cursorMatchingBracket,
  cursorLineBoundaryBackward,
  deleteGroupBackward,
  deleteGroupForward,
} from "@codemirror/commands";
import {
  selectNextOccurrence,
  selectSelectionMatches,
  openSearchPanel,
  closeSearchPanel,
  findNext,
  findPrevious,
  gotoLine,
} from "@codemirror/search";
import { foldCode, unfoldCode, foldAll, unfoldAll } from "@codemirror/language";
import { startCompletion } from "@codemirror/autocomplete";
import { clearRevealEffect } from "./reveal";

export interface CreateKeymapsOptions {
  onForceScan?: () => void;
  onFormat?: (view: EditorView) => void;
  onEscapeAnnounce?: (msg: string) => void;
  onOpenShortcuts?: () => void;
}

let escapeArmed = false;

export function resetEscapeArmed() {
  escapeArmed = false;
}

export function isEscapeArmed() {
  return escapeArmed;
}

/**
 * Keymap covering the full VS Code parity table (Part B1).
 */
export function createEditorKeymaps(options: CreateKeymapsOptions = {}) {
  const bindings: KeyBinding[] = [
    // 1. Accessibility Rescan
    {
      key: "Mod-Enter",
      run: () => {
        options.onForceScan?.();
        return true;
      },
    },

    // 2. Format Document (Shift-Alt-f)
    {
      key: "Shift-Alt-f",
      run: (view) => {
        options.onFormat?.(view);
        return true;
      },
    },

    // 3. Undo / Redo
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-Shift-z", run: redo, preventDefault: true },
    { key: "Ctrl-y", run: redo, preventDefault: true, mac: "" },

    // 4. Select All
    { key: "Mod-a", run: selectAll, preventDefault: true },

    // 5. Delete Line
    { key: "Mod-Shift-k", run: deleteLine, preventDefault: true },

    // 6. Move Line Up / Down
    { key: "Alt-ArrowUp", run: moveLineUp, preventDefault: true },
    { key: "Alt-ArrowDown", run: moveLineDown, preventDefault: true },

    // 7. Copy Line Up / Down
    { key: "Shift-Alt-ArrowUp", run: copyLineUp, preventDefault: true },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown, preventDefault: true },

    // 8. Insert Line Below / Above
    {
      key: "Mod-Alt-Enter",
      run: (view) => {
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        view.dispatch({
          changes: { from: line.to, insert: "\n" },
          selection: { anchor: line.to + 1 },
          scrollIntoView: true,
        });
        return true;
      },
      preventDefault: true,
    },
    {
      key: "Mod-Shift-Enter",
      run: (view) => {
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        view.dispatch({
          changes: { from: line.from, insert: "\n" },
          selection: { anchor: line.from },
          scrollIntoView: true,
        });
        return true;
      },
      preventDefault: true,
    },

    // 9. Indent / Outdent
    { key: "Mod-]", run: indentMore, preventDefault: true },
    { key: "Mod-[", run: indentLess, preventDefault: true },

    // 10. Toggle Comments
    { key: "Mod-/", run: toggleComment, preventDefault: true },
    { key: "Shift-Alt-a", run: toggleBlockComment, preventDefault: true },

    // 11. Search & Selection Matches
    { key: "Mod-d", run: selectNextOccurrence, preventDefault: true },
    { key: "Mod-Shift-l", run: selectSelectionMatches, preventDefault: true },
    { key: "Mod-f", run: openSearchPanel, preventDefault: true },
    { key: "Mod-h", run: openSearchPanel, preventDefault: true },
    { key: "F3", run: findNext, preventDefault: true },
    { key: "Shift-F3", run: findPrevious, preventDefault: true },

    // 12. Add Cursor
    { key: "Mod-Alt-ArrowUp", run: addCursorAbove, preventDefault: true },
    { key: "Mod-Alt-ArrowDown", run: addCursorBelow, preventDefault: true },

    // 13. Expand / Shrink Selection
    {
      key: "Shift-Alt-ArrowRight",
      run: selectParentSyntax,
      preventDefault: true,
    },
    {
      key: "Shift-Alt-ArrowLeft",
      run: simplifySelection,
      preventDefault: true,
    },

    // 14. Go to Line
    { key: "Mod-g", run: gotoLine, preventDefault: true },
    { key: "Ctrl-g", run: gotoLine, preventDefault: true },

    // 15. Fold / Unfold
    { key: "Mod-Shift-[", run: foldCode, preventDefault: true },
    { key: "Mod-Shift-]", run: unfoldCode, preventDefault: true },
    { key: "Mod-Alt-[", run: foldAll, preventDefault: true },
    { key: "Mod-Alt-]", run: unfoldAll, preventDefault: true },

    // 16. Matching Bracket
    { key: "Mod-Shift-\\", run: cursorMatchingBracket, preventDefault: true },

    // 17. Smart Home
    { key: "Home", run: cursorLineBoundaryBackward },

    // 18. Delete Word Left / Right
    { key: "Mod-Backspace", run: deleteGroupBackward, preventDefault: true },
    { key: "Mod-Delete", run: deleteGroupForward, preventDefault: true },

    // 19. Autocomplete Trigger
    { key: "Ctrl-Space", run: startCompletion, preventDefault: true },

    // 20. Help / Shortcuts Dialog
    {
      key: "F1",
      run: () => {
        options.onOpenShortcuts?.();
        return true;
      },
    },

    // 21. Cut/Copy Line when selection is empty (VS Code parity)
    {
      key: "Mod-c",
      run: (view) => {
        if (!view.state.selection.main.empty) return false;
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(line.text + "\n").catch(() => {});
        }
        return true;
      },
    },
    {
      key: "Mod-x",
      run: (view) => {
        if (!view.state.selection.main.empty) return false;
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(line.text + "\n").catch(() => {});
        }
        deleteLine(view);
        return true;
      },
    },

    // 22. Escape handling: clears reveal highlight, closes search, arms Esc-then-Tab
    {
      key: "Escape",
      run: (view) => {
        view.dispatch({ effects: clearRevealEffect.of() });
        closeSearchPanel(view);
        escapeArmed = true;
        options.onEscapeAnnounce?.("Tab will exit the editor.");
        return true;
      },
    },
  ];

  return keymap.of(bindings);
}

/**
 * Wraps selection when typing quotes, brackets, or angle brackets.
 */
export function handleWrapSelection(
  view: EditorView,
  _from: number,
  _to: number,
  text: string
): boolean {
  if (view.state.selection.main.empty) return false;

  const pairs: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
    "`": "`",
    "<": ">",
  };

  const close = pairs[text];
  if (!close) return false;

  const sel = view.state.selection.main;
  const selectedText = view.state.sliceDoc(sel.from, sel.to);

  view.dispatch({
    changes: {
      from: sel.from,
      to: sel.to,
      insert: text + selectedText + close,
    },
    selection: { anchor: sel.from + 1, head: sel.to + 1 },
    userEvent: "input.wrap",
  });

  return true;
}

export const wrapSelectionInputHandler =
  EditorView.inputHandler.of(handleWrapSelection);

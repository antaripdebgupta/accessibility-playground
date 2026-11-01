import { Annotation } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

/**
 * Annotation used on transactions triggered by external value updates
 * so that update listeners know not to echo the change back to the parent.
 */
export const isExternalChange = Annotation.define<boolean>();

export interface ApplyExternalValueOptions {
  isFullReplace?: boolean;
}

/**
 * Minimal diff computation between current doc and nextValue.
 * Returns { from, to, insert } representing the single minimal change,
 * or null if identical.
 */
export function computeMinimalDiff(
  current: string,
  next: string
): { from: number; to: number; insert: string } | null {
  if (current === next) return null;

  const prevLen = current.length;
  const nextLen = next.length;

  let prefix = 0;
  while (
    prefix < prevLen &&
    prefix < nextLen &&
    current.charCodeAt(prefix) === next.charCodeAt(prefix)
  ) {
    prefix++;
  }

  let suffix = 0;
  while (
    suffix < prevLen - prefix &&
    suffix < nextLen - prefix &&
    current.charCodeAt(prevLen - 1 - suffix) ===
      next.charCodeAt(nextLen - 1 - suffix)
  ) {
    suffix++;
  }

  const from = prefix;
  const to = prevLen - suffix;
  const insert = next.slice(prefix, nextLen - suffix);

  return { from, to, insert };
}

/**
 * Applies an external value change to the EditorView using a minimal diff
 * or a full replacement (for templates / snippets).
 * Preserves and maps the user's caret and scroll position.
 */
export function applyExternalValue(
  view: EditorView,
  nextValue: string,
  options?: ApplyExternalValueOptions
): boolean {
  const currentDoc = view.state.doc.toString();
  if (currentDoc === nextValue) {
    return false;
  }

  const prevLen = currentDoc.length;

  if (options?.isFullReplace) {
    view.dispatch({
      changes: { from: 0, to: prevLen, insert: nextValue },
      selection: { anchor: 0 },
      scrollIntoView: true,
      annotations: [isExternalChange.of(true)],
    });
    return true;
  }

  const diff = computeMinimalDiff(currentDoc, nextValue);
  if (!diff) return false;

  const tr = view.state.update({
    changes: diff,
    annotations: [isExternalChange.of(true)],
  });

  view.dispatch(tr);
  return true;
}

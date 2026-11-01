import { StateField, StateEffect } from "@codemirror/state";
import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";

export interface RevealTarget {
  from: number;
  to: number;
}

export const setRevealEffect = StateEffect.define<RevealTarget | null>();
export const clearRevealEffect = StateEffect.define<void>();

export const revealDecoration = Decoration.mark({
  class: "cm-a11y-selected",
});

export const revealStateField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    // 1. Check for explicit set/clear effects
    for (const effect of tr.effects) {
      if (effect.is(setRevealEffect)) {
        if (!effect.value) {
          return Decoration.none;
        }
        const { from, to } = effect.value;
        const docLength = tr.newDoc.length;
        const validFrom = Math.max(0, Math.min(from, docLength));
        const validTo = Math.max(validFrom, Math.min(to, docLength));
        if (validFrom === validTo) {
          return Decoration.none;
        }
        return Decoration.set([revealDecoration.range(validFrom, validTo)]);
      }
      if (effect.is(clearRevealEffect)) {
        return Decoration.none;
      }
    }

    // 2. Clear if doc changed touches the range
    if (tr.docChanged && decorations.size > 0) {
      let shouldClear = false;
      decorations.between(0, tr.startState.doc.length, (from, to) => {
        tr.changes.iterChanges((chFrom, chTo) => {
          if (chFrom <= to && chTo >= from) {
            shouldClear = true;
          }
        });
      });
      if (shouldClear) {
        return Decoration.none;
      }
      return decorations.map(tr.changes);
    }

    // 3. Clear on user selection changes (when selection changed and not programmatic reveal effect)
    if (
      Boolean(tr.selection) &&
      decorations.size > 0 &&
      !tr.effects.some((e) => e.is(setRevealEffect))
    ) {
      return Decoration.none;
    }

    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/**
 * Reveal a source range in the editor:
 * Scrolls the range into view with margin and decorates it,
 * WITHOUT moving or overwriting the user's cursor / selection.
 */
export function revealRange(
  view: EditorView,
  range: readonly [number, number],
  focus?: boolean
): void {
  const [start, end] = range;
  const docLength = view.state.doc.length;
  const validStart = Math.max(0, Math.min(start, docLength));
  const validEnd = Math.max(validStart, Math.min(end, docLength));

  if (validStart >= docLength && validEnd >= docLength) return;

  view.dispatch({
    effects: [
      setRevealEffect.of({ from: validStart, to: validEnd }),
      EditorView.scrollIntoView(validStart, { y: "nearest", yMargin: 24 }),
    ],
  });

  if (focus) {
    view.focus();
  }
}

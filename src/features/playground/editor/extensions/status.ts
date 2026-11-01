import { EditorView, type ViewUpdate } from "@codemirror/view";

export interface EditorStatusState {
  line: number;
  col: number;
  selectionLength: number;
}

export function computeEditorStatus(view: EditorView): EditorStatusState {
  const selection = view.state.selection.main;
  const lineObj = view.state.doc.lineAt(selection.head);
  const line = lineObj.number;
  const col = selection.head - lineObj.from + 1;
  const selectionLength = Math.abs(selection.head - selection.anchor);

  return { line, col, selectionLength };
}

export function createStatusListener(
  onStatusChange: (status: EditorStatusState) => void,
  throttleMs = 100
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastUpdate: ViewUpdate | null = null;

  return EditorView.updateListener.of((update) => {
    if (update.selectionSet || update.docChanged) {
      lastUpdate = update;
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          if (lastUpdate) {
            onStatusChange(computeEditorStatus(lastUpdate.view));
            lastUpdate = null;
          }
        }, throttleMs);
      }
    }
  });
}

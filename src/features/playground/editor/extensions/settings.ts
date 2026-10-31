import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export const tabIndentCompartment = new Compartment();
export const wrapCompartment = new Compartment();
export const fontSizeCompartment = new Compartment();
export const autocompleteCompartment = new Compartment();

export function createFontSizeExtension(fontSizePx: number) {
  return EditorView.theme({
    "&": {
      fontSize: `${fontSizePx}px`,
    },
  });
}

import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

export const languageCompartment = new Compartment();
export const tabSizeCompartment = new Compartment();
export const indentUnitCompartment = new Compartment();
export const wrapCompartment = new Compartment();
export const fontSizeCompartment = new Compartment();
export const autocompleteCompartment = new Compartment();
export const lineNumbersCompartment = new Compartment();
export const ariaLabelCompartment = new Compartment();
export const indentWithTabCompartment = new Compartment();
export const readOnlyCompartment = new Compartment();
export const lintCompartment = new Compartment();

export function createFontSizeExtension(fontSizePx: number) {
  return EditorView.theme({
    "&": {
      fontSize: `${fontSizePx}px`,
    },
  });
}

export function createTabSizeExtension(tabSize: number) {
  return [EditorState.tabSize.of(tabSize), indentUnit.of(" ".repeat(tabSize))];
}

export function createAriaLabelExtension(label: string) {
  return EditorView.contentAttributes.of({
    "aria-label": label,
    role: "textbox",
    "aria-multiline": "true",
  });
}

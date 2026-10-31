import { keymap, type KeyBinding } from "@codemirror/view";
import { indentWithTab as indentWithTabCommand } from "@codemirror/commands";

export interface KeymapOptions {
  onForceScan?: () => void;
  indentWithTab?: boolean;
}

export function createEditorKeymaps(options: KeymapOptions) {
  const bindings: KeyBinding[] = [
    {
      key: "Mod-Enter",
      run: () => {
        options.onForceScan?.();
        return true;
      },
    },
  ];

  if (options.indentWithTab) {
    bindings.push(indentWithTabCommand);
  }

  return keymap.of(bindings);
}

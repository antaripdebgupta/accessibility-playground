import type { Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  dropCursor,
  rectangularSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  bracketMatching,
  syntaxHighlighting,
  foldGutter,
} from "@codemirror/language";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
} from "@codemirror/autocomplete";
import { search, highlightSelectionMatches } from "@codemirror/search";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import {
  history,
  historyKeymap,
  defaultKeymap,
  indentMore,
  indentLess,
} from "@codemirror/commands";
import { html as langHtml, htmlLanguage } from "@codemirror/lang-html";
import { css as langCss, cssLanguage } from "@codemirror/lang-css";

import {
  languageCompartment,
  tabSizeCompartment,
  indentUnitCompartment,
  wrapCompartment,
  fontSizeCompartment,
  autocompleteCompartment,
  lineNumbersCompartment,
  ariaLabelCompartment,
  indentWithTabCompartment,
  lintCompartment,
  createFontSizeExtension,
  createTabSizeExtension,
  createAriaLabelExtension,
} from "./compartments";
import { editorTheme, accessibleHighlightStyle } from "./extensions/theme";
import { revealStateField } from "./extensions/reveal";
import { isExternalChange } from "./extensions/external-value";
import {
  createEditorKeymaps,
  wrapSelectionInputHandler,
  isEscapeArmed,
  resetEscapeArmed,
} from "./extensions/keymaps";
import { createStatusListener } from "./extensions/status";
import { ariaCompletionSource } from "./extensions/completions/aria";
import { idRefCompletionSource } from "./extensions/completions/id-refs";
import { a11ySnippetsCompletionSource } from "./extensions/completions/a11y-snippets";
import { cssA11yCompletionSource } from "./extensions/completions/css-a11y";
import { tailwindCompletionSource } from "./extensions/completions/tailwind";
import type { EditorSettings } from "./useEditorSettings";

export function createHtmlLanguageExtension(useTailwind = false): Extension {
  const exts: Extension[] = [
    langHtml({ autoCloseTags: true, matchClosingTags: true }),
    htmlLanguage.data.of({
      autocomplete: ariaCompletionSource,
    }),
    htmlLanguage.data.of({
      autocomplete: idRefCompletionSource,
    }),
    htmlLanguage.data.of({
      autocomplete: a11ySnippetsCompletionSource,
    }),
  ];

  if (useTailwind) {
    exts.push(
      htmlLanguage.data.of({
        autocomplete: tailwindCompletionSource,
      })
    );
  }

  return exts;
}

export function createCssLanguageExtension(): Extension {
  return [
    langCss(),
    cssLanguage.data.of({
      autocomplete: cssA11yCompletionSource,
    }),
  ];
}

export function createAutocompleteExtension(enabled: boolean): Extension {
  if (!enabled) return [];
  return autocompletion({
    activateOnTyping: true,
    maxRenderedOptions: 50,
    icons: false,
    defaultKeymap: true,
  });
}

export function createIndentWithTabExtension(enabled: boolean): Extension {
  if (!enabled) return [];
  return keymap.of([
    {
      key: "Tab",
      run: (view) => {
        if (isEscapeArmed()) {
          resetEscapeArmed();
          return false; // let tab leave editor
        }
        return indentMore(view);
      },
      shift: (view) => {
        if (isEscapeArmed()) {
          resetEscapeArmed();
          return false;
        }
        return indentLess(view);
      },
    },
  ]);
}

export interface CreateEditorOptions {
  language: "html" | "css";
  useTailwind?: boolean;
  settings: EditorSettings;
  indentWithTab?: boolean;
  ariaLabel: string;
  bus?: EventTarget;
}

/**
 * Creates the base extension array once.
 * Everything dynamic is inside a Compartment or emits via EventTarget bus.
 */
export function createEditorBaseExtensions(
  options: CreateEditorOptions
): Extension[] {
  const initialLang =
    options.language === "html"
      ? createHtmlLanguageExtension(options.useTailwind)
      : createCssLanguageExtension();

  const customKeymaps = createEditorKeymaps({
    onForceScan: () => options.bus?.dispatchEvent(new Event("forceScan")),
    onFormat: (view) =>
      options.bus?.dispatchEvent(new CustomEvent("format", { detail: view })),
    onEscapeAnnounce: (msg) =>
      options.bus?.dispatchEvent(
        new CustomEvent("escapeAnnounce", { detail: msg })
      ),
    onOpenShortcuts: () =>
      options.bus?.dispatchEvent(new Event("openShortcuts")),
  });

  return [
    // Core history and editing capabilities
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    foldGutter(),

    // Compartments for dynamic configuration
    languageCompartment.of(initialLang),
    tabSizeCompartment.of(createTabSizeExtension(options.settings.tabSize)),
    indentUnitCompartment.of([]),
    wrapCompartment.of(
      options.settings.lineWrapping ? EditorView.lineWrapping : []
    ),
    fontSizeCompartment.of(createFontSizeExtension(options.settings.fontSize)),
    autocompleteCompartment.of(
      createAutocompleteExtension(options.settings.autocomplete)
    ),
    lineNumbersCompartment.of(
      options.settings.lineNumbers ? lineNumbers() : []
    ),
    ariaLabelCompartment.of(createAriaLabelExtension(options.ariaLabel)),
    indentWithTabCompartment.of(
      createIndentWithTabExtension(options.indentWithTab ?? true)
    ),
    lintCompartment.of([lintGutter()]),

    // Visual theme & highlights
    editorTheme,
    syntaxHighlighting(accessibleHighlightStyle),
    bracketMatching(),
    closeBrackets(),
    highlightSelectionMatches(),
    search({ top: true }),

    // Decorations & input handling
    revealStateField,
    wrapSelectionInputHandler,

    // Keymaps (custom keymap first, then closeBrackets, defaultKeymap, historyKeymap, lintKeymap)
    customKeymaps,
    keymap.of(closeBracketsKeymap),
    keymap.of(defaultKeymap),
    keymap.of(historyKeymap),
    keymap.of(lintKeymap),

    // Reset escape state on any non-Tab keydown
    EditorView.domEventHandlers({
      keydown: (e) => {
        if (e.key !== "Tab" && e.key !== "Escape") {
          resetEscapeArmed();
        }
      },
    }),

    // Throttled status bar updater
    createStatusListener((status) => {
      options.bus?.dispatchEvent(
        new CustomEvent("statusChange", { detail: status })
      );
    }, 100),

    // Document and caret change listener
    EditorView.updateListener.of((update) => {
      // 1. External changes are flagged with isExternalChange annotation; do not echo back
      if (update.docChanged) {
        const isExternal = update.transactions.some((tr) =>
          tr.annotation(isExternalChange)
        );
        if (!isExternal) {
          options.bus?.dispatchEvent(
            new CustomEvent("docChange", {
              detail: update.state.doc.toString(),
            })
          );
        }
      }

      // 2. Caret change (only when selection set and not doc change, and editor is focused)
      if (update.selectionSet && !update.docChanged && update.view.hasFocus) {
        const head = update.state.selection.main.head;
        options.bus?.dispatchEvent(
          new CustomEvent("caretChange", { detail: head })
        );
      }
    }),
  ];
}

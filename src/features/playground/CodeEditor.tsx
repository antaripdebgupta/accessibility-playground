"use client";

import * as React from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { html as langHtml, htmlLanguage } from "@codemirror/lang-html";
import { css as langCss, cssLanguage } from "@codemirror/lang-css";
import { EditorView, ViewPlugin, keymap } from "@codemirror/view";
import { syntaxHighlighting } from "@codemirror/language";
import { autocompletion } from "@codemirror/autocomplete";
import { indentWithTab as indentWithTabCommand } from "@codemirror/commands";

import {
  editorTheme,
  accessibleHighlightStyle,
} from "./editor/extensions/theme";
import { ariaCompletionSource } from "./editor/extensions/completions/aria";
import { idRefCompletionSource } from "./editor/extensions/completions/id-refs";
import { a11ySnippetsCompletionSource } from "./editor/extensions/completions/a11y-snippets";
import { cssA11yCompletionSource } from "./editor/extensions/completions/css-a11y";
import { tailwindCompletionSource } from "./editor/extensions/completions/tailwind";
import { useEditorSettings } from "./editor/useEditorSettings";

export interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "html" | "css";
  selectionRange?: readonly [number, number] | null;
  onCaretChange?: (offset: number) => void;
  onForceScan?: () => void;
  indentWithTab?: boolean;
  ariaLabel: string;
  useTailwind?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  selectionRange,
  onCaretChange,
  onForceScan,
  indentWithTab = false,
  ariaLabel,
  useTailwind = false,
}: CodeEditorProps) {
  const editorRef = React.useRef<ReactCodeMirrorRef>(null);
  const { settings } = useEditorSettings();

  // Sync cursor selection when a node is selected in tree
  React.useEffect(() => {
    if (selectionRange && editorRef.current?.view) {
      const [start, end] = selectionRange;
      const view = editorRef.current.view;
      const docLength = view.state.doc.length;
      if (start >= 0 && end <= docLength && end >= start) {
        view.dispatch({
          selection: { anchor: start, head: end },
          scrollIntoView: true,
        });
      }
    }
  }, [selectionRange]);

  const extensions = React.useMemo(() => {
    const exts = [
      editorTheme,
      syntaxHighlighting(accessibleHighlightStyle),
      settings.lineWrapping ? EditorView.lineWrapping : [],
      EditorView.contentAttributes.of({
        "aria-label": ariaLabel,
      }),
      // Override CodeMirror's internal tabindex="-1" on .cm-scroller so axe
      // does not flag the scrollable region as keyboard-inaccessible (Safari).
      ViewPlugin.define((view) => {
        const scroller = view.dom.querySelector(".cm-scroller");
        scroller?.setAttribute("tabindex", "0");
        return {};
      }),
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onForceScan?.();
            return true;
          },
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.selectionSet && !update.docChanged && onCaretChange) {
          const head = update.state.selection.main.head;
          onCaretChange(head);
        }
      }),
    ];

    if (indentWithTab) {
      exts.push(keymap.of([indentWithTabCommand]));
    }

    if (language === "html") {
      exts.push(
        langHtml({ autoCloseTags: true, matchClosingTags: true }),
        htmlLanguage.data.of({
          autocomplete: ariaCompletionSource,
        }),
        htmlLanguage.data.of({
          autocomplete: idRefCompletionSource,
        }),
        htmlLanguage.data.of({
          autocomplete: a11ySnippetsCompletionSource,
        })
      );
      if (useTailwind) {
        exts.push(
          htmlLanguage.data.of({
            autocomplete: tailwindCompletionSource,
          })
        );
      }
    } else {
      exts.push(
        langCss(),
        cssLanguage.data.of({
          autocomplete: cssA11yCompletionSource,
        })
      );
    }

    if (settings.autocomplete) {
      exts.push(
        autocompletion({
          activateOnTyping: true,
          maxRenderedOptions: 30,
          icons: false,
          defaultKeymap: true, // Enter accept, Esc close, ↑↓ navigate, Ctrl-Space open. (No Tab trap!)
        })
      );
    }

    return exts;
  }, [
    language,
    onCaretChange,
    onForceScan,
    indentWithTab,
    ariaLabel,
    useTailwind,
    settings.autocomplete,
    settings.lineWrapping,
  ]);

  return (
    <div className="relative h-full min-h-0">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={onChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: settings.lineNumbers,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: false,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false, // We control autocompletion through our extension config above
          rectangularSelection: true,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: settings.autocomplete,
          lintKeymap: false,
        }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default CodeEditor;

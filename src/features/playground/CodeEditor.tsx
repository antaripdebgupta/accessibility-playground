"use client";

import * as React from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { html as langHtml } from "@codemirror/lang-html";
import { css as langCss } from "@codemirror/lang-css";
import { EditorView, ViewPlugin, keymap } from "@codemirror/view";
import { indentWithTab as indentWithTabCommand } from "@codemirror/commands";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Accessible syntax highlight style driven by CSS variables for >= 4.5:1 contrast in light & dark modes
const accessibleHighlightStyle = HighlightStyle.define([
  { tag: t.tagName, color: "var(--color-code-tag)", fontWeight: "600" },
  { tag: t.attributeName, color: "var(--color-code-attr)" },
  { tag: t.attributeValue, color: "var(--color-code-val)" },
  { tag: t.string, color: "var(--color-code-val)" },
  { tag: t.angleBracket, color: "var(--color-code-punct)" },
  { tag: t.definitionOperator, color: "var(--color-code-punct)" },
  { tag: t.punctuation, color: "var(--color-code-punct)" },
  { tag: t.comment, color: "var(--color-code-comment)", fontStyle: "italic" },
  { tag: t.propertyName, color: "var(--color-code-attr)" },
  { tag: t.keyword, color: "var(--color-code-tag)", fontWeight: "600" },
  { tag: t.number, color: "var(--color-code-num)" },
  { tag: t.className, color: "var(--color-code-num)" },
  { tag: t.definition(t.propertyName), color: "var(--color-code-attr)" },
]);

const editorTheme = EditorView.theme({
  "&": {
    height: "280px",
    fontSize: "13px",
    fontFamily: "var(--font-mono), monospace",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
  },
  ".cm-content": {
    caretColor: "var(--color-focus-ring)",
    padding: "8px 0",
  },
  "&.cm-focused": {
    outline: "2px solid var(--color-focus-ring) !important",
    outlineOffset: "-1px",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-surface-raised)",
    color: "var(--color-text-secondary)",
    borderRight: "1px solid var(--color-border)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--color-surface-raised)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-surface-raised)",
    color: "var(--color-text-primary)",
    fontWeight: "bold",
  },
});

export interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "html" | "css";
  selectionRange?: readonly [number, number] | null;
  onForceScan?: () => void;
  indentWithTab?: boolean;
  ariaLabel: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  selectionRange,
  onForceScan,
  indentWithTab = false,
  ariaLabel,
}: CodeEditorProps) {
  const editorRef = React.useRef<ReactCodeMirrorRef>(null);

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
      language === "html" ? langHtml() : langCss(),
      editorTheme,
      syntaxHighlighting(accessibleHighlightStyle),
      EditorView.lineWrapping,
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
    ];

    if (indentWithTab) {
      exts.push(keymap.of([indentWithTabCommand]));
    }

    return exts;
  }, [language, onForceScan, indentWithTab, ariaLabel]);

  return (
    <div className="relative">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={onChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: false,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          syntaxHighlighting: false,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: false,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: false,
        }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default CodeEditor;

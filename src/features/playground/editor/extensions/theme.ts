import { HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Accessible syntax highlight style driven by CSS variables for >= 4.5:1 contrast in light & dark modes
export const accessibleHighlightStyle = HighlightStyle.define([
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

export const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    fontFamily: "var(--font-mono), monospace",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
  },
  ".cm-scroller": {
    overflow: "auto",
    overscrollBehavior: "contain",
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
  // Selection decoration for element reveal (WCAG 1.4.1 token color + outline, not color only)
  ".cm-a11y-selected": {
    backgroundColor: "var(--color-accent-subtle)",
    outline: "2px solid var(--color-focus-ring)",
    outlineOffset: "-1px",
    borderRadius: "2px",
  },
  // Accessible completion popup styling (>= 4.5:1 text, >= 3:1 UI)
  ".cm-tooltip-autocomplete": {
    border: "1px solid var(--color-border-strong)",
    backgroundColor: "var(--color-surface-raised)",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    padding: "4px",
    maxWidth: "400px",
  },
  ".cm-tooltip-autocomplete > ul": {
    maxHeight: "220px",
    fontFamily: "var(--font-mono), monospace",
    fontSize: "12px",
  },
  ".cm-tooltip-autocomplete > ul > li": {
    padding: "3px 8px",
    borderRadius: "4px",
    color: "var(--color-text-primary)",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--color-accent-subtle)",
    color: "var(--color-accent-fg, var(--color-text-primary))",
    outline: "none",
  },
  ".cm-completionMatchedText": {
    fontWeight: "700",
    textDecoration: "underline",
    color: "var(--color-accent)",
  },
  ".cm-completionDetail": {
    fontStyle: "italic",
    color: "var(--color-text-secondary)",
    marginLeft: "8px",
  },
  // Search panel styling
  ".cm-search": {
    backgroundColor: "var(--color-surface-raised)",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-mono), monospace",
    fontSize: "12px",
    padding: "6px 8px",
  },
  ".cm-search input": {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    color: "var(--color-text-primary)",
    padding: "2px 6px",
    fontSize: "12px",
    outline: "none",
  },
  ".cm-search input:focus-visible": {
    outline: "2px solid var(--color-focus-ring)",
    borderColor: "var(--color-focus-ring)",
  },
  ".cm-search button": {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    color: "var(--color-text-primary)",
    padding: "2px 8px",
    fontSize: "11px",
    cursor: "pointer",
  },
  ".cm-search button:hover": {
    backgroundColor: "var(--color-surface-sunken)",
  },
  ".cm-search button:focus-visible": {
    outline: "2px solid var(--color-focus-ring)",
  },
  // Lint and diagnostics styling
  ".cm-diagnostic": {
    padding: "4px 8px",
    fontSize: "12px",
    fontFamily: "var(--font-sans), sans-serif",
    borderLeftWidth: "4px",
    borderLeftStyle: "solid",
  },
  ".cm-diagnostic-error": {
    borderLeftColor: "var(--color-danger-default, #ef4444)",
    backgroundColor: "var(--color-surface-raised)",
  },
  ".cm-diagnostic-warning": {
    borderLeftColor: "var(--color-warning-default, #f59e0b)",
    backgroundColor: "var(--color-surface-raised)",
  },
  ".cm-diagnostic-info": {
    borderLeftColor: "var(--color-info-default, #3b82f6)",
    backgroundColor: "var(--color-surface-raised)",
  },
  ".cm-diagnosticAction": {
    marginLeft: "8px",
    padding: "2px 6px",
    fontSize: "11px",
    borderRadius: "3px",
    backgroundColor: "var(--color-accent-subtle)",
    border: "1px solid var(--color-accent)",
    color: "var(--color-text-primary)",
    cursor: "pointer",
  },
  // Forced colors mode (Windows High Contrast / forced-colors: active)
  "@media (forced-colors: active)": {
    ".cm-cursor": {
      borderColor: "CanvasText",
    },
    "&.cm-focused": {
      outline: "2px solid Highlight !important",
    },
    ".cm-a11y-selected": {
      outline: "2px solid Highlight !important",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "Highlight !important",
      color: "HighlightText !important",
    },
    ".cm-activeLine": {
      outline: "1px dotted CanvasText",
    },
    ".cm-search": {
      borderBottom: "1px solid CanvasText",
    },
  },
});

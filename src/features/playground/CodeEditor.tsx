"use client";

import * as React from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView, lineNumbers } from "@codemirror/view";
import type { Diagnostic } from "@codemirror/lint";

import { useEditorSettings } from "./editor/useEditorSettings";
import {
  languageCompartment,
  tabSizeCompartment,
  wrapCompartment,
  fontSizeCompartment,
  autocompleteCompartment,
  lineNumbersCompartment,
  ariaLabelCompartment,
  indentWithTabCompartment,
  createFontSizeExtension,
  createTabSizeExtension,
  createAriaLabelExtension,
} from "./editor/compartments";
import {
  createEditorBaseExtensions,
  createHtmlLanguageExtension,
  createCssLanguageExtension,
  createAutocompleteExtension,
  createIndentWithTabExtension,
} from "./editor/createEditor";
import { revealRange } from "./editor/extensions/reveal";
import { applyExternalValue } from "./editor/extensions/external-value";
import { updateEditorDiagnostics } from "./editor/extensions/diagnostics";
import { formatDocument } from "./editor/extensions/format";
import type { EditorStatusState } from "./editor/extensions/status";

export interface RevealRequest {
  readonly id: number;
  readonly range: readonly [number, number];
  readonly focus?: boolean;
}

export interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "html" | "css";
  revealRequest?: RevealRequest | null;
  /** @deprecated Use revealRequest instead */
  selectionRange?: readonly [number, number] | null;
  onCaretChange?: (offset: number) => void;
  onForceScan?: () => void;
  indentWithTab?: boolean;
  ariaLabel: string;
  useTailwind?: boolean;
  diagnostics?: Diagnostic[];
  onStatusChange?: (status: EditorStatusState) => void;
  onEscapeAnnounce?: (msg: string) => void;
  onOpenShortcuts?: () => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  revealRequest,
  selectionRange,
  onCaretChange,
  onForceScan,
  indentWithTab = true,
  ariaLabel,
  useTailwind = false,
  diagnostics,
  onStatusChange,
  onEscapeAnnounce,
  onOpenShortcuts,
}: CodeEditorProps) {
  const editorRef = React.useRef<ReactCodeMirrorRef>(null);
  const { settings } = useEditorSettings();

  // Stable event bus: decoupled from render, no refs during render
  const [bus] = React.useState(() => new EventTarget());

  React.useEffect(() => {
    const onDocChange = (e: Event) =>
      onChange((e as CustomEvent<string>).detail);
    const onCaret = (e: Event) =>
      onCaretChange?.((e as CustomEvent<number>).detail);
    const onScan = () => onForceScan?.();
    const onFmt = (e: Event) => {
      const view = (e as CustomEvent<EditorView>).detail;
      formatDocument(view, { language, tabSize: settings.tabSize });
    };
    const onStatus = (e: Event) =>
      onStatusChange?.((e as CustomEvent<EditorStatusState>).detail);
    const onEsc = (e: Event) =>
      onEscapeAnnounce?.((e as CustomEvent<string>).detail);
    const onShortcuts = () => onOpenShortcuts?.();

    bus.addEventListener("docChange", onDocChange);
    bus.addEventListener("caretChange", onCaret);
    bus.addEventListener("forceScan", onScan);
    bus.addEventListener("format", onFmt);
    bus.addEventListener("statusChange", onStatus);
    bus.addEventListener("escapeAnnounce", onEsc);
    bus.addEventListener("openShortcuts", onShortcuts);

    return () => {
      bus.removeEventListener("docChange", onDocChange);
      bus.removeEventListener("caretChange", onCaret);
      bus.removeEventListener("forceScan", onScan);
      bus.removeEventListener("format", onFmt);
      bus.removeEventListener("statusChange", onStatus);
      bus.removeEventListener("escapeAnnounce", onEsc);
      bus.removeEventListener("openShortcuts", onShortcuts);
    };
  }, [
    bus,
    onChange,
    onCaretChange,
    onForceScan,
    language,
    settings.tabSize,
    onStatusChange,
    onEscapeAnnounce,
    onOpenShortcuts,
  ]);

  // Base extensions assembled ONCE for the lifetime of this component
  const extensions = React.useMemo(() => {
    return createEditorBaseExtensions({
      language,
      useTailwind,
      settings,
      indentWithTab,
      ariaLabel,
      bus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);

  // Minimal-diff external value sync (Part A5)
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view && view.state.doc.toString() !== value) {
      applyExternalValue(view, value);
    }
  }, [value]);

  // One-shot reveal command (Part A1)
  const lastRevealIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (revealRequest && revealRequest.id !== lastRevealIdRef.current) {
      lastRevealIdRef.current = revealRequest.id;
      const view = editorRef.current?.view;
      if (view) {
        revealRange(view, revealRequest.range, revealRequest.focus);
      }
    }
  }, [revealRequest]);

  // Handle deprecated selectionRange prop (only if revealRequest not provided)
  const lastSelectionRangeRef = React.useRef<readonly [number, number] | null>(
    null
  );
  React.useEffect(() => {
    if (
      !revealRequest &&
      selectionRange &&
      selectionRange !== lastSelectionRangeRef.current
    ) {
      lastSelectionRangeRef.current = selectionRange;
      const view = editorRef.current?.view;
      if (view) {
        revealRange(view, selectionRange, false);
      }
    }
  }, [revealRequest, selectionRange]);

  // Diagnostics sync (Part B7)
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view && diagnostics) {
      updateEditorDiagnostics(view, diagnostics);
    }
  }, [diagnostics]);

  // Dynamic Compartment updates (Part A2)
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      const nextLang =
        language === "html"
          ? createHtmlLanguageExtension(useTailwind)
          : createCssLanguageExtension();
      view.dispatch({
        effects: languageCompartment.reconfigure(nextLang),
      });
    }
  }, [language, useTailwind]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: tabSizeCompartment.reconfigure(
          createTabSizeExtension(settings.tabSize)
        ),
      });
    }
  }, [settings.tabSize]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: fontSizeCompartment.reconfigure(
          createFontSizeExtension(settings.fontSize)
        ),
      });
    }
  }, [settings.fontSize]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: wrapCompartment.reconfigure(
          settings.lineWrapping ? EditorView.lineWrapping : []
        ),
      });
    }
  }, [settings.lineWrapping]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: lineNumbersCompartment.reconfigure(
          settings.lineNumbers ? lineNumbers() : []
        ),
      });
    }
  }, [settings.lineNumbers]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: autocompleteCompartment.reconfigure(
          createAutocompleteExtension(settings.autocomplete)
        ),
      });
    }
  }, [settings.autocomplete]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: indentWithTabCompartment.reconfigure(
          createIndentWithTabExtension(indentWithTab)
        ),
      });
    }
  }, [indentWithTab]);

  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view) {
      view.dispatch({
        effects: ariaLabelCompartment.reconfigure(
          createAriaLabelExtension(ariaLabel)
        ),
      });
    }
  }, [ariaLabel]);

  // Stable empty onChange for CodeMirror so @uiw/react-codemirror never reconfigures
  const handleStableCodeMirrorChange = React.useCallback(() => {}, []);

  return (
    <div className="relative h-full min-h-0 flex-1">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={handleStableCodeMirrorChange}
        extensions={extensions}
        basicSetup={false}
        height="100%"
        className="h-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default CodeEditor;

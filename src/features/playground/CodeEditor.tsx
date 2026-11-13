"use client";

import * as React from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView, lineNumbers } from "@codemirror/view";
import type { Diagnostic } from "@codemirror/lint";

import { useEditorSettings } from "./editor/useEditorSettings";
import { useCompartment } from "./editor/useCompartment";
import { useLatest } from "@/hooks/useLatest";
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

export type ExternalEdit =
  | { readonly id: number; readonly kind: "replace"; readonly text: string }
  | { readonly id: number; readonly kind: "patch"; readonly text: string };

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "html" | "css";
  externalEdit?: ExternalEdit | null;
  revealRequest?: RevealRequest | null;
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

function CodeEditor({
  value,
  onChange,
  language,
  externalEdit,
  revealRequest,
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
  const [initialValue] = React.useState(value);
  const lastExternalEditIdRef = React.useRef<number | null>(
    externalEdit?.id ?? null
  );

  // Stable event bus: decoupled from render, no refs during render
  const [bus] = React.useState(() => new EventTarget());

  // Keep volatile callbacks and values in a latest ref to avoid listener churn
  const latestCallbacks = useLatest({
    onChange,
    onCaretChange,
    onForceScan,
    onStatusChange,
    onEscapeAnnounce,
    onOpenShortcuts,
    language,
    tabSize: settings.tabSize,
  });

  // Effect 1: Event bus subscriptions (attached once, routes to latest callbacks)
  React.useEffect(() => {
    const onDocChange = (e: Event) => {
      const val = (e as CustomEvent<string>).detail;
      latestCallbacks.current.onChange(val);
    };
    const onCaret = (e: Event) =>
      latestCallbacks.current.onCaretChange?.(
        (e as CustomEvent<number>).detail
      );
    const onScan = () => latestCallbacks.current.onForceScan?.();
    const onFmt = (e: Event) => {
      const view = (e as CustomEvent<EditorView>).detail;
      formatDocument(view, {
        language: latestCallbacks.current.language,
        tabSize: latestCallbacks.current.tabSize,
      });
    };
    const onStatus = (e: Event) =>
      latestCallbacks.current.onStatusChange?.(
        (e as CustomEvent<EditorStatusState>).detail
      );
    const onEsc = (e: Event) =>
      latestCallbacks.current.onEscapeAnnounce?.(
        (e as CustomEvent<string>).detail
      );
    const onShortcuts = () => latestCallbacks.current.onOpenShortcuts?.();

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
  }, [bus, latestCallbacks]);

  // Base extensions assembled ONCE on mount for the lifetime of this component
  const [extensions] = React.useState(() =>
    createEditorBaseExtensions({
      language,
      useTailwind,
      settings,
      indentWithTab,
      ariaLabel,
      bus,
    })
  );

  // Dynamic Compartment updates using useCompartment hook
  const langExtension = React.useMemo(
    () =>
      language === "html"
        ? createHtmlLanguageExtension(useTailwind)
        : createCssLanguageExtension(),
    [language, useTailwind]
  );
  useCompartment(editorRef, languageCompartment, langExtension);

  const tabSizeExtension = React.useMemo(
    () => createTabSizeExtension(settings.tabSize),
    [settings.tabSize]
  );
  useCompartment(editorRef, tabSizeCompartment, tabSizeExtension);

  const fontSizeExtension = React.useMemo(
    () => createFontSizeExtension(settings.fontSize),
    [settings.fontSize]
  );
  useCompartment(editorRef, fontSizeCompartment, fontSizeExtension);

  const wrapExtension = React.useMemo(
    () => (settings.lineWrapping ? EditorView.lineWrapping : []),
    [settings.lineWrapping]
  );
  useCompartment(editorRef, wrapCompartment, wrapExtension);

  const lineNumbersExtension = React.useMemo(
    () => (settings.lineNumbers ? lineNumbers() : []),
    [settings.lineNumbers]
  );
  useCompartment(editorRef, lineNumbersCompartment, lineNumbersExtension);

  const autocompleteExtension = React.useMemo(
    () => createAutocompleteExtension(settings.autocomplete),
    [settings.autocomplete]
  );
  useCompartment(editorRef, autocompleteCompartment, autocompleteExtension);

  const indentWithTabExtension = React.useMemo(
    () => createIndentWithTabExtension(indentWithTab),
    [indentWithTab]
  );
  useCompartment(editorRef, indentWithTabCompartment, indentWithTabExtension);

  const ariaLabelExtension = React.useMemo(
    () => createAriaLabelExtension(ariaLabel),
    [ariaLabel]
  );
  useCompartment(editorRef, ariaLabelCompartment, ariaLabelExtension);

  // Effect 2: Apply external edits (replace or patch) by id, once per new id
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (!view || !externalEdit) return;
    if (externalEdit.id === lastExternalEditIdRef.current) return;

    lastExternalEditIdRef.current = externalEdit.id;
    applyExternalValue(
      view,
      externalEdit.text,
      externalEdit.kind === "replace" ? { isFullReplace: true } : undefined
    );
  }, [externalEdit]);

  // Effect 3: Reveal request sync
  const lastRevealIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) return;

    if (revealRequest && revealRequest.id !== lastRevealIdRef.current) {
      lastRevealIdRef.current = revealRequest.id;
      revealRange(view, revealRequest.range, revealRequest.focus);
    }
  }, [revealRequest]);

  // Effect 4: Diagnostics sync (Part B7)
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (view && diagnostics) {
      updateEditorDiagnostics(view, diagnostics);
    }
  }, [diagnostics]);

  // Stable empty onChange for CodeMirror so @uiw/react-codemirror never reconfigures
  const handleStableCodeMirrorChange = React.useCallback(() => {}, []);

  return (
    <div className="relative h-full min-h-0 flex-1">
      <CodeMirror
        ref={editorRef}
        value={initialValue}
        onChange={handleStableCodeMirrorChange}
        extensions={extensions}
        basicSetup={false}
        indentWithTab={false}
        height="100%"
        className="h-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default CodeEditor;

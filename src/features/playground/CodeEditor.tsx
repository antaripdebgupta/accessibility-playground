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

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: "html" | "css";
  loadRequest?: { readonly id: number } | null;
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
  loadRequest,
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
  const lastLoadRequestIdRef = React.useRef<number | null>(
    loadRequest?.id ?? null
  );

  // Stable event bus: decoupled from render, no refs during render
  const [bus] = React.useState(() => new EventTarget());

  // Track values emitted by this editor to ignore React prop echoes during typing
  const emittedValuesRef = React.useRef(new Set<string>());

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
      emittedValuesRef.current.add(val);
      if (emittedValuesRef.current.size > 100) {
        const first = emittedValuesRef.current.values().next().value;
        if (first !== undefined) emittedValuesRef.current.delete(first);
      }
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

  // Effect 2: Minimal-diff external value sync (Part A5)
  React.useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) return;

    const isLoad =
      loadRequest != null && loadRequest.id !== lastLoadRequestIdRef.current;
    if (isLoad) {
      lastLoadRequestIdRef.current = loadRequest.id;
      emittedValuesRef.current.clear();
    }

    // If this value was emitted by this editor, it's an echo of user typing — skip sync
    if (!isLoad && emittedValuesRef.current.has(value)) {
      emittedValuesRef.current.delete(value);
      return;
    }

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      applyExternalValue(
        view,
        value,
        isLoad ? { isFullReplace: true } : undefined
      );
    } else if (isLoad) {
      applyExternalValue(view, value, { isFullReplace: true });
    }
  }, [value, loadRequest]);

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
        height="100%"
        className="h-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default CodeEditor;

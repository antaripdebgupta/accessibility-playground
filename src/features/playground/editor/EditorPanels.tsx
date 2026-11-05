"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";
import type { RevealRequest, ExternalEdit } from "../CodeEditor";
import type { Diagnostic } from "@codemirror/lint";
import type { EditorStatusState } from "./extensions/status";

const CodeEditor = dynamic(() => import("../CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text-secondary)]">
      Loading accessible code editor...
    </div>
  ),
});

export interface EditorPanelsProps {
  activeTab: "html" | "css";
  hasOpenedCss: boolean;
  html: string;
  css: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  activeExternalEdit?: ExternalEdit | null;
  revealRequest?: RevealRequest | null;
  onCaretChange?: (offset: number) => void;
  onForceScan?: () => void;
  indentWithTab: boolean;
  useTailwind?: boolean;
  diagnostics?: Diagnostic[];
  setStatusState: React.Dispatch<React.SetStateAction<EditorStatusState>>;
  setLiveAnnouncement: React.Dispatch<React.SetStateAction<string | null>>;
  setIsShortcutsOpen: (open: boolean) => void;
  isOversized: boolean;
}

export function EditorPanels({
  activeTab,
  hasOpenedCss,
  html,
  css,
  onHtmlChange,
  onCssChange,
  activeExternalEdit,
  revealRequest,
  onCaretChange,
  onForceScan,
  indentWithTab,
  useTailwind,
  diagnostics,
  setStatusState,
  setLiveAnnouncement,
  setIsShortcutsOpen,
  isOversized,
}: EditorPanelsProps) {
  return (
    <div className="relative min-h-0 flex-1">
      {/* HTML tabpanel */}
      <div
        role="tabpanel"
        id="panel-editor-html"
        aria-labelledby="tab-editor-html"
        className={
          activeTab === "html"
            ? "flex h-full min-h-0 flex-col"
            : "pointer-events-none invisible absolute inset-0"
        }
        aria-hidden={activeTab !== "html"}
        inert={activeTab !== "html" ? true : undefined}
      >
        <CodeEditor
          value={html}
          onChange={onHtmlChange}
          language="html"
          externalEdit={activeExternalEdit}
          revealRequest={activeTab === "html" ? revealRequest : null}
          onCaretChange={onCaretChange}
          onForceScan={onForceScan}
          indentWithTab={indentWithTab}
          ariaLabel="HTML code editor"
          useTailwind={useTailwind}
          diagnostics={diagnostics}
          onStatusChange={setStatusState}
          onEscapeAnnounce={setLiveAnnouncement}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </div>

      {/* CSS tabpanel */}
      {hasOpenedCss && (
        <div
          role="tabpanel"
          id="panel-editor-css"
          aria-labelledby="tab-editor-css"
          className={
            activeTab === "css"
              ? "flex h-full min-h-0 flex-col"
              : "pointer-events-none invisible absolute inset-0"
          }
          aria-hidden={activeTab !== "css"}
          inert={activeTab !== "css" ? true : undefined}
        >
          <CodeEditor
            value={css}
            onChange={onCssChange}
            language="css"
            externalEdit={activeExternalEdit}
            onForceScan={onForceScan}
            indentWithTab={indentWithTab}
            ariaLabel="CSS code editor"
            onStatusChange={setStatusState}
            onEscapeAnnounce={setLiveAnnouncement}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        </div>
      )}

      {isOversized && (
        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-md border border-[var(--color-warning-default)]/40 bg-[var(--color-warning-subtle)] px-2.5 py-1 text-xs text-[var(--color-warning-default)] shadow-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Document exceeds 50KB. Large inputs may slow parsing.</span>
        </div>
      )}
    </div>
  );
}

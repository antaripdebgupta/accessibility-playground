"use client";

import * as React from "react";
import { useToast } from "@accessly-ui/react";
import type { StarterTemplate } from "@/data/templates";
import { EditorStatusBar } from "./editor/EditorStatusBar";
import { ShortcutsDialog } from "./editor/ShortcutsDialog";
import { useEditorSettings } from "./editor/useEditorSettings";
import { EditorToolbar } from "./editor/EditorToolbar";
import { EditorPanels } from "./editor/EditorPanels";
import type { RevealRequest, ExternalEdit } from "./CodeEditor";
import type { Diagnostic } from "@codemirror/lint";
import type { EditorStatusState } from "./editor/extensions/status";

export interface EditorProps {
  html: string;
  css: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  onCopyLink?: () => string;
  useTailwind?: boolean;
  onToggleTailwind?: (enabled: boolean) => void;
  externalEdit?: ExternalEdit | null;
  revealRequest?: RevealRequest | null;
  onCaretChange?: (offset: number) => void;
  onForceScan?: () => void;
  diagnostics?: Diagnostic[];
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export function Editor({
  html,
  css,
  onHtmlChange,
  onCssChange,
  onSelectTemplate,
  onCopyLink,
  useTailwind = false,
  onToggleTailwind,
  externalEdit,
  revealRequest,
  onCaretChange,
  onForceScan,
  diagnostics,
  isMaximized = false,
  onToggleMaximize,
}: EditorProps) {
  const [activeTab, setActiveTab] = React.useState<"html" | "css">("html");
  const [hasOpenedCss, setHasOpenedCss] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);
  const [indentWithTab, setIndentWithTab] = React.useState(true);
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [statusState, setStatusState] = React.useState<EditorStatusState>({
    line: 1,
    col: 1,
    selectionLength: 0,
  });
  const [liveAnnouncement, setLiveAnnouncement] = React.useState<string | null>(
    null
  );
  const [localExternalEdit, setLocalExternalEdit] =
    React.useState<ExternalEdit | null>(null);
  const localEditSeqRef = React.useRef(0);

  const triggerLocalLoad = React.useCallback((text: string) => {
    localEditSeqRef.current += 1;
    setLocalExternalEdit({
      id: localEditSeqRef.current,
      kind: "replace",
      text,
    });
  }, []);

  const activeExternalEdit = externalEdit ?? localExternalEdit;

  const { settings } = useEditorSettings();
  const toast = useToast();

  const activeContent = activeTab === "html" ? html : css;

  const lineCount = React.useMemo(() => {
    return activeContent.split("\n").length;
  }, [activeContent]);

  const byteLength = React.useMemo(() => {
    return new TextEncoder().encode(activeContent).length;
  }, [activeContent]);

  const isOversized = byteLength > 50000;

  // Window-level shortcut for Cmd/Ctrl+K (ignore when editor is focused)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const activeEl = document.activeElement;
        if (activeEl?.closest(".cm-editor")) {
          return;
        }
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleTabChange = React.useCallback((tab: "html" | "css") => {
    setActiveTab(tab);
    if (tab === "css") {
      setHasOpenedCss(true);
    }
  }, []);

  const handleFormatClick = React.useCallback(async () => {
    const activeText = activeTab === "html" ? html : css;
    if (activeText.length > 200 * 1024) {
      toast.push({
        title: "Format skipped",
        description: "Document exceeds 200KB limit for formatting.",
        variant: "warning",
      });
      return;
    }

    try {
      const [prettierModule, htmlPluginModule, postcssPluginModule] =
        await Promise.all([
          import("prettier/standalone"),
          import("prettier/plugins/html"),
          import("prettier/plugins/postcss"),
        ]);

      const prettier = prettierModule.default || prettierModule;
      const htmlPlugin = htmlPluginModule.default || htmlPluginModule;
      const postcssPlugin = postcssPluginModule.default || postcssPluginModule;

      const formatted = await prettier.format(activeText, {
        parser: activeTab === "html" ? "html" : "css",
        plugins: activeTab === "html" ? [htmlPlugin] : [postcssPlugin],
        tabWidth: settings.tabSize,
        useTabs: false,
      });

      if (activeTab === "html") {
        onHtmlChange(formatted);
      } else {
        onCssChange(formatted);
      }

      toast.push({
        title: "Document formatted",
        description: `Formatted ${activeTab.toUpperCase()} with Prettier.`,
        variant: "success",
      });
    } catch {
      toast.push({
        title: "Format error",
        description: "Could not format document due to a syntax issue.",
        variant: "danger",
      });
    }
  }, [
    activeTab,
    html,
    css,
    settings.tabSize,
    onHtmlChange,
    onCssChange,
    toast,
  ]);

  const handleCopyLinkClick = React.useCallback(async () => {
    if (!onCopyLink) return;
    try {
      const url = onCopyLink();
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.push({
        title: "Permalink copied",
        description:
          "Share this link to reproduce your exact HTML + CSS snippet.",
        variant: "success",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.push({
        title: "Copy failed",
        description:
          "Clipboard access was denied. Please copy the URL manually.",
        variant: "danger",
      });
    }
  }, [onCopyLink, toast]);

  const handleSelectTemplate = React.useCallback(
    (tmpl: StarterTemplate) => {
      onSelectTemplate(tmpl);
      triggerLocalLoad(tmpl.html);
      setLiveAnnouncement(`Template loaded: ${tmpl.label}`);
    },
    [onSelectTemplate, triggerLocalLoad]
  );

  const handleToggleIndentWithTab = React.useCallback((checked: boolean) => {
    setIndentWithTab(checked);
    setLiveAnnouncement(
      checked
        ? "Tab key will now indent code. Press Escape then Tab to leave editor."
        : "Tab key will now move keyboard focus."
    );
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      <EditorToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFormatClick={handleFormatClick}
        onCopyLink={onCopyLink}
        linkCopied={linkCopied}
        onCopyLinkClick={handleCopyLinkClick}
        indentWithTab={indentWithTab}
        onToggleIndentWithTab={handleToggleIndentWithTab}
        useTailwind={useTailwind}
        onToggleTailwind={onToggleTailwind}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onSelectTemplate={handleSelectTemplate}
        html={html}
        css={css}
        onHtmlChange={onHtmlChange}
        onCssChange={onCssChange}
        triggerLocalLoad={triggerLocalLoad}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
      />

      <EditorPanels
        activeTab={activeTab}
        hasOpenedCss={hasOpenedCss}
        html={html}
        css={css}
        onHtmlChange={onHtmlChange}
        onCssChange={onCssChange}
        activeExternalEdit={activeExternalEdit}
        revealRequest={revealRequest}
        onCaretChange={onCaretChange}
        onForceScan={onForceScan}
        indentWithTab={indentWithTab}
        useTailwind={useTailwind}
        diagnostics={diagnostics}
        setStatusState={setStatusState}
        setLiveAnnouncement={setLiveAnnouncement}
        setIsShortcutsOpen={setIsShortcutsOpen}
        isOversized={isOversized}
      />

      {/* Editor Footer / Status Bar */}
      <EditorStatusBar
        lineCount={lineCount}
        byteLength={byteLength}
        cursorLine={statusState.line}
        cursorCol={statusState.col}
        selectionLength={statusState.selectionLength}
        language={activeTab === "html" ? "HTML" : "CSS"}
        tabSize={settings.tabSize}
        lineWrapping={settings.lineWrapping}
        indentWithTab={indentWithTab}
        liveAnnouncement={liveAnnouncement}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

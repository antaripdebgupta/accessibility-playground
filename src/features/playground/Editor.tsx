"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  useToast,
} from "@accessly-ui/react";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/templates";
import {
  ChevronDown,
  AlertTriangle,
  FileCode,
  Link2,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { SnippetsMenu } from "./editor/SnippetsMenu";
import { EditorStatusBar } from "./editor/EditorStatusBar";
import { ShortcutsDialog } from "./editor/ShortcutsDialog";
import { Badge } from "@/components/ui/Badge";
import { useEditorSettings } from "./editor/useEditorSettings";
import type { RevealRequest } from "./CodeEditor";
import type { Diagnostic } from "@codemirror/lint";
import type { EditorStatusState } from "./editor/extensions/status";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text-secondary)]">
      Loading accessible code editor...
    </div>
  ),
});

export interface EditorProps {
  html: string;
  css: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  onCopyLink?: () => string;
  useTailwind?: boolean;
  onToggleTailwind?: (enabled: boolean) => void;
  revealRequest?: RevealRequest | null;
  /** @deprecated Use revealRequest */
  selectionRange?: readonly [number, number] | null;
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
  revealRequest,
  selectionRange,
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
  const [indentWithTab, setIndentWithTab] = React.useState(true); // Part A6a: default ON
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [statusState, setStatusState] = React.useState<EditorStatusState>({
    line: 1,
    col: 1,
    selectionLength: 0,
  });
  const [liveAnnouncement, setLiveAnnouncement] = React.useState<string | null>(
    null
  );

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

  // Window-level shortcut for Cmd/Ctrl+K (Part A6b: ignore when editor is focused)
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

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-2">
        {/* HTML / CSS Tabs */}
        <div
          role="tablist"
          aria-label="Editor modes"
          className="flex items-center gap-1 rounded-md bg-[var(--color-surface-sunken)] p-0.5"
        >
          <button
            type="button"
            role="tab"
            id="tab-editor-html"
            aria-selected={activeTab === "html"}
            aria-controls="panel-editor-html"
            onClick={() => handleTabChange("html")}
            className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              activeTab === "html"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            HTML
          </button>
          <button
            type="button"
            role="tab"
            id="tab-editor-css"
            aria-selected={activeTab === "css"}
            aria-controls="panel-editor-css"
            onClick={() => handleTabChange("css")}
            className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              activeTab === "css"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            CSS
          </button>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Format Document Button */}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2.5 text-xs font-medium"
            onClick={handleFormatClick}
            title="Format document (Shift+Alt+F)"
            aria-label="Format document with Prettier (Shift+Alt+F)"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Format</span>
          </Button>

          {/* Copy Link Button */}
          {onCopyLink && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 px-2.5 text-xs font-medium"
              onClick={async () => {
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
              }}
              aria-label={
                linkCopied
                  ? "Copied! Permalink copied to clipboard"
                  : "Copy shareable permalink to clipboard"
              }
            >
              {linkCopied ? (
                <>
                  <Check
                    className="h-3.5 w-3.5 text-[var(--color-success-default)]"
                    aria-hidden="true"
                  />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
          )}

          {/* Tab Indent Toggle */}
          <label className="hidden cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] sm:flex">
            <input
              type="checkbox"
              checked={indentWithTab}
              onChange={(e) => {
                setIndentWithTab(e.target.checked);
                setLiveAnnouncement(
                  e.target.checked
                    ? "Tab key will now indent code. Press Escape then Tab to leave editor."
                    : "Tab key will now move keyboard focus."
                );
              }}
              className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span>Tab indents</span>
          </label>

          {/* Tailwind CSS Toggle */}
          {onToggleTailwind && (
            <label className="hidden cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:flex">
              <input
                type="checkbox"
                checked={useTailwind}
                onChange={(e) => onToggleTailwind(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              />
              <span>Tailwind CSS</span>
            </label>
          )}

          {/* Starter Templates Dropdown */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs font-medium"
              >
                <FileCode className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Templates</span>
                <span
                  className="hidden font-mono text-[10px] opacity-60 sm:inline"
                  aria-hidden="true"
                >
                  ⌘K
                </span>
                <ChevronDown
                  className="h-3 w-3 opacity-60"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 w-64 overflow-y-auto"
            >
              {STARTER_TEMPLATES.map((tmpl) => (
                <DropdownMenuItem
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-col items-start gap-0.5 p-2"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {tmpl.label}
                    </span>
                    <Badge
                      variant="default"
                      className="px-1 py-0 text-[8px] font-normal"
                    >
                      Built-in
                    </Badge>
                  </div>
                  <span className="line-clamp-1 text-[11px] text-[var(--color-text-secondary)]">
                    {tmpl.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Snippets Menu Component */}
          <SnippetsMenu
            html={html}
            css={css}
            onHtmlChange={onHtmlChange}
            onCssChange={onCssChange}
          />

          {onToggleMaximize && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleMaximize}
              className="h-7 w-7 p-0"
              aria-label={
                isMaximized ? "Restore pane size (Esc)" : "Maximize code editor"
              }
              aria-pressed={isMaximized}
            >
              {isMaximized ? (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Body - Part A4: keep both mounted, preserve measuring & undo */}
      <div className="relative min-h-0 flex-1">
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
            revealRequest={activeTab === "html" ? revealRequest : null}
            selectionRange={activeTab === "html" ? selectionRange : null}
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
            <AlertTriangle
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>Document exceeds 50KB. Large inputs may slow parsing.</span>
          </div>
        )}
      </div>

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

export default Editor;

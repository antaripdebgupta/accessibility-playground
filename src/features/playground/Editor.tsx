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
} from "lucide-react";
import { SnippetsMenu } from "./editor/SnippetsMenu";
import { EditorStatusBar } from "./editor/EditorStatusBar";

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
  selectionRange?: readonly [number, number] | null;
  onForceScan?: () => void;
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
  selectionRange,
  onForceScan,
  isMaximized = false,
  onToggleMaximize,
}: EditorProps) {
  const [activeTab, setActiveTab] = React.useState<"html" | "css">("html");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [indentWithTab, setIndentWithTab] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);
  const toast = useToast();

  const activeContent = activeTab === "html" ? html : css;

  const lineCount = React.useMemo(() => {
    return activeContent.split("\n").length;
  }, [activeContent]);

  const byteLength = React.useMemo(() => {
    return new TextEncoder().encode(activeContent).length;
  }, [activeContent]);

  const isOversized = byteLength > 50000;

  // Window-level shortcut for Cmd/Ctrl+K
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
            onClick={() => setActiveTab("html")}
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
            onClick={() => setActiveTab("css")}
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
              onChange={(e) => setIndentWithTab(e.target.checked)}
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
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {tmpl.label}
                  </span>
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

      {/* Editor Body */}
      <div className="relative min-h-0 flex-1">
        <div
          role="tabpanel"
          id="panel-editor-html"
          aria-labelledby="tab-editor-html"
          className={activeTab === "html" ? "h-full" : "hidden"}
        >
          <CodeEditor
            value={html}
            onChange={onHtmlChange}
            language="html"
            selectionRange={selectionRange}
            onForceScan={onForceScan}
            indentWithTab={indentWithTab}
            ariaLabel="HTML code editor"
          />
        </div>

        <div
          role="tabpanel"
          id="panel-editor-css"
          aria-labelledby="tab-editor-css"
          className={activeTab === "css" ? "h-full" : "hidden"}
        >
          <CodeEditor
            value={css}
            onChange={onCssChange}
            language="css"
            onForceScan={onForceScan}
            indentWithTab={indentWithTab}
            ariaLabel="CSS code editor"
          />
        </div>

        {isOversized && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border border-[var(--color-warning-default)]/40 bg-[var(--color-warning-subtle)] px-2.5 py-1 text-xs text-[var(--color-warning-default)] shadow-xs">
            <AlertTriangle
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>Document exceeds 50KB. Large inputs may slow parsing.</span>
          </div>
        )}
      </div>

      {/* Editor Footer / Status Bar */}
      <EditorStatusBar lineCount={lineCount} byteLength={byteLength} />
    </div>
  );
}

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
  Bookmark,
  Trash2,
  Plus,
} from "lucide-react";
import {
  listSnippets,
  saveSnippet,
  deleteSnippet,
  formatRelativeTime,
  type SavedSnippet,
} from "@/lib/snippet-library";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text-secondary)]">
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
}: EditorProps) {
  const [activeTab, setActiveTab] = React.useState<"html" | "css">("html");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [indentWithTab, setIndentWithTab] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = React.useState(false);
  const [snippets, setSnippets] = React.useState<SavedSnippet[]>(() =>
    listSnippets()
  );
  const [isNamingSnippet, setIsNamingSnippet] = React.useState(false);
  const [newSnippetName, setNewSnippetName] = React.useState("");
  const toast = useToast();

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippetName.trim()) return;
    const created = saveSnippet(newSnippetName, html, css);
    setSnippets(listSnippets());
    setNewSnippetName("");
    setIsNamingSnippet(false);
    toast.push({
      title: "Snippet saved",
      description: `Saved "${created.name}" to your library.`,
      variant: "success",
    });
  };

  const handleDeleteSnippet = (
    e: React.MouseEvent,
    id: string,
    name: string
  ) => {
    e.stopPropagation();
    deleteSnippet(id);
    setSnippets(listSnippets());
    toast.push({
      title: "Snippet deleted",
      description: `Removed "${name}".`,
      variant: "info",
    });
  };

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
    <div className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
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
              <span>Tailwind CSS (loads cdn.tailwindcss.com)</span>
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

          {/* My Snippets Dropdown */}
          <DropdownMenu open={isSnippetsOpen} onOpenChange={setIsSnippetsOpen}>
            <DropdownMenuTrigger>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs font-medium"
              >
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                <span>My Snippets</span>
                {snippets.length > 0 && (
                  <span className="py-0.2 rounded-full bg-[var(--color-surface-sunken)] px-1.5 font-mono text-[10px]">
                    {snippets.length}
                  </span>
                )}
                <ChevronDown
                  className="h-3 w-3 opacity-60"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-80 w-72 overflow-y-auto p-1"
            >
              {/* Save current as... section */}
              <div className="border-b border-[var(--color-border)] p-2">
                {isNamingSnippet ? (
                  <form
                    onSubmit={handleSaveSnippet}
                    className="flex flex-col gap-2"
                  >
                    <input
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                      type="text"
                      placeholder="Snippet name..."
                      value={newSnippetName}
                      onChange={(e) => setNewSnippetName(e.target.value)}
                      className="h-7 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-mono text-xs text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => {
                          setIsNamingSnippet(false);
                          setNewSnippetName("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!newSnippetName.trim()}
                        className="h-6 px-2 text-[11px]"
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsNamingSnippet(true)}
                    className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-subtle)]/40 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Save current as...</span>
                  </button>
                )}
              </div>

              {/* List of saved snippets */}
              {snippets.length === 0 ? (
                <div className="p-3 text-center text-xs text-[var(--color-text-secondary)]">
                  No saved snippets yet.
                </div>
              ) : (
                snippets.map((snip) => (
                  <DropdownMenuItem
                    key={snip.id}
                    onClick={() => {
                      onHtmlChange(snip.html);
                      onCssChange(snip.css);
                      setIsSnippetsOpen(false);
                      toast.push({
                        title: "Snippet loaded",
                        description: `Loaded "${snip.name}".`,
                        variant: "success",
                      });
                    }}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                        {snip.name}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                        {formatRelativeTime(snip.savedAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleDeleteSnippet(e, snip.id, snip.name)
                      }
                      title={`Delete "${snip.name}"`}
                      aria-label={`Delete "${snip.name}"`}
                      className="ml-2 rounded p-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        <div
          role="tabpanel"
          id="panel-editor-html"
          aria-labelledby="tab-editor-html"
          className={activeTab === "html" ? "block" : "hidden"}
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
          className={activeTab === "css" ? "block" : "hidden"}
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

      {/* Editor Footer / Status */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-3 py-1.5 text-[11px] text-[var(--color-text-secondary)]">
        <span className="truncate">
          ⌘/Ctrl+Enter to rescan · ⌘/Ctrl+K for templates · Esc then Tab exits
          editor
        </span>
        <div className="flex shrink-0 items-center gap-3 font-mono">
          <span>{lineCount} lines</span>
          <span>{byteLength} bytes</span>
        </div>
      </div>
    </div>
  );
}

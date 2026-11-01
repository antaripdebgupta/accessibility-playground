"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  useToast,
} from "@accessly-ui/react";
import {
  Bookmark,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Upload,
  Check,
  X,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/snippet-library";
import { useSnippets } from "./useSnippets";
import { Badge } from "@/components/ui/Badge";

interface SnippetsMenuProps {
  html: string;
  css: string;
  onHtmlChange: (html: string) => void;
  onCssChange: (css: string) => void;
}

export function SnippetsMenu({
  html,
  css,
  onHtmlChange,
  onCssChange,
}: SnippetsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    snippets,
    isNamingSnippet,
    setIsNamingSnippet,
    newSnippetName,
    setNewSnippetName,
    editingSnippetId,
    editingSnippetName,
    setEditingSnippetName,
    handleSaveSnippet,
    handleDeleteSnippet,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDuplicateSnippet,
    handleExportAll,
    handleImportFile,
  } = useSnippets(html, css);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs font-medium"
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Snippets</span>
          {snippets.length > 0 && (
            <span className="py-0.2 rounded-full bg-[var(--color-surface-sunken)] px-1.5 font-mono text-[10px]">
              {snippets.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-96 w-80 overflow-y-auto p-1"
      >
        {/* Save current as... section */}
        <div className="border-b border-[var(--color-border)] p-2">
          {isNamingSnippet ? (
            <form onSubmit={handleSaveSnippet} className="flex flex-col gap-2">
              <input
                ref={(el) => el?.focus()}
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
              <span>Save current as snippet...</span>
            </button>
          )}
        </div>

        {/* Header indicating "Yours" */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span>Saved Snippets</span>
            <Badge variant="default" className="text-[9px] px-1 py-0 font-normal">
              Yours
            </Badge>
          </div>
          <span className="font-mono text-[10px] opacity-75">
            {snippets.length} total
          </span>
        </div>

        {/* List of saved snippets */}
        {snippets.length === 0 ? (
          <div className="p-3 text-center text-xs text-[var(--color-text-secondary)] italic">
            No personal snippets saved yet.
          </div>
        ) : (
          snippets.map((snip) => (
            <div
              key={snip.id}
              className="flex flex-col rounded border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface-sunken)] p-1.5 my-0.5"
            >
              {editingSnippetId === snip.id ? (
                <form
                  onSubmit={(e) => handleSaveRename(e, snip.id)}
                  className="flex items-center gap-1.5 p-1"
                >
                  <input
                    ref={(el) => el?.focus()}
                    type="text"
                    value={editingSnippetName}
                    onChange={(e) => setEditingSnippetName(e.target.value)}
                    className="h-6 flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 font-mono text-xs text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                  />
                  <button
                    type="submit"
                    className="rounded p-1 text-[var(--color-success-default)] hover:bg-[var(--color-surface)]"
                    title="Save name"
                    aria-label="Save name"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelRename}
                    className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                    title="Cancel"
                    aria-label="Cancel rename"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <DropdownMenuItem
                    onClick={() => {
                      onHtmlChange(snip.html);
                      onCssChange(snip.css);
                      setIsOpen(false);
                      toast.push({
                        title: "Snippet loaded",
                        description: `Loaded "${snip.name}".`,
                        variant: "success",
                      });
                    }}
                    className="flex flex-1 flex-col items-start p-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                        {snip.name}
                      </span>
                      <Badge variant="default" className="text-[8px] px-1 py-0">
                        Yours
                      </Badge>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                      {formatRelativeTime(snip.savedAt)}
                    </span>
                  </DropdownMenuItem>

                  {/* Actions: Rename, Duplicate, Delete */}
                  <div className="flex items-center gap-0.5 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(e, snip)}
                      className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                      title={`Rename ${snip.name}`}
                      aria-label={`Rename ${snip.name}`}
                    >
                      <Edit2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicateSnippet(e, snip.id)}
                      className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                      title={`Duplicate ${snip.name}`}
                      aria-label={`Duplicate ${snip.name}`}
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSnippet(e, snip.id, snip.name)}
                      className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                      title={`Delete ${snip.name}`}
                      aria-label={`Delete ${snip.name}`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Footer: Export / Import */}
        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] px-2 pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
            aria-label="Upload snippet file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <Upload className="h-3 w-3" aria-hidden="true" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            disabled={snippets.length === 0}
            onClick={handleExportAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            <span>Export All</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

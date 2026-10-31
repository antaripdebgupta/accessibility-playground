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
import { Bookmark, ChevronDown, Plus, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/snippet-library";
import { useSnippets } from "./useSnippets";

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
  const toast = useToast();
  const {
    snippets,
    isNamingSnippet,
    setIsNamingSnippet,
    newSnippetName,
    setNewSnippetName,
    handleSaveSnippet,
    handleDeleteSnippet,
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
          <span>My Snippets</span>
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
        className="max-h-80 w-72 overflow-y-auto p-1"
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
                setIsOpen(false);
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
                onClick={(e) => handleDeleteSnippet(e, snip.id, snip.name)}
                className="ml-2 rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                title={`Delete ${snip.name}`}
                aria-label={`Delete ${snip.name}`}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

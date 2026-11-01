"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";

export interface EditorStatusBarProps {
  lineCount?: number;
  byteLength?: number;
  cursorLine?: number;
  cursorCol?: number;
  selectionLength?: number;
  language?: "HTML" | "CSS";
  tabSize?: number;
  lineWrapping?: boolean;
  indentWithTab?: boolean;
  liveAnnouncement?: string | null;
  onOpenShortcuts?: () => void;
}

export function EditorStatusBar({
  lineCount,
  byteLength,
  cursorLine = 1,
  cursorCol = 1,
  selectionLength = 0,
  language = "HTML",
  tabSize = 2,
  lineWrapping = true,
  indentWithTab = true,
  liveAnnouncement,
  onOpenShortcuts,
}: EditorStatusBarProps) {
  return (
    <footer
      aria-label="Editor status"
      className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 px-3 py-1 font-mono text-[11px] text-[var(--color-text-secondary)] select-none"
    >
      {/* Left side: cursor, selection, hints */}
      <div className="flex items-center gap-3">
        <span aria-label={`Line ${cursorLine}, Column ${cursorCol}`}>
          Ln {cursorLine}, Col {cursorCol}
        </span>

        {selectionLength > 0 && (
          <span className="text-[var(--color-text-primary)]">
            ({selectionLength} selected)
          </span>
        )}

        <span className="hidden opacity-60 sm:inline">·</span>

        <span className="hidden text-[var(--color-text-secondary)] md:inline">
          {indentWithTab ? "Tab: Indents (Esc exits)" : "Tab: Moves focus"}
        </span>

        {/* Live region for screen readers (e.g. Esc pressed announcement) */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveAnnouncement}
        </div>
      </div>

      {/* Right side: language, encoding, tab size, wrap, help */}
      <div className="flex items-center gap-3">
        {lineCount !== undefined && byteLength !== undefined && (
          <span className="hidden opacity-70 lg:inline">
            {lineCount} lines, {byteLength} B
          </span>
        )}

        <span>Spaces: {tabSize}</span>
        <span>{lineWrapping ? "Wrap" : "No Wrap"}</span>
        <span>{language}</span>
        <span className="hidden sm:inline">LF</span>

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            aria-label="Open keyboard shortcuts (F1)"
            title="Keyboard Shortcuts (F1)"
          >
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            <span className="hidden sm:inline">Help</span>
          </button>
        )}
      </div>
    </footer>
  );
}

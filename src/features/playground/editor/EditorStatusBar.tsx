"use client";

import * as React from "react";

interface EditorStatusBarProps {
  lineCount: number;
  byteLength: number;
}

export function EditorStatusBar({
  lineCount,
  byteLength,
}: EditorStatusBarProps) {
  return (
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
  );
}

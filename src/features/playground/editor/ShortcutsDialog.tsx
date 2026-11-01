"use client";

import * as React from "react";
import { Button } from "@accessly-ui/react";
import { X, Keyboard } from "lucide-react";

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  action: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Accessibility & Actions",
    items: [
      { keys: ["⌘ / Ctrl", "Enter"], action: "Rescan accessibility rules" },
      { keys: ["Shift", "Alt", "F"], action: "Format document (Prettier)" },
      { keys: ["⌘ / Ctrl", "."], action: "Quick fix diagnostic at cursor" },
      { keys: ["F8"], action: "Next accessibility diagnostic" },
      { keys: ["Shift", "F8"], action: "Previous accessibility diagnostic" },
      {
        keys: ["Esc", "then", "Tab"],
        action: "Exit editor (no keyboard trap)",
      },
    ],
  },
  {
    title: "Editing & Lines",
    items: [
      { keys: ["⌘ / Ctrl", "Shift", "K"], action: "Delete line" },
      { keys: ["Alt", "↑ / ↓"], action: "Move line up / down" },
      { keys: ["Shift", "Alt", "↑ / ↓"], action: "Copy line up / down" },
      { keys: ["⌘ / Ctrl", "Alt", "Enter"], action: "Insert line below" },
      { keys: ["⌘ / Ctrl", "Shift", "Enter"], action: "Insert line above" },
      { keys: ["⌘ / Ctrl", "Backspace"], action: "Delete word backward" },
      { keys: ["⌘ / Ctrl", "Delete"], action: "Delete word forward" },
      {
        keys: ["⌘ / Ctrl", "C / X"],
        action: "Copy / cut full line (when empty selection)",
      },
    ],
  },
  {
    title: "Selection & Navigation",
    items: [
      { keys: ["⌘ / Ctrl", "A"], action: "Select all" },
      { keys: ["⌘ / Ctrl", "D"], action: "Select next occurrence" },
      { keys: ["⌘ / Ctrl", "Shift", "L"], action: "Select all occurrences" },
      {
        keys: ["⌘ / Ctrl", "Alt", "↑ / ↓"],
        action: "Add cursor above / below",
      },
      {
        keys: ["Shift", "Alt", "→ / ←"],
        action: "Expand / shrink selection (syntax)",
      },
      { keys: ["⌘ / Ctrl", "Shift", "\\"], action: "Jump to matching bracket" },
      { keys: ["Home"], action: "Smart Home (first non-blank character)" },
      { keys: ["⌘ / Ctrl", "G"], action: "Go to line" },
    ],
  },
  {
    title: "Indentation & Comments",
    items: [
      { keys: ["Tab / Shift+Tab"], action: "Indent / outdent line" },
      { keys: ["⌘ / Ctrl", "] / ["], action: "Indent / outdent line" },
      {
        keys: ["⌘ / Ctrl", "/"],
        action: "Toggle line comment (<!-- --> / /* */)",
      },
      { keys: ["Shift", "Alt", "A"], action: "Toggle block comment" },
    ],
  },
  {
    title: "Search, Folding & Autocomplete",
    items: [
      { keys: ["⌘ / Ctrl", "F"], action: "Find in file" },
      { keys: ["⌘ / Ctrl", "H"], action: "Replace in file" },
      { keys: ["F3 / Shift+F3"], action: "Find next / previous match" },
      { keys: ["Ctrl", "Space"], action: "Trigger autocomplete popup" },
      {
        keys: ["⌘ / Ctrl", "Shift", "[ / ]"],
        action: "Fold / unfold code block",
      },
      {
        keys: ["⌘ / Ctrl", "Alt", "[ / ]"],
        action: "Fold / unfold all code blocks",
      },
    ],
  },
];

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);
  const triggerElementRef = React.useRef<HTMLElement | null>(null);

  // Capture trigger element to restore focus on close
  React.useEffect(() => {
    if (open) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      // Focus close button initially
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else if (triggerElementRef.current) {
      triggerElementRef.current.focus();
      triggerElementRef.current = null;
    }
  }, [open]);

  // Focus trap & Escape key
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Keyboard
              className="h-4 w-4 text-[var(--color-accent)]"
              aria-hidden="true"
            />
            <h2
              id="shortcuts-dialog-title"
              className="text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Editor Keyboard Shortcuts
            </h2>
          </div>
          <Button
            ref={closeBtnRef}
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6 overflow-y-auto p-4 text-xs">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <h3 className="mb-2.5 font-semibold text-[var(--color-text-primary)]">
                {cat.title}
              </h3>
              <div className="divide-y divide-[var(--color-border)]/60 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/40">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="text-[var(--color-text-secondary)]">
                      {item.action}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[var(--color-text-primary)] shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 px-4 py-2.5 text-[11px] text-[var(--color-text-secondary)]">
          <span>Press Esc or click outside to close</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-6 px-2.5 text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

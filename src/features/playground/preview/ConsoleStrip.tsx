"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Terminal, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { RuntimeErrorItem } from "./usePreviewBridge";

export interface ConsoleStripProps {
  runtimeErrors: readonly RuntimeErrorItem[];
  isConsoleOpen: boolean;
  setIsConsoleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClearErrors: () => void;
}

export function ConsoleStrip({
  runtimeErrors,
  isConsoleOpen,
  setIsConsoleOpen,
  onClearErrors,
}: ConsoleStripProps) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
      <div className="flex items-center justify-between px-3 py-1 text-xs">
        <button
          type="button"
          onClick={() => setIsConsoleOpen((v) => !v)}
          aria-expanded={isConsoleOpen}
          aria-controls="preview-runtime-console"
          className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          {isConsoleOpen ? (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          )}
          <Terminal className="h-3 w-3" aria-hidden="true" />
          <span>Console</span>
          {runtimeErrors.length > 0 && (
            <Badge
              variant="danger"
              className="px-1 py-0 text-[9px] font-normal"
            >
              {runtimeErrors.length}{" "}
              {runtimeErrors.length === 1 ? "error" : "errors"}
            </Badge>
          )}
        </button>

        {runtimeErrors.length > 0 && (
          <button
            type="button"
            onClick={onClearErrors}
            className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            Clear console
          </button>
        )}
      </div>

      {isConsoleOpen && (
        <div
          id="preview-runtime-console"
          role="region"
          aria-label="Preview runtime errors"
          className="max-h-36 space-y-1.5 overflow-y-auto border-t border-[var(--color-border)] p-2 font-mono text-[11px]"
        >
          {runtimeErrors.length === 0 ? (
            <div className="text-[10px] text-[var(--color-text-secondary)] italic opacity-60">
              No runtime exceptions detected.
            </div>
          ) : (
            runtimeErrors.map((err) => (
              <div
                key={err.id}
                className="flex items-start gap-1.5 text-[var(--color-danger-default)]"
              >
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold break-words">{err.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
                    {err.lineno !== undefined && (
                      <span>
                        {err.source ? `${err.source}:` : "line "}
                        {err.lineno}
                        {err.colno !== undefined ? `:${err.colno}` : ""}
                      </span>
                    )}
                    <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

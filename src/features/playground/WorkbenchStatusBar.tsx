import * as React from "react";

export interface WorkbenchStatusBarProps {
  isScanning: boolean;
  violationCount: number;
  maximizedPane: "editor" | "preview" | "analysis" | null;
  direction: "row" | "column";
  outerPercent: number;
  onOpenIssues: () => void;
}

export function WorkbenchStatusBar({
  isScanning,
  violationCount,
  maximizedPane,
  direction,
  outerPercent,
  onOpenIssues,
}: WorkbenchStatusBarProps) {
  return (
    <div className="flex h-7 flex-none items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 px-3 text-[11px] text-[var(--color-text-secondary)]">
      {/* Only scan state is polite live region (SC 4.1.3: No live-region spam) */}
      <div role="status" aria-live="polite" className="flex items-center gap-2">
        <span>{isScanning ? "Scanning…" : "Ready"}</span>
        <span>·</span>
        <button
          type="button"
          onClick={onOpenIssues}
          className="font-medium text-[var(--color-text-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          {violationCount} issue{violationCount === 1 ? "" : "s"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {maximizedPane && (
          <span className="font-medium text-[var(--color-accent)]">
            Maximized: {maximizedPane} (Esc to exit)
          </span>
        )}
        <span className="hidden sm:inline">
          Layout:{" "}
          {direction === "column"
            ? "Stacked"
            : `${Math.round(outerPercent)}/${Math.round(100 - outerPercent)}`}
        </span>
      </div>
    </div>
  );
}

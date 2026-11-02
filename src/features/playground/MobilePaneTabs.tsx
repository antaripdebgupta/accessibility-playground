import * as React from "react";

export type MobilePaneId = "editor" | "preview" | "analysis";

export interface MobilePaneTabsProps {
  activePane: MobilePaneId;
  onChangePane: (pane: MobilePaneId) => void;
}

const PANES: readonly MobilePaneId[] = [
  "editor",
  "preview",
  "analysis",
] as const;

export function MobilePaneTabs({
  activePane,
  onChangePane,
}: MobilePaneTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Workbench panes"
      className="flex flex-none items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-1.5"
    >
      {PANES.map((pane) => (
        <button
          key={pane}
          type="button"
          role="tab"
          aria-selected={activePane === pane}
          onClick={() => onChangePane(pane)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
            activePane === pane
              ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {pane}
        </button>
      ))}
    </div>
  );
}

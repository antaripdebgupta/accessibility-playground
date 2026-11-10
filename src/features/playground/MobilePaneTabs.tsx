"use client";

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
  const tabRefs = React.useRef<Map<MobilePaneId, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: React.KeyboardEvent, currentPane: MobilePaneId) => {
    const currentIndex = PANES.indexOf(currentPane);
    let targetIndex = -1;

    switch (e.key) {
      case "ArrowLeft":
        targetIndex = (currentIndex - 1 + PANES.length) % PANES.length;
        break;
      case "ArrowRight":
        targetIndex = (currentIndex + 1) % PANES.length;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = PANES.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextPane = PANES[targetIndex];
    if (nextPane) {
      onChangePane(nextPane);
      tabRefs.current.get(nextPane)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Workbench panes"
      className="flex flex-none items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-1.5"
    >
      {PANES.map((pane) => (
        <button
          key={pane}
          ref={(el) => {
            if (el) {
              tabRefs.current.set(pane, el);
            } else {
              tabRefs.current.delete(pane);
            }
          }}
          id={`mobile-tab-${pane}`}
          type="button"
          role="tab"
          aria-selected={activePane === pane}
          aria-controls={`mobile-pane-${pane}`}
          tabIndex={activePane === pane ? 0 : -1}
          onClick={() => onChangePane(pane)}
          onKeyDown={(e) => handleKeyDown(e, pane)}
          className={`min-h-[36px] rounded-md px-3.5 py-2 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
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

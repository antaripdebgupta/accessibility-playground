import * as React from "react";

export interface UseWorkbenchKeysParams {
  maximizedPane: "editor" | "preview" | "analysis" | null;
  setMaximizedPane: (pane: "editor" | "preview" | "analysis" | null) => void;
}

/**
 * Handles workbench keyboard shortcuts:
 * - Escape exits any maximized pane
 * - F6 / Shift+F6 cycles focus between primary panes (Code editor, Preview reload button, Analysis active tab)
 */
export function useWorkbenchKeys({
  maximizedPane,
  setMaximizedPane,
}: UseWorkbenchKeysParams): void {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && maximizedPane !== null) {
        setMaximizedPane(null);
        e.preventDefault();
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        const targets = [
          document.querySelector<HTMLElement>("#code-editor-pane .cm-content"),
          document.querySelector<HTMLElement>(
            "button[aria-label*='Reload preview']"
          ),
          document.querySelector<HTMLElement>(
            "[role='tablist'] [role='tab'][aria-selected='true']"
          ),
        ].filter(Boolean) as HTMLElement[];

        if (targets.length === 0) return;

        const activeIndex = targets.findIndex(
          (t) =>
            t === document.activeElement || t.contains(document.activeElement)
        );
        let nextIndex = 0;
        if (e.shiftKey) {
          nextIndex = activeIndex <= 0 ? targets.length - 1 : activeIndex - 1;
        } else {
          nextIndex = activeIndex >= targets.length - 1 ? 0 : activeIndex + 1;
        }
        targets[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maximizedPane, setMaximizedPane]);
}

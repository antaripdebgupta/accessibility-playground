import * as React from "react";

export interface UseWorkbenchKeysParams {
  maximizedPane: "editor" | "preview" | "analysis" | null;
  setMaximizedPane: (pane: "editor" | "preview" | "analysis" | null) => void;
  onForceScan?: () => void;
  isScanning?: boolean;
  isModalOpen?: boolean;
  mobilePane?: string;
  setMobilePane?: (pane: "editor" | "preview" | "analysis") => void;
  isDesktop?: boolean;
}

type PaneId = "editor" | "preview" | "analysis";

function resolvePaneFocusTargets(
  maximizedPane: "editor" | "preview" | "analysis" | null
): HTMLElement[] {
  const targets: (HTMLElement | null)[] = [
    document.querySelector<HTMLElement>("#code-editor-pane .cm-content"),
    document.querySelector<HTMLElement>("button[aria-label*='Reload preview']"),
    document.querySelector<HTMLElement>(
      "[role='tablist'] [role='tab'][aria-selected='true']"
    ),
  ];

  if (maximizedPane === "editor")
    return [targets[0]].filter(Boolean) as HTMLElement[];
  if (maximizedPane === "preview")
    return [targets[1]].filter(Boolean) as HTMLElement[];
  if (maximizedPane === "analysis")
    return [targets[2]].filter(Boolean) as HTMLElement[];

  return targets.filter(Boolean) as HTMLElement[];
}

/**
 * Handles workbench keyboard shortcuts:
 * - Escape exits any maximized pane
 * - F6 / Shift+F6 cycles focus between primary panes (editor, preview, analysis)
 * - Ctrl/Cmd+Enter triggers a rescan from anywhere in the workbench
 *
 * Returns a stable callback to forward shortcuts received from the preview iframe.
 */
export function useWorkbenchKeys({
  maximizedPane,
  setMaximizedPane,
  onForceScan,
  isScanning = false,
  isModalOpen = false,
  mobilePane,
  setMobilePane,
  isDesktop = true,
}: UseWorkbenchKeysParams): (
  key: string,
  shiftKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean
) => void {
  const onForceScanRef = React.useRef(onForceScan);
  const isScanningRef = React.useRef(isScanning);
  const isModalOpenRef = React.useRef(isModalOpen);
  const maximizedPaneRef = React.useRef(maximizedPane);
  const mobilePaneRef = React.useRef(mobilePane);
  const setMobilePaneRef = React.useRef(setMobilePane);
  const isDesktopRef = React.useRef(isDesktop);

  React.useEffect(() => {
    onForceScanRef.current = onForceScan;
  }, [onForceScan]);
  React.useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);
  React.useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);
  React.useEffect(() => {
    maximizedPaneRef.current = maximizedPane;
  }, [maximizedPane]);
  React.useEffect(() => {
    mobilePaneRef.current = mobilePane;
  }, [mobilePane]);
  React.useEffect(() => {
    setMobilePaneRef.current = setMobilePane;
  }, [setMobilePane]);
  React.useEffect(() => {
    isDesktopRef.current = isDesktop;
  }, [isDesktop]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && maximizedPaneRef.current !== null) {
        setMaximizedPane(null);
        e.preventDefault();
        return;
      }

      if (e.key === "F6" && !isModalOpenRef.current) {
        e.preventDefault();

        if (!isDesktopRef.current) {
          const panes: PaneId[] = ["editor", "preview", "analysis"];
          const current = mobilePaneRef.current as PaneId | undefined;
          const idx = current ? panes.indexOf(current) : 0;
          const next = e.shiftKey
            ? panes[(idx - 1 + panes.length) % panes.length]!
            : panes[(idx + 1) % panes.length]!;
          setMobilePaneRef.current?.(next);
          return;
        }

        const targets = resolvePaneFocusTargets(maximizedPaneRef.current);
        if (targets.length === 0) return;

        const activeEl = document.activeElement;
        const activeIndex = targets.findIndex(
          (t) => t === activeEl || t.contains(activeEl)
        );
        const nextIndex = e.shiftKey
          ? activeIndex <= 0
            ? targets.length - 1
            : activeIndex - 1
          : activeIndex >= targets.length - 1
            ? 0
            : activeIndex + 1;
        targets[nextIndex]?.focus();
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        !e.altKey &&
        !e.shiftKey &&
        !isModalOpenRef.current
      ) {
        // CodeMirror's own Mod-Enter binding calls preventDefault; skip double-fire
        if (e.defaultPrevented) return;

        // Don't intercept in native text inputs outside CodeMirror
        const target = e.target as HTMLElement;
        const isNativeText =
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
          !target.closest(".cm-editor");
        if (isNativeText) return;

        if (isScanningRef.current) return;

        e.preventDefault();
        onForceScanRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMaximizedPane]);

  // Stable callback for shortcuts forwarded from the preview iframe
  return React.useCallback(
    (key: string, shiftKey: boolean, ctrlKey: boolean, metaKey: boolean) => {
      if (isModalOpenRef.current) return;

      if (key === "F6") {
        if (!isDesktopRef.current) {
          const panes: PaneId[] = ["editor", "preview", "analysis"];
          const current = mobilePaneRef.current as PaneId | undefined;
          const idx = current ? panes.indexOf(current) : 0;
          const next = shiftKey
            ? panes[(idx - 1 + panes.length) % panes.length]!
            : panes[(idx + 1) % panes.length]!;
          setMobilePaneRef.current?.(next);
          return;
        }
        const targets = resolvePaneFocusTargets(maximizedPaneRef.current);
        if (targets.length === 0) return;
        // Focus is in the preview iframe (index 1); move to next pane
        const previewIdx = 1;
        const nextIndex = shiftKey
          ? previewIdx <= 0
            ? targets.length - 1
            : previewIdx - 1
          : previewIdx >= targets.length - 1
            ? 0
            : previewIdx + 1;
        targets[nextIndex]?.focus();
        return;
      }

      if (key === "Enter" && (ctrlKey || metaKey) && !shiftKey) {
        if (isScanningRef.current) return;
        onForceScanRef.current?.();
      }
    },
    [] // stable — reads only refs
  );
}

"use client";

import * as React from "react";
import { generatePreviewSrcDoc } from "@/lib/iframe-template";
import type { AxeFinding, FocusOrderPosition } from "@/types/a11y";
import { usePreviewBridge } from "./preview/usePreviewBridge";
import { PreviewToolbar, type ViewportWidth } from "./preview/PreviewToolbar";
import { ConsoleStrip } from "./preview/ConsoleStrip";

export interface PreviewFrameProps {
  instrumentedHtml: string;
  css?: string;
  selectedNodeId: string | null;
  scanId?: string;
  onSelectNodeId: (id: string) => void;
  onScanResults: (
    violations: readonly AxeFinding[],
    incomplete?: readonly AxeFinding[]
  ) => void;
  onScanError: (error: string) => void;
  parseError: string | null;
  focusPositions?: readonly FocusOrderPosition[];
  onFocusPositionsChange?: (positions: readonly FocusOrderPosition[]) => void;
  focusedElementId?: string | null;
  showFocusBadges?: boolean;
  useTailwind?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export function PreviewFrame({
  instrumentedHtml,
  css = "",
  selectedNodeId,
  scanId,
  onSelectNodeId,
  onScanResults,
  onScanError,
  parseError,
  focusPositions,
  onFocusPositionsChange,
  focusedElementId,
  showFocusBadges = true,
  useTailwind = false,
  isMaximized = false,
  onToggleMaximize,
}: PreviewFrameProps) {
  const [iframeKey, setIframeKey] = React.useState(0);
  const [viewportWidth, setViewportWidth] =
    React.useState<ViewportWidth>("full");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [forcedColors, setForcedColors] = React.useState(false);

  const {
    iframeRef,
    runtimeErrors,
    isConsoleOpen,
    setIsConsoleOpen,
    clearRuntimeErrors,
  } = usePreviewBridge({
    selectedNodeId,
    scanId,
    focusedElementId,
    onSelectNodeId,
    onScanResults,
    onScanError,
    onFocusPositionsChange,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isSimulatedWidthExceeded, setIsSimulatedWidthExceeded] =
    React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (viewportWidth === "full") {
          setIsSimulatedWidthExceeded(false);
        } else {
          const targetWidth = parseInt(viewportWidth, 10);
          setIsSimulatedWidthExceeded(entry.contentRect.width < targetWidth);
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportWidth]);

  const axeUrl = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/axe.min.js`;
    }
    return "/axe.min.js";
  }, []);

  const simulations = React.useMemo(() => {
    return { reducedMotion, forcedColors };
  }, [reducedMotion, forcedColors]);

  // srcDoc depends on HTML, CSS, axeUrl, useTailwind, and active simulations
  const srcDoc = React.useMemo(() => {
    return generatePreviewSrcDoc(
      instrumentedHtml,
      css,
      axeUrl,
      useTailwind,
      simulations
    );
  }, [instrumentedHtml, css, axeUrl, useTailwind, simulations]);

  return (
    <div
      role="region"
      aria-label="Interactive sandboxed HTML preview"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
    >
      <PreviewToolbar
        viewportWidth={viewportWidth}
        setViewportWidth={setViewportWidth}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        forcedColors={forcedColors}
        setForcedColors={setForcedColors}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
        onReload={() => setIframeKey((k) => k + 1)}
      />

      {/* Honest simulation disclaimer banners */}
      {(reducedMotion || forcedColors) && (
        <div
          role="status"
          className="border-b border-[var(--color-accent-subtle)] bg-[var(--color-accent-subtle)]/30 px-3 py-1 font-mono text-[10px] text-[var(--color-accent)]"
        >
          Simulated preview setting ({reducedMotion ? "reduced-motion" : ""}
          {reducedMotion && forcedColors ? ", " : ""}
          {forcedColors ? "forced-colors" : ""}) — does not replace testing in a
          real operating system environment.
        </div>
      )}

      {viewportWidth === "320" && (
        <div
          role="status"
          className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1 text-[10px] text-[var(--color-text-secondary)]"
        >
          320px viewport simulates 400% zoom on a standard 1280px display (WCAG
          1.4.10 Reflow).
        </div>
      )}

      {isSimulatedWidthExceeded && (
        <div
          role="status"
          className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1 text-[10px] text-[var(--color-text-secondary)]"
        >
          Simulated width ({viewportWidth}px) exceeds preview pane width.
        </div>
      )}

      <div
        ref={containerRef}
        className="min-h-0 w-full flex-1 overflow-auto bg-[var(--color-canvas)]"
      >
        <div
          className={`relative h-full bg-white ${
            viewportWidth === "320"
              ? "mx-auto w-[320px] max-w-none shrink-0 border-x border-[var(--color-border)] shadow-lg"
              : viewportWidth === "768"
                ? "mx-auto w-[768px] max-w-none shrink-0 border-x border-[var(--color-border)] shadow-lg"
                : viewportWidth === "1280"
                  ? "mx-auto w-[1280px] max-w-none shrink-0 border-x border-[var(--color-border)] shadow-lg"
                  : "w-full"
          }`}
        >
          {parseError ? (
            <div className="text-md flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center text-[var(--color-danger-default)]">
              <p className="font-semibold">{parseError}</p>
            </div>
          ) : !instrumentedHtml ? (
            <div className="text-md flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
              <p>
                Editor is empty. Paste or write HTML to generate the live
                preview.
              </p>
            </div>
          ) : (
            <>
              <iframe
                key={iframeKey}
                ref={iframeRef}
                srcDoc={srcDoc}
                title="Safe sandboxed HTML preview"
                sandbox="allow-scripts"
                className="h-full w-full border-0"
              />

              {/* Overlaid Tab Sequence Badges */}
              {showFocusBadges &&
                focusPositions &&
                focusPositions.length > 0 && (
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    {focusPositions.map((pos, idx) => {
                      const isSelected = selectedNodeId === pos.id;
                      const isSimulated = focusedElementId === pos.id;

                      return (
                        <div
                          key={`${pos.id}-${idx}`}
                          style={{
                            top: `${Math.max(4, pos.rect.top)}px`,
                            left: `${Math.max(4, pos.rect.left)}px`,
                          }}
                          className={`pointer-events-none absolute z-20 flex h-5 w-5 -translate-x-2 -translate-y-2 items-center justify-center rounded-full text-[10px] font-bold shadow-md transition-all ${
                            isSimulated
                              ? "scale-125 bg-[var(--color-focus-ring)] text-white ring-2 ring-white ring-offset-1"
                              : isSelected
                                ? "scale-110 bg-[var(--color-focus-ring)] text-white"
                                : "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      <ConsoleStrip
        runtimeErrors={runtimeErrors}
        isConsoleOpen={isConsoleOpen}
        setIsConsoleOpen={setIsConsoleOpen}
        onClearErrors={clearRuntimeErrors}
      />
    </div>
  );
}

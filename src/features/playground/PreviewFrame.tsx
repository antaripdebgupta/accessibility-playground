"use client";

import * as React from "react";
import { generatePreviewSrcDoc } from "@/lib/iframe-template";
import { safeParseIframeMessage } from "@/lib/postmessage-schema";
import type { AxeFinding, FocusOrderPosition } from "@/types/a11y";
import {
  RefreshCw,
  Maximize2,
  Minimize2,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  ZapOff,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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
  const [viewportWidth, setViewportWidth] = React.useState<"full" | "320" | "768" | "1280">("full");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [forcedColors, setForcedColors] = React.useState(false);
  const [runtimeErrors, setRuntimeErrors] = React.useState<
    readonly {
      id: string;
      message: string;
      source?: string;
      lineno?: number;
      colno?: number;
      timestamp: string;
    }[]
  >([]);
  const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const currentScanIdRef = React.useRef(scanId);

  React.useEffect(() => {
    currentScanIdRef.current = scanId;
  }, [scanId]);

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

  // Synchronize selection without reloading the iframe
  // Note: With sandbox="allow-scripts" and no allow-same-origin, the iframe has an opaque origin ("null"),
  // so targetOrigin "*" is required. Inbound messages are strictly verified via event.source === iframe.contentWindow.
  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "select-node", id: selectedNodeId },
        "*"
      );
    }
  }, [selectedNodeId]);

  // Trigger rescan when scanId changes
  React.useEffect(() => {
    if (scanId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "run-scan", scanId },
        "*"
      );
    }
  }, [scanId]);

  // Focus simulation
  React.useEffect(() => {
    if (focusedElementId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "focus-element", id: focusedElementId },
        "*"
      );
    }
  }, [focusedElementId]);

  // Handle messages with source verification and stale scanId filtering
  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Security check: only accept messages from our own iframe
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }

      const parsed = safeParseIframeMessage(event.data);
      if (!parsed) return;

      if (parsed.type === "element-clicked") {
        onSelectNodeId(parsed.id);
      } else if (parsed.type === "scan-results") {
        // Ignore stale scans
        if (
          parsed.scanId &&
          currentScanIdRef.current &&
          parsed.scanId !== "initial" &&
          parsed.scanId !== currentScanIdRef.current
        ) {
          return;
        }
        onScanResults(parsed.violations, parsed.incomplete);
      } else if (parsed.type === "scan-error") {
        if (
          parsed.scanId &&
          currentScanIdRef.current &&
          parsed.scanId !== currentScanIdRef.current
        ) {
          return;
        }
        onScanError(parsed.message);
      } else if (parsed.type === "focus-order") {
        onFocusPositionsChange?.(parsed.elements);
      } else if (parsed.type === "runtime-error") {
        setRuntimeErrors((prev) => [
          {
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            message: parsed.message,
            source: parsed.source,
            lineno: parsed.lineno,
            colno: parsed.colno,
            timestamp: parsed.timestamp,
          },
          ...prev,
        ].slice(0, 100));
        setIsConsoleOpen(true);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSelectNodeId, onScanResults, onScanError, onFocusPositionsChange]);

  return (
    <div
      role="region"
      aria-label="Interactive sandboxed HTML preview"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
    >
      {/* Preview Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-1.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)]">
            Live Preview
          </span>

          {/* Viewport Presets */}
          <div className="flex items-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5" role="toolbar" aria-label="Viewport size presets">
            <button
              type="button"
              onClick={() => setViewportWidth("full")}
              aria-pressed={viewportWidth === "full"}
              title="Full responsive width"
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                viewportWidth === "full"
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Monitor className="h-3 w-3" aria-hidden="true" />
              <span>Full</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportWidth("768")}
              aria-pressed={viewportWidth === "768"}
              title="768px Tablet viewport"
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                viewportWidth === "768"
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Tablet className="h-3 w-3" aria-hidden="true" />
              <span>768px</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportWidth("320")}
              aria-pressed={viewportWidth === "320"}
              title="320px Reflow / Mobile viewport (WCAG 1.4.10)"
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                viewportWidth === "320"
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Smartphone className="h-3 w-3" aria-hidden="true" />
              <span>320px</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Simulations */}
          <div className="flex items-center gap-1" role="toolbar" aria-label="Accessibility media simulations">
            <button
              type="button"
              onClick={() => setReducedMotion((v) => !v)}
              aria-pressed={reducedMotion}
              title="Simulate prefers-reduced-motion: reduce"
              className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                reducedMotion
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/50 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <ZapOff className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Reduced Motion</span>
            </button>

            <button
              type="button"
              onClick={() => setForcedColors((v) => !v)}
              aria-pressed={forcedColors}
              title="Simulate forced-colors: active (High Contrast Mode)"
              className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                forcedColors
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/50 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Forced Colors</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              aria-label={
                isMaximized
                  ? "Restore pane size (Esc)"
                  : "Maximize live preview"
              }
              aria-pressed={isMaximized}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              {isMaximized ? (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Reload preview frame"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Honest simulation disclaimer banners */}
      {(reducedMotion || forcedColors) && (
        <div
          role="status"
          className="border-b border-[var(--color-accent-subtle)] bg-[var(--color-accent-subtle)]/30 px-3 py-1 font-mono text-[10px] text-[var(--color-accent)]"
        >
          Simulated preview setting ({reducedMotion ? "reduced-motion" : ""}{reducedMotion && forcedColors ? ", " : ""}{forcedColors ? "forced-colors" : ""}) — does not replace testing in a real operating system environment.
        </div>
      )}

      {viewportWidth === "320" && (
        <div
          role="status"
          className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-1 text-[10px] text-[var(--color-text-secondary)]"
        >
          320px viewport simulates 400% zoom on a standard 1280px display (WCAG 1.4.10 Reflow).
        </div>
      )}

      {/* Frame Container */}
      <div className={`relative min-h-0 w-full flex-1 bg-white ${
        viewportWidth === "320"
          ? "mx-auto max-w-[320px] shadow-lg border-x border-[var(--color-border)]"
          : viewportWidth === "768"
          ? "mx-auto max-w-[768px] shadow-lg border-x border-[var(--color-border)]"
          : viewportWidth === "1280"
          ? "mx-auto max-w-[1280px] shadow-lg border-x border-[var(--color-border)]"
          : ""
      }`}>
        {parseError ? (
          <div className="text-md flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center text-[var(--color-danger-default)]">
            <p className="font-semibold">{parseError}</p>
          </div>
        ) : !instrumentedHtml ? (
          <div className="text-md flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
            <p>
              Editor is empty. Paste or write HTML to generate the live preview.
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

            {/* Overlaid Tab Sequence Badges (Visual only, aria-hidden, pointer-events-none) */}
            {showFocusBadges && focusPositions && focusPositions.length > 0 && (
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

      {/* Collapsible Console Strip (Capped at 100 entries) */}
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
              <Badge variant="danger" className="text-[9px] px-1 py-0 font-normal">
                {runtimeErrors.length} {runtimeErrors.length === 1 ? "error" : "errors"}
              </Badge>
            )}
          </button>

          {runtimeErrors.length > 0 && (
            <button
              type="button"
              onClick={() => setRuntimeErrors([])}
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
            className="max-h-36 overflow-y-auto border-t border-[var(--color-border)] p-2 font-mono text-[11px] space-y-1.5"
          >
            {runtimeErrors.length === 0 ? (
              <div className="text-[var(--color-text-secondary)] opacity-60 italic text-[10px]">
                No runtime exceptions detected.
              </div>
            ) : (
              runtimeErrors.map((err) => (
                <div
                  key={err.id}
                  className="flex items-start gap-1.5 text-[var(--color-danger-default)]"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">{err.message}</p>
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
    </div>
  );
}

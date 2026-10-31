"use client";

import * as React from "react";
import { generatePreviewSrcDoc } from "@/lib/iframe-template";
import { safeParseIframeMessage } from "@/lib/postmessage-schema";
import type { AxeFinding, FocusOrderPosition } from "@/types/a11y";
import { RefreshCw } from "lucide-react";

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
  isDragging?: boolean;
  useTailwind?: boolean;
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
  isDragging = false,
  useTailwind = false,
}: PreviewFrameProps) {
  const [iframeKey, setIframeKey] = React.useState(0);
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

  // srcDoc depends on HTML, CSS, axeUrl, and useTailwind - NOT selectedNodeId!
  const srcDoc = React.useMemo(() => {
    return generatePreviewSrcDoc(instrumentedHtml, css, axeUrl, useTailwind);
  }, [instrumentedHtml, css, axeUrl, useTailwind]);

  // Synchronize selection without reloading the iframe
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
      className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
            Live Preview
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          aria-label="Reload preview frame"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Frame Container */}
      <div className="relative max-h-[360px] min-h-[220px] w-full bg-white">
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
              className={`h-full min-h-[220px] w-full border-0 ${
                isDragging ? "pointer-events-none" : ""
              }`}
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
    </div>
  );
}

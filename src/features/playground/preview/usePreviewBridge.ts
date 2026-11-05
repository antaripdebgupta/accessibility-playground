import * as React from "react";
import {
  safeParseIframeMessage,
  type HostMessage,
} from "@/lib/postmessage-schema";
import type { AxeFinding, FocusOrderPosition } from "@/types/a11y";

export interface RuntimeErrorItem {
  id: string;
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  timestamp: string;
}

export interface UsePreviewBridgeParams {
  selectedNodeId: string | null;
  scanId?: string;
  focusedElementId?: string | null;
  onSelectNodeId: (id: string) => void;
  onScanResults: (
    violations: readonly AxeFinding[],
    incomplete?: readonly AxeFinding[]
  ) => void;
  onScanError: (error: string) => void;
  onFocusPositionsChange?: (positions: readonly FocusOrderPosition[]) => void;
}

export function usePreviewBridge({
  selectedNodeId,
  scanId,
  focusedElementId,
  onSelectNodeId,
  onScanResults,
  onScanError,
  onFocusPositionsChange,
}: UsePreviewBridgeParams) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const currentScanIdRef = React.useRef(scanId);
  const [runtimeErrors, setRuntimeErrors] = React.useState<
    readonly RuntimeErrorItem[]
  >([]);
  const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);

  React.useEffect(() => {
    currentScanIdRef.current = scanId;
  }, [scanId]);

  // Typed host-to-iframe postMessage helper
  const postToIframe = React.useCallback((msg: HostMessage) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, "*");
    }
  }, []);

  // Synchronize selection without reloading the iframe
  React.useEffect(() => {
    postToIframe({ type: "select-node", id: selectedNodeId });
  }, [selectedNodeId, postToIframe]);

  // Trigger rescan when scanId changes
  React.useEffect(() => {
    if (scanId) {
      postToIframe({ type: "run-scan", scanId });
    }
  }, [scanId, postToIframe]);

  // Focus simulation
  React.useEffect(() => {
    if (focusedElementId) {
      postToIframe({ type: "focus-element", id: focusedElementId });
    }
  }, [focusedElementId, postToIframe]);

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
        setRuntimeErrors((prev) =>
          [
            {
              id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              message: parsed.message,
              source: parsed.source,
              lineno: parsed.lineno,
              colno: parsed.colno,
              timestamp: parsed.timestamp,
            },
            ...prev,
          ].slice(0, 100)
        );
        setIsConsoleOpen(true);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSelectNodeId, onScanResults, onScanError, onFocusPositionsChange]);

  const clearRuntimeErrors = React.useCallback(() => {
    setRuntimeErrors([]);
  }, []);

  return {
    iframeRef,
    runtimeErrors,
    isConsoleOpen,
    setIsConsoleOpen,
    clearRuntimeErrors,
  };
}

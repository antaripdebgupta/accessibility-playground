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
  srcDoc?: string;
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
  onShortcut?: (
    key: string,
    shiftKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean
  ) => void;
}

export function usePreviewBridge({
  srcDoc,
  selectedNodeId,
  scanId,
  focusedElementId,
  onSelectNodeId,
  onScanResults,
  onScanError,
  onFocusPositionsChange,
  onShortcut,
}: UsePreviewBridgeParams) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const currentScanIdRef = React.useRef(scanId);
  const isFrameReadyRef = React.useRef(false);
  const latestSrcDocRef = React.useRef(srcDoc);
  const pendingScanRef = React.useRef<string | null>(null);
  const scanTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [runtimeErrors, setRuntimeErrors] = React.useState<
    readonly RuntimeErrorItem[]
  >([]);
  const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);

  const onScanErrorRef = React.useRef(onScanError);
  React.useEffect(() => {
    onScanErrorRef.current = onScanError;
  }, [onScanError]);

  const clearScanTimeout = React.useCallback(() => {
    if (scanTimeoutRef.current !== null) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  const armScanTimeout = React.useCallback(() => {
    clearScanTimeout();
    scanTimeoutRef.current = setTimeout(() => {
      onScanErrorRef.current("Scan timed out after 12 seconds.");
    }, 12000);
  }, [clearScanTimeout]);

  React.useEffect(() => {
    currentScanIdRef.current = scanId;
  }, [scanId]);

  React.useEffect(() => {
    latestSrcDocRef.current = srcDoc;
  }, [srcDoc]);

  const postToIframe = React.useCallback((msg: HostMessage) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, "*");
    }
  }, []);

  const sendDocument = React.useCallback(() => {
    if (latestSrcDocRef.current && iframeRef.current?.contentWindow) {
      postToIframe({ type: "render-document", html: latestSrcDocRef.current });
    }
  }, [postToIframe]);

  React.useEffect(() => {
    if (srcDoc && isFrameReadyRef.current) {
      sendDocument();
    }
  }, [srcDoc, sendDocument]);

  React.useEffect(() => {
    postToIframe({ type: "select-node", id: selectedNodeId });
  }, [selectedNodeId, postToIframe]);

  React.useEffect(() => {
    if (scanId) {
      if (!isFrameReadyRef.current) {
        // Queue the scan; it will be flushed on preview-frame-ready
        pendingScanRef.current = scanId;
      } else {
        postToIframe({ type: "run-scan", scanId });
        armScanTimeout();
      }
    }
  }, [scanId, postToIframe, armScanTimeout]);

  React.useEffect(() => {
    if (focusedElementId) {
      postToIframe({ type: "focus-element", id: focusedElementId });
    }
  }, [focusedElementId, postToIframe]);

  // Cleanup timeout on unmount
  React.useEffect(() => () => clearScanTimeout(), [clearScanTimeout]);

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }

      const parsed = safeParseIframeMessage(event.data);
      if (!parsed) return;

      if (parsed.type === "preview-frame-ready") {
        isFrameReadyRef.current = true;
        sendDocument();
        // Flush any scan that was queued before the frame was ready
        if (pendingScanRef.current) {
          const queuedScanId = pendingScanRef.current;
          pendingScanRef.current = null;
          postToIframe({ type: "run-scan", scanId: queuedScanId });
          armScanTimeout();
        }
      } else if (parsed.type === "element-clicked") {
        onSelectNodeId(parsed.id);
      } else if (parsed.type === "scan-results") {
        if (
          parsed.scanId &&
          currentScanIdRef.current &&
          parsed.scanId !== "initial" &&
          parsed.scanId !== currentScanIdRef.current
        ) {
          return;
        }
        onScanResults(parsed.violations, parsed.incomplete);
        clearScanTimeout();
      } else if (parsed.type === "scan-error") {
        if (
          parsed.scanId &&
          currentScanIdRef.current &&
          parsed.scanId !== currentScanIdRef.current
        ) {
          return;
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn("[PreviewBridge] Scan error:", parsed.message, {
            hint: "Check Cross-Origin-Resource-Policy and CSP headers for axe script and preview-frame.",
          });
        }
        onScanError(parsed.message);
        clearScanTimeout();
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
      } else if (parsed.type === "shortcut") {
        onShortcut?.(
          parsed.key,
          parsed.shiftKey ?? false,
          parsed.ctrlKey ?? false,
          parsed.metaKey ?? false
        );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    onSelectNodeId,
    onScanResults,
    onScanError,
    onFocusPositionsChange,
    onShortcut,
    sendDocument,
    postToIframe,
    armScanTimeout,
    clearScanTimeout,
  ]);

  const clearRuntimeErrors = React.useCallback(() => {
    setRuntimeErrors([]);
  }, []);

  return {
    iframeRef,
    runtimeErrors,
    isConsoleOpen,
    setIsConsoleOpen,
    clearRuntimeErrors,
    postToIframe,
  };
}

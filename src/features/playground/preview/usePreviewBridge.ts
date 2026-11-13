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
}: UsePreviewBridgeParams) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const currentScanIdRef = React.useRef(scanId);
  const isFrameReadyRef = React.useRef(false);
  const latestSrcDocRef = React.useRef(srcDoc);
  const [runtimeErrors, setRuntimeErrors] = React.useState<
    readonly RuntimeErrorItem[]
  >([]);
  const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);

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
      postToIframe({ type: "run-scan", scanId });
    }
  }, [scanId, postToIframe]);

  React.useEffect(() => {
    if (focusedElementId) {
      postToIframe({ type: "focus-element", id: focusedElementId });
    }
  }, [focusedElementId, postToIframe]);

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
  }, [
    onSelectNodeId,
    onScanResults,
    onScanError,
    onFocusPositionsChange,
    sendDocument,
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

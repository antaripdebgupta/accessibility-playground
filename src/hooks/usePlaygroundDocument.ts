"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { DEFAULT_DOCUMENT } from "@/data/default-document";
import { decodeSnippet } from "@/lib/snippet-share";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useToast } from "@accessly-ui/react";
import type { ExternalEdit } from "@/features/playground/CodeEditor";

const MAX_DOCUMENT_BYTES = 200 * 1024; // 200KB hard input cap (§B.4)

export function usePlaygroundDocument(onDocumentChange?: () => void) {
  const searchParams = useSearchParams();
  const sharedParam = searchParams.get("s");
  const toast = useToast();

  const [rawHtml, setRawHtml] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      if (sharedParam) {
        const decoded = decodeSnippet(sharedParam);
        if (decoded) return decoded.html;
      }
      const saved = storage.get(STORAGE_KEYS.html);
      if (saved) return saved;
    }
    return DEFAULT_DOCUMENT.html;
  });

  const [rawCss, setRawCss] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      if (sharedParam) {
        const decoded = decodeSnippet(sharedParam);
        if (decoded) return decoded.css;
      }
      const saved = storage.get(STORAGE_KEYS.css);
      if (saved) return saved;
    }
    return DEFAULT_DOCUMENT.css;
  });

  const debouncedHtml = useDebounce(rawHtml, 400);
  const debouncedCss = useDebounce(rawCss, 400);

  const [useTailwind, setUseTailwind] = React.useState<boolean>(() => {
    return storage.get(STORAGE_KEYS.tailwind) === "true";
  });

  // Sync Tailwind preference to storage
  React.useEffect(() => {
    storage.set(STORAGE_KEYS.tailwind, String(useTailwind));
  }, [useTailwind]);

  // Persist session to storage
  React.useEffect(() => {
    if (debouncedHtml) {
      storage.set(STORAGE_KEYS.html, debouncedHtml);
    }
  }, [debouncedHtml]);

  React.useEffect(() => {
    storage.set(STORAGE_KEYS.css, debouncedCss);
  }, [debouncedCss]);

  // External edit state: single channel for all programmatic updates
  const externalEditSeqRef = React.useRef(0);
  const [externalEdit, setExternalEdit] = React.useState<ExternalEdit | null>(
    null
  );

  const pushExternalEdit = React.useCallback(
    (kind: ExternalEdit["kind"], text: string) => {
      externalEditSeqRef.current += 1;
      setExternalEdit({ id: externalEditSeqRef.current, kind, text });
    },
    []
  );

  // Restore toast on initial mount
  const hasShownRestoreToast = React.useRef(false);
  React.useEffect(() => {
    if (hasShownRestoreToast.current) return;
    hasShownRestoreToast.current = true;
    if (typeof window !== "undefined" && !sharedParam) {
      if (storage.get(STORAGE_KEYS.html)) {
        toast.push({
          title: "Session restored",
          description: "Your last session was restored from local storage.",
          variant: "info",
        });
      }
    }
  }, [sharedParam, toast]);

  const handleStartFresh = React.useCallback(() => {
    const freshHtml = DEFAULT_DOCUMENT.html;
    storage.remove(STORAGE_KEYS.html);
    storage.remove(STORAGE_KEYS.css);
    setRawHtml(freshHtml);
    setRawCss(DEFAULT_DOCUMENT.css);
    pushExternalEdit("replace", freshHtml);
    onDocumentChange?.();
    toast.push({
      title: "Started fresh",
      description: "Reset code editor to the default example.",
      variant: "info",
    });
  }, [onDocumentChange, toast, pushExternalEdit]);

  const handleResetExample = React.useCallback(() => {
    let targetHtml: string = DEFAULT_DOCUMENT.html;
    let targetCss: string = DEFAULT_DOCUMENT.css;

    if (sharedParam) {
      const decoded = decodeSnippet(sharedParam);
      if (decoded) {
        targetHtml = decoded.html;
        targetCss = decoded.css;
      }
    }

    setRawHtml(targetHtml);
    setRawCss(targetCss);
    pushExternalEdit("replace", targetHtml);
    onDocumentChange?.();
    toast.push({
      title: "Example reset",
      description: "Restored code to original starter state.",
      variant: "info",
    });
  }, [sharedParam, onDocumentChange, toast, pushExternalEdit]);

  const updateHtml = React.useCallback(
    (valOrUpdater: string | ((prev: string) => string)) => {
      setRawHtml(valOrUpdater);
      onDocumentChange?.();
    },
    [onDocumentChange]
  );

  const updateCss = React.useCallback(
    (valOrUpdater: string | ((prev: string) => string)) => {
      setRawCss(valOrUpdater);
      onDocumentChange?.();
    },
    [onDocumentChange]
  );

  const isOverSizeLimit = rawHtml.length > MAX_DOCUMENT_BYTES;

  return {
    rawHtml,
    rawCss,
    debouncedHtml,
    debouncedCss,
    useTailwind,
    setRawHtml: updateHtml,
    setRawCss: updateCss,
    setUseTailwind,
    handleStartFresh,
    handleResetExample,
    isOverSizeLimit,
    externalEdit,
    pushExternalEdit,
  };
}

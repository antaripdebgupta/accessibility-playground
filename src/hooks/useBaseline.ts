"use client";

import * as React from "react";
import type { Finding } from "@/types/a11y";
import { compare, type CompareResult } from "@/lib/compare";

const BASELINE_SESSION_KEY_PREFIX = "ap_baseline_";

export interface BaselineData {
  readonly id: string;
  readonly findings: readonly Finding[];
  readonly html: string;
  readonly timestamp: string;
}

function getStorageKey(id: string): string {
  return `${BASELINE_SESSION_KEY_PREFIX}${id}`;
}

function loadBaselineFromSession(id: string): BaselineData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.findings)
    ) {
      return parsed as BaselineData;
    }
  } catch {
    // Ignore sessionStorage parse errors
  }
  return null;
}

function saveBaselineToSession(data: BaselineData): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(getStorageKey(data.id), JSON.stringify(data));
  } catch {
    // Ignore sessionStorage quota errors
  }
}

function removeBaselineFromSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(getStorageKey(id));
  } catch {
    // Ignore
  }
}

export function useBaseline(
  activeId: string,
  currentFindings: readonly Finding[],
  currentHtml: string,
  onBaselineCleared?: (reason: string) => void
) {
  const [baseline, setBaselineState] = React.useState<BaselineData | null>(
    () => {
      return loadBaselineFromSession(activeId);
    }
  );

  const activeIdRef = React.useRef(activeId);

  // Clear baseline if active template/snippet ID changes
  React.useEffect(() => {
    if (activeIdRef.current !== activeId) {
      activeIdRef.current = activeId;
      setBaselineState(loadBaselineFromSession(activeId));
      if (baseline) {
        onBaselineCleared?.("Switched template or snippet");
      }
    }
  }, [activeId, baseline, onBaselineCleared]);

  const setBaseline = React.useCallback(() => {
    const data: BaselineData = {
      id: activeId,
      findings: currentFindings,
      html: currentHtml,
      timestamp: new Date().toISOString(),
    };
    saveBaselineToSession(data);
    setBaselineState(data);
  }, [activeId, currentFindings, currentHtml]);

  const clearBaseline = React.useCallback(
    (reason?: string) => {
      removeBaselineFromSession(activeId);
      setBaselineState(null);
      if (reason && onBaselineCleared) {
        onBaselineCleared(reason);
      }
    },
    [activeId, onBaselineCleared]
  );

  const comparison: CompareResult | null = React.useMemo(() => {
    if (!baseline) return null;
    return compare(baseline.findings, currentFindings);
  }, [baseline, currentFindings]);

  return {
    baseline,
    hasBaseline: baseline !== null,
    setBaseline,
    clearBaseline,
    comparison,
  };
}

"use client";

import * as React from "react";
import { z } from "zod";
import type { Finding } from "@/types/a11y";
import { compare, type CompareResult } from "@/lib/compare";
import { storage } from "@/lib/storage";

const BASELINE_SESSION_KEY_PREFIX = "ap_baseline_v1_";

const WcagRefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  level: z.string().optional(),
  url: z.string().optional(),
});

const FindingNodeSchema = z.object({
  html: z.string(),
  target: z.array(z.string()),
  failureSummary: z.string().optional(),
  targetId: z.string().optional(),
});

const FindingSchema = z.object({
  fingerprint: z.string(),
  ruleId: z.string(),
  engine: z.enum(["axe-core", "playground"]),
  status: z.enum(["violation", "needs-review"]),
  confidence: z.enum(["high", "medium", "low"]),
  impact: z.enum(["critical", "serious", "moderate", "minor"]),
  wcag: z.array(WcagRefSchema),
  help: z.string(),
  description: z.string(),
  helpUrl: z.string().optional(),
  nodes: z.array(FindingNodeSchema),
  fix: z.unknown().optional(),
});

const BaselineDataSchema = z.object({
  id: z.string(),
  findings: z.array(FindingSchema),
  html: z.string(),
  timestamp: z.string(),
});

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
  return storage.session.getJSON(
    getStorageKey(id),
    BaselineDataSchema
  ) as BaselineData | null;
}

function saveBaselineToSession(data: BaselineData): void {
  storage.session.setJSON(getStorageKey(data.id), data);
}

function removeBaselineFromSession(id: string): void {
  storage.session.remove(getStorageKey(id));
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

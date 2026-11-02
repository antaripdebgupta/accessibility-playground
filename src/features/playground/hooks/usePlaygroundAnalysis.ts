import * as React from "react";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import { computeFocusOrder } from "@/lib/focus-order";
import { runCustomRules } from "@/lib/custom-rules";
import {
  normalizeFindings,
  findingsToAxeFindings,
} from "@/lib/findings/normalize";
import type { A11yNode, AxeFinding, Finding } from "@/types/a11y";
import type { ComputedFocusOrder } from "@/lib/focus-order";

export interface UsePlaygroundAnalysisParams {
  debouncedHtml: string;
  rawHtml: string;
  debouncedCss: string;
  isOverSizeLimit: boolean;
  axeViolations: readonly AxeFinding[];
  axeIncomplete: readonly AxeFinding[];
}

export interface PlaygroundAnalysisResult {
  ast: A11yNode | null;
  instrumentedHtml: string;
  parseError: string | null;
  focusOrder: ComputedFocusOrder | null;
  customFindings: readonly AxeFinding[];
  findings: Finding[];
  mergedViolations: AxeFinding[];
  violationCount: number;
  currentViolationRuleIds: string[];
}

/**
 * Derives and memoises live AST, focus order sequence, and consolidated findings
 * from the current playground document and axe-core scan results.
 */
export function usePlaygroundAnalysis({
  debouncedHtml,
  rawHtml,
  debouncedCss,
  isOverSizeLimit,
  axeViolations,
  axeIncomplete,
}: UsePlaygroundAnalysisParams): PlaygroundAnalysisResult {
  // Parse AST whenever debouncedHtml changes (skip if over size limit §B.4)
  const {
    ast,
    instrumentedHtml,
    error: parseError,
  } = React.useMemo(() => {
    if (isOverSizeLimit) {
      return {
        ast: null,
        instrumentedHtml: rawHtml,
        error: "Document too large for live AST parsing.",
      };
    }
    return parseHtmlToA11yTree(debouncedHtml);
  }, [debouncedHtml, isOverSizeLimit, rawHtml]);

  // Derive computed focus sequence
  const focusOrder = React.useMemo(() => {
    if (!ast) return null;
    return computeFocusOrder(ast);
  }, [ast]);

  // Run custom playground rules host-side immediately
  const customFindings = React.useMemo(() => {
    if (!ast || isOverSizeLimit) return [];
    return runCustomRules(ast, debouncedCss, debouncedHtml);
  }, [ast, debouncedCss, debouncedHtml, isOverSizeLimit]);

  // Normalized findings as single source of truth for reports, comparison, and inspector
  const findings = React.useMemo(() => {
    return normalizeFindings(customFindings, axeViolations, axeIncomplete);
  }, [customFindings, axeViolations, axeIncomplete]);

  // Derived legacy AxeFinding[] for legacy consumers / auto-fix
  const mergedViolations = React.useMemo(() => {
    return findingsToAxeFindings(
      findings.filter((f) => f.status === "violation")
    );
  }, [findings]);

  // Collect all current violation rule IDs for challenge verification
  const currentViolationRuleIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const f of findings) {
      ids.add(f.ruleId);
    }
    return Array.from(ids);
  }, [findings]);

  return {
    ast,
    instrumentedHtml,
    parseError,
    focusOrder,
    customFindings,
    findings,
    mergedViolations,
    violationCount: mergedViolations.length,
    currentViolationRuleIds,
  };
}

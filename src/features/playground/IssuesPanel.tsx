"use client";

import * as React from "react";
import type { AxeFinding, Finding } from "@/types/a11y";
import { normalizeFindings } from "@/lib/findings/normalize";
import { IssuesList } from "./IssuesList";
import { FindingDetail } from "./FindingDetail";
import {
  AlertOctagon,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export interface IssuesPanelProps {
  findings?: readonly Finding[];
  violations?: readonly (AxeFinding | Finding)[];
  incomplete?: readonly (AxeFinding | Finding)[];
  isScanning: boolean;
  scanError: string | null;
  hasHtml: boolean;
  onSelectNode?: (id: string) => void;
  onOpenInspector?: (
    inspector: "tree" | "aria" | "accname" | "focus" | "announce",
    nodeId?: string
  ) => void;
  onApplyFix?: (finding: AxeFinding) => void;
}

function isNormalizedFinding(f: AxeFinding | Finding): f is Finding {
  return "status" in f && "fingerprint" in f && "confidence" in f;
}

export function IssuesPanel({
  findings: propFindings,
  violations = [],
  incomplete = [],
  isScanning,
  scanError,
  hasHtml,
  onSelectNode,
  onOpenInspector,
  onApplyFix,
}: IssuesPanelProps) {
  const [selectedFingerprint, setSelectedFingerprint] = React.useState<
    string | null
  >(null);

  // Normalize findings if not already provided as Finding[]
  const findings: readonly Finding[] = React.useMemo(() => {
    if (propFindings) return propFindings;

    const allViolationsAreNormalized = violations.length > 0 && violations.every(isNormalizedFinding);
    if (allViolationsAreNormalized) {
      return violations as Finding[];
    }

    const axeFindings = violations as AxeFinding[];
    const axeIncomplete = incomplete as AxeFinding[];
    return normalizeFindings([], axeFindings, axeIncomplete);
  }, [propFindings, violations, incomplete]);

  // Selected finding lookup
  const selectedFinding = React.useMemo(() => {
    if (!selectedFingerprint) return null;
    return findings.find((f) => f.fingerprint === selectedFingerprint) || null;
  }, [findings, selectedFingerprint]);

  if (!hasHtml) {
    return (
      <div className="flex h-48 items-center justify-center p-6 text-center text-xs text-[var(--color-text-secondary)]">
        Write or paste HTML in the editor to run the automated accessibility audit.
      </div>
    );
  }

  if (scanError) {
    return (
      <div className="flex h-48 flex-col items-center justify-center p-6 text-center text-[var(--color-danger-default)]">
        <AlertOctagon className="mb-2 h-6 w-6" aria-hidden="true" />
        <p className="font-semibold text-xs">Audit Scan Failed</p>
        <p className="max-w-md text-[11px] text-[var(--color-text-secondary)]">
          {scanError} Check that axe.min.js is accessible and iframe permissions are active.
        </p>
      </div>
    );
  }

  if (isScanning && findings.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-focus-ring)] border-t-transparent" />
        <p className="font-medium text-xs text-[var(--color-text-primary)]">
          Running automated accessibility scan…
        </p>
      </div>
    );
  }

  const violationCount = findings.filter((f) => f.status === "violation").length;
  const reviewCount = findings.filter((f) => f.status === "needs-review").length;
  const manualCount = findings.filter((f) => f.status === "manual-required").length;

  if (findings.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <CheckCircle2
            className="mb-2 h-7 w-7 text-[var(--color-success-default)]"
            aria-hidden="true"
          />
          <p className="font-semibold text-xs text-[var(--color-text-primary)]">
            No automated issues detected
          </p>
          <p className="mt-1 max-w-sm text-[11px] text-[var(--color-text-secondary)]">
            Automated checks passed. Always test manually with keyboard navigation, screen readers, and zoom.
          </p>
        </div>

        {/* Honest disclaimer */}
        <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-3 text-center text-[11px] text-[var(--color-text-secondary)]">
          <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          <p className="font-medium">Testing Notice</p>
          <p className="mt-0.5">
            Automated checks find only a subset of WCAG issues. Passing them does not mean the page is accessible.
          </p>
        </div>
      </div>
    );
  }

  // If a finding is selected, show detail view with back button
  if (selectedFinding) {
    return (
      <div className="flex flex-col">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-2">
          <button
            type="button"
            onClick={() => setSelectedFingerprint(null)}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to all issues ({findings.length})</span>
          </button>
        </div>
        <FindingDetail
          finding={selectedFinding}
          onSelectNode={onSelectNode}
          onOpenInspector={onOpenInspector}
          onApplyFix={onApplyFix}
        />
      </div>
    );
  }

  // Count severities
  const criticalCount = findings.filter((f) => f.impact === "critical").length;
  const seriousCount = findings.filter((f) => f.impact === "serious").length;
  const moderateCount = findings.filter((f) => f.impact === "moderate").length;
  const minorCount = findings.filter((f) => f.impact === "minor").length;

  const engines = Array.from(new Set(findings.map((f) => f.engine)));

  return (
    <div className="flex flex-col">
      {/* Honest Summary Header (§B.3) */}
      <header className="flex flex-col gap-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              {violationCount} {violationCount === 1 ? "violation" : "violations"}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs font-medium text-[var(--color-warning-default)]">
                · {reviewCount} to review
              </span>
            )}
            {manualCount > 0 && (
              <span className="text-xs font-medium text-[var(--color-info-default)]">
                · {manualCount} manual
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)]">
            <span>Engines:</span>
            {engines.map((e) => (
              <span
                key={e}
                className="rounded bg-[var(--color-surface-sunken)] px-1.5 py-0.5 font-mono"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Severity breakdown chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-danger-subtle)] px-2 py-0.5 font-medium text-[var(--color-danger-text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger-default)]" />
              {criticalCount} critical
            </span>
          )}
          {seriousCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-warning-subtle)] px-2 py-0.5 font-medium text-[var(--color-warning-text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning-default)]" />
              {seriousCount} serious
            </span>
          )}
          {moderateCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[var(--color-text-secondary)]">
              {moderateCount} moderate
            </span>
          )}
          {minorCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[var(--color-text-secondary)]">
              {minorCount} minor
            </span>
          )}
        </div>

        {/* Fixed honest disclaimer: no score, automated limits noted */}
        <div className="flex items-start gap-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/80 p-2 text-[11px] text-[var(--color-text-secondary)]">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-warning-default)]" aria-hidden="true" />
          <p>
            Automated checks find only a subset of WCAG issues. Passing them does not mean the page is accessible.
          </p>
        </div>
      </header>

      {/* Issues list */}
      <IssuesList
        findings={findings}
        selectedFingerprint={selectedFingerprint}
        onSelectFinding={(f) => setSelectedFingerprint(f.fingerprint)}
      />
    </div>
  );
}

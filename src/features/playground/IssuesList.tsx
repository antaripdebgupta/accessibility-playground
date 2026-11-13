"use client";

import * as React from "react";
import type { Finding, FindingStatus, AxeImpactLevel } from "@/types/a11y";
import { FindingRow } from "./issues/FindingRow";
import { IssuesFilters } from "./issues/IssuesFilters";
import { AlertOctagon, AlertTriangle, HelpCircle } from "lucide-react";

export interface IssuesListProps {
  findings: readonly Finding[];
  selectedFingerprint: string | null;
  onSelectFinding: (finding: Finding) => void;
}

const SEVERITY_ORDER: Record<AxeImpactLevel, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export function IssuesList({
  findings,
  selectedFingerprint,
  onSelectFinding,
}: IssuesListProps) {
  const [statusFilter, setStatusFilter] = React.useState<"all" | FindingStatus>(
    "all"
  );
  const [severityFilter, setSeverityFilter] = React.useState<
    "all" | AxeImpactLevel
  >("all");
  const [engineFilter, setEngineFilter] = React.useState<
    "all" | "axe-core" | "playground"
  >("all");

  const filteredFindings = React.useMemo(() => {
    return findings.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (severityFilter !== "all" && f.impact !== severityFilter) return false;
      if (engineFilter !== "all" && f.engine !== engineFilter) return false;
      return true;
    });
  }, [findings, statusFilter, severityFilter, engineFilter]);

  // Group by status first, then sort by severity inside each status group
  const violations = React.useMemo(() => {
    return filteredFindings
      .filter((f) => f.status === "violation")
      .sort(
        (a, b) =>
          (SEVERITY_ORDER[a.impact] ?? 99) - (SEVERITY_ORDER[b.impact] ?? 99)
      );
  }, [filteredFindings]);

  const needsReview = React.useMemo(() => {
    return filteredFindings
      .filter((f) => f.status === "needs-review")
      .sort(
        (a, b) =>
          (SEVERITY_ORDER[a.impact] ?? 99) - (SEVERITY_ORDER[b.impact] ?? 99)
      );
  }, [filteredFindings]);

  const manualCheck = React.useMemo(() => {
    return filteredFindings
      .filter((f) => f.status === "manual-required")
      .sort(
        (a, b) =>
          (SEVERITY_ORDER[a.impact] ?? 99) - (SEVERITY_ORDER[b.impact] ?? 99)
      );
  }, [filteredFindings]);

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Polite live region for announcing filter results to assistive tech */}
      <div role="status" aria-live="polite" className="sr-only">
        Showing {filteredFindings.length} accessibility findings
      </div>

      {/* Accessible filter controls */}
      <IssuesFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        engineFilter={engineFilter}
        setEngineFilter={setEngineFilter}
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] pb-2 text-[11px] text-[var(--color-text-secondary)]">
        <span className="font-semibold text-[var(--color-text-primary)]">
          Legend:
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertOctagon
            className="h-3 w-3 text-[var(--color-danger-default)]"
            aria-hidden="true"
          />
          <span>Violation (verified)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertTriangle
            className="h-3 w-3 text-[var(--color-warning-default)]"
            aria-hidden="true"
          />
          <span>Needs review (heuristic)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <HelpCircle
            className="h-3 w-3 text-[var(--color-info-default)]"
            aria-hidden="true"
          />
          <span>Manual check</span>
        </span>
      </div>

      {/* Filtered list grouped by status first, then severity */}
      {filteredFindings.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
          No findings match the current filter selection.
        </div>
      ) : (
        <div className="space-y-4">
          {violations.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-danger-default)] uppercase">
                <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Violations ({violations.length})</span>
              </h2>
              <div className="space-y-1.5">
                {violations.map((f) => (
                  <FindingRow
                    key={f.fingerprint}
                    finding={f}
                    isSelected={selectedFingerprint === f.fingerprint}
                    onSelectFinding={onSelectFinding}
                  />
                ))}
              </div>
            </section>
          )}

          {needsReview.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-warning-default)] uppercase">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Needs Review ({needsReview.length})</span>
              </h2>
              <div className="space-y-1.5">
                {needsReview.map((f) => (
                  <FindingRow
                    key={f.fingerprint}
                    finding={f}
                    isSelected={selectedFingerprint === f.fingerprint}
                    onSelectFinding={onSelectFinding}
                  />
                ))}
              </div>
            </section>
          )}

          {manualCheck.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-info-default)] uppercase">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Manual Check ({manualCheck.length})</span>
              </h2>
              <div className="space-y-1.5">
                {manualCheck.map((f) => (
                  <FindingRow
                    key={f.fingerprint}
                    finding={f}
                    isSelected={selectedFingerprint === f.fingerprint}
                    onSelectFinding={onSelectFinding}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

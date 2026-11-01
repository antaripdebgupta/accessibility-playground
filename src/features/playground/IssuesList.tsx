"use client";

import * as React from "react";
import type { Finding, FindingStatus, AxeImpactLevel } from "@/types/a11y";
import { FindingStatusBadge } from "./FindingStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { getImpactMeta } from "@/lib/impact";
import {
  AlertOctagon,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Filter,
} from "lucide-react";

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

  const renderFindingRow = (f: Finding) => {
    const isSelected = selectedFingerprint === f.fingerprint;
    const impactMeta = getImpactMeta(f.impact);
    const primaryNode = f.nodes[0];
    const targetTag = primaryNode?.html
      ? primaryNode.html.match(/<([a-z0-9-]+)/i)?.[1] || "element"
      : "element";

    return (
      <button
        key={f.fingerprint}
        type="button"
        onClick={() => onSelectFinding(f)}
        aria-pressed={isSelected}
        className={`group flex w-full items-center justify-between gap-3 rounded-md border p-2.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
          isSelected
            ? "border-[var(--color-focus-ring)] bg-[var(--color-surface-raised)] shadow-xs"
            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-sunken)]"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <FindingStatusBadge status={f.status} />
            <Badge variant={impactMeta.variant}>{impactMeta.label}</Badge>
            <span className="rounded bg-[var(--color-surface-sunken)] px-1 font-mono text-[10px] text-[var(--color-text-secondary)]">
              {f.engine}
            </span>
            <span className="truncate font-mono text-[11px] text-[var(--color-text-secondary)]">
              &lt;{targetTag}&gt;
            </span>
          </div>
          <p className="line-clamp-1 font-medium text-[var(--color-text-primary)]">
            {f.help}
          </p>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${
            isSelected
              ? "translate-x-0.5 text-[var(--color-focus-ring)]"
              : "text-[var(--color-text-secondary)]"
          }`}
          aria-hidden="true"
        />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Polite live region for announcing filter results to assistive tech */}
      <div role="status" aria-live="polite" className="sr-only">
        Showing {filteredFindings.length} accessibility findings
      </div>

      {/* Accessible filter controls */}
      <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 p-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Filter Findings</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {/* Status filter toggle */}
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Filter by status"
          >
            <button
              type="button"
              aria-pressed={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-surface)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "violation"}
              onClick={() => setStatusFilter("violation")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                statusFilter === "violation"
                  ? "bg-[var(--color-danger-default)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Violations
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "needs-review"}
              onClick={() => setStatusFilter("needs-review")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                statusFilter === "needs-review"
                  ? "bg-[var(--color-warning-default)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Needs Review
            </button>
          </div>

          {/* Severity filter */}
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Filter by severity"
          >
            <button
              type="button"
              aria-pressed={severityFilter === "all"}
              onClick={() => setSeverityFilter("all")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                severityFilter === "all"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-surface)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All Severity
            </button>
            <button
              type="button"
              aria-pressed={severityFilter === "critical"}
              onClick={() => setSeverityFilter("critical")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                severityFilter === "critical"
                  ? "bg-[var(--color-danger-default)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Critical
            </button>
            <button
              type="button"
              aria-pressed={severityFilter === "serious"}
              onClick={() => setSeverityFilter("serious")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                severityFilter === "serious"
                  ? "bg-[var(--color-warning-default)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Serious
            </button>
            <button
              type="button"
              aria-pressed={severityFilter === "moderate"}
              onClick={() => setSeverityFilter("moderate")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                severityFilter === "moderate"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Moderate
            </button>
            <button
              type="button"
              aria-pressed={severityFilter === "minor"}
              onClick={() => setSeverityFilter("minor")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                severityFilter === "minor"
                  ? "border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Minor
            </button>
          </div>

          {/* Engine filter */}
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Filter by engine"
          >
            <button
              type="button"
              aria-pressed={engineFilter === "all"}
              onClick={() => setEngineFilter("all")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                engineFilter === "all"
                  ? "bg-[var(--color-text-primary)] text-[var(--color-surface)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All Engines
            </button>
            <button
              type="button"
              aria-pressed={engineFilter === "axe-core"}
              onClick={() => setEngineFilter("axe-core")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                engineFilter === "axe-core"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              axe-core
            </button>
            <button
              type="button"
              aria-pressed={engineFilter === "playground"}
              onClick={() => setEngineFilter("playground")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                engineFilter === "playground"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Playground
            </button>
          </div>
        </div>
      </div>

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
              <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-danger-default)] uppercase">
                <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Violations ({violations.length})</span>
              </h4>
              <div className="space-y-1.5">
                {violations.map(renderFindingRow)}
              </div>
            </section>
          )}

          {needsReview.length > 0 && (
            <section className="flex flex-col gap-2">
              <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-warning-default)] uppercase">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Needs Review ({needsReview.length})</span>
              </h4>
              <div className="space-y-1.5">
                {needsReview.map(renderFindingRow)}
              </div>
            </section>
          )}

          {manualCheck.length > 0 && (
            <section className="flex flex-col gap-2">
              <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-info-default)] uppercase">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Manual Check ({manualCheck.length})</span>
              </h4>
              <div className="space-y-1.5">
                {manualCheck.map(renderFindingRow)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import type { FindingStatus, AxeImpactLevel } from "@/types/a11y";
import { Filter } from "lucide-react";

export interface IssuesFiltersProps {
  statusFilter: "all" | FindingStatus;
  setStatusFilter: (s: "all" | FindingStatus) => void;
  severityFilter: "all" | AxeImpactLevel;
  setSeverityFilter: (s: "all" | AxeImpactLevel) => void;
  engineFilter: "all" | "axe-core" | "playground";
  setEngineFilter: (e: "all" | "axe-core" | "playground") => void;
}

export function IssuesFilters({
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  engineFilter,
  setEngineFilter,
}: IssuesFiltersProps) {
  return (
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
  );
}

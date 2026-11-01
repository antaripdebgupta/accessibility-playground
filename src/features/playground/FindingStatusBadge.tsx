"use client";

import * as React from "react";
import type { FindingStatus } from "@/types/a11y";
import { AlertOctagon, AlertTriangle, HelpCircle } from "lucide-react";

export interface FindingStatusBadgeProps {
  status: FindingStatus;
  className?: string;
}

export function FindingStatusBadge({
  status,
  className = "",
}: FindingStatusBadgeProps) {
  if (status === "violation") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded border border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-danger-text)] ${className}`}
      >
        <AlertOctagon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Violation</span>
      </span>
    );
  }

  if (status === "needs-review") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded border border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-warning-text)] ${className}`}
      >
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Needs review</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border border-[var(--color-info-border)] bg-[var(--color-info-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-info-text)] ${className}`}
    >
      <HelpCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>Manual check</span>
    </span>
  );
}

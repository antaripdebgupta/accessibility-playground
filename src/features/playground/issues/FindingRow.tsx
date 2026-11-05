"use client";

import * as React from "react";
import type { Finding } from "@/types/a11y";
import { FindingStatusBadge } from "../FindingStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { getImpactMeta } from "@/lib/impact";
import { ChevronRight } from "lucide-react";

export interface FindingRowProps {
  finding: Finding;
  isSelected: boolean;
  onSelectFinding: (finding: Finding) => void;
}

export function FindingRow({
  finding: f,
  isSelected,
  onSelectFinding,
}: FindingRowProps) {
  const impactMeta = getImpactMeta(f.impact);
  const primaryNode = f.nodes[0];
  const targetTag = primaryNode?.html
    ? primaryNode.html.match(/<([a-z0-9-]+)/i)?.[1] || "element"
    : "element";

  return (
    <button
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
}

"use client";

import * as React from "react";
import type { ComparedFinding } from "@/lib/compare";
import { Badge } from "@/components/ui/Badge";
import { Trash2 } from "lucide-react";

export interface ComparedItemRowProps {
  item: ComparedFinding;
  onSelectNode?: (targetId: string) => void;
}

export function ComparedItemRow({ item, onSelectNode }: ComparedItemRowProps) {
  const { finding, disposition } = item;
  const targetId = finding.nodes[0]?.targetId;
  const targetSelector = finding.nodes[0]?.target.join(" > ") || "<element>";

  return (
    <li className="flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-semibold text-[var(--color-text-primary)]">
            {finding.help || finding.ruleId}
          </span>
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            ({finding.ruleId})
          </span>
        </div>

        {disposition === "element-removed" ? (
          <Badge
            variant="default"
            className="bg-[var(--color-surface-sunken)] text-[9px]"
          >
            Element removed
          </Badge>
        ) : (
          <Badge
            variant={
              finding.impact === "critical" || finding.impact === "serious"
                ? "danger"
                : "default"
            }
            className="text-[9px]"
          >
            {finding.impact}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
        <span className="truncate font-mono">{targetSelector}</span>
        {targetId && onSelectNode && disposition !== "element-removed" && (
          <button
            type="button"
            onClick={() => onSelectNode(targetId)}
            className="ml-2 shrink-0 text-[10px] font-medium text-[var(--color-focus-ring)] hover:underline"
          >
            Inspect
          </button>
        )}
      </div>

      {disposition === "element-removed" && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] italic">
          <Trash2 className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>
            The target element was removed from the markup — not verified as
            resolved.
          </span>
        </div>
      )}
    </li>
  );
}

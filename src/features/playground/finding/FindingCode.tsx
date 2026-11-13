"use client";

import * as React from "react";
import type { AxeFindingNode } from "@/types/a11y";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { Crosshair } from "lucide-react";

export interface FindingCodeProps {
  primaryNode?: AxeFindingNode;
  onSelectNode?: (id: string) => void;
}

export function FindingCode({ primaryNode, onSelectNode }: FindingCodeProps) {
  if (!primaryNode) return null;
  const targetId = primaryNode.targetId;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          Inspected Element
        </h3>
        {targetId && onSelectNode && (
          <button
            type="button"
            onClick={() => onSelectNode(targetId)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-focus-ring)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <Crosshair className="h-3 w-3" aria-hidden="true" />
            <span>Highlight in editor</span>
          </button>
        )}
      </div>
      <CodeSnippet code={primaryNode.html} />
      {primaryNode.failureSummary && (
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          {primaryNode.failureSummary}
        </p>
      )}
    </section>
  );
}

"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { Tag } from "lucide-react";

export interface InspectorSelectedHeaderProps {
  selectedNode: A11yNode | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function InspectorSelectedHeader({
  selectedNode,
}: InspectorSelectedHeaderProps) {
  if (!selectedNode) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2">
        <Tag
          className="h-3.5 w-3.5 text-[var(--color-focus-ring)]"
          aria-hidden="true"
        />
        <span className="font-semibold text-[var(--color-text-primary)]">
          Selected:
        </span>
        <code className="font-mono font-semibold text-[var(--color-focus-ring)]">
          &lt;{selectedNode.tagName}&gt;
        </code>
        <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
          #{selectedNode.id}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className="font-mono text-[10px]">
          role: {selectedNode.role}
        </Badge>
        {selectedNode.accessibleName && (
          <span
            className="max-w-[200px] truncate text-[11px] text-[var(--color-text-secondary)]"
            title={selectedNode.accessibleName}
          >
            &quot;{selectedNode.accessibleName}&quot;
          </span>
        )}
      </div>
    </div>
  );
}

export function InspectorEmptyState({
  title = "No Element Selected",
  description = "Select an element in the preview, tree, or editor to inspect its accessibility properties.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-xs text-[var(--color-text-secondary)]">
      <p className="mb-1 font-semibold text-[var(--color-text-primary)]">
        {title}
      </p>
      <p className="max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

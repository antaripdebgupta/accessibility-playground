"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { Volume2, AlertTriangle, Layers } from "lucide-react";
import { computeAnnouncementDetails } from "@/lib/announcement";

export interface AnnouncementPanelProps {
  selectedNode: A11yNode | null;
}

export function AnnouncementPanel({ selectedNode }: AnnouncementPanelProps) {
  if (!selectedNode) {
    return (
      <div className="text-md flex h-64 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <p className="mb-1 font-medium text-[var(--color-text-primary)]">
          No Element Selected
        </p>
        <p>
          Click an element in the preview or tree to preview its simulated
          screen-reader announcement.
        </p>
      </div>
    );
  }

  const { text, parts } = computeAnnouncementDetails(selectedNode);

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Computed Announcement Card */}
      <div className="rounded-lg border border-[var(--color-focus-ring)]/30 bg-[var(--color-accent-subtle)]/40 p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-[var(--color-accent)]">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>SIMULATED ANNOUNCEMENT</span>
          </span>
          <Badge variant="default" className="font-mono text-xs">
            {selectedNode.role}
          </Badge>
        </div>

        <div className="my-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className="font-mono text-base font-bold tracking-tight text-[var(--color-text-primary)] select-all">
            &quot;{text}&quot;
          </p>
        </div>

        <p className="text-md text-[var(--color-text-secondary)]">
          Node:{" "}
          <code className="font-mono font-semibold text-[var(--color-text-primary)]">
            &lt;{selectedNode.tagName}&gt;
          </code>{" "}
          (role:{" "}
          <code className="font-mono font-semibold text-[var(--color-text-primary)]">
            {selectedNode.role}
          </code>
          )
        </p>
      </div>

      {/* Breakdown List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <h4 className="text-md flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
            <Layers className="h-4 w-4 text-[var(--color-accent)]" />
            Announcement Breakdown
          </h4>
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            Speech token sequence
          </span>
        </div>

        <div className="space-y-2">
          {parts.map((part, idx) => (
            <div
              key={`${part.type}-${idx}`}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-raised)] font-mono text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  {idx + 1}
                </span>
                <span className="text-md font-medium text-[var(--color-text-secondary)]">
                  {part.label}:
                </span>
                <code className="rounded bg-[var(--color-surface-raised)] px-1.5 py-0.5 font-mono text-sm font-bold text-[var(--color-text-primary)]">
                  {part.value}
                </code>
              </div>
              <Badge
                variant={
                  part.type === "name"
                    ? "success"
                    : part.type === "role"
                      ? "secondary"
                      : "warning"
                }
                className="text-[10px] capitalize"
              >
                {part.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning-default)]"
          aria-hidden="true"
        />
        <p>
          <strong className="font-semibold text-[var(--color-text-primary)]">
            Disclaimer:
          </strong>{" "}
          This approximates common NVDA/VoiceOver conventions. Actual
          announcements vary by assistive technology, browser, and verbosity
          settings. Always verify with a real screen reader before shipping.
        </p>
      </div>
    </div>
  );
}

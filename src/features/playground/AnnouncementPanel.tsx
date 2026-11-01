"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import { Volume2, AlertTriangle, Layers, History } from "lucide-react";
import { computeAnnouncementDetails } from "@/lib/announcement";

export interface AnnouncementHistoryItem {
  id: string;
  nodeId: string;
  tagName: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface AnnouncementPanelProps {
  selectedNode: A11yNode | null;
}

export function AnnouncementPanel({ selectedNode }: AnnouncementPanelProps) {
  const [history, setHistory] = React.useState<AnnouncementHistoryItem[]>([]);

  // Compute current node announcement
  const announcement = React.useMemo(() => {
    if (!selectedNode) return null;
    return computeAnnouncementDetails(selectedNode);
  }, [selectedNode]);

  // Record into announcement history (last 10 items) when selected node changes
  React.useEffect(() => {
    if (!selectedNode || !announcement) return;

    const timer = setTimeout(() => {
      setHistory((prev) => {
        if (
          prev[0]?.nodeId === selectedNode.id &&
          prev[0]?.text === announcement.text
        ) {
          return prev;
        }
        const newItem: AnnouncementHistoryItem = {
          id: `${selectedNode.id}-${Date.now()}`,
          nodeId: selectedNode.id,
          tagName: selectedNode.tagName,
          role: selectedNode.role,
          text: announcement.text,
          timestamp: new Date().toLocaleTimeString(),
        };
        return [newItem, ...prev.slice(0, 9)];
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedNode, announcement]);

  if (!selectedNode) {
    return (
      <div className="flex flex-col">
        <InspectorEmptyState
          title="No Element Selected"
          description="Select an element in the preview or tree to preview its simulated screen-reader announcement."
        />
        {history.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-[var(--color-border)] p-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <h4>Recent Announcements History</h4>
            </div>
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                      &lt;{item.tagName}&gt;
                    </span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      &quot;{item.text}&quot;
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const { text, parts } = announcement!;

  return (
    <div className="flex flex-col">
      <InspectorSelectedHeader selectedNode={selectedNode} />

      <div className="flex flex-col gap-5 p-4">
        {/* Prominent Label (§C2) */}
        <div className="rounded border border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-3 py-1.5 text-xs text-[var(--color-warning-text)]">
          <p className="font-medium">
            Simulated announcement — not real screen reader output
          </p>
        </div>

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
              <Layers className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
              <span>Announcement Breakdown</span>
            </h4>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Speech token sequence
            </span>
          </div>

          <div className="space-y-2">
            {parts.map((part, idx) => (
              <div
                key={`${part.type}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-raised)] font-mono text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-[var(--color-text-secondary)]">
                    {part.label}:
                  </span>
                  <code className="rounded bg-[var(--color-surface-raised)] px-1.5 py-0.5 font-mono text-xs font-bold text-[var(--color-text-primary)]">
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

        {/* History of last 10 simulated announcements (§C2) */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2.5 border-t border-[var(--color-border)] pt-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <h4>Announcement History (Last {history.length})</h4>
            </div>
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                      &lt;{item.tagName}&gt;
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      &quot;{item.text}&quot;
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
}

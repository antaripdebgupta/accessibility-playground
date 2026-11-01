"use client";

import * as React from "react";
import type { Finding } from "@/types/a11y";
import type { CompareResult, ComparedFinding } from "@/lib/compare";
import type { BaselineData } from "@/hooks/useBaseline";
import { computeLineDiff } from "@/lib/diff";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileDiff,
  Trash2,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface CompareViewProps {
  baseline: BaselineData | null;
  comparison: CompareResult | null;
  currentFindings: readonly Finding[];
  currentHtml: string;
  onSetBaseline: () => void;
  onClearBaseline: () => void;
  onSelectNode?: (targetId: string) => void;
}

export function CompareView({
  baseline,
  comparison,
  currentHtml,
  onSetBaseline,
  onClearBaseline,
  onSelectNode,
}: CompareViewProps) {
  const [showDiff, setShowDiff] = React.useState(true);

  if (!baseline || !comparison) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)]">
          <BookmarkCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          No baseline set
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[var(--color-text-secondary)]">
          Snapshot your current findings as a baseline to track resolved, remaining, and introduced issues as you make fixes.
        </p>
        <button
          type="button"
          onClick={onSetBaseline}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Set current as baseline</span>
        </button>
      </div>
    );
  }

  const { resolved, remaining, introduced } = comparison;
  const lineDiff = computeLineDiff(baseline.html, currentHtml);
  const changedLines = lineDiff.filter((l) => l.type !== "unchanged");

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-6">
      {/* Baseline status header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Baseline Active
            </span>
            <Badge variant="default" className="text-[10px]">
              {baseline.findings.length} initial findings
            </Badge>
          </div>
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            Saved: {new Date(baseline.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSetBaseline}
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            Update baseline
          </button>
          <button
            type="button"
            onClick={onClearBaseline}
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger-default)] hover:bg-[var(--color-danger-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--color-success-border,var(--color-border))] bg-[var(--color-success-subtle)]/40 p-2.5 text-center">
          <span className="block text-lg font-bold text-[var(--color-success-default)]">
            {resolved.length}
          </span>
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
            Resolved
          </span>
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-2.5 text-center">
          <span className="block text-lg font-bold text-[var(--color-text-primary)]">
            {remaining.length}
          </span>
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
            Remaining
          </span>
        </div>
        <div className="rounded-md border border-[var(--color-danger-border,var(--color-border))] bg-[var(--color-danger-subtle)]/40 p-2.5 text-center">
          <span className="block text-lg font-bold text-[var(--color-danger-default)]">
            {introduced.length}
          </span>
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
            Introduced
          </span>
        </div>
      </div>

      {/* 1. Resolved issues */}
      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-success-default)]" aria-hidden="true" />
          <span>Resolved Issues ({resolved.length})</span>
        </h4>
        {resolved.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] italic">
            No issues resolved yet. Apply fixes in the code editor to resolve baseline findings.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {resolved.map((item, idx) => (
              <ComparedItemRow
                key={`res-${item.finding.fingerprint}-${idx}`}
                item={item}
                onSelectNode={onSelectNode}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 2. Remaining issues */}
      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
          <AlertTriangle className="h-4 w-4 text-[var(--color-warning-default)]" aria-hidden="true" />
          <span>Remaining Baseline Issues ({remaining.length})</span>
        </h4>
        {remaining.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] italic">
            All baseline issues have been addressed!
          </p>
        ) : (
          <ul className="space-y-1.5">
            {remaining.map((item, idx) => (
              <ComparedItemRow
                key={`rem-${item.finding.fingerprint}-${idx}`}
                item={item}
                onSelectNode={onSelectNode}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 3. Introduced issues */}
      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
          <PlusCircle className="h-4 w-4 text-[var(--color-danger-default)]" aria-hidden="true" />
          <span>Introduced Issues ({introduced.length})</span>
        </h4>
        {introduced.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] italic">
            No new accessibility issues introduced.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {introduced.map((item, idx) => (
              <ComparedItemRow
                key={`int-${item.finding.fingerprint}-${idx}`}
                item={item}
                onSelectNode={onSelectNode}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 4. Source HTML Diff */}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          type="button"
          onClick={() => setShowDiff(!showDiff)}
          className="flex w-full items-center justify-between p-3 text-left focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <div className="flex items-center gap-2">
            <FileDiff className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Source Changes Diff ({changedLines.length} changed lines)
            </span>
          </div>
          {showDiff ? (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
          )}
        </button>

        {showDiff && (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-3">
            {changedLines.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] italic">
                HTML is identical to baseline.
              </p>
            ) : (
              <pre className="max-h-60 overflow-x-auto overflow-y-auto font-mono text-[11px] leading-relaxed">
                {lineDiff.map((line, idx) => {
                  if (line.type === "added") {
                    return (
                      <div
                        key={idx}
                        className="bg-[var(--color-success-subtle)] text-[var(--color-success-default)] px-1"
                      >
                        + {line.text}
                      </div>
                    );
                  }
                  if (line.type === "removed") {
                    return (
                      <div
                        key={idx}
                        className="bg-[var(--color-danger-subtle)] text-[var(--color-danger-default)] px-1"
                      >
                        - {line.text}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="text-[var(--color-text-secondary)] opacity-50 px-1">
                      {"  "}{line.text}
                    </div>
                  );
                })}
              </pre>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ComparedItemRow({
  item,
  onSelectNode,
}: {
  item: ComparedFinding;
  onSelectNode?: (targetId: string) => void;
}) {
  const { finding, disposition } = item;
  const targetId = finding.nodes[0]?.targetId;
  const targetSelector = finding.nodes[0]?.target.join(" > ") || "<element>";

  return (
    <li className="flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-[var(--color-text-primary)] truncate">
            {finding.help || finding.ruleId}
          </span>
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            ({finding.ruleId})
          </span>
        </div>

        {disposition === "element-removed" ? (
          <Badge variant="default" className="text-[9px] bg-[var(--color-surface-sunken)]">
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
        <span className="font-mono truncate">{targetSelector}</span>
        {targetId && onSelectNode && disposition !== "element-removed" && (
          <button
            type="button"
            onClick={() => onSelectNode(targetId)}
            className="text-[10px] font-medium text-[var(--color-focus-ring)] hover:underline shrink-0 ml-2"
          >
            Inspect
          </button>
        )}
      </div>

      {disposition === "element-removed" && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] italic">
          <Trash2 className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>The target element was removed from the markup — not verified as resolved.</span>
        </div>
      )}
    </li>
  );
}

"use client";

import * as React from "react";
import { computeLineDiff } from "@/lib/diff";
import { FileDiff, ChevronDown, ChevronRight } from "lucide-react";

export interface CompareDiffSectionProps {
  baselineHtml: string;
  currentHtml: string;
}

export function CompareDiffSection({
  baselineHtml,
  currentHtml,
}: CompareDiffSectionProps) {
  const [showDiff, setShowDiff] = React.useState(true);
  const lineDiff = computeLineDiff(baselineHtml, currentHtml);
  const changedLines = lineDiff.filter((l) => l.type !== "unchanged");

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={() => setShowDiff(!showDiff)}
        className="flex w-full items-center justify-between p-3 text-left focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
      >
        <div className="flex items-center gap-2">
          <FileDiff
            className="h-4 w-4 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            Source Changes Diff ({changedLines.length} changed lines)
          </span>
        </div>
        {showDiff ? (
          <ChevronDown
            className="h-4 w-4 text-[var(--color-text-secondary)]"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="h-4 w-4 text-[var(--color-text-secondary)]"
            aria-hidden="true"
          />
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
                      className="bg-[var(--color-success-subtle)] px-1 text-[var(--color-success-default)]"
                    >
                      + {line.text}
                    </div>
                  );
                }
                if (line.type === "removed") {
                  return (
                    <div
                      key={idx}
                      className="bg-[var(--color-danger-subtle)] px-1 text-[var(--color-danger-default)]"
                    >
                      - {line.text}
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="px-1 text-[var(--color-text-secondary)] opacity-50"
                  >
                    {"  "}
                    {line.text}
                  </div>
                );
              })}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}

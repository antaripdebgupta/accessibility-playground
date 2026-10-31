"use client";

import * as React from "react";
import type { AxeFinding } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { WcagBadge } from "@/components/WcagBadge";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  HelpCircle,
  Crosshair,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { isAutoFixable, computeFixPreview } from "@/lib/auto-fix";

export interface IssuesPanelProps {
  violations: readonly AxeFinding[];
  incomplete?: readonly AxeFinding[];
  isScanning: boolean;
  scanError: string | null;
  hasHtml: boolean;
  onSelectNode?: (id: string) => void;
  onApplyFix?: (finding: AxeFinding) => void;
}

export function IssuesPanel({
  violations,
  incomplete = [],
  isScanning,
  scanError,
  hasHtml,
  onSelectNode,
  onApplyFix,
}: IssuesPanelProps) {
  const [previewFindingKey, setPreviewFindingKey] = React.useState<
    string | null
  >(null);

  if (!hasHtml) {
    return (
      <div className="text-md flex h-48 items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        Write or paste HTML to run the automated audit.
      </div>
    );
  }

  if (scanError) {
    return (
      <div className="text-md flex h-48 flex-col items-center justify-center p-6 text-center text-[var(--color-danger-default)]">
        <AlertOctagon className="mb-2 h-6 w-6" aria-hidden="true" />
        <p className="font-semibold">Audit Scan Failed</p>
        <p className="max-w-md text-xs text-[var(--color-text-secondary)]">
          {scanError} Check that axe.min.js is accessible and iframe script
          permissions are active.
        </p>
      </div>
    );
  }

  if (isScanning && violations.length === 0) {
    return (
      <div className="text-md flex h-48 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-focus-ring)] border-t-transparent" />
        <p className="font-medium text-[var(--color-text-primary)]">
          Running WCAG accessibility scan...
        </p>
      </div>
    );
  }

  if (violations.length === 0 && incomplete.length === 0) {
    return (
      <div className="text-md flex h-48 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <CheckCircle2
          className="mb-2 h-7 w-7 text-[var(--color-success-default)]"
          aria-hidden="true"
        />
        <p className="font-semibold text-[var(--color-text-primary)]">
          No violations found
        </p>
        <p className="max-w-md text-xs text-[var(--color-text-secondary)]">
          Automated checks passed. Always test manually with keyboard
          navigation, screen readers, and zoom for comprehensive conformance.
        </p>
      </div>
    );
  }

  // Group violations by severity
  const critical = violations.filter((v) => v.impact === "critical");
  const serious = violations.filter((v) => v.impact === "serious");
  const moderate = violations.filter((v) => v.impact === "moderate");
  const minor = violations.filter((v) => v.impact === "minor");

  const groups = [
    { label: "Critical", items: critical, variant: "critical" as const },
    { label: "Serious", items: serious, variant: "serious" as const },
    { label: "Moderate", items: moderate, variant: "moderate" as const },
    { label: "Minor", items: minor, variant: "minor" as const },
  ].filter((g) => g.items.length > 0);

  const renderFindingCard = (finding: AxeFinding) => {
    const isAxe = finding.source === "axe-core";
    const primaryNode = finding.nodes[0];
    const targetId = primaryNode?.targetId;

    return (
      <div
        key={`${finding.id}-${primaryNode?.html ?? ""}`}
        className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 shadow-xs transition-colors hover:border-[var(--color-border-strong)]"
      >
        {/* Card Header: Impact, Title, Source, Wcag */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {finding.impact === "critical" ? (
              <Badge variant="critical">
                <AlertOctagon className="h-3 w-3" aria-hidden="true" />
                Critical
              </Badge>
            ) : finding.impact === "serious" ? (
              <Badge variant="serious">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                Serious
              </Badge>
            ) : finding.impact === "moderate" ? (
              <Badge variant="moderate">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                Moderate
              </Badge>
            ) : (
              <Badge variant="minor">
                <Info className="h-3 w-3" aria-hidden="true" />
                Minor
              </Badge>
            )}

            <Badge variant="outline" className="font-mono text-[10px]">
              {isAxe ? "axe-core" : "Playground rule"}
            </Badge>

            {finding.wcag && finding.wcag.length > 0 && (
              <div className="flex items-center gap-1">
                {finding.wcag.map((sc) => (
                  <WcagBadge key={sc} criterionId={sc} />
                ))}
              </div>
            )}
          </div>

          {finding.helpUrl && (
            <a
              href={finding.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Documentation for ${finding.id} (opens in new tab)`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              <span>Guidance</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Description & Help */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {finding.help}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {finding.description}
          </p>
        </div>

        {/* Failing HTML snippet */}
        {primaryNode && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Failing Element
            </span>
            <CodeSnippet code={primaryNode.html} />
          </div>
        )}

        {/* Suggested Fix */}
        {finding.fix && (
          <div className="rounded bg-[var(--color-surface-sunken)]/60 p-2 text-xs text-[var(--color-text-primary)]">
            <span className="font-semibold text-[var(--color-focus-ring)]">
              Suggested fix:{" "}
            </span>
            <span>{finding.fix}</span>
          </div>
        )}

        {/* Inspect & Apply Fix action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-end gap-2">
            {isAutoFixable(finding.id) && onApplyFix && (
              <button
                type="button"
                onClick={() =>
                  setPreviewFindingKey(
                    previewFindingKey === finding.id ? null : finding.id
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-success-default)]/40 bg-[var(--color-success-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--color-success-default)] transition-colors hover:bg-[var(--color-success-default)] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <Wrench className="h-3 w-3" aria-hidden="true" />
                <span>
                  {previewFindingKey === finding.id ? "Hide fix" : "Apply fix"}
                </span>
              </button>
            )}

            {targetId && onSelectNode && (
              <button
                type="button"
                onClick={() => onSelectNode(targetId)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <Crosshair className="h-3 w-3" aria-hidden="true" />
                <span>Inspect in tree</span>
              </button>
            )}
          </div>

          {/* Inline Before / After Diff View */}
          {previewFindingKey === finding.id &&
            isAutoFixable(finding.id) &&
            (() => {
              const diff = computeFixPreview(finding);
              if (!diff) return null;
              return (
                <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-primary)]">
                    <span>Proposed Auto-Fix</span>
                    <span className="text-[11px] font-normal text-[var(--color-text-secondary)]">
                      Review tag modification
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold tracking-wider text-[var(--color-danger-default)] uppercase">
                        Before
                      </span>
                      <CodeSnippet code={diff.beforeTag} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold tracking-wider text-[var(--color-success-default)] uppercase">
                        After
                      </span>
                      <CodeSnippet code={diff.afterTag} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFindingKey(null)}
                      className="rounded px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyFix?.(finding);
                        setPreviewFindingKey(null);
                      }}
                      className="inline-flex items-center gap-1 rounded bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
                    >
                      Confirm Fix
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header Summary */}
      <div className="text-md flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
          <span>{violations.length}</span>
          <span>
            {violations.length === 1 ? "Violation" : "Violations"} Flagged
          </span>
        </span>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          Merged axe-core &amp; Playground rules
        </span>
      </div>

      {/* Severity Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-text-secondary)] uppercase">
              <span>{group.label}</span>
              <span className="text-[10px] font-normal opacity-75">
                ({group.items.length})
              </span>
            </h4>
            <div className="space-y-3">
              {group.items.map(renderFindingCard)}
            </div>
          </section>
        ))}
      </div>

      {/* Incomplete / Needs Manual Review Section */}
      {incomplete.length > 0 && (
        <section className="flex flex-col gap-2.5 border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--color-warning-default)] uppercase">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Needs Manual Review</span>
              <span className="text-[10px] font-normal opacity-75">
                ({incomplete.length})
              </span>
            </h4>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Axe-core could not automatically confirm pass/fail for these checks
            (e.g. background gradients, overlapping layers). Review manually:
          </p>
          <div className="space-y-3">{incomplete.map(renderFindingCard)}</div>
        </section>
      )}
    </div>
  );
}

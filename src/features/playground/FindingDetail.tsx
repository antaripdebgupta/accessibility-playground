"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { AxeFinding, Finding } from "@/types/a11y";
import { getLearnTopicForRuleId } from "@/data/learn-topics";
import { FindingStatusBadge } from "./FindingStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { WcagBadge } from "@/components/WcagBadge";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { getImpactMeta } from "@/lib/impact";
import { isAutoFixable, computeFixPreview } from "@/lib/auto-fix";
import { ExternalLink, Crosshair, Wrench, BookOpen } from "lucide-react";

/**
 * RuleLesson is loaded lazily so that the large rule-knowledge data
 * (1,176 lines) is split into its own chunk and not included in the
 * playground's initial client bundle.
 */
const RuleLesson = dynamic(() => import("./RuleLesson"), {
  ssr: false,
  loading: () => (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="h-3 w-3/4 rounded bg-[var(--color-surface-sunken)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--color-surface-sunken)]" />
      <div className="h-3 w-2/3 rounded bg-[var(--color-surface-sunken)]" />
      <div className="h-3 w-1/3 rounded bg-[var(--color-surface-sunken)]" />
    </div>
  ),
});

export interface FindingDetailProps {
  finding: Finding;
  onSelectNode?: (id: string) => void;
  onOpenInspector?: (
    inspector: "tree" | "aria" | "accname" | "focus" | "announce",
    nodeId?: string
  ) => void;
  onApplyFix?: (finding: AxeFinding) => void;
}

export function generateContextualFix(
  finding: Finding,
  defaultGoodExample: string
): string {
  const primaryNode = finding.nodes[0];
  const html = primaryNode?.html || "";

  if (finding.ruleId === "img-missing-alt" || finding.ruleId === "image-alt") {
    if (html.startsWith("<img")) {
      if (/alt\s*=\s*["'][^"']*["']/i.test(html)) {
        return html;
      }
      return html.replace(
        /<img\b([^>]*)>/i,
        `<img$1 alt="Meaningful description of the image">`
      );
    }
  }

  if (
    finding.ruleId === "button-name" ||
    (finding.ruleId === "empty-interactive-name" && html.startsWith("<button"))
  ) {
    if (html.startsWith("<button")) {
      return html.replace(
        /<button\b([^>]*)>/i,
        `<button$1 aria-label="Action description">`
      );
    }
  }

  if (
    finding.ruleId === "link-name" ||
    (finding.ruleId === "empty-interactive-name" && html.startsWith("<a"))
  ) {
    if (html.startsWith("<a")) {
      return html.replace(
        /<a\b([^>]*)>/i,
        `<a$1 aria-label="Destination description">`
      );
    }
  }

  if (
    finding.ruleId === "label" ||
    finding.ruleId === "input-no-label" ||
    finding.ruleId === "input-placeholder-only"
  ) {
    const idMatch = html.match(/id\s*=\s*["']([^"']+)["']/i);
    const placeholderMatch = html.match(/placeholder\s*=\s*["']([^"']+)["']/i);
    const labelText = placeholderMatch ? placeholderMatch[1] : "Field Label";
    if (idMatch && idMatch[1]) {
      return `<label for="${idMatch[1]}">${labelText}</label>\n${html}`;
    } else {
      const suggestedId = "field-input";
      const withId = html.replace(
        /<input\b([^>]*)>/i,
        `<input$1 id="${suggestedId}">`
      );
      return `<label for="${suggestedId}">${labelText}</label>\n${withId}`;
    }
  }

  return defaultGoodExample;
}

export function FindingDetail({
  finding,
  onSelectNode,
  onOpenInspector,
  onApplyFix,
}: FindingDetailProps) {
  const [showAutoFixPreview, setShowAutoFixPreview] = React.useState(false);
  const learnTopic = getLearnTopicForRuleId(finding.ruleId);
  const impactMeta = getImpactMeta(finding.impact);
  const primaryNode = finding.nodes[0];
  const targetId = primaryNode?.targetId;

  // Convert to AxeFinding wire shape for auto-fix compatibility if needed
  const axeFinding: AxeFinding = {
    id: finding.ruleId,
    impact: finding.impact,
    description: finding.description,
    help: finding.help,
    helpUrl: finding.helpUrl,
    nodes: finding.nodes,
    fix: finding.fix,
  };

  const hasAutoFix = isAutoFixable(finding.ruleId);
  const fixPreview = hasAutoFix ? computeFixPreview(axeFinding) : null;

  return (
    <article
      aria-label={`Finding details: ${finding.help}`}
      className="flex flex-col gap-6 p-4 text-xs"
    >
      {/* Header bar */}
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <FindingStatusBadge status={finding.status} />
          <Badge variant={impactMeta.variant}>{impactMeta.label}</Badge>
          <span className="rounded bg-[var(--color-surface-sunken)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]">
            {finding.engine}
          </span>
          <span className="font-mono text-[11px] font-medium text-[var(--color-text-secondary)]">
            {finding.ruleId}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {finding.help}
        </h3>
      </div>

      {/* Matching Knowledge Centre Topic */}
      {learnTopic && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <BookOpen
              className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-accent)]"
              aria-hidden="true"
            />
            <span className="flex-shrink-0 text-[var(--color-text-secondary)]">
              Guide:
            </span>
            <span className="truncate font-semibold text-[var(--color-text-primary)]">
              {learnTopic.title}
            </span>
          </div>
          <Link
            href={`/learn/${learnTopic.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex flex-shrink-0 items-center gap-1 font-semibold text-[var(--color-accent)] hover:underline"
          >
            <span>Read guide</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* WCAG Success Criteria */}
      {finding.wcag.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="font-semibold text-[var(--color-text-primary)]">
            WCAG Success Criteria
          </h4>
          <div className="flex flex-wrap gap-2">
            {finding.wcag.map((ref) => (
              <div key={ref.id} className="flex items-center gap-1.5">
                <WcagBadge criterionId={ref.id} />
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  (v{ref.version} Level {ref.level})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Your code */}
      {primaryNode && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[var(--color-text-primary)]">
              Your code
            </h4>
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
      )}

      {/* Auto-fix preview */}
      {hasAutoFix && fixPreview && (
        <section className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <Wrench
                className="h-3.5 w-3.5 text-[var(--color-accent)]"
                aria-hidden="true"
              />
              <h4>Automated Fix Available</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowAutoFixPreview(!showAutoFixPreview)}
              className="text-[11px] font-medium text-[var(--color-focus-ring)] hover:underline"
            >
              {showAutoFixPreview ? "Hide diff" : "Preview diff"}
            </button>
          </div>

          {showAutoFixPreview && (
            <div className="flex flex-col gap-2 pt-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-[var(--color-danger-default)] uppercase">
                    Current
                  </span>
                  <CodeSnippet code={fixPreview.beforeTag} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-[var(--color-success-default)] uppercase">
                    Proposed
                  </span>
                  <CodeSnippet code={fixPreview.afterTag} />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onApplyFix?.(axeFinding)}
                  className="inline-flex items-center gap-1.5 rounded bg-[var(--color-accent)] px-3 py-1 font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  <Wrench className="h-3 w-3" aria-hidden="true" />
                  <span>Apply Auto-Fix</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Lazily-loaded lesson body (rule knowledge, verification, references) */}
      <RuleLesson
        finding={finding}
        targetId={targetId}
        onOpenInspector={onOpenInspector}
      />
    </article>
  );
}

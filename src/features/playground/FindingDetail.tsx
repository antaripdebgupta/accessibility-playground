"use client";

import * as React from "react";
import Link from "next/link";
import type { AxeFinding, Finding } from "@/types/a11y";
import { getRuleKnowledge, type RuleKnowledge } from "@/data/rule-knowledge";
import { getLearnTopicForRuleId } from "@/data/learn-topics";
import { FindingStatusBadge } from "./FindingStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { WcagBadge } from "@/components/WcagBadge";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { getImpactMeta } from "@/lib/impact";
import { isAutoFixable, computeFixPreview } from "@/lib/auto-fix";
import {
  ExternalLink,
  Crosshair,
  ArrowRight,
  Wrench,
  Users,
  CheckCircle,
  BookOpen,
} from "lucide-react";

export interface FindingDetailProps {
  finding: Finding;
  onSelectNode?: (id: string) => void;
  onOpenInspector?: (inspector: "tree" | "aria" | "accname" | "focus" | "announce", nodeId?: string) => void;
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

const INSPECTOR_LABELS: Record<string, string> = {
  tree: "A11y Tree",
  aria: "ARIA Explorer",
  accname: "Accessible Name",
  focus: "Focus Order",
  announce: "Announcement",
};

export function FindingDetail({
  finding,
  onSelectNode,
  onOpenInspector,
  onApplyFix,
}: FindingDetailProps) {
  const [showAutoFixPreview, setShowAutoFixPreview] = React.useState(false);
  const knowledge: RuleKnowledge | undefined = getRuleKnowledge(finding.ruleId);
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

  const goodExample = knowledge
    ? generateContextualFix(finding, knowledge.goodExample)
    : finding.fix || "";

  return (
    <article
      aria-label={`Finding details: ${finding.help}`}
      className="flex flex-col gap-6 p-4 text-xs"
    >
      {/* Header bar */}
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <FindingStatusBadge status={finding.status} />
          <Badge variant={impactMeta.variant}>
            {impactMeta.label}
          </Badge>
          <span className="rounded bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-secondary)]">
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
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="text-[var(--color-text-secondary)] flex-shrink-0">Guide:</span>
            <span className="font-semibold text-[var(--color-text-primary)] truncate">{learnTopic.title}</span>
          </div>
          <Link
            href={`/learn/${learnTopic.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] hover:underline flex-shrink-0"
          >
            <span>Read guide</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* 1. What's happening */}
      <section className="flex flex-col gap-1.5">
        <h4 className="font-semibold text-[var(--color-text-primary)]">
          What is happening
        </h4>
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          {knowledge ? knowledge.whatIsHappening : finding.description}
        </p>
      </section>

      {/* 2. Why it matters */}
      <section className="flex flex-col gap-1.5">
        <h4 className="font-semibold text-[var(--color-text-primary)]">
          Why it matters
        </h4>
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          {knowledge ? knowledge.whyItMatters : finding.help}
        </p>
      </section>

      {/* 3. Who is affected */}
      {knowledge ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <h4>Who is affected</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {knowledge.whoIsAffected.map((group) => (
              <span
                key={group}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] text-[var(--color-text-primary)]"
              >
                {group.replace(/-/g, " ")}
              </span>
            ))}
          </div>
          {knowledge.whoIsAffectedNote && (
            <p className="text-[11px] italic text-[var(--color-text-secondary)]">
              {knowledge.whoIsAffectedNote}
            </p>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-1 text-[var(--color-text-secondary)]">
          <h4 className="font-semibold text-[var(--color-text-primary)]">Who is affected</h4>
          <p>No detailed lesson yet. See external documentation below.</p>
        </section>
      )}

      {/* 4. WCAG */}
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

      {/* 5. Your code */}
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

      {/* 6. Suggested fix */}
      {goodExample && (
        <section className="flex flex-col gap-2">
          <h4 className="font-semibold text-[var(--color-text-primary)]">
            Suggested fix
          </h4>
          <CodeSnippet code={goodExample} />
        </section>
      )}

      {/* 7. Why the fix works */}
      {knowledge && (
        <section className="flex flex-col gap-1.5">
          <h4 className="font-semibold text-[var(--color-text-primary)]">
            Why the fix works
          </h4>
          <p className="leading-relaxed text-[var(--color-text-secondary)]">
            {knowledge.whyFixWorks}
          </p>
        </section>
      )}

      {/* 8. How to verify */}
      {knowledge && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <CheckCircle className="h-3.5 w-3.5 text-[var(--color-success-default)]" aria-hidden="true" />
              <h4>How to verify</h4>
            </div>
            {onOpenInspector && (
              <button
                type="button"
                onClick={() => onOpenInspector(knowledge.inspector, targetId)}
                className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <span>Open in {INSPECTOR_LABELS[knowledge.inspector] || knowledge.inspector}</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
          <ol className="list-decimal space-y-1 pl-4 text-[var(--color-text-secondary)]">
            {knowledge.howToVerify.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 9. Auto-fix preview */}
      {hasAutoFix && fixPreview && (
        <section className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <Wrench className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
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

      {/* Resources & References */}
      <section className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <h4>Official References</h4>
        </div>
        <ul className="space-y-1">
          {knowledge ? (
            knowledge.resources.map((res) => (
              <li key={res.url}>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--color-focus-ring)] hover:underline"
                >
                  <span>{res.title}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))
          ) : (
            <li>
              <a
                href={finding.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[var(--color-focus-ring)] hover:underline"
              >
                <span>{finding.help} Documentation</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          )}
        </ul>
      </section>
    </article>
  );
}

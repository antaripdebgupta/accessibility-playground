"use client";

import * as React from "react";
import type { Finding } from "@/types/a11y";
import { getRuleKnowledge, type RuleKnowledge } from "@/data/rule-knowledge";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { generateContextualFix } from "./FindingDetail";
import {
  ExternalLink,
  ArrowRight,
  Users,
  CheckCircle,
  BookOpen,
} from "lucide-react";

const INSPECTOR_LABELS: Record<string, string> = {
  tree: "A11y Tree",
  aria: "ARIA Explorer",
  accname: "Accessible Name",
  focus: "Focus Order",
  announce: "Announcement",
};

export interface RuleLessonProps {
  finding: Finding;
  targetId?: string;
  onOpenInspector?: (
    inspector: "tree" | "aria" | "accname" | "focus" | "announce",
    nodeId?: string
  ) => void;
}

export default function RuleLesson({
  finding,
  targetId,
  onOpenInspector,
}: RuleLessonProps) {
  const knowledge: RuleKnowledge | undefined = getRuleKnowledge(finding.ruleId);

  return (
    <>
      {/* What's happening */}
      <section className="flex flex-col gap-1.5">
        <h4 className="font-semibold text-[var(--color-text-primary)]">
          What is happening
        </h4>
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          {knowledge ? knowledge.whatIsHappening : finding.description}
        </p>
      </section>

      {/* Why it matters */}
      <section className="flex flex-col gap-1.5">
        <h4 className="font-semibold text-[var(--color-text-primary)]">
          Why it matters
        </h4>
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          {knowledge ? knowledge.whyItMatters : finding.help}
        </p>
      </section>

      {/* Who is affected */}
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
            <p className="text-[11px] text-[var(--color-text-secondary)] italic">
              {knowledge.whoIsAffectedNote}
            </p>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-1 text-[var(--color-text-secondary)]">
          <h4 className="font-semibold text-[var(--color-text-primary)]">
            Who is affected
          </h4>
          <p>No detailed lesson yet. See external documentation below.</p>
        </section>
      )}

      {/* Suggested fix */}
      {(() => {
        const goodExample = knowledge
          ? generateContextualFix(finding, knowledge.goodExample)
          : finding.fix || "";
        return goodExample ? (
          <section className="flex flex-col gap-2">
            <h4 className="font-semibold text-[var(--color-text-primary)]">
              Suggested fix
            </h4>
            <CodeSnippet code={goodExample} />
          </section>
        ) : null;
      })()}

      {/* Why the fix works */}
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

      {/* How to verify */}
      {knowledge && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
              <CheckCircle
                className="h-3.5 w-3.5 text-[var(--color-success-default)]"
                aria-hidden="true"
              />
              <h4>How to verify</h4>
            </div>
            {onOpenInspector && (
              <button
                type="button"
                onClick={() => onOpenInspector(knowledge.inspector, targetId)}
                className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <span>
                  Open in{" "}
                  {INSPECTOR_LABELS[knowledge.inspector] || knowledge.inspector}
                </span>
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

      {/* Official References */}
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
    </>
  );
}

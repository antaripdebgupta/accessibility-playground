"use client";

import * as React from "react";
import Link from "next/link";
import type { Finding } from "@/types/a11y";
import { getLearnTopicForRuleId } from "@/data/learn-topics";
import { FindingStatusBadge } from "../FindingStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { WcagBadge } from "@/components/WcagBadge";
import { getImpactMeta } from "@/lib/impact";
import { BookOpen, ExternalLink } from "lucide-react";

export interface FindingHeaderProps {
  finding: Finding;
}

export function FindingHeader({ finding }: FindingHeaderProps) {
  const learnTopic = getLearnTopicForRuleId(finding.ruleId);
  const impactMeta = getImpactMeta(finding.impact);

  return (
    <>
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
    </>
  );
}

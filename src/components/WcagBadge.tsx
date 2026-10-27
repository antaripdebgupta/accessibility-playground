"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@accessly-ui/react";
import { WCAG_CRITERIA_BY_ID } from "@/data/wcag";

export function WcagBadge({
  criterionId,
  asLink = true,
}: {
  criterionId: string;
  asLink?: boolean;
}) {
  const criterion = WCAG_CRITERIA_BY_ID.get(criterionId);

  if (!criterion) {
    return <Badge variant="secondary">{criterionId}</Badge>;
  }

  const badgeContent = (
    <Badge
      variant="default"
      className="gap-1 font-mono hover:border-[var(--color-focus-ring)]/40"
    >
      <span>WCAG {criterion.id}</span>
      <span className="text-[10px] font-semibold">({criterion.level})</span>
    </Badge>
  );

  return (
    <Tooltip delayDuration={200} placement="top">
      <TooltipTrigger>
        {asLink ? (
          <a
            href={criterion.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WCAG ${criterion.id} ${criterion.name} (Level ${criterion.level}) (opens in new tab)`}
            className="inline-flex cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            {badgeContent}
          </a>
        ) : (
          <span
            aria-label={`WCAG ${criterion.id} ${criterion.name} (Level ${criterion.level})`}
            className="inline-flex rounded"
          >
            {badgeContent}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-1">
            <span className="font-mono text-[11px] font-bold text-[var(--color-focus-ring)]">
              WCAG {criterion.id}: {criterion.name}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Level {criterion.level}
            </span>
          </div>
          <p className="text-md leading-relaxed text-[var(--color-text-secondary)]">
            {criterion.summary}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

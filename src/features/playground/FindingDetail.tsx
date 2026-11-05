"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { AxeFinding, Finding } from "@/types/a11y";
import type { ApplyAutoFixOptions } from "@/lib/auto-fix";
import { FindingHeader } from "./finding/FindingHeader";
import { FindingCode } from "./finding/FindingCode";
import { FindingFix } from "./finding/FindingFix";

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
  onApplyFix?: (finding: AxeFinding, options?: ApplyAutoFixOptions) => void;
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

  return (
    <article
      aria-label={`Finding details: ${finding.help}`}
      className="flex flex-col gap-6 p-4 text-xs"
    >
      <FindingHeader finding={finding} />

      <FindingCode primaryNode={primaryNode} onSelectNode={onSelectNode} />

      <FindingFix
        axeFinding={axeFinding}
        ruleId={finding.ruleId}
        primaryNode={primaryNode}
        onApplyFix={onApplyFix}
      />

      {/* Lazily-loaded lesson body (rule knowledge, verification, references) */}
      <RuleLesson
        finding={finding}
        targetId={targetId}
        onOpenInspector={onOpenInspector}
      />
    </article>
  );
}

"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import { CheckCircle2, Circle, AlertCircle, Tag } from "lucide-react";

export interface AccessibleNamePanelProps {
  selectedNode: A11yNode | null;
}

export function AccessibleNamePanel({
  selectedNode,
}: AccessibleNamePanelProps) {
  if (!selectedNode) {
    return (
      <InspectorEmptyState
        title="No Element Selected"
        description="Select an element in the preview or tree to trace its accessible name computation."
      />
    );
  }

  // Construct standard step traces
  const steps = [
    {
      title: "1. Hidden Check",
      rule: "Elements with aria-hidden='true' or inert are pruned from the name calculation.",
      applied: selectedNode.ariaAttributes["aria-hidden"] === "true",
      output:
        selectedNode.ariaAttributes["aria-hidden"] === "true"
          ? "(Hidden from a11y tree)"
          : null,
    },
    {
      title: "2. aria-labelledby",
      rule: "Highest precedence: references another element by ID to accumulate its text alternative.",
      applied: selectedNode.accessibleNameSource === "aria-labelledby",
      output:
        selectedNode.accessibleNameSource === "aria-labelledby"
          ? selectedNode.accessibleName
          : null,
    },
    {
      title: "3. aria-label",
      rule: "Direct author string alternative assigned directly via aria-label attribute.",
      applied: selectedNode.accessibleNameSource === "aria-label",
      output:
        selectedNode.accessibleNameSource === "aria-label"
          ? selectedNode.accessibleName
          : null,
    },
    {
      title: "4. Native Markup Label",
      rule: "HTML host-language semantics: <label for>, enclosing <label>, alt on <img>, or <title> on <svg>.",
      applied:
        selectedNode.accessibleNameSource === "<label for>" ||
        selectedNode.accessibleNameSource === "enclosing <label>" ||
        selectedNode.accessibleNameSource === "alt attribute" ||
        selectedNode.accessibleNameSource === "<title> element",
      output:
        selectedNode.accessibleNameSource === "<label for>" ||
        selectedNode.accessibleNameSource === "enclosing <label>" ||
        selectedNode.accessibleNameSource === "alt attribute" ||
        selectedNode.accessibleNameSource === "<title> element"
          ? selectedNode.accessibleName
          : null,
    },
    {
      title: "5. Subtree Text Content",
      rule: "Accumulates inner rendered text for elements allowing name-from-content (e.g. <button>, <a>, headings).",
      applied: selectedNode.accessibleNameSource === "subtree text",
      output:
        selectedNode.accessibleNameSource === "subtree text"
          ? selectedNode.accessibleName
          : null,
    },
    {
      title: "6. Placeholder Attribute",
      rule: "Fallback for inputs only. Highly discouraged as primary label because it disappears on input.",
      applied: selectedNode.accessibleNameSource === "placeholder (fallback)",
      output:
        selectedNode.accessibleNameSource === "placeholder (fallback)"
          ? selectedNode.accessibleName
          : null,
    },
    {
      title: "7. Title Attribute",
      rule: "Advisory tooltip fallback if no other source exists.",
      applied: selectedNode.accessibleNameSource === "title (fallback)",
      output:
        selectedNode.accessibleNameSource === "title (fallback)"
          ? selectedNode.accessibleName
          : null,
    },
  ];

  return (
    <div className="flex flex-col">
      <InspectorSelectedHeader selectedNode={selectedNode} />
      <div className="flex flex-col gap-5 p-4">
        {/* Final Winning Name Card */}
        <div className="rounded-lg border border-[var(--color-focus-ring)]/30 bg-[var(--color-accent-subtle)]/40 p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-[var(--color-accent)]">
              <Tag className="h-4 w-4" aria-hidden="true" />
              <span>COMPUTED ACCESSIBLE NAME</span>
            </span>
            <Badge
              variant={selectedNode.hasAccessibleName ? "success" : "warning"}
            >
              Source: {selectedNode.accessibleNameSource}
            </Badge>
          </div>

          <div className="my-2">
            {selectedNode.hasAccessibleName ? (
              <p className="font-mono text-base font-bold tracking-tight text-[var(--color-text-primary)]">
                &quot;{selectedNode.accessibleName}&quot;
              </p>
            ) : (
              <div className="text-md flex items-center gap-1.5 font-semibold text-[var(--color-danger-default)]">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Genuinely no accessible name — assistive technology will
                  announce only the tag or role!
                </span>
              </div>
            )}
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

        {/* Algorithm Step-by-Step Trace */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h4 className="text-md font-semibold text-[var(--color-text-primary)]">
              W3C Accessible Name and Description Computation 1.2
            </h4>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Evaluated in precedence order
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isWinner = step.applied;
              return (
                <div
                  key={step.title}
                  className={`relative flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isWinner
                      ? "border-[var(--color-success-default)]/40 bg-[var(--color-success-subtle)]/40"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] opacity-75"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isWinner ? (
                      <CheckCircle2
                        className="h-4 w-4 text-[var(--color-success-default)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="h-4 w-4 text-[var(--color-text-disabled)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-md font-mono font-semibold ${isWinner ? "text-[var(--color-success-default)]" : "text-[var(--color-text-primary)]"}`}
                      >
                        {step.title}
                      </span>
                      {isWinner ? (
                        <Badge variant="success" className="text-[10px]">
                          Winning Step
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-[var(--color-text-secondary)] italic">
                          {step.output
                            ? "Ignored because higher-precedence step won"
                            : "Not provided on element"}
                        </span>
                      )}
                    </div>

                    <p className="text-md leading-relaxed text-[var(--color-text-secondary)]">
                      {step.rule}
                    </p>

                    {isWinner && step.output && (
                      <div className="text-md mt-1 rounded border border-[var(--color-success-default)]/30 bg-[var(--color-surface)] p-2 font-mono">
                        <span className="text-[var(--color-text-secondary)]">
                          Resolved text:{" "}
                        </span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          &quot;{step.output}&quot;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

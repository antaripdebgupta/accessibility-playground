"use client";

import * as React from "react";
import type { A11yNode, Finding } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { EyeOff, AlertOctagon } from "lucide-react";

export interface A11yTreeSelectedCardProps {
  selectedNode: A11yNode;
  findings?: readonly Finding[];
}

export function A11yTreeSelectedCard({
  selectedNode,
  findings = [],
}: A11yTreeSelectedCardProps) {
  const nodeFindings = findings.filter((f) =>
    f.nodes.some((n) => n.targetId === selectedNode.id)
  );

  const ariaAttributes = Object.entries(selectedNode.ariaAttributes);

  return (
    <section
      aria-label="Selected node details"
      className="flex flex-col gap-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/30 p-4 text-xs"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">
            Role Semantics
          </span>
          <p className="mt-0.5 font-mono text-[var(--color-text-primary)]">
            {selectedNode.role}{" "}
            <span className="text-[11px] font-normal text-[var(--color-text-secondary)]">
              (implicit: {selectedNode.implicitRole}, explicit:{" "}
              {selectedNode.explicitRole || "none"})
            </span>
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">
            Name &amp; Source
          </span>
          <p className="mt-0.5 text-[var(--color-text-primary)]">
            {selectedNode.accessibleName ? (
              <span>
                &quot;{selectedNode.accessibleName}&quot;{" "}
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  (via {selectedNode.accessibleNameSource})
                </span>
              </span>
            ) : (
              <span className="text-[var(--color-text-secondary)] italic">
                None
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ARIA States & Properties */}
      {ariaAttributes.length > 0 && (
        <div>
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">
            States &amp; Properties
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {ariaAttributes.map(([k, v]) => (
              <span
                key={k}
                className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-primary)]"
              >
                {k}=&quot;{v}&quot;
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hidden element indicator */}
      {selectedNode.ariaAttributes["aria-hidden"] === "true" && (
        <div className="flex items-center gap-1.5 rounded bg-[var(--color-warning-subtle)] px-2 py-1 text-[11px] text-[var(--color-warning-text)]">
          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Hidden from assistive technology tree (aria-hidden=&quot;true&quot;)
          </span>
        </div>
      )}

      {/* Related issues */}
      {nodeFindings.length > 0 && (
        <div className="flex flex-col gap-1 rounded border border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)] p-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-danger-text)]">
            <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Related issues ({nodeFindings.length})</span>
          </div>
          <ul className="flex list-disc flex-col gap-0.5 pl-5 text-[11px] text-[var(--color-text-secondary)]">
            {nodeFindings.map((f) => (
              <li key={f.fingerprint}>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {f.help}
                </span>{" "}
                <Badge variant="danger" className="ml-1 text-[9px]">
                  {f.impact}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

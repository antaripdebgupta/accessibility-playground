"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { validateAriaAttribute } from "@/lib/aria-explorer";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, XCircle, Crosshair } from "lucide-react";

export interface AriaExplorerPanelProps {
  selectedNode: A11yNode | null;
}

export function AriaExplorerPanel({ selectedNode }: AriaExplorerPanelProps) {
  if (!selectedNode) {
    return (
      <div className="text-md flex h-64 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <p className="mb-1 font-medium text-[var(--color-text-primary)]">
          No Element Selected
        </p>
        <p>
          Click an element in the preview or tree to inspect its role, name, and
          ARIA state here.
        </p>
      </div>
    );
  }

  const ariaAttrEntries = Object.entries(selectedNode.ariaAttributes);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Role Summary Card */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
        <h4 className="text-md mb-2 flex items-center justify-between font-mono font-semibold text-[var(--color-text-primary)]">
          <span>&lt;{selectedNode.tagName}&gt; Role Mapping</span>
          <span className="text-[11px] font-normal text-[var(--color-text-secondary)]">
            ID: {selectedNode.id}
          </span>
        </h4>

        <div className="text-md grid grid-cols-1 gap-2 font-mono sm:grid-cols-3">
          <div className="flex flex-col gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
            <span className="text-[10px] tracking-wider text-[var(--color-text-secondary)] uppercase">
              Implicit Role
            </span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {selectedNode.implicitRole}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
            <span className="text-[10px] tracking-wider text-[var(--color-text-secondary)] uppercase">
              Explicit Role
            </span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {selectedNode.explicitRole
                ? `role="${selectedNode.explicitRole}"`
                : "(none specified)"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 rounded border border-[var(--color-focus-ring)]/30 bg-[var(--color-accent-subtle)]/40 bg-[var(--color-surface)] p-2">
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-[var(--color-focus-ring)] uppercase">
              <Crosshair className="h-3 w-3" aria-hidden="true" />
              Computed Role
            </span>
            <span className="font-bold text-[var(--color-focus-ring)]">
              {selectedNode.role}
            </span>
          </div>
        </div>
      </div>

      {/* ARIA Attributes Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-[var(--color-text-primary)]">
            Applied ARIA Attributes ({ariaAttrEntries.length})
          </h4>
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            WAI-ARIA 1.2 Validity
          </span>
        </div>

        {ariaAttrEntries.length === 0 ? (
          <div className="text-md rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-sunken)]/20 p-5 text-center text-[var(--color-text-secondary)]">
            <p className="mb-0.5 font-medium text-[var(--color-text-primary)]">
              No ARIA attributes applied to this node.
            </p>
            <p>
              It relies entirely on native HTML semantics (implicit role:{" "}
              <span className="font-mono font-semibold text-[var(--color-text-primary)]">
                {selectedNode.implicitRole}
              </span>
              ).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="text-md w-full text-left">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] font-mono text-[11px] text-[var(--color-text-secondary)]">
                <tr>
                  <th scope="col" className="p-2.5">
                    Attribute
                  </th>
                  <th scope="col" className="p-2.5">
                    Value
                  </th>
                  <th scope="col" className="p-2.5">
                    Status
                  </th>
                  <th scope="col" className="p-2.5">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                {ariaAttrEntries.map(([attr, val]) => {
                  const validation = validateAriaAttribute(
                    attr,
                    val,
                    selectedNode.role
                  );
                  return (
                    <tr
                      key={attr}
                      className="transition-colors hover:bg-[var(--color-surface-raised)]/50"
                    >
                      <td className="p-2.5 font-mono font-medium text-[var(--color-text-primary)]">
                        {attr}
                      </td>
                      <td className="p-2.5 font-mono text-[var(--color-text-secondary)]">
                        &quot;{val}&quot;
                      </td>
                      <td className="p-2.5">
                        {validation.status === "valid" ? (
                          <Badge variant="success">
                            <CheckCircle2
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            Valid
                          </Badge>
                        ) : validation.status === "not-allowed" ? (
                          <Badge variant="warning">
                            <AlertTriangle
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            Not Allowed
                          </Badge>
                        ) : validation.status === "invalid-value" ? (
                          <Badge variant="danger">
                            <XCircle className="h-3 w-3" aria-hidden="true" />
                            Invalid Value
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </td>
                      <td className="text-md p-2.5 leading-relaxed text-[var(--color-text-secondary)]">
                        {validation.explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

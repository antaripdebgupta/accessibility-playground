"use client";

import * as React from "react";
import type { A11yNode, Finding } from "@/types/a11y";
import { getAllowedAriaAttributes } from "@/lib/aria-explorer";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import { Crosshair, AlertOctagon, Tag } from "lucide-react";
import { AriaAttributeItem } from "./aria/AriaAttributeItem";
import { AriaAddAttributeForm } from "./aria/AriaAddAttributeForm";

export interface AriaExplorerPanelProps {
  selectedNode: A11yNode | null;
  onUpdateAttribute?: (attr: string, value: string) => void;
  onRemoveAttribute?: (attr: string) => void;
  findings?: readonly Finding[];
}

export function AriaExplorerPanel({
  selectedNode,
  onUpdateAttribute,
  onRemoveAttribute,
  findings = [],
}: AriaExplorerPanelProps) {
  const [editingAttr, setEditingAttr] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>("");
  const [newAttr, setNewAttr] = React.useState<string>("");
  const [newValue, setNewValue] = React.useState<string>("");

  if (!selectedNode) {
    return (
      <InspectorEmptyState
        title="No Element Selected"
        description="Select an element in the preview or tree to inspect its role, name, and ARIA state."
      />
    );
  }

  const ariaAttrEntries = Object.entries(selectedNode.ariaAttributes);
  const allowedAttrs = getAllowedAriaAttributes(selectedNode.role);
  const availableAttrs = allowedAttrs.filter(
    (attr) => !(attr in selectedNode.ariaAttributes)
  );

  const nodeFindings = findings.filter((f) =>
    f.nodes.some((n) => n.targetId === selectedNode.id)
  );

  const handleStartEdit = (attr: string, val: string) => {
    if (!onUpdateAttribute) return;
    setEditingAttr(attr);
    setEditingValue(val);
  };

  const handleCommitEdit = (attr: string) => {
    if (onUpdateAttribute && editingAttr === attr) {
      onUpdateAttribute(attr, editingValue);
    }
    setEditingAttr(null);
  };

  const handleKeyDownEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    attr: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommitEdit(attr);
    } else if (e.key === "Escape") {
      setEditingAttr(null);
    }
  };

  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttr || !onUpdateAttribute) return;
    onUpdateAttribute(newAttr, newValue.trim() || "true");
    setNewAttr("");
    setNewValue("");
  };

  return (
    <div className="flex flex-col">
      <InspectorSelectedHeader selectedNode={selectedNode} />

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

            <div className="flex flex-col gap-0.5 rounded border border-[var(--color-focus-ring)]/30 bg-[var(--color-accent-subtle)]/40 p-2">
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

        {/* Related Name Info (§C2) */}
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
            <Tag
              className="h-3.5 w-3.5 text-[var(--color-focus-ring)]"
              aria-hidden="true"
            />
            <span>Related Name Information</span>
          </div>
          <div className="flex flex-col gap-1 text-[var(--color-text-secondary)]">
            <p>
              <strong className="text-[var(--color-text-primary)]">
                Accessible Name:
              </strong>{" "}
              {selectedNode.accessibleName ? (
                <span>&quot;{selectedNode.accessibleName}&quot;</span>
              ) : (
                <span className="italic">None</span>
              )}
            </p>
            <p>
              <strong className="text-[var(--color-text-primary)]">
                Source:
              </strong>{" "}
              {selectedNode.accessibleNameSource || "None"}
            </p>
            {selectedNode.ariaAttributes["aria-labelledby"] && (
              <p>
                <strong className="text-[var(--color-text-primary)]">
                  aria-labelledby targets:
                </strong>{" "}
                <code className="font-mono text-[var(--color-focus-ring)]">
                  {selectedNode.ariaAttributes["aria-labelledby"]}
                </code>
              </p>
            )}
            {selectedNode.ariaAttributes["aria-describedby"] && (
              <p>
                <strong className="text-[var(--color-text-primary)]">
                  aria-describedby targets:
                </strong>{" "}
                <code className="font-mono text-[var(--color-focus-ring)]">
                  {selectedNode.ariaAttributes["aria-describedby"]}
                </code>
              </p>
            )}
          </div>
        </div>

        {/* Related Issues (§C2) */}
        {nodeFindings.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)] p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-danger-text)]">
              <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Related Issues ({nodeFindings.length})</span>
            </div>
            <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-[var(--color-danger-text)]">
              {nodeFindings.map((f) => (
                <li key={f.fingerprint}>{f.help}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ARIA Attributes Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-[var(--color-text-primary)]">
              Applied ARIA Attributes ({ariaAttrEntries.length})
            </h4>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              WAI-ARIA 1.2 Validity · Click value to edit
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
                    {onRemoveAttribute && (
                      <th scope="col" className="p-2.5 text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                  {ariaAttrEntries.map(([attr, val]) => (
                    <AriaAttributeItem
                      key={attr}
                      attr={attr}
                      val={val}
                      selectedNode={selectedNode}
                      editingAttr={editingAttr}
                      editingValue={editingValue}
                      setEditingValue={setEditingValue}
                      onStartEdit={handleStartEdit}
                      onCommitEdit={handleCommitEdit}
                      onKeyDownEdit={handleKeyDownEdit}
                      onRemoveAttribute={onRemoveAttribute}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Attribute Row */}
          {onUpdateAttribute && (
            <AriaAddAttributeForm
              availableAttrs={availableAttrs}
              newAttr={newAttr}
              setNewAttr={setNewAttr}
              newValue={newValue}
              setNewValue={setNewValue}
              onAddAttribute={handleAddAttribute}
            />
          )}
        </div>
      </div>
    </div>
  );
}

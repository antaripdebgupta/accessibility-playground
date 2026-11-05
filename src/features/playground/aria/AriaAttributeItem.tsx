"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { validateAriaAttribute } from "@/lib/aria-explorer";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, XCircle, Trash2 } from "lucide-react";

export interface AriaAttributeItemProps {
  attr: string;
  val: string;
  selectedNode: A11yNode;
  editingAttr: string | null;
  editingValue: string;
  setEditingValue: (v: string) => void;
  onStartEdit: (attr: string, val: string) => void;
  onCommitEdit: (attr: string) => void;
  onKeyDownEdit: (
    e: React.KeyboardEvent<HTMLInputElement>,
    attr: string
  ) => void;
  onRemoveAttribute?: (attr: string) => void;
}

export function AriaAttributeItem({
  attr,
  val,
  selectedNode,
  editingAttr,
  editingValue,
  setEditingValue,
  onStartEdit,
  onCommitEdit,
  onKeyDownEdit,
  onRemoveAttribute,
}: AriaAttributeItemProps) {
  const isEditing = editingAttr === attr;
  const validation = validateAriaAttribute(attr, val, selectedNode.role);

  return (
    <tr className="transition-colors hover:bg-[var(--color-surface-raised)]/50">
      <td className="p-2.5 font-mono font-medium text-[var(--color-text-primary)]">
        {attr}
      </td>
      <td className="p-2.5 font-mono text-[var(--color-text-secondary)]">
        {isEditing ? (
          <input
            ref={(el) => el?.focus()}
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={() => onCommitEdit(attr)}
            onKeyDown={(e) => onKeyDownEdit(e, attr)}
            className="rounded border border-[var(--color-focus-ring)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-primary)] ring-1 ring-[var(--color-focus-ring)] outline-none"
            aria-label={`Edit value for ${attr}`}
          />
        ) : (
          <button
            type="button"
            onClick={() => onStartEdit(attr, val)}
            title="Click to edit value"
            className="rounded px-1.5 py-0.5 text-left transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            &quot;{val}&quot;
          </button>
        )}
      </td>
      <td className="p-2.5">
        {validation.status === "valid" ? (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Valid
          </Badge>
        ) : validation.status === "not-allowed" ? (
          <Badge variant="warning">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
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
      {onRemoveAttribute && (
        <td className="p-2.5 text-right">
          <button
            type="button"
            onClick={() => onRemoveAttribute(attr)}
            title={`Remove ${attr}`}
            className="rounded p-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            aria-label={`Remove attribute ${attr}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </td>
      )}
    </tr>
  );
}

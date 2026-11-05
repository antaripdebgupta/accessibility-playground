"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@accessly-ui/react";

export interface AriaAddAttributeFormProps {
  availableAttrs: readonly string[];
  newAttr: string;
  setNewAttr: (v: string) => void;
  newValue: string;
  setNewValue: (v: string) => void;
  onAddAttribute: (e: React.FormEvent) => void;
}

export function AriaAddAttributeForm({
  availableAttrs,
  newAttr,
  setNewAttr,
  newValue,
  setNewValue,
  onAddAttribute,
}: AriaAddAttributeFormProps) {
  return (
    <form
      onSubmit={onAddAttribute}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 p-2.5"
    >
      <div className="flex min-w-[160px] flex-1 items-center gap-1.5">
        <label
          htmlFor="new-aria-attr-select"
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          Add:
        </label>
        <select
          id="new-aria-attr-select"
          value={newAttr}
          onChange={(e) => setNewAttr(e.target.value)}
          className="h-7 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-mono text-xs text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <option value="">Select ARIA attribute...</option>
          {availableAttrs.map((attr) => (
            <option key={attr} value={attr}>
              {attr}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[140px] flex-1 items-center gap-1.5">
        <label
          htmlFor="new-aria-attr-value"
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          Value:
        </label>
        <input
          id="new-aria-attr-value"
          type="text"
          placeholder="e.g. true"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-7 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-mono text-xs text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        />
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={!newAttr}
        className="h-7 gap-1 px-2.5 text-xs font-medium"
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
        <span>Add</span>
      </Button>
    </form>
  );
}

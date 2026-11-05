"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { ChevronRight, AlertCircle, EyeOff } from "lucide-react";

export interface FlattenedNode {
  node: A11yNode;
  depth: number;
  hasChildren: boolean;
  parentId: string | null;
}

export interface A11yTreeNodeRowProps {
  item: FlattenedNode;
  isSelected: boolean;
  isFocused: boolean;
  isCollapsed: boolean;
  hasIssues: boolean;
  itemRef: (el: HTMLButtonElement | null) => void;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onFocus: (id: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLButtonElement>,
    item: FlattenedNode
  ) => void;
}

export function A11yTreeNodeRow({
  item,
  isSelected,
  isFocused,
  isCollapsed,
  hasIssues,
  itemRef,
  onToggleExpand,
  onSelect,
  onFocus,
  onKeyDown,
}: A11yTreeNodeRowProps) {
  const { node, depth, hasChildren } = item;
  const isHidden = node.ariaAttributes["aria-hidden"] === "true";

  return (
    <div
      role="none"
      className="flex items-center"
      style={{ paddingLeft: `${depth * 16}px` }}
    >
      {/* Expand / collapse chevron */}
      {hasChildren ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
          className="mr-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-100 ${
              isCollapsed ? "" : "rotate-90"
            }`}
          />
        </button>
      ) : (
        <span
          className="mr-0.5 inline-block h-5 w-5 shrink-0"
          aria-hidden="true"
        />
      )}

      {/* The focusable treeitem */}
      <button
        ref={itemRef}
        type="button"
        role="treeitem"
        id={`a11y-treeitem-${node.id}`}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? !isCollapsed : undefined}
        aria-level={depth + 1}
        tabIndex={isFocused ? 0 : -1}
        onClick={() => onSelect(node.id)}
        onFocus={() => onFocus(node.id)}
        onKeyDown={(e) => onKeyDown(e, item)}
        className={`group flex min-w-0 flex-1 items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
          isSelected
            ? "bg-[var(--color-surface-sunken)] font-semibold text-[var(--color-text-primary)] ring-1 ring-[var(--color-focus-ring)]"
            : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)]"
        } ${isHidden ? "opacity-60" : ""}`}
      >
        {/* Role badge */}
        <span className="shrink-0 rounded bg-[var(--color-surface-raised)] px-1 py-0.5 text-[10px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
          {node.role}
        </span>

        {/* Accessible name */}
        {node.accessibleName && (
          <span className="truncate text-[var(--color-text-primary)]">
            &quot;{node.accessibleName}&quot;
          </span>
        )}

        {/* Tagname */}
        <span className="text-[10px] text-[var(--color-text-secondary)]">
          &lt;{node.tagName}&gt;
        </span>

        {/* aria-hidden indicator */}
        {isHidden && (
          <span
            title="Hidden from AT (aria-hidden='true')"
            className="ml-auto flex shrink-0 items-center text-[var(--color-warning-default)]"
          >
            <EyeOff className="h-3 w-3" aria-hidden="true" />
          </span>
        )}

        {/* Violation indicator icon */}
        {hasIssues && (
          <span
            title="Has accessibility findings"
            className={`flex shrink-0 items-center text-[var(--color-danger-default)] ${
              isHidden ? "" : "ml-auto"
            }`}
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </button>
    </div>
  );
}

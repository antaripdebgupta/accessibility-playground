"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight, AlertCircle, Crosshair } from "lucide-react";

export interface A11yTreePanelProps {
  ast: A11yNode | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

interface FlattenedNode {
  node: A11yNode;
  depth: number;
  hasChildren: boolean;
  parentId: string | null;
}

export function A11yTreePanel({
  ast,
  selectedNodeId,
  onSelectNode,
}: A11yTreePanelProps) {
  // Set of collapsed node IDs (all nodes expanded by default without an effect)
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const itemRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Flatten visible nodes
  const visibleNodes = React.useMemo(() => {
    if (!ast) return [];
    const list: FlattenedNode[] = [];

    function traverse(node: A11yNode, depth: number, parentId: string | null) {
      const hasChildren = node.children.length > 0;
      list.push({ node, depth, hasChildren, parentId });

      if (hasChildren && !collapsedIds.has(node.id)) {
        for (const child of node.children) {
          traverse(child, depth + 1, node.id);
        }
      }
    }

    traverse(ast, 0, null);
    return list;
  }, [ast, collapsedIds]);

  // Determine which node has tabIndex=0 (roving tabindex)
  const effectiveFocusedId = React.useMemo(() => {
    if (focusedId && visibleNodes.some((v) => v.node.id === focusedId)) {
      return focusedId;
    }
    if (
      selectedNodeId &&
      visibleNodes.some((v) => v.node.id === selectedNodeId)
    ) {
      return selectedNodeId;
    }
    return visibleNodes[0]?.node.id ?? null;
  }, [focusedId, selectedNodeId, visibleNodes]);

  const toggleExpand = React.useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const focusItem = React.useCallback((id: string) => {
    setFocusedId(id);
    const el = itemRefs.current.get(id);
    el?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, item: FlattenedNode) => {
    const currentIndex = visibleNodes.findIndex(
      (v) => v.node.id === item.node.id
    );
    if (currentIndex === -1) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (currentIndex < visibleNodes.length - 1) {
          const next = visibleNodes[currentIndex + 1]!;
          focusItem(next.node.id);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (currentIndex > 0) {
          const prev = visibleNodes[currentIndex - 1]!;
          focusItem(prev.node.id);
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (item.hasChildren) {
          if (collapsedIds.has(item.node.id)) {
            toggleExpand(item.node.id);
          } else if (currentIndex < visibleNodes.length - 1) {
            focusItem(visibleNodes[currentIndex + 1]!.node.id);
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (item.hasChildren && !collapsedIds.has(item.node.id)) {
          toggleExpand(item.node.id);
        } else if (item.parentId) {
          focusItem(item.parentId);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        if (visibleNodes[0]) {
          focusItem(visibleNodes[0].node.id);
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const last = visibleNodes[visibleNodes.length - 1];
        if (last) {
          focusItem(last.node.id);
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        onSelectNode(item.node.id);
        break;
      }
    }
  };

  if (!ast) {
    return (
      <div className="text-md flex h-64 flex-col items-center justify-center p-6 text-center text-[var(--color-text-secondary)]">
        <p className="mb-1 font-medium text-[var(--color-text-primary)]">
          No Accessibility Tree Available
        </p>
        <p>Enter valid HTML in the editor to inspect the computed hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="text-md flex items-center justify-between border-b border-[var(--color-border)] pb-2 text-[var(--color-text-secondary)]">
        <span>Use arrow keys to navigate tree; Enter to select</span>
        <span className="font-mono text-[11px]">Role &amp; Name Hierarchy</span>
      </div>
      <div
        role="tree"
        aria-label="Accessibility Tree"
        className="space-y-0.5 focus-visible:outline-none"
      >
        {visibleNodes.map((item) => {
          const { node, depth, hasChildren } = item;
          const isSelected = node.id === selectedNodeId;
          const isExpanded = !collapsedIds.has(node.id);
          const isRovingTarget = node.id === effectiveFocusedId;

          return (
            <div key={node.id} role="none" className="flex flex-col">
              <button
                ref={(el) => {
                  if (el) itemRefs.current.set(node.id, el);
                  else itemRefs.current.delete(node.id);
                }}
                type="button"
                role="treeitem"
                tabIndex={isRovingTarget ? 0 : -1}
                aria-selected={isSelected}
                aria-level={depth + 1}
                aria-expanded={hasChildren ? isExpanded : undefined}
                onClick={() => {
                  setFocusedId(node.id);
                  onSelectNode(node.id);
                }}
                onKeyDown={(e) => handleKeyDown(e, item)}
                className={`group text-md flex items-center justify-between rounded px-2.5 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                  isSelected
                    ? "border border-[var(--color-focus-ring)]/30 bg-[var(--color-accent-subtle)] font-medium text-[var(--color-focus-ring)]"
                    : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)]"
                }`}
                style={{ paddingLeft: `${Math.max(8, depth * 16 + 8)}px` }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {hasChildren ? (
                    <span
                      aria-hidden="true"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        toggleExpand(node.id);
                      }}
                      className="inline-flex cursor-pointer p-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <ChevronRight
                        className={`h-3 w-3 shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    <span
                      className="h-3 w-3 shrink-0 opacity-25"
                      aria-hidden="true"
                    >
                      <ChevronRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                    &lt;{node.tagName}&gt;
                  </span>
                  <span className="text-md font-mono font-semibold text-[var(--color-text-primary)]">
                    {node.role}
                  </span>
                  {node.hasAccessibleName ? (
                    <span className="text-md truncate font-normal text-[var(--color-text-secondary)]">
                      &quot;{node.accessibleName}&quot;
                    </span>
                  ) : (
                    <Badge
                      variant="warning"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      <AlertCircle className="h-2.5 w-2.5" aria-hidden="true" />
                      no name
                    </Badge>
                  )}
                </div>

                {isSelected && (
                  <span className="ml-2 flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold text-[var(--color-focus-ring)]">
                    <Crosshair className="h-2.5 w-2.5" aria-hidden="true" />
                    Selected
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

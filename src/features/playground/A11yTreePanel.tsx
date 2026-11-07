"use client";

import * as React from "react";
import type { A11yNode, Finding } from "@/types/a11y";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import { A11yTreeNodeRow, type FlattenedNode } from "./tree/A11yTreeNodeRow";
import { A11yTreeSelectedCard } from "./tree/A11yTreeSelectedCard";

export interface A11yTreePanelProps {
  ast: A11yNode | null;
  selectedNode?: A11yNode | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  findings?: readonly Finding[];
}

export function A11yTreePanel({
  ast,
  selectedNode,
  selectedNodeId,
  onSelectNode,
  findings = [],
}: A11yTreePanelProps) {
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

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    item: FlattenedNode
  ) => {
    const { node, hasChildren } = item;
    const currentIndex = visibleNodes.findIndex((v) => v.node.id === node.id);
    if (currentIndex === -1) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = visibleNodes[currentIndex + 1];
        if (next) {
          setFocusedId(next.node.id);
          itemRefs.current.get(next.node.id)?.focus();
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = visibleNodes[currentIndex - 1];
        if (prev) {
          setFocusedId(prev.node.id);
          itemRefs.current.get(prev.node.id)?.focus();
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (hasChildren && collapsedIds.has(node.id)) {
          toggleExpand(node.id);
        } else if (hasChildren && !collapsedIds.has(node.id)) {
          const next = visibleNodes[currentIndex + 1];
          if (next) {
            setFocusedId(next.node.id);
            itemRefs.current.get(next.node.id)?.focus();
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (hasChildren && !collapsedIds.has(node.id)) {
          toggleExpand(node.id);
        } else if (item.parentId) {
          setFocusedId(item.parentId);
          itemRefs.current.get(item.parentId)?.focus();
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = visibleNodes[0];
        if (first) {
          setFocusedId(first.node.id);
          itemRefs.current.get(first.node.id)?.focus();
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const last = visibleNodes[visibleNodes.length - 1];
        if (last) {
          setFocusedId(last.node.id);
          itemRefs.current.get(last.node.id)?.focus();
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        onSelectNode(node.id);
        break;
      }
    }
  };

  const findingNodeIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const f of findings) {
      for (const n of f.nodes) {
        if (n.targetId) set.add(n.targetId);
      }
    }
    return set;
  }, [findings]);

  return (
    <div className="flex flex-col">
      <InspectorSelectedHeader selectedNode={selectedNode ?? null} />

      <div className="flex items-start gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 px-4 py-2 text-[11px] text-[var(--color-text-secondary)]">
        <p>
          This is the playground&apos;s interpretation of the DOM, not the
          browser&apos;s real accessibility tree.
        </p>
      </div>

      {selectedNode && (
        <A11yTreeSelectedCard selectedNode={selectedNode} findings={findings} />
      )}

      {/* Tree container */}
      <div className="p-4">
        {!ast ? (
          <InspectorEmptyState
            title="Tree Unavailable"
            description="Type or paste HTML in the editor to inspect the accessibility tree structure."
          />
        ) : (
          <div
            role="tree"
            aria-label="Accessibility node hierarchy"
            className="flex flex-col gap-0.5"
          >
            {visibleNodes.map((item) => (
              <A11yTreeNodeRow
                key={item.node.id}
                item={item}
                isSelected={selectedNodeId === item.node.id}
                isFocused={effectiveFocusedId === item.node.id}
                isCollapsed={collapsedIds.has(item.node.id)}
                hasIssues={findingNodeIds.has(item.node.id)}
                itemRef={(el) => {
                  if (el) itemRefs.current.set(item.node.id, el);
                  else itemRefs.current.delete(item.node.id);
                }}
                onToggleExpand={toggleExpand}
                onSelect={onSelectNode}
                onFocus={setFocusedId}
                onKeyDown={handleKeyDown}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

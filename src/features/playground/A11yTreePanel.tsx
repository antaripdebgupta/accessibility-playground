"use client";

import * as React from "react";
import type { A11yNode, Finding } from "@/types/a11y";
import { Badge } from "@/components/ui/Badge";
import {
  InspectorSelectedHeader,
  InspectorEmptyState,
} from "./InspectorSelectedHeader";
import {
  ChevronRight,
  AlertCircle,
  Crosshair,
  Info,
  EyeOff,
  AlertOctagon,
} from "lucide-react";

export interface A11yTreePanelProps {
  ast: A11yNode | null;
  selectedNode?: A11yNode | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  findings?: readonly Finding[];
}

interface FlattenedNode {
  node: A11yNode;
  depth: number;
  hasChildren: boolean;
  parentId: string | null;
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
      case "Enter":
      case " ": {
        e.preventDefault();
        onSelectNode(node.id);
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
    }
  };

  if (!ast) {
    return (
      <InspectorEmptyState
        title="No Accessibility Tree Available"
        description="Enter valid HTML in the editor to inspect the computed accessibility hierarchy."
      />
    );
  }

  // Related issues for currently selected node
  const nodeFindings = selectedNode
    ? findings.filter((f) =>
        f.nodes.some((n) => n.targetId === selectedNode.id)
      )
    : [];

  const ariaAttributes = selectedNode
    ? Object.entries(selectedNode.ariaAttributes)
    : [];

  return (
    <div className="flex flex-col">
      {/* Consistent header (§C2) */}
      <InspectorSelectedHeader selectedNode={selectedNode ?? null} />

      {/* Visible disclaimer notice (§C2) */}
      <div className="flex items-start gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 px-4 py-2 text-[11px] text-[var(--color-text-secondary)]">
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-focus-ring)]"
          aria-hidden="true"
        />
        <p>
          This is the playground&apos;s interpretation of the DOM, not the
          browser&apos;s real accessibility tree.
        </p>
      </div>

      {/* Selected Node Details Card (§C2) */}
      {selectedNode && (
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
                Hidden from assistive technology tree
                (aria-hidden=&quot;true&quot;)
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
              <ul className="list-disc pl-4 text-[11px] text-[var(--color-danger-text)]">
                {nodeFindings.map((f) => (
                  <li key={f.fingerprint}>{f.help}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Tree View */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 text-[11px] text-[var(--color-text-secondary)]">
          <span>Use arrow keys to navigate; Enter to select</span>
          <span className="font-mono">Role &amp; Name Hierarchy</span>
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
            const isHidden = node.ariaAttributes["aria-hidden"] === "true";

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
                  className={`group flex items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
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
                    <span className="font-mono font-semibold text-[var(--color-text-primary)]">
                      {node.role}
                    </span>
                    {node.hasAccessibleName ? (
                      <span className="truncate font-normal text-[var(--color-text-secondary)]">
                        &quot;{node.accessibleName}&quot;
                      </span>
                    ) : (
                      <Badge
                        variant="warning"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        <AlertCircle
                          className="h-2.5 w-2.5"
                          aria-hidden="true"
                        />
                        no name
                      </Badge>
                    )}
                    {isHidden && (
                      <span
                        className="rounded bg-[var(--color-surface-sunken)] px-1 font-mono text-[10px] text-[var(--color-text-secondary)]"
                        title="aria-hidden='true'"
                      >
                        hidden
                      </span>
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
    </div>
  );
}

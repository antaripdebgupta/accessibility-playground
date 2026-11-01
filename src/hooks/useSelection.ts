"use client";

import * as React from "react";
import type { A11yNode } from "@/types/a11y";
import { findA11yNodeById, rematchA11yNode } from "@/lib/a11y-tree";

export type SelectionSource =
  | "preview"
  | "tree"
  | "issue"
  | "focus"
  | "editor"
  | "initial";

export interface SelectedNodeMeta {
  readonly id: string;
  readonly tagName: string;
  readonly accessibleName?: string;
  readonly sourceRange?: readonly [number, number];
}

export interface UseSelectionOptions {
  ast: A11yNode | null;
  onTabChange?: (tab: string) => void;
}

export function useSelection({ ast, onTabChange }: UseSelectionOptions) {
  // Parse URL params once for deep linking (?tab=aria&el=<id>)
  const initialUrlParams = React.useMemo(() => {
    if (typeof window === "undefined") return { tab: null, el: null };
    try {
      const params = new URLSearchParams(window.location.search);
      return { tab: params.get("tab"), el: params.get("el") };
    } catch {
      return { tab: null, el: null };
    }
  }, []);

  const [selectedId, setSelectedId] = React.useState<string | null>(
    () => initialUrlParams.el
  );
  const [source, setSource] = React.useState<SelectionSource>("initial");
  const [lastSelectedNodeMeta, setLastSelectedNodeMeta] =
    React.useState<SelectedNodeMeta | null>(null);

  // Sync tab param to parent on mount (external side-effect only)
  React.useEffect(() => {
    if (initialUrlParams.tab && onTabChange) {
      onTabChange(initialUrlParams.tab);
    }
  }, [initialUrlParams.tab, onTabChange]);

  // Unified select action
  const select = React.useCallback(
    (id: string | null, newSource: SelectionSource) => {
      setSelectedId(id);
      setSource(newSource);

      if (id && ast) {
        const node = findA11yNodeById(ast, id);
        if (node) {
          setLastSelectedNodeMeta({
            id: node.id,
            tagName: node.tagName,
            accessibleName: node.accessibleName,
            sourceRange: node.sourceRange,
          });
        }
      }
    },
    [ast]
  );

  // Derive active node ID with rematching (§C3)
  const activeNodeId = React.useMemo(() => {
    if (!ast) return null;

    // 1. Direct ID match
    if (selectedId && findA11yNodeById(ast, selectedId)) {
      return selectedId;
    }

    // 2. Best-effort re-match if selected element shifted
    if (selectedId && lastSelectedNodeMeta) {
      const rematched = rematchA11yNode(lastSelectedNodeMeta, ast);
      if (rematched) {
        return rematched.id;
      }
    }

    // 3. Fallback to first child or root
    return ast.children[0]?.id ?? ast.id;
  }, [ast, selectedId, lastSelectedNodeMeta]);

  // Purely derived selection lost flag (§C3)
  const selectionLost = React.useMemo(() => {
    if (!ast || !selectedId || !lastSelectedNodeMeta) return false;
    const directFound = findA11yNodeById(ast, selectedId);
    if (directFound) return false;
    const rematched = rematchA11yNode(lastSelectedNodeMeta, ast);
    return !rematched;
  }, [ast, selectedId, lastSelectedNodeMeta]);

  const selectedNode = React.useMemo(() => {
    return findA11yNodeById(ast, activeNodeId ?? "");
  }, [ast, activeNodeId]);

  return {
    selectedId: activeNodeId,
    rawSelectedId: selectedId,
    source,
    select,
    selectedNode,
    selectionLost,
  };
}

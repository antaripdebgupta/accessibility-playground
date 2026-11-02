import * as React from "react";
import { useSelection, type SelectionSource } from "@/hooks/useSelection";
import { findA11yNodeAtOffset, findA11yNodeById } from "@/lib/a11y-tree";
import { applyAutoFixToHtml } from "@/lib/auto-fix";
import type { A11yNode, AxeFinding, Finding } from "@/types/a11y";
import type { RevealRequest } from "../CodeEditor";

export interface UsePlaygroundSelectionParams {
  ast: A11yNode | null;
  onTabChange: (tab: string) => void;
  setRawHtml: React.Dispatch<React.SetStateAction<string>>;
}

export interface UsePlaygroundSelectionResult {
  activeNodeId: string | null;
  selectedNode: A11yNode | null;
  selectionLost: boolean;
  revealRequest: RevealRequest | null;
  simulatedFocusId: string | null;
  wrappedHandleSelect: (
    id: string | null,
    source: SelectionSource,
    focusEditor?: boolean
  ) => void;
  handleCaretChange: (offset: number) => void;
  handleSimulateFocus: (id: string) => void;
  handleApplyFix: (finding: Finding | AxeFinding) => void;
}

export function usePlaygroundSelection({
  ast,
  onTabChange,
  setRawHtml,
}: UsePlaygroundSelectionParams): UsePlaygroundSelectionResult {
  const {
    selectedId: activeNodeId,
    select: handleSelect,
    selectedNode,
    selectionLost,
  } = useSelection({ ast, onTabChange });

  const [revealRequest, setRevealRequest] =
    React.useState<RevealRequest | null>(null);
  const revealSeqRef = React.useRef(0);

  const [simulatedFocusId, setSimulatedFocusId] = React.useState<string | null>(
    null
  );

  const wrappedHandleSelect = React.useCallback(
    (id: string | null, newSource: SelectionSource, focusEditor = false) => {
      handleSelect(id, newSource);
      if (
        (newSource === "tree" ||
          newSource === "preview" ||
          newSource === "issue" ||
          newSource === "focus") &&
        id &&
        ast
      ) {
        const node = findA11yNodeById(ast, id);
        if (node?.sourceRange) {
          revealSeqRef.current += 1;
          setRevealRequest({
            id: revealSeqRef.current,
            range: node.sourceRange,
            focus: focusEditor,
          });
        }
      }
    },
    [handleSelect, ast]
  );

  const handleCaretChange = React.useCallback(
    (offset: number) => {
      if (!ast) return;
      const node = findA11yNodeAtOffset(ast, offset);
      if (node && node.id !== activeNodeId) {
        handleSelect(node.id, "editor");
      }
    },
    [ast, activeNodeId, handleSelect]
  );

  const handleSimulateFocus = React.useCallback(
    (id: string) => {
      setSimulatedFocusId(id);
      wrappedHandleSelect(id, "focus");
    },
    [wrappedHandleSelect]
  );

  const handleApplyFix = React.useCallback(
    (finding: Finding | AxeFinding) => {
      if (!ast) return;
      const targetId = finding.nodes[0]?.targetId ?? "";
      const node = findA11yNodeById(ast, targetId);
      if (!node) return;
      const axeFinding: AxeFinding =
        "id" in finding
          ? finding
          : {
              id: finding.ruleId,
              impact: finding.impact,
              description: finding.description,
              help: finding.help,
              helpUrl: finding.helpUrl,
              fix: finding.fix,
              nodes: finding.nodes,
            };
      setRawHtml((html) => applyAutoFixToHtml(html, axeFinding, node));
    },
    [ast, setRawHtml]
  );

  return {
    activeNodeId,
    selectedNode,
    selectionLost,
    revealRequest,
    simulatedFocusId,
    wrappedHandleSelect,
    handleCaretChange,
    handleSimulateFocus,
    handleApplyFix,
  };
}

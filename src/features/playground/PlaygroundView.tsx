"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Editor } from "./Editor";
import { PreviewFrame } from "./PreviewFrame";
import { WorkbenchToolbar } from "./WorkbenchToolbar";
import { SplitPane } from "@/components/workbench/SplitPane";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWorkbenchLayout } from "@/hooks/useWorkbenchLayout";
import { usePlaygroundDocument } from "@/hooks/usePlaygroundDocument";
import { useScanState } from "@/hooks/useScanState";
import { useSelection } from "@/hooks/useSelection";
import {
  parseHtmlToA11yTree,
  findA11yNodeAtOffset,
  findA11yNodeById,
} from "@/lib/a11y-tree";
import { computeFocusOrder } from "@/lib/focus-order";
import { runCustomRules } from "@/lib/custom-rules";
import { mergeFindings } from "@/lib/merge-findings";
import type { FocusOrderPosition, AxeFinding, Finding } from "@/types/a11y";
import type { RevealRequest } from "./CodeEditor";
import { buildDiagnostics } from "./editor/extensions/diagnostics";
import type { SelectionSource } from "@/hooks/useSelection";
import { encodeSnippet } from "@/lib/snippet-share";
import { AlertTriangle } from "lucide-react";
import {
  setAttributeInSource,
  removeAttributeFromSource,
} from "@/lib/mutate-html";
import { applyAutoFixToHtml } from "@/lib/auto-fix";
import { AnalysisTabs } from "./AnalysisTabs";
import { useBaseline } from "@/hooks/useBaseline";
import { normalizeFindings } from "@/lib/findings/normalize";
import { toJson, toCsv, toMarkdown, downloadBlob } from "@/lib/report";
import { loadManualTestResults } from "@/lib/manual-tests-storage";
import { useToast } from "@accessly-ui/react";
import { getChallengeById, type Challenge } from "@/data/challenges";
import { useChallengeMode } from "@/hooks/useChallengeMode";
import { ChallengeStrip } from "./ChallengeStrip";

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const challengeParam = searchParams.get("challenge");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Challenge mode: resolve the active challenge from ?challenge=<id>
  const activeChallenge = React.useMemo<Challenge | null>(
    () => (challengeParam ? (getChallengeById(challengeParam) ?? null) : null),
    [challengeParam]
  );
  const challengeMode = useChallengeMode(activeChallenge);

  const {
    outerPercent,
    innerPercent,
    direction,
    maximizedPane,
    setOuterPercent,
    setInnerPercent,
    toggleMaximize,
    setMaximizedPane,
  } = useWorkbenchLayout();

  const {
    scanId,
    isScanning,
    setIsScanning,
    scanError,
    axeViolations,
    axeIncomplete,
    triggerScan,
    handleScanResults,
    handleScanError,
  } = useScanState();

  const handleDocumentChange = React.useCallback(() => {
    setIsScanning(true);
  }, [setIsScanning]);

  const {
    rawHtml,
    rawCss,
    debouncedHtml,
    debouncedCss,
    useTailwind,
    setRawHtml,
    setRawCss,
    setUseTailwind,
    handleSelectTemplate,
    handleStartFresh,
    handleResetExample,
    isOverSizeLimit,
  } = usePlaygroundDocument(handleDocumentChange);

  // Load challenge starter on first mount when ?challenge= is present
  const loadedChallengeRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (activeChallenge && loadedChallengeRef.current !== activeChallenge.id) {
      loadedChallengeRef.current = activeChallenge.id;
      setRawHtml(activeChallenge.startHtml);
      setRawCss(activeChallenge.startCss ?? "");
    }
  }, [activeChallenge, setRawHtml, setRawCss]);

  // Active analysis tab (supports ?tab= in URL, e.g. ?tab=issues)
  const [analysisTab, setAnalysisTab] = React.useState<string>(
    tabParam || "tree"
  );

  const [focusPositions, setFocusPositions] = React.useState<
    readonly FocusOrderPosition[]
  >([]);
  const [simulatedFocusId, setSimulatedFocusId] = React.useState<string | null>(
    null
  );

  // Mobile pane selector (used below lg breakpoint)
  const [mobilePane, setMobilePane] = React.useState<
    "editor" | "preview" | "analysis"
  >("editor");

  // Parse AST whenever debouncedHtml changes (skip if over size limit §B.4)
  const {
    ast,
    instrumentedHtml,
    error: parseError,
  } = React.useMemo(() => {
    if (isOverSizeLimit) {
      return {
        ast: null,
        instrumentedHtml: rawHtml,
        error: "Document too large for live AST parsing.",
      };
    }
    return parseHtmlToA11yTree(debouncedHtml);
  }, [debouncedHtml, isOverSizeLimit, rawHtml]);

  // Unified selection model (§C1)
  const {
    selectedId: activeNodeId,
    select: handleSelect,
    selectedNode,
    selectionLost,
  } = useSelection({ ast, onTabChange: setAnalysisTab });

  const [revealRequest, setRevealRequest] =
    React.useState<RevealRequest | null>(null);
  const revealSeqRef = React.useRef(0);

  // One-shot reveal triggered only on user selection from tree/preview/issue/focus (Part A1)
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

  // Sync cursor in CodeMirror with element selection (§C1) - no feedback loop (Part A1)
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

  // Derive computed focus sequence & findings
  const computedFocusOrder = React.useMemo(() => {
    if (!ast) return null;
    return computeFocusOrder(ast);
  }, [ast]);

  // Run custom playground rules host-side immediately
  const customFindings = React.useMemo(() => {
    if (!ast || isOverSizeLimit) return [];
    return runCustomRules(ast, debouncedCss, debouncedHtml);
  }, [ast, debouncedCss, debouncedHtml, isOverSizeLimit]);

  // Merge axe-core findings + custom findings
  const mergedViolations = React.useMemo(() => {
    return mergeFindings(customFindings, axeViolations);
  }, [customFindings, axeViolations]);

  // Normalized findings for reports, comparison, and inspector
  const normalizedFindings = React.useMemo(() => {
    return normalizeFindings(customFindings, axeViolations, axeIncomplete);
  }, [customFindings, axeViolations, axeIncomplete]);

  // Collect all current violation rule IDs for challenge verification
  const currentViolationRuleIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const v of mergedViolations) {
      ids.add(v.id);
    }
    for (const v of axeViolations) {
      ids.add(v.id);
    }
    for (const f of normalizedFindings) {
      ids.add(f.ruleId);
    }
    return Array.from(ids);
  }, [mergedViolations, axeViolations, normalizedFindings]);

  // Challenge: load solution into editor
  const handleLoadSolution = React.useCallback(
    (challenge: Challenge) => {
      setRawHtml(challenge.solutionHtml);
      setRawCss(challenge.solutionCss ?? "");
    },
    [setRawHtml, setRawCss]
  );

  // Challenge: reset to starter code
  const handleResetStarter = React.useCallback(
    (challenge: Challenge) => {
      setRawHtml(challenge.startHtml);
      setRawCss(challenge.startCss ?? "");
    },
    [setRawHtml, setRawCss]
  );

  const toast = useToast();
  const activeTemplateId =
    challengeParam ||
    searchParams.get("pattern") ||
    searchParams.get("s") ||
    "default";

  const handleBaselineCleared = React.useCallback(
    (reason: string) => {
      toast.push({
        title: "Baseline cleared",
        description: reason,
        variant: "info",
      });
    },
    [toast]
  );

  const { baseline, hasBaseline, setBaseline, clearBaseline, comparison } =
    useBaseline(
      activeTemplateId,
      normalizedFindings,
      rawHtml,
      handleBaselineCleared
    );

  const handleExportJson = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeTemplateId);
    const jsonString = toJson(
      normalizedFindings,
      comparison ?? undefined,
      undefined,
      manualTests
    );
    downloadBlob(
      jsonString,
      `a11y-report-${Date.now()}.json`,
      "application/json"
    );
    toast.push({
      title: "Report exported",
      description: "Downloaded JSON report.",
      variant: "success",
    });
  }, [normalizedFindings, comparison, activeTemplateId, toast]);

  const handleExportCsv = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeTemplateId);
    const csvString = toCsv(
      normalizedFindings,
      comparison ?? undefined,
      manualTests
    );
    downloadBlob(
      csvString,
      `a11y-report-${Date.now()}.csv`,
      "text/csv;charset=utf-8"
    );
    toast.push({
      title: "Report exported",
      description: "Downloaded CSV spreadsheet.",
      variant: "success",
    });
  }, [normalizedFindings, comparison, activeTemplateId, toast]);

  const handleExportMarkdown = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeTemplateId);
    const mdString = toMarkdown(
      normalizedFindings,
      comparison ?? undefined,
      undefined,
      manualTests
    );
    downloadBlob(
      mdString,
      `a11y-report-${Date.now()}.md`,
      "text/markdown;charset=utf-8"
    );
    toast.push({
      title: "Report exported",
      description: "Downloaded Markdown report.",
      variant: "success",
    });
  }, [normalizedFindings, comparison, activeTemplateId, toast]);

  const handleCopyReport = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeTemplateId);
    const mdString = toMarkdown(
      normalizedFindings,
      comparison ?? undefined,
      undefined,
      manualTests
    );
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(mdString).then(() => {
        toast.push({
          title: "Report copied",
          description: "Markdown report copied to clipboard.",
          variant: "success",
        });
      });
    }
  }, [normalizedFindings, comparison, activeTemplateId, toast]);

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

  const editorDiagnostics = React.useMemo(() => {
    return buildDiagnostics(rawHtml.length, {
      ast,
      findings: normalizedFindings,
      parseError,
      onApplyFix: handleApplyFix,
      onSelectFinding: () => {
        setAnalysisTab("issues");
      },
    });
  }, [rawHtml.length, ast, normalizedFindings, parseError, handleApplyFix]);

  // F6 / Shift+F6 keyboard cycling between panes and Esc to exit maximize (§2.5)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && maximizedPane !== null) {
        setMaximizedPane(null);
        e.preventDefault();
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        const targets = [
          document.querySelector<HTMLElement>("#code-editor-pane .cm-content"),
          document.querySelector<HTMLElement>(
            "button[aria-label*='Reload preview']"
          ),
          document.querySelector<HTMLElement>(
            "[role='tablist'] [role='tab'][aria-selected='true']"
          ),
        ].filter(Boolean) as HTMLElement[];

        if (targets.length === 0) return;

        const activeIndex = targets.findIndex(
          (t) =>
            t === document.activeElement || t.contains(document.activeElement)
        );
        let nextIndex = 0;
        if (e.shiftKey) {
          nextIndex = activeIndex <= 0 ? targets.length - 1 : activeIndex - 1;
        } else {
          nextIndex = activeIndex >= targets.length - 1 ? 0 : activeIndex + 1;
        }
        targets[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maximizedPane, setMaximizedPane]);

  const editorPane = (
    <section
      id="code-editor-pane"
      aria-label="Code editor"
      className="flex h-full min-h-0 flex-col"
    >
      <Editor
        html={rawHtml}
        css={rawCss}
        onHtmlChange={(val) => setRawHtml(val)}
        onCssChange={(val) => setRawCss(val)}
        onSelectTemplate={handleSelectTemplate}
        onCopyLink={() => {
          const encoded = encodeSnippet(rawHtml, rawCss);
          return `${location.origin}/playground?s=${encoded}`;
        }}
        useTailwind={useTailwind}
        onToggleTailwind={setUseTailwind}
        revealRequest={revealRequest}
        onCaretChange={handleCaretChange}
        onForceScan={triggerScan}
        diagnostics={editorDiagnostics}
        isMaximized={maximizedPane === "editor"}
        onToggleMaximize={() => toggleMaximize("editor")}
      />
    </section>
  );

  const previewPane = (
    <section
      id="live-preview-pane"
      aria-label="Live preview"
      className="flex h-full min-h-0 flex-col"
    >
      <PreviewFrame
        instrumentedHtml={instrumentedHtml}
        css={rawCss}
        useTailwind={useTailwind}
        selectedNodeId={activeNodeId}
        scanId={scanId}
        onSelectNodeId={(id) => wrappedHandleSelect(id, "preview")}
        onScanResults={handleScanResults}
        onScanError={handleScanError}
        parseError={parseError}
        focusPositions={focusPositions}
        onFocusPositionsChange={setFocusPositions}
        focusedElementId={simulatedFocusId}
        showFocusBadges={true}
        isMaximized={maximizedPane === "preview"}
        onToggleMaximize={() => toggleMaximize("preview")}
      />
    </section>
  );

  const analysisPane = (
    <section
      id="analysis-pane"
      aria-label="Analysis"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
    >
      {selectionLost && (
        <div
          role="status"
          className="flex items-center gap-1.5 border-b border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-3 py-1.5 text-xs text-[var(--color-warning-text)]"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Selection lost — previously selected element was removed. Fell back
            to first element.
          </span>
        </div>
      )}
      <AnalysisTabs
        analysisTab={analysisTab}
        onTabChange={setAnalysisTab}
        maximizedPane={maximizedPane}
        onToggleMaximize={() => toggleMaximize("analysis")}
        ast={ast}
        selectedNode={selectedNode}
        activeNodeId={activeNodeId}
        onSelectNode={(id) => wrappedHandleSelect(id, "tree")}
        onUpdateAttribute={(attr, value) => {
          if (!selectedNode) return;
          setRawHtml((html) =>
            setAttributeInSource(html, selectedNode, attr, value)
          );
        }}
        onRemoveAttribute={(attr) => {
          if (!selectedNode) return;
          setRawHtml((html) =>
            removeAttributeFromSource(html, selectedNode, attr)
          );
        }}
        computedFocusOrder={computedFocusOrder}
        onSimulateFocus={handleSimulateFocus}
        mergedViolations={mergedViolations}
        axeIncomplete={axeIncomplete}
        isScanning={isScanning}
        scanError={scanError}
        hasHtml={rawHtml.trim().length > 0}
        onApplyFix={handleApplyFix}
        isOverSizeLimit={isOverSizeLimit}
        baseline={baseline}
        comparison={comparison}
        rawHtml={rawHtml}
        onSetBaseline={setBaseline}
        onClearBaseline={clearBaseline}
        templateOrSnippetId={activeTemplateId}
      />
    </section>
  );

  const challengeStripElement = activeChallenge ? (
    <ChallengeStrip
      challengeMode={challengeMode}
      currentViolationRuleIds={currentViolationRuleIds}
      onLoadSolution={handleLoadSolution}
      onResetStarter={handleResetStarter}
    />
  ) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Accessibility Playground — Live Workbench</h1>
      <WorkbenchToolbar
        onForceScan={triggerScan}
        isScanning={isScanning}
        onStartFresh={() => {
          clearBaseline("Started fresh with default template");
          handleStartFresh();
        }}
        onResetExample={handleResetExample}
        onSetBaseline={setBaseline}
        hasBaseline={hasBaseline}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onExportMarkdown={handleExportMarkdown}
        onCopyReport={handleCopyReport}
      />

      {/* Main Workspace Body */}
      {isDesktop ? (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col">
            {maximizedPane === "editor" ? (
              <div className="min-h-0 flex-1 p-2">{editorPane}</div>
            ) : maximizedPane === "preview" ? (
              <div className="min-h-0 flex-1 p-2">{previewPane}</div>
            ) : maximizedPane === "analysis" ? (
              <div className="min-h-0 flex-1 p-2">{analysisPane}</div>
            ) : (
              <SplitPane
                direction={direction}
                size={outerPercent}
                onSizeChange={setOuterPercent}
                min={25}
                max={75}
                primaryId="pane-left"
                primaryLabel="Editor and Preview"
                secondaryLabel="Analysis"
                className="min-h-0 flex-1"
                primary={
                  <SplitPane
                    direction="column"
                    size={innerPercent}
                    onSizeChange={setInnerPercent}
                    min={25}
                    max={80}
                    primaryId="pane-editor"
                    primaryLabel="Code editor"
                    secondaryLabel="Live preview"
                    className="h-full"
                    primary={editorPane}
                    secondary={previewPane}
                  />
                }
                secondary={analysisPane}
              />
            )}
          </div>
          {challengeStripElement}
        </div>
      ) : (
        /* Mobile: one pane at a time with segmented control (SC 1.4.10 Reflow) */
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            role="tablist"
            aria-label="Workbench panes"
            className="flex flex-none items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/60 px-3 py-1.5"
          >
            {(["editor", "preview", "analysis"] as const).map((pane) => (
              <button
                key={pane}
                type="button"
                role="tab"
                aria-selected={mobilePane === pane}
                onClick={() => setMobilePane(pane)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                  mobilePane === pane
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {pane}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {mobilePane === "editor" && editorPane}
            {mobilePane === "preview" && previewPane}
            {mobilePane === "analysis" && analysisPane}
          </div>
        </div>
      )}

      {/* Status bar (§3.3) */}
      <div className="flex h-7 flex-none items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 px-3 text-[11px] text-[var(--color-text-secondary)]">
        {/* Only scan state is polite live region (SC 4.1.3: No live-region spam) */}
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2"
        >
          <span>{isScanning ? "Scanning…" : "Ready"}</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setAnalysisTab("issues");
              if (!isDesktop) setMobilePane("analysis");
            }}
            className="font-medium text-[var(--color-text-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            {mergedViolations.length} issue
            {mergedViolations.length === 1 ? "" : "s"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {maximizedPane && (
            <span className="font-medium text-[var(--color-accent)]">
              Maximized: {maximizedPane} (Esc to exit)
            </span>
          )}
          <span className="hidden sm:inline">
            Layout:{" "}
            {direction === "column"
              ? "Stacked"
              : `${Math.round(outerPercent)}/${Math.round(100 - outerPercent)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

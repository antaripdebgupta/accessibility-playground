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
import { parseHtmlToA11yTree, findA11yNodeById } from "@/lib/a11y-tree";
import { computeFocusOrder } from "@/lib/focus-order";
import { runCustomRules } from "@/lib/custom-rules";
import { mergeFindings } from "@/lib/merge-findings";
import type { FocusOrderPosition } from "@/types/a11y";
import { encodeSnippet } from "@/lib/snippet-share";
import {
  setAttributeInSource,
  removeAttributeFromSource,
} from "@/lib/mutate-html";
import { applyAutoFixToHtml } from "@/lib/auto-fix";
import { AnalysisTabs } from "./AnalysisTabs";

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
    isOverSizeLimit,
  } = usePlaygroundDocument(handleDocumentChange);

  // Active analysis tab (supports ?tab= in URL, e.g. ?tab=issues)
  const [analysisTab, setAnalysisTab] = React.useState<string>(
    tabParam || "tree"
  );

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
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

  // Derive computed focus sequence & findings
  const computedFocusOrder = React.useMemo(() => {
    if (!ast) return null;
    return computeFocusOrder(ast);
  }, [ast]);

  // Run custom playground rules host-side immediately
  const customFindings = React.useMemo(() => {
    if (!ast || isOverSizeLimit) return [];
    return runCustomRules(ast, debouncedCss);
  }, [ast, debouncedCss, isOverSizeLimit]);

  // Merge axe-core findings + custom findings
  const mergedViolations = React.useMemo(() => {
    return mergeFindings(customFindings, axeViolations);
  }, [customFindings, axeViolations]);

  // Derive effective selected node ID
  const activeNodeId = React.useMemo(() => {
    if (!ast) return null;
    if (selectedNodeId && findA11yNodeById(ast, selectedNodeId)) {
      return selectedNodeId;
    }
    return ast.children[0]?.id ?? ast.id;
  }, [ast, selectedNodeId]);

  const selectedNode = React.useMemo(() => {
    return findA11yNodeById(ast, activeNodeId ?? "");
  }, [ast, activeNodeId]);

  const handleSimulateFocus = React.useCallback((id: string) => {
    setSimulatedFocusId(id);
    setSelectedNodeId(id);
  }, []);

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
        selectionRange={selectedNode?.sourceRange ?? null}
        onForceScan={triggerScan}
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
        onSelectNodeId={(id) => setSelectedNodeId(id)}
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
      <AnalysisTabs
        analysisTab={analysisTab}
        onTabChange={setAnalysisTab}
        maximizedPane={maximizedPane}
        onToggleMaximize={() => toggleMaximize("analysis")}
        ast={ast}
        selectedNode={selectedNode}
        activeNodeId={activeNodeId}
        onSelectNode={(id) => setSelectedNodeId(id)}
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
        onApplyFix={(finding) => {
          const targetId = finding.nodes[0]?.targetId ?? "";
          const node = findA11yNodeById(ast, targetId);
          if (!node) return;
          setRawHtml((html) => applyAutoFixToHtml(html, finding, node));
        }}
        isOverSizeLimit={isOverSizeLimit}
      />
    </section>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Accessibility Playground — Live Workbench</h1>
      <WorkbenchToolbar
        onForceScan={triggerScan}
        isScanning={isScanning}
        onStartFresh={handleStartFresh}
      />

      {/* Main Workspace Body */}
      {isDesktop ? (
        maximizedPane === "editor" ? (
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
        )
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

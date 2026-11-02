"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { WorkbenchToolbar } from "./WorkbenchToolbar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWorkbenchLayout } from "@/hooks/useWorkbenchLayout";
import { usePlaygroundDocument } from "@/hooks/usePlaygroundDocument";
import { useScanState } from "@/hooks/useScanState";
import { buildDiagnostics } from "./editor/extensions/diagnostics";
import { useBaseline } from "@/hooks/useBaseline";
import { useToast } from "@accessly-ui/react";
import { usePlaygroundAnalysis } from "./hooks/usePlaygroundAnalysis";
import { usePlaygroundSelection } from "./hooks/usePlaygroundSelection";
import { useActiveChallenge } from "./hooks/useActiveChallenge";
import { useReportExport } from "./hooks/useReportExport";
import { useWorkbenchKeys } from "./hooks/useWorkbenchKeys";
import { useWorkbenchPanes } from "./hooks/useWorkbenchPanes";
import { WorkbenchStatusBar } from "./WorkbenchStatusBar";
import { WorkbenchWorkspace } from "./WorkbenchWorkspace";
import type { FocusOrderPosition } from "@/types/a11y";
import type { MobilePaneId } from "./MobilePaneTabs";

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const challengeParam = searchParams.get("challenge");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Workbench layout
  const layout = useWorkbenchLayout();
  const {
    outerPercent,
    innerPercent,
    direction,
    maximizedPane,
    setOuterPercent,
    setInnerPercent,
    setMaximizedPane,
  } = layout;

  // Scan and document state
  const scan = useScanState();
  const handleDocumentChange = React.useCallback(() => {
    scan.setIsScanning(true);
  }, [scan]);

  const doc = usePlaygroundDocument(handleDocumentChange);
  const { rawHtml, setRawHtml, setRawCss } = doc;

  // Challenge mode
  const {
    activeChallenge,
    challengeMode,
    handleLoadSolution,
    handleResetStarter,
  } = useActiveChallenge(challengeParam, setRawHtml, setRawCss);

  const [analysisTab, setAnalysisTab] = React.useState<string>(
    tabParam || "tree"
  );
  const [focusPositions, setFocusPositions] = React.useState<
    readonly FocusOrderPosition[]
  >([]);
  const [mobilePane, setMobilePane] = React.useState<MobilePaneId>("editor");

  // Pure analysis derivations
  const analysis = usePlaygroundAnalysis({
    debouncedHtml: doc.debouncedHtml,
    rawHtml: doc.rawHtml,
    debouncedCss: doc.debouncedCss,
    isOverSizeLimit: doc.isOverSizeLimit,
    axeViolations: scan.axeViolations,
    axeIncomplete: scan.axeIncomplete,
  });

  // Selection model, reveal requests, focus simulation, and auto-fix
  const selection = usePlaygroundSelection({
    ast: analysis.ast,
    onTabChange: setAnalysisTab,
    setRawHtml,
  });

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

  const baselineState = useBaseline(
    activeTemplateId,
    analysis.findings,
    rawHtml,
    handleBaselineCleared
  );

  const reportExport = useReportExport({
    activeTemplateId,
    findings: analysis.findings,
    comparison: baselineState.comparison,
  });

  useWorkbenchKeys({ maximizedPane, setMaximizedPane });

  const editorDiagnostics = React.useMemo(() => {
    return buildDiagnostics(rawHtml.length, {
      ast: analysis.ast,
      findings: analysis.findings,
      parseError: analysis.parseError,
      onApplyFix: selection.handleApplyFix,
      onSelectFinding: () => setAnalysisTab("issues"),
    });
  }, [
    rawHtml.length,
    analysis.ast,
    analysis.findings,
    analysis.parseError,
    selection.handleApplyFix,
  ]);

  const { editorPane, previewPane, analysisPane } = useWorkbenchPanes({
    doc,
    analysis,
    selection,
    scan,
    layout,
    baselineState,
    editorDiagnostics,
    focusPositions,
    setFocusPositions,
    analysisTab,
    setAnalysisTab,
    activeTemplateId,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Accessibility Playground — Live Workbench</h1>
      <WorkbenchToolbar
        onForceScan={scan.triggerScan}
        isScanning={scan.isScanning}
        onStartFresh={() => {
          baselineState.clearBaseline("Started fresh with default template");
          doc.handleStartFresh();
        }}
        onResetExample={doc.handleResetExample}
        onSetBaseline={baselineState.setBaseline}
        hasBaseline={baselineState.hasBaseline}
        onExportJson={reportExport.handleExportJson}
        onExportCsv={reportExport.handleExportCsv}
        onExportMarkdown={reportExport.handleExportMarkdown}
        onCopyReport={reportExport.handleCopyReport}
      />

      <WorkbenchWorkspace
        isDesktop={isDesktop}
        maximizedPane={maximizedPane}
        direction={direction}
        outerPercent={outerPercent}
        innerPercent={innerPercent}
        setOuterPercent={setOuterPercent}
        setInnerPercent={setInnerPercent}
        mobilePane={mobilePane}
        setMobilePane={setMobilePane}
        editorPane={editorPane}
        previewPane={previewPane}
        analysisPane={analysisPane}
        activeChallenge={activeChallenge}
        challengeMode={challengeMode}
        currentViolationRuleIds={analysis.currentViolationRuleIds}
        onLoadSolution={handleLoadSolution}
        onResetStarter={handleResetStarter}
      />

      <WorkbenchStatusBar
        isScanning={scan.isScanning}
        violationCount={analysis.violationCount}
        maximizedPane={maximizedPane}
        direction={direction}
        outerPercent={outerPercent}
        onOpenIssues={() => {
          setAnalysisTab("issues");
          if (!isDesktop) setMobilePane("analysis");
        }}
      />
    </div>
  );
}

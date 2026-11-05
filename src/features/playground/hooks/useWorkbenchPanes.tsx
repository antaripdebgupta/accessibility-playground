import * as React from "react";
import {
  EditorPaneSection,
  PreviewPaneSection,
  AnalysisPaneSection,
} from "../WorkbenchPanes";
import {
  setAttributeInSource,
  removeAttributeFromSource,
} from "@/lib/mutate-html";
import type { FocusOrderPosition } from "@/types/a11y";
import type { Diagnostic } from "@codemirror/lint";
import type { PlaygroundAnalysisResult } from "./usePlaygroundAnalysis";
import type { UsePlaygroundSelectionResult } from "./usePlaygroundSelection";
import type { useBaseline } from "@/hooks/useBaseline";
import type { ExternalEdit } from "../CodeEditor";

export interface UseWorkbenchPanesParams {
  doc: {
    rawHtml: string;
    rawCss: string;
    setRawHtml: React.Dispatch<React.SetStateAction<string>>;
    setRawCss: (val: string) => void;
    handleSelectTemplate: (
      template: import("@/data/templates").StarterTemplate
    ) => void;
    useTailwind: boolean;
    setUseTailwind: (val: boolean) => void;
    isOverSizeLimit: boolean;
    externalEdit?: ExternalEdit | null;
    pushExternalEdit?: (kind: ExternalEdit["kind"], text: string) => void;
  };
  analysis: PlaygroundAnalysisResult;
  selection: UsePlaygroundSelectionResult;
  scan: {
    scanId: string;
    isScanning: boolean;
    scanError: string | null;
    triggerScan: () => void;
    handleScanResults: (
      violations: readonly import("@/types/a11y").AxeFinding[],
      incomplete?: readonly import("@/types/a11y").AxeFinding[]
    ) => void;
    handleScanError: (error: string) => void;
    axeIncomplete: readonly import("@/types/a11y").AxeFinding[];
  };
  layout: {
    maximizedPane: "editor" | "preview" | "analysis" | null;
    toggleMaximize: (pane: "editor" | "preview" | "analysis") => void;
  };
  baselineState: ReturnType<typeof useBaseline>;
  editorDiagnostics: Diagnostic[];
  focusPositions: readonly FocusOrderPosition[];
  setFocusPositions: (p: readonly FocusOrderPosition[]) => void;
  analysisTab: string;
  setAnalysisTab: (t: string) => void;
  activeTemplateId: string;
}

export function useWorkbenchPanes({
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
}: UseWorkbenchPanesParams) {
  const editorPane = (
    <EditorPaneSection
      rawHtml={doc.rawHtml}
      rawCss={doc.rawCss}
      onHtmlChange={(val) => doc.setRawHtml(val)}
      onCssChange={(val) => doc.setRawCss(val)}
      onSelectTemplate={doc.handleSelectTemplate}
      useTailwind={doc.useTailwind}
      onToggleTailwind={doc.setUseTailwind}
      externalEdit={doc.externalEdit}
      revealRequest={selection.revealRequest}
      onCaretChange={selection.handleCaretChange}
      onForceScan={scan.triggerScan}
      diagnostics={editorDiagnostics}
      isMaximized={layout.maximizedPane === "editor"}
      onToggleMaximize={() => layout.toggleMaximize("editor")}
    />
  );

  const previewPane = (
    <PreviewPaneSection
      instrumentedHtml={analysis.instrumentedHtml}
      rawCss={doc.rawCss}
      useTailwind={doc.useTailwind}
      selectedNodeId={selection.activeNodeId}
      scanId={scan.scanId}
      onSelectNodeId={(id) => selection.wrappedHandleSelect(id, "preview")}
      onScanResults={scan.handleScanResults}
      onScanError={scan.handleScanError}
      parseError={analysis.parseError}
      focusPositions={focusPositions}
      onFocusPositionsChange={setFocusPositions}
      focusedElementId={selection.simulatedFocusId}
      isMaximized={layout.maximizedPane === "preview"}
      onToggleMaximize={() => layout.toggleMaximize("preview")}
    />
  );

  const analysisPane = (
    <AnalysisPaneSection
      selectionLost={selection.selectionLost}
      analysisTab={analysisTab}
      onTabChange={setAnalysisTab}
      maximizedPane={layout.maximizedPane}
      onToggleMaximize={() => layout.toggleMaximize("analysis")}
      ast={analysis.ast}
      selectedNode={selection.selectedNode}
      activeNodeId={selection.activeNodeId}
      onSelectNode={(id) => selection.wrappedHandleSelect(id, "tree")}
      onUpdateAttribute={(attr, value) => {
        if (selection.selectedNode) {
          doc.setRawHtml((h) => {
            const newHtml = setAttributeInSource(
              h,
              selection.selectedNode!,
              attr,
              value
            );
            doc.pushExternalEdit?.("patch", newHtml);
            return newHtml;
          });
        }
      }}
      onRemoveAttribute={(attr) => {
        if (selection.selectedNode) {
          doc.setRawHtml((h) => {
            const newHtml = removeAttributeFromSource(
              h,
              selection.selectedNode!,
              attr
            );
            doc.pushExternalEdit?.("patch", newHtml);
            return newHtml;
          });
        }
      }}
      computedFocusOrder={analysis.focusOrder}
      onSimulateFocus={selection.handleSimulateFocus}
      mergedViolations={analysis.mergedViolations}
      axeIncomplete={scan.axeIncomplete}
      isScanning={scan.isScanning}
      scanError={scan.scanError}
      hasHtml={doc.rawHtml.trim().length > 0}
      onApplyFix={selection.handleApplyFix}
      isOverSizeLimit={doc.isOverSizeLimit}
      baseline={baselineState.baseline}
      comparison={baselineState.comparison}
      rawHtml={doc.rawHtml}
      onSetBaseline={baselineState.setBaseline}
      onClearBaseline={baselineState.clearBaseline}
      templateOrSnippetId={activeTemplateId}
    />
  );

  return { editorPane, previewPane, analysisPane };
}

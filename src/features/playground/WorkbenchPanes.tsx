import * as React from "react";
import { Editor } from "./Editor";
import { PreviewFrame } from "./PreviewFrame";
import { AnalysisTabs } from "./AnalysisTabs";
import { AlertTriangle } from "lucide-react";
import { encodeSnippet } from "@/lib/snippet-share";
import type {
  A11yNode,
  AxeFinding,
  Finding,
  FocusOrderPosition,
} from "@/types/a11y";
import type { ComputedFocusOrder } from "@/lib/focus-order";
import type { StarterTemplate } from "@/data/templates";
import type { RevealRequest } from "./CodeEditor";
import type { Diagnostic } from "@codemirror/lint";
import type { BaselineData } from "@/hooks/useBaseline";
import type { CompareResult } from "@/lib/compare";

export interface EditorPaneProps {
  rawHtml: string;
  rawCss: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  useTailwind: boolean;
  onToggleTailwind: (use: boolean) => void;
  loadRequest?: { readonly id: number } | null;
  revealRequest: RevealRequest | null;
  onCaretChange: (offset: number) => void;
  onForceScan: () => void;
  diagnostics: Diagnostic[];
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export function EditorPaneSection({
  rawHtml,
  rawCss,
  onHtmlChange,
  onCssChange,
  onSelectTemplate,
  useTailwind,
  onToggleTailwind,
  loadRequest,
  revealRequest,
  onCaretChange,
  onForceScan,
  diagnostics,
  isMaximized,
  onToggleMaximize,
}: EditorPaneProps) {
  return (
    <section
      id="code-editor-pane"
      aria-label="Code editor"
      className="flex h-full min-h-0 flex-col"
    >
      <Editor
        html={rawHtml}
        css={rawCss}
        onHtmlChange={onHtmlChange}
        onCssChange={onCssChange}
        onSelectTemplate={onSelectTemplate}
        onCopyLink={() =>
          `${location.origin}/playground?s=${encodeSnippet(rawHtml, rawCss)}`
        }
        useTailwind={useTailwind}
        onToggleTailwind={onToggleTailwind}
        loadRequest={loadRequest}
        revealRequest={revealRequest}
        onCaretChange={onCaretChange}
        onForceScan={onForceScan}
        diagnostics={diagnostics}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
      />
    </section>
  );
}

export interface PreviewPaneProps {
  instrumentedHtml: string;
  rawCss: string;
  useTailwind: boolean;
  selectedNodeId: string | null;
  scanId?: string;
  onSelectNodeId: (id: string) => void;
  onScanResults: (
    violations: readonly AxeFinding[],
    incomplete?: readonly AxeFinding[]
  ) => void;
  onScanError: (error: string) => void;
  parseError: string | null;
  focusPositions: readonly FocusOrderPosition[];
  onFocusPositionsChange: (positions: readonly FocusOrderPosition[]) => void;
  focusedElementId: string | null;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export function PreviewPaneSection({
  instrumentedHtml,
  rawCss,
  useTailwind,
  selectedNodeId,
  scanId,
  onSelectNodeId,
  onScanResults,
  onScanError,
  parseError,
  focusPositions,
  onFocusPositionsChange,
  focusedElementId,
  isMaximized,
  onToggleMaximize,
}: PreviewPaneProps) {
  return (
    <section
      id="live-preview-pane"
      aria-label="Live preview"
      className="flex h-full min-h-0 flex-col"
    >
      <PreviewFrame
        instrumentedHtml={instrumentedHtml}
        css={rawCss}
        useTailwind={useTailwind}
        selectedNodeId={selectedNodeId}
        scanId={scanId}
        onSelectNodeId={onSelectNodeId}
        onScanResults={onScanResults}
        onScanError={onScanError}
        parseError={parseError}
        focusPositions={focusPositions}
        onFocusPositionsChange={onFocusPositionsChange}
        focusedElementId={focusedElementId}
        showFocusBadges={true}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
      />
    </section>
  );
}

export interface AnalysisPaneProps {
  selectionLost: boolean;
  analysisTab: string;
  onTabChange: (tab: string) => void;
  maximizedPane: "editor" | "preview" | "analysis" | null;
  onToggleMaximize: () => void;
  ast: A11yNode | null;
  selectedNode: A11yNode | null;
  activeNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateAttribute: (attr: string, value: string) => void;
  onRemoveAttribute: (attr: string) => void;
  computedFocusOrder: ComputedFocusOrder | null;
  onSimulateFocus: (id: string) => void;
  mergedViolations: AxeFinding[];
  axeIncomplete: readonly AxeFinding[];
  isScanning: boolean;
  scanError: string | null;
  hasHtml: boolean;
  onApplyFix: (
    finding: Finding | AxeFinding,
    options?: import("@/lib/auto-fix").ApplyAutoFixOptions
  ) => void;
  isOverSizeLimit: boolean;
  baseline: BaselineData | null;
  comparison: CompareResult | null;
  rawHtml: string;
  onSetBaseline: (data?: BaselineData) => void;
  onClearBaseline: (reason?: string) => void;
  templateOrSnippetId: string;
}

export function AnalysisPaneSection({
  selectionLost,
  analysisTab,
  onTabChange,
  maximizedPane,
  onToggleMaximize,
  ast,
  selectedNode,
  activeNodeId,
  onSelectNode,
  onUpdateAttribute,
  onRemoveAttribute,
  computedFocusOrder,
  onSimulateFocus,
  mergedViolations,
  axeIncomplete,
  isScanning,
  scanError,
  hasHtml,
  onApplyFix,
  isOverSizeLimit,
  baseline,
  comparison,
  rawHtml,
  onSetBaseline,
  onClearBaseline,
  templateOrSnippetId,
}: AnalysisPaneProps) {
  return (
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
        onTabChange={onTabChange}
        maximizedPane={maximizedPane}
        onToggleMaximize={onToggleMaximize}
        ast={ast}
        selectedNode={selectedNode}
        activeNodeId={activeNodeId}
        onSelectNode={onSelectNode}
        onUpdateAttribute={onUpdateAttribute}
        onRemoveAttribute={onRemoveAttribute}
        computedFocusOrder={computedFocusOrder}
        onSimulateFocus={onSimulateFocus}
        mergedViolations={mergedViolations}
        axeIncomplete={axeIncomplete}
        isScanning={isScanning}
        scanError={scanError}
        hasHtml={hasHtml}
        onApplyFix={onApplyFix}
        isOverSizeLimit={isOverSizeLimit}
        baseline={baseline}
        comparison={comparison}
        rawHtml={rawHtml}
        onSetBaseline={onSetBaseline}
        onClearBaseline={onClearBaseline}
        templateOrSnippetId={templateOrSnippetId}
      />
    </section>
  );
}

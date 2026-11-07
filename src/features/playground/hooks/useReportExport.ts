import * as React from "react";
import { useToast } from "@accessly-ui/react";
import { toJson, toCsv, toMarkdown, downloadBlob } from "@/lib/report";
import { loadManualTestResults } from "@/lib/manual-tests-storage";
import type { Finding } from "@/types/a11y";
import type { CompareResult } from "@/lib/compare";

export interface UseReportExportParams {
  /** Active document ID ("default", challenge ID, or share ID) */
  activeDocumentId: string;
  findings: Finding[];
  comparison?: CompareResult | null;
}

export interface UseReportExportResult {
  handleExportJson: () => void;
  handleExportCsv: () => void;
  handleExportMarkdown: () => void;
  handleCopyReport: () => void;
}

export function useReportExport({
  activeDocumentId,
  findings,
  comparison,
}: UseReportExportParams): UseReportExportResult {
  const toast = useToast();

  const handleExportJson = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeDocumentId);
    const jsonString = toJson(
      findings,
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
  }, [findings, comparison, activeDocumentId, toast]);

  const handleExportCsv = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeDocumentId);
    const csvString = toCsv(findings, comparison ?? undefined, manualTests);
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
  }, [findings, comparison, activeDocumentId, toast]);

  const handleExportMarkdown = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeDocumentId);
    const mdString = toMarkdown(
      findings,
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
  }, [findings, comparison, activeDocumentId, toast]);

  const handleCopyReport = React.useCallback(() => {
    const manualTests = loadManualTestResults(activeDocumentId);
    const mdString = toMarkdown(
      findings,
      comparison ?? undefined,
      undefined,
      manualTests
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mdString).then(() => {
        toast.push({
          title: "Report copied",
          description: "Markdown report copied to clipboard.",
          variant: "success",
        });
      });
    }
  }, [findings, comparison, activeDocumentId, toast]);

  return {
    handleExportJson,
    handleExportCsv,
    handleExportMarkdown,
    handleCopyReport,
  };
}

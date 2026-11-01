"use client";

import * as React from "react";
import {
  MANUAL_TESTS,
  type ManualTestStatus,
  type ManualTestRecord,
} from "@/data/manual-tests";
import {
  loadManualTestResults,
  saveManualTestResult,
  clearManualTestResults,
} from "@/lib/manual-tests-storage";

export function useManualTests(templateOrSnippetId: string) {
  const [prevId, setPrevId] = React.useState(templateOrSnippetId);
  const [records, setRecords] = React.useState<Record<string, ManualTestRecord>>(() => {
    return loadManualTestResults(templateOrSnippetId);
  });
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // When template or snippet ID changes, sync records during render
  if (prevId !== templateOrSnippetId) {
    setPrevId(templateOrSnippetId);
    setRecords(loadManualTestResults(templateOrSnippetId));
    setValidationErrors({});
  }

  const updateTestStatus = React.useCallback(
    (testId: string, status: ManualTestStatus, note?: string): boolean => {
      if (status === "failed" && (!note || note.trim().length === 0)) {
        setValidationErrors((prev) => ({
          ...prev,
          [testId]: "A note explaining the failure is required.",
        }));
        return false;
      }

      const record: ManualTestRecord = {
        testId,
        status,
        ...(note !== undefined ? { note: note.trim() } : {}),
        updatedAt: new Date().toISOString(),
      };

      const result = saveManualTestResult(templateOrSnippetId, record);
      if (result.success) {
        setRecords((prev) => ({
          ...prev,
          [testId]: record,
        }));
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[testId];
          return next;
        });
        return true;
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          [testId]: result.error ?? "Failed to save test result",
        }));
        return false;
      }
    },
    [templateOrSnippetId]
  );

  const clearAll = React.useCallback(() => {
    clearManualTestResults(templateOrSnippetId);
    setRecords({});
    setValidationErrors({});
  }, [templateOrSnippetId]);

  const stats = React.useMemo(() => {
    let passed = 0;
    let failed = 0;
    let notApplicable = 0;

    for (const r of Object.values(records)) {
      if (r.status === "passed") passed++;
      else if (r.status === "failed") failed++;
      else if (r.status === "not-applicable") notApplicable++;
    }

    const total = MANUAL_TESTS.length;
    const notTested = Math.max(0, total - (passed + failed + notApplicable));

    return { total, passed, failed, notApplicable, notTested };
  }, [records]);

  return {
    records,
    validationErrors,
    updateTestStatus,
    clearAll,
    stats,
  };
}

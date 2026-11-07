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

/**
 * Hook to manage manual test records for the current document.
 * @param documentId Active document ID ("default", challenge ID, or share ID)
 */
export function useManualTests(documentId: string) {
  const [prevId, setPrevId] = React.useState(documentId);
  const [records, setRecords] = React.useState<
    Record<string, ManualTestRecord>
  >(() => {
    return loadManualTestResults(documentId);
  });
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  // When document ID changes, sync records during render
  if (prevId !== documentId) {
    setPrevId(documentId);
    setRecords(loadManualTestResults(documentId));
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

      const result = saveManualTestResult(documentId, record);
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
    [documentId]
  );

  const clearAll = React.useCallback(() => {
    clearManualTestResults(documentId);
    setRecords({});
    setValidationErrors({});
  }, [documentId]);

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

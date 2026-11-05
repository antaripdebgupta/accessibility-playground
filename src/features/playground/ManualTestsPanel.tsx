"use client";

import * as React from "react";
import { MANUAL_TESTS } from "@/data/manual-tests";
import { useManualTests } from "@/hooks/useManualTests";
import { RotateCcw } from "lucide-react";
import {
  ManualTestFilters,
  type FilterCategory,
} from "./manual-tests/ManualTestFilters";
import { ManualTestList } from "./manual-tests/ManualTestList";

interface ManualTestsPanelProps {
  templateOrSnippetId: string;
}

export function ManualTestsPanel({
  templateOrSnippetId,
}: ManualTestsPanelProps) {
  const [selectedCategory, setSelectedCategory] =
    React.useState<FilterCategory>("all");
  const { records, validationErrors, updateTestStatus, clearAll, stats } =
    useManualTests(templateOrSnippetId);

  const filteredTests = React.useMemo(() => {
    if (selectedCategory === "all") return MANUAL_TESTS;
    return MANUAL_TESTS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4">
      {/* Overview and Stats */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Manual Testing Checklists
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Automated scans miss ~60% of WCAG criteria. Verify essential human
              interactions below.
            </p>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reset checklists</span>
          </button>
        </div>

        {/* Counter cards */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center">
            <span className="block text-base font-bold text-[var(--color-success-default)]">
              {stats.passed}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Passed
            </span>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center">
            <span className="block text-base font-bold text-[var(--color-danger-default)]">
              {stats.failed}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Failed
            </span>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center">
            <span className="block text-base font-bold text-[var(--color-text-secondary)]">
              {stats.notApplicable}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              N/A
            </span>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center">
            <span className="block text-base font-bold text-[var(--color-text-primary)]">
              {stats.notTested}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              To test
            </span>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <ManualTestFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Tests checklist */}
      <ManualTestList
        tests={filteredTests}
        records={records}
        validationErrors={validationErrors}
        onUpdateStatus={updateTestStatus}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  MANUAL_TESTS,
  type ManualTestCategory,
  type ManualTestStatus,
  type ManualTestItem,
} from "@/data/manual-tests";
import { useManualTests } from "@/hooks/useManualTests";
import { Badge } from "@/components/ui/Badge";
import {
  Keyboard,
  Volume2,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface ManualTestsPanelProps {
  templateOrSnippetId: string;
}

export function ManualTestsPanel({
  templateOrSnippetId,
}: ManualTestsPanelProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<
    "all" | ManualTestCategory
  >("all");
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
      <div
        role="tablist"
        aria-label="Filter manual test categories"
        className="flex flex-wrap gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
            selectedCategory === "all"
              ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <span>All Tests</span>
          <Badge variant="default" className="px-1 py-0 text-[9px]">
            {MANUAL_TESTS.length}
          </Badge>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "keyboard"}
          onClick={() => setSelectedCategory("keyboard")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
            selectedCategory === "keyboard"
              ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Keyboard className="h-3 w-3" aria-hidden="true" />
          <span>Keyboard</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "screen-reader"}
          onClick={() => setSelectedCategory("screen-reader")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
            selectedCategory === "screen-reader"
              ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Volume2 className="h-3 w-3" aria-hidden="true" />
          <span>Screen Reader</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "visual"}
          onClick={() => setSelectedCategory("visual")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
            selectedCategory === "visual"
              ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Eye className="h-3 w-3" aria-hidden="true" />
          <span>Visual</span>
        </button>
      </div>

      {/* Tests checklist */}
      <div className="space-y-3">
        {filteredTests.map((test) => (
          <ManualTestCard
            key={`${test.id}-${records[test.id]?.updatedAt ?? "init"}`}
            test={test}
            record={records[test.id]}
            validationError={validationErrors[test.id]}
            onStatusChange={(status, note) =>
              updateTestStatus(test.id, status, note)
            }
          />
        ))}
      </div>
    </div>
  );
}

function ManualTestCard({
  test,
  record,
  validationError,
  onStatusChange,
}: {
  test: ManualTestItem;
  record?: { status: ManualTestStatus; note?: string };
  validationError?: string;
  onStatusChange: (status: ManualTestStatus, note?: string) => void;
}) {
  const currentStatus = record?.status ?? "not-tested";
  const [note, setNote] = React.useState(record?.note ?? "");
  const [isFailedSelected, setIsFailedSelected] = React.useState(
    currentStatus === "failed"
  );

  const handleRadioChange = (newStatus: ManualTestStatus) => {
    if (newStatus === "failed") {
      setIsFailedSelected(true);
      if (note.trim().length > 0) {
        onStatusChange("failed", note);
      }
    } else {
      setIsFailedSelected(false);
      onStatusChange(newStatus, note);
    }
  };

  const handleNoteBlur = () => {
    if (isFailedSelected) {
      onStatusChange("failed", note);
    }
  };

  return (
    <article
      className={`space-y-3 rounded-lg border p-3.5 transition-colors ${
        currentStatus === "passed"
          ? "border-[var(--color-success-border,var(--color-border))] bg-[var(--color-surface)]"
          : currentStatus === "failed"
            ? "border-[var(--color-danger-border,var(--color-border))] bg-[var(--color-danger-subtle)]/20"
            : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      {/* Title & WCAG Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
            {test.title}
          </h4>
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)] uppercase">
            {test.category}
          </span>
        </div>

        <a
          href={test.linkedSc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-focus-ring)] hover:underline"
        >
          <span>
            SC {test.linkedSc.id} {test.linkedSc.name} ({test.linkedSc.level})
          </span>
          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
        </a>
      </div>

      {/* Steps and expected result */}
      <div className="space-y-2 rounded bg-[var(--color-surface-sunken)] p-2.5 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase">
            Testing Steps:
          </span>
          <ol className="mt-1 list-inside list-decimal space-y-0.5 text-[11px] text-[var(--color-text-primary)]">
            {test.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase">
            Expected Result:
          </span>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-primary)]">
            {test.expectedResult}
          </p>
        </div>
      </div>

      {/* Why automation can't tell you */}
      <div className="flex items-start gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 p-2 text-[11px] text-[var(--color-text-secondary)]">
        <HelpCircle
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]"
          aria-hidden="true"
        />
        <span>
          <strong className="text-[var(--color-text-primary)]">
            Why manual:
          </strong>{" "}
          {test.whatAutomationCantTellYou}
        </span>
      </div>

      {/* Radio group status selector */}
      <fieldset
        className="flex flex-col gap-1.5 pt-1"
        role="radiogroup"
        aria-labelledby={`legend-${test.id}`}
      >
        <legend id={`legend-${test.id}`} className="sr-only">
          Status for {test.title}
        </legend>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <input
              type="radio"
              name={`status-${test.id}`}
              value="not-tested"
              checked={currentStatus === "not-tested" && !isFailedSelected}
              onChange={() => handleRadioChange("not-tested")}
              className="accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span>Not tested</span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-success-default)]">
            <input
              type="radio"
              name={`status-${test.id}`}
              value="passed"
              checked={currentStatus === "passed"}
              onChange={() => handleRadioChange("passed")}
              className="accent-[var(--color-success-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span className="flex items-center gap-0.5 font-medium">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Passed
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-danger-default)]">
            <input
              type="radio"
              name={`status-${test.id}`}
              value="failed"
              checked={isFailedSelected}
              onChange={() => handleRadioChange("failed")}
              className="accent-[var(--color-danger-default)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span className="flex items-center gap-0.5 font-medium">
              <XCircle className="h-3 w-3" aria-hidden="true" />
              Failed
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <input
              type="radio"
              name={`status-${test.id}`}
              value="not-applicable"
              checked={currentStatus === "not-applicable"}
              onChange={() => handleRadioChange("not-applicable")}
              className="accent-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <span className="flex items-center gap-0.5">
              <MinusCircle className="h-3 w-3" aria-hidden="true" />
              N/A
            </span>
          </label>
        </div>

        {/* Required note when failed is active */}
        {isFailedSelected && (
          <div className="mt-2 space-y-1">
            <label
              htmlFor={`note-${test.id}`}
              className="block text-[11px] font-semibold text-[var(--color-danger-default)]"
            >
              Failure notes (required):
            </label>
            <textarea
              id={`note-${test.id}`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Describe why this test failed (e.g. Escape does not close the dialog)..."
              aria-required="true"
              aria-invalid={validationError !== undefined}
              className={`w-full rounded border bg-[var(--color-surface)] p-2 text-xs text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                validationError
                  ? "border-[var(--color-danger-default)] ring-1 ring-[var(--color-danger-default)]"
                  : "border-[var(--color-border)]"
              }`}
            />
            {validationError && (
              <p
                role="alert"
                className="flex items-center gap-1 text-[11px] text-[var(--color-danger-default)]"
              >
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onStatusChange("failed", note)}
                className="rounded bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                Save failure note
              </button>
            </div>
          </div>
        )}
      </fieldset>
    </article>
  );
}

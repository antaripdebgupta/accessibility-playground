"use client";

import * as React from "react";
import type {
  ManualTestItem as ManualTestItemType,
  ManualTestRecord,
  ManualTestStatus,
} from "@/data/manual-tests";
import {
  MinusCircle,
  HelpCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export interface ManualTestItemProps {
  test: ManualTestItemType;
  record?: ManualTestRecord;
  validationError?: string;
  onStatusChange: (status: ManualTestStatus, note?: string) => void;
}

export function ManualTestItem({
  test,
  record,
  validationError,
  onStatusChange,
}: ManualTestItemProps) {
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

"use client";

import * as React from "react";
import {
  evaluateContrast,
  formatContrastRatio,
  isValidHex,
  normalizeHex,
  suggestPassingColor,
} from "@/lib/contrast";
import { CheckCircle2, XCircle, ArrowRightLeft } from "lucide-react";

export function ContrastChecker() {
  const [fgHex, setFgHex] = React.useState("#1e293b");
  const [bgHex, setBgHex] = React.useState("#ffffff");

  const isFgValid = isValidHex(fgHex);
  const isBgValid = isValidHex(bgHex);

  const normalizedFg = isFgValid ? normalizeHex(fgHex) : null;
  const normalizedBg = isBgValid ? normalizeHex(bgHex) : null;

  const evaluation = React.useMemo(() => {
    if (!normalizedFg || !normalizedBg) return null;
    return evaluateContrast(normalizedFg, normalizedBg);
  }, [normalizedFg, normalizedBg]);

  const suggestedFg = React.useMemo(() => {
    if (!normalizedFg || !normalizedBg || !evaluation) return null;
    if (evaluation.normalTextAA) return null; // Already passes
    return suggestPassingColor(normalizedFg, normalizedBg, 4.5);
  }, [normalizedFg, normalizedBg, evaluation]);

  const handleSwap = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  const handleApplySuggestion = () => {
    if (suggestedFg) {
      setFgHex(suggestedFg);
    }
  };

  const rows = [
    {
      id: "normal-aa",
      label: "Normal text — AA (4.5:1)",
      requirement: "4.5:1",
      passed: evaluation?.normalTextAA ?? false,
    },
    {
      id: "normal-aaa",
      label: "Normal text — AAA (7:1)",
      requirement: "7:1",
      passed: evaluation?.normalTextAAA ?? false,
    },
    {
      id: "large-aa",
      label: "Large text — AA (3:1)",
      requirement: "3:1",
      passed: evaluation?.largeTextAA ?? false,
    },
    {
      id: "large-aaa",
      label: "Large text — AAA (4.5:1)",
      requirement: "4.5:1",
      passed: evaluation?.largeTextAAA ?? false,
    },
    {
      id: "ui-aa",
      label: "UI components / graphics — AA (3:1)",
      requirement: "3:1",
      passed: evaluation?.nonTextAA ?? false,
    },
  ];

  // Live summary for screen readers
  const liveSummary = React.useMemo(() => {
    if (!evaluation) {
      return "Please enter valid text and background hex colors to calculate contrast.";
    }
    const ratioStr = formatContrastRatio(evaluation.ratio);
    const passes = [];
    if (evaluation.normalTextAA) passes.push("AA for normal text");
    if (evaluation.normalTextAAA) passes.push("AAA for normal text");
    if (evaluation.largeTextAA) passes.push("AA for large text");
    if (evaluation.largeTextAAA) passes.push("AAA for large text");
    if (evaluation.nonTextAA) passes.push("AA for UI components");

    const passText =
      passes.length > 0
        ? `Passes ${passes.join(", ")}.`
        : "Fails all WCAG contrast thresholds.";
    return `Contrast ratio ${ratioStr} to 1. ${passText}`;
  }, [evaluation]);

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[5fr_6fr]">
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveSummary}
      </div>

      {/* Left card: Colors */}
      <section
        aria-labelledby="colors-card-heading"
        className="flex flex-col gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2
            id="colors-card-heading"
            className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
          >
            Colors
          </h2>
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap text and background colors"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Text color input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="fg-color-input"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Text color
          </label>
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              style={{
                backgroundColor: isFgValid ? normalizedFg! : "transparent",
              }}
              className="h-10 w-10 shrink-0 rounded-md border border-[var(--color-border)]"
            />
            <input
              id="fg-color-input"
              type="text"
              value={fgHex}
              onChange={(e) => setFgHex(e.target.value)}
              aria-invalid={!isFgValid}
              aria-describedby={!isFgValid ? "fg-color-error" : undefined}
              spellCheck={false}
              autoComplete="off"
              className="h-10 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus-visible:border-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <input
              type="color"
              aria-label="Text color picker"
              value={normalizedFg ?? "#000000"}
              onChange={(e) => setFgHex(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-[var(--color-border)] bg-transparent p-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
          </div>
          {!isFgValid && (
            <p
              id="fg-color-error"
              role="alert"
              className="text-xs font-medium text-[var(--color-danger-default)]"
            >
              Enter a valid 3- or 6-digit hex color (e.g. #1e293b).
            </p>
          )}
        </div>

        {/* Background color input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bg-color-input"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Background color
          </label>
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              style={{
                backgroundColor: isBgValid ? normalizedBg! : "transparent",
              }}
              className="h-10 w-10 shrink-0 rounded-md border border-[var(--color-border)]"
            />
            <input
              id="bg-color-input"
              type="text"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              aria-invalid={!isBgValid}
              aria-describedby={!isBgValid ? "bg-color-error" : undefined}
              spellCheck={false}
              autoComplete="off"
              className="h-10 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus-visible:border-[var(--color-focus-ring)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
            <input
              type="color"
              aria-label="Background color picker"
              value={normalizedBg ?? "#ffffff"}
              onChange={(e) => setBgHex(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-[var(--color-border)] bg-transparent p-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            />
          </div>
          {!isBgValid && (
            <p
              id="bg-color-error"
              role="alert"
              className="text-xs font-medium text-[var(--color-danger-default)]"
            >
              Enter a valid 3- or 6-digit hex color (e.g. #ffffff).
            </p>
          )}
        </div>

        {/* Preview box */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Preview
          </span>
          <div
            style={{
              color: isFgValid ? normalizedFg! : "inherit",
              backgroundColor: isBgValid ? normalizedBg! : "transparent",
            }}
            className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-4 transition-colors"
          >
            <p className="text-base leading-normal font-normal">
              Normal text preview — The quick brown fox jumps.
            </p>
            <p className="text-2xl leading-tight font-bold">
              Large text preview
            </p>
          </div>
        </div>
      </section>

      {/* Right card: Results */}
      <section
        aria-labelledby="results-card-heading"
        className="flex flex-col gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2
            id="results-card-heading"
            className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
          >
            Results
          </h2>
        </div>

        {/* Contrast Ratio Line */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Contrast ratio:
          </span>
          <span className="font-mono text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {evaluation ? `${formatContrastRatio(evaluation.ratio)}:1` : "—"}
          </span>
        </div>

        {/* 5 Rows separated by 1px dividers */}
        <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {row.label}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                {row.passed ? (
                  <>
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[var(--color-success-default)]"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-[var(--color-success-default)]">
                      ✓ Pass — {row.requirement} required
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle
                      className="h-4 w-4 shrink-0 text-[var(--color-danger-default)]"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-[var(--color-danger-default)]">
                      ✕ Fail — {row.requirement} required
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Nearest passing color suggestion (only when normal-text AA fails) */}
        {evaluation && !evaluation.normalTextAA && suggestedFg && (
          <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Nearest passing color:
              </span>
              <div
                aria-hidden="true"
                style={{ backgroundColor: suggestedFg }}
                className="h-6 w-6 rounded border border-[var(--color-border)]"
              />
              <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">
                {suggestedFg}
              </span>
            </div>
            <button
              type="button"
              onClick={handleApplySuggestion}
              className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--color-accent)] px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              Apply
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

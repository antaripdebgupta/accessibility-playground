"use client";

import * as React from "react";
import {
  evaluateContrast,
  formatContrastRatio,
  isValidHex,
  normalizeHex,
  suggestPassingColor,
} from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { Pipette } from "lucide-react";

export function ContrastChecker() {
  const [fgHex, setFgHex] = React.useState("#1e293b");
  const [bgHex, setBgHex] = React.useState("#ffffff");

  const isFgValid = isValidHex(fgHex);
  const isBgValid = isValidHex(bgHex);

  const supportsEyeDropper = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && "EyeDropper" in window,
    () => false
  );

  const handleEyeDropper = async (target: "fg" | "bg") => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const EyeDropperClass = (window as any).EyeDropper;
      if (!EyeDropperClass) return;
      const eyeDropper = new EyeDropperClass();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        if (target === "fg") {
          setFgHex(result.sRGBHex);
        } else {
          setBgHex(result.sRGBHex);
        }
      }
    } catch {
      // User pressed Escape or eye dropper was dismissed
    }
  };

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

  const handleReset = () => {
    setFgHex("#1e293b");
    setBgHex("#ffffff");
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
    if (evaluation.normalTextAA) passes.push("Normal text (4.5:1)");
    if (evaluation.normalTextAAA) passes.push("Normal text (7:1)");
    if (evaluation.largeTextAA) passes.push("Large text (3:1)");
    if (evaluation.largeTextAAA) passes.push("Large text (4.5:1)");
    if (evaluation.nonTextAA) passes.push("UI components / graphics (3:1)");

    const passText =
      passes.length > 0
        ? `Passes ${passes.join(", ")}.`
        : "Fails all WCAG contrast thresholds.";
    return `Contrast ratio ${ratioStr} to 1. ${passText}`;
  }, [evaluation]);

  return (
    <>
      {/* Live region for screen readers */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="liveSummary"
      >
        {liveSummary}
      </div>

      <div className="checker-grid">
        {/* Colors panel */}
        <div className="panel" aria-labelledby="colors-heading">
          <div className="panel-head">
            <h2 id="colors-heading">Colors</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer text-xs font-medium text-[var(--ink-soft)] underline underline-offset-4 transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
              >
                Reset
              </button>
              <button
                type="button"
                className="swap-btn"
                id="swapBtn"
                onClick={handleSwap}
                aria-label="Swap text and background colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 7h11M18 7l-3.5-3.5M18 7l-3.5 3.5M17 17H6M6 17l3.5 3.5M6 17l3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="fg-hex">Text color</label>
            <div className="field-row">
              <div
                className="swatch"
                id="fgSwatch"
                aria-hidden="true"
                style={{
                  backgroundColor: isFgValid ? normalizedFg! : "transparent",
                }}
              />
              <input
                id="fg-hex"
                className={cn("hex-input", !isFgValid && "is-invalid")}
                type="text"
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                aria-invalid={!isFgValid}
                aria-describedby={!isFgValid ? "fg-error" : undefined}
                spellCheck={false}
                autoComplete="off"
              />
              <input
                id="fg-picker"
                className="color-picker"
                type="color"
                value={normalizedFg ?? "#000000"}
                onChange={(e) => setFgHex(e.target.value)}
                aria-label="Text color picker"
              />
              {supportsEyeDropper && (
                <button
                  type="button"
                  onClick={() => handleEyeDropper("fg")}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                  title="Sample text color from screen"
                  aria-label="Sample text color from screen"
                >
                  <Pipette className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {!isFgValid && (
              <span className="field-error" id="fg-error" role="alert">
                Enter a valid 3- or 6-digit hex color.
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="bg-hex">Background color</label>
            <div className="field-row">
              <div
                className="swatch"
                id="bgSwatch"
                aria-hidden="true"
                style={{
                  backgroundColor: isBgValid ? normalizedBg! : "transparent",
                }}
              />
              <input
                id="bg-hex"
                className={cn("hex-input", !isBgValid && "is-invalid")}
                type="text"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                aria-invalid={!isBgValid}
                aria-describedby={!isBgValid ? "bg-error" : undefined}
                spellCheck={false}
                autoComplete="off"
              />
              <input
                id="bg-picker"
                className="color-picker"
                type="color"
                value={normalizedBg ?? "#ffffff"}
                onChange={(e) => setBgHex(e.target.value)}
                aria-label="Background color picker"
              />
              {supportsEyeDropper && (
                <button
                  type="button"
                  onClick={() => handleEyeDropper("bg")}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                  title="Sample background color from screen"
                  aria-label="Sample background color from screen"
                >
                  <Pipette className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {!isBgValid && (
              <span className="field-error" id="bg-error" role="alert">
                Enter a valid 3- or 6-digit hex color.
              </span>
            )}
          </div>

          <p className="preview-label">Preview</p>
          <div
            className="preview-box"
            id="previewBox"
            style={{
              color: isFgValid ? normalizedFg! : "inherit",
              backgroundColor: isBgValid ? normalizedBg! : "transparent",
            }}
          >
            <p className="normal">
              Normal text preview — The quick brown fox jumps.
            </p>
            <p className="large">Large text preview</p>
          </div>
        </div>

        {/* Results panel */}
        <div className="panel" aria-labelledby="results-heading">
          <div className="panel-head">
            <h2 id="results-heading">Results</h2>
          </div>

          <div className="ratio-line">
            <span className="ratio-label">Contrast ratio:</span>
            <span className="ratio-value" id="ratioValue">
              {evaluation ? `${formatContrastRatio(evaluation.ratio)}:1` : "—"}
            </span>
          </div>

          <div className="result-list" id="resultList">
            {rows.map((row) => (
              <div
                key={row.id}
                className="result-row"
                data-pass={evaluation ? String(row.passed) : "unknown"}
              >
                <span className="criterion">{row.label}</span>
                <span
                  className="verdict"
                  style={
                    !evaluation ? { color: "var(--ink-faint)" } : undefined
                  }
                >
                  {!evaluation ? (
                    "—"
                  ) : row.passed ? (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M8 12.5l2.5 2.5L16 9.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Pass — {row.requirement} required
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M9 9l6 6M15 9l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      Fail — {row.requirement} required
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>

          {evaluation && !evaluation.normalTextAA && suggestedFg && (
            <div className="suggestion" id="suggestion">
              <div className="suggestion-info">
                <span className="label">Nearest passing color:</span>
                <span
                  className="suggestion-swatch"
                  id="suggestionSwatch"
                  aria-hidden="true"
                  style={{ backgroundColor: suggestedFg }}
                />
                <span className="hex" id="suggestionHex">
                  {suggestedFg}
                </span>
              </div>
              <button
                type="button"
                className="apply-btn"
                id="applyBtn"
                onClick={handleApplySuggestion}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

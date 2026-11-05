"use client";

import * as React from "react";
import { Lightbulb } from "lucide-react";

export interface ChallengeHintsProps {
  hints: readonly string[];
  hintsRevealed: number;
  onRevealNextHint: () => void;
}

export function ChallengeHints({
  hints,
  hintsRevealed,
  onRevealNextHint,
}: ChallengeHintsProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <h3
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--color-text-secondary)",
          margin: "0 0 8px",
        }}
      >
        Hints ({hintsRevealed}/{hints.length})
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {hints.slice(0, hintsRevealed).map((hint, i) => (
          <div
            key={i}
            style={{
              padding: "8px 10px",
              background: "var(--color-surface-sunken, #f5f5f4)",
              borderRadius: "6px",
              fontSize: "0.8125rem",
              color: "var(--color-text-primary)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "var(--color-accent, var(--focus))",
                marginRight: "4px",
              }}
            >
              Hint {i + 1}:
            </span>
            {hint}
          </div>
        ))}
      </div>

      {hintsRevealed < hints.length && (
        <button
          type="button"
          onClick={onRevealNextHint}
          className="challenge-strip-btn"
          style={{
            marginTop: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
          Show next hint
        </button>
      )}
    </div>
  );
}

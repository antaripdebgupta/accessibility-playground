"use client";

import * as React from "react";
import { Eye } from "lucide-react";

export interface ChallengeSolutionDialogProps {
  solutionViewed: boolean;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  onShowSolution: () => void;
}

export function ChallengeSolutionDialog({
  solutionViewed,
  showConfirm,
  setShowConfirm,
  onShowSolution,
}: ChallengeSolutionDialogProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {solutionViewed ? (
        <p
          style={{
            margin: 0,
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            fontStyle: "italic",
          }}
        >
          Solution was viewed. You can reset the challenge to try again.
        </p>
      ) : showConfirm ? (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--amber-bg, #fff7e8)",
            borderRadius: "6px",
            border: "1px solid var(--amber-line, #f0d9a8)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "0.8125rem",
              color: "var(--amber, #92400e)",
              fontWeight: 600,
            }}
          >
            Are you sure? Try using hints first.
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={onShowSolution}
              className="challenge-strip-btn challenge-strip-btn--danger"
            >
              Show solution
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="challenge-strip-btn"
            >
              Keep trying
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="challenge-strip-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Show solution
        </button>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, Trophy, AlertCircle } from "lucide-react";

export interface CheckResultData {
  resolved: readonly string[];
  remaining: readonly string[];
}

export interface ChallengeCheckResultsProps {
  checkResult: CheckResultData | null;
  onCheckFix: () => void;
}

export function ChallengeCheckResults({
  checkResult,
  onCheckFix,
}: ChallengeCheckResultsProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={onCheckFix}
        className="challenge-strip-btn challenge-strip-btn--primary"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        Check my fix
      </button>

      {checkResult && (
        <div role="status" aria-live="polite" style={{ marginTop: "10px" }}>
          {checkResult.remaining.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 12px",
                background: "var(--green-bg, #ecfdf5)",
                borderRadius: "6px",
                color: "var(--green, #065f46)",
                fontWeight: 600,
              }}
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              All expected issues resolved!
            </div>
          ) : (
            <div
              style={{
                padding: "10px 12px",
                background: "var(--amber-bg, #fff7e8)",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--amber, #92400e)",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {checkResult.remaining.length} issue
                {checkResult.remaining.length === 1 ? "" : "s"} still present
              </div>
              {checkResult.resolved.length > 0 && (
                <ul
                  style={{
                    margin: "0 0 4px",
                    padding: "0 0 0 16px",
                    fontSize: "0.75rem",
                  }}
                >
                  {checkResult.resolved.map((r) => (
                    <li key={r} style={{ color: "var(--green, #065f46)" }}>
                      ✓ <code>{r}</code> — resolved
                    </li>
                  ))}
                </ul>
              )}
              <ul
                style={{
                  margin: 0,
                  padding: "0 0 0 16px",
                  fontSize: "0.75rem",
                }}
              >
                {checkResult.remaining.map((r) => (
                  <li key={r} style={{ color: "var(--red, #b91c1c)" }}>
                    ✕ <code>{r}</code> — still present
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import type { Challenge } from "@/data/challenges";
import type { ChallengeMode } from "@/hooks/useChallengeMode";
import {
  Check,
  Lightbulb,
  Eye,
  RotateCcw,
  Trophy,
  AlertCircle,
  CircleDot,
} from "lucide-react";

interface ChallengeStripProps {
  readonly challengeMode: ChallengeMode;
  readonly currentViolationRuleIds: readonly string[];
  readonly onLoadSolution: (challenge: Challenge) => void;
  readonly onResetStarter: (challenge: Challenge) => void;
}

/**
 * Side strip shown when the playground is in challenge mode.
 * Shows objectives, progressive hints, "Check my fix" button,
 * and "Show solution" with confirmation.
 */
export function ChallengeStrip({
  challengeMode,
  currentViolationRuleIds,
  onLoadSolution,
  onResetStarter,
}: ChallengeStripProps) {
  const { challenge, progress, revealNextHint, recordCheckResult, viewSolution, resetChallenge } =
    challengeMode;

  const [showSolutionConfirm, setShowSolutionConfirm] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<{
    resolved: readonly string[];
    remaining: readonly string[];
  } | null>(null);

  if (!challenge) return null;

  const handleCheckFix = () => {
    const mustBeAbsent = challenge.verify.ruleIdsMustBeAbsent;
    const remaining = mustBeAbsent.filter((ruleId) =>
      currentViolationRuleIds.includes(ruleId)
    );
    const resolved = mustBeAbsent.filter(
      (ruleId) => !currentViolationRuleIds.includes(ruleId)
    );
    setCheckResult({ resolved, remaining });
    recordCheckResult(remaining.length);
  };

  const handleShowSolution = () => {
    viewSolution();
    onLoadSolution(challenge);
    setShowSolutionConfirm(false);
    setCheckResult(null);
  };

  const handleReset = () => {
    resetChallenge();
    onResetStarter(challenge);
    setCheckResult(null);
    setShowSolutionConfirm(false);
  };

  const difficultyColors: Record<Challenge["difficulty"], string> = {
    beginner: "var(--green)",
    intermediate: "var(--amber)",
    advanced: "var(--red)",
  };

  const difficultyBgColors: Record<Challenge["difficulty"], string> = {
    beginner: "var(--green-bg)",
    intermediate: "var(--amber-bg)",
    advanced: "var(--red-bg)",
  };

  return (
    <aside
      className="challenge-strip"
      aria-label="Challenge instructions"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        borderLeft: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        width: "320px",
        minWidth: "280px",
        maxWidth: "360px",
        overflow: "auto",
        fontSize: "0.8125rem",
        lineHeight: "1.5",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-raised, var(--color-surface))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: difficultyColors[challenge.difficulty],
              background: difficultyBgColors[challenge.difficulty],
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {challenge.difficulty}
          </span>
          {progress.completed && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--green)",
              }}
            >
              <Trophy className="h-3 w-3" aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--color-text-primary)",
          }}
        >
          {challenge.title}
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
          }}
        >
          {challenge.summary}
        </p>
      </div>

      {/* Objectives */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
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
          Objectives
        </h3>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {challenge.objectives.map((obj, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <CircleDot
                className="h-3.5 w-3.5 shrink-0"
                style={{ marginTop: "2px", color: "var(--color-accent, var(--focus))" }}
                aria-hidden="true"
              />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hints (progressive disclosure) */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
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
          Hints ({progress.hintsRevealed}/{challenge.hints.length})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {challenge.hints.slice(0, progress.hintsRevealed).map((hint, i) => (
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

        {progress.hintsRevealed < challenge.hints.length && (
          <button
            type="button"
            onClick={revealNextHint}
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

      {/* Check my fix */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <button
          type="button"
          onClick={handleCheckFix}
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
          <div
            role="status"
            aria-live="polite"
            style={{ marginTop: "10px" }}
          >
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

      {/* Show solution */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        {progress.solutionViewed ? (
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
        ) : showSolutionConfirm ? (
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
                onClick={handleShowSolution}
                className="challenge-strip-btn challenge-strip-btn--danger"
              >
                Show solution
              </button>
              <button
                type="button"
                onClick={() => setShowSolutionConfirm(false)}
                className="challenge-strip-btn"
              >
                Keep trying
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSolutionConfirm(true)}
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

      {/* Manual verification steps */}
      {challenge.manualSteps.length > 0 && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
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
            Manual Verification
          </h3>
          <ol
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              color: "var(--color-text-primary)",
            }}
          >
            {challenge.manualSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Reset */}
      <div style={{ padding: "12px 16px" }}>
        <button
          type="button"
          onClick={handleReset}
          className="challenge-strip-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--color-text-secondary)",
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset challenge
        </button>
      </div>
    </aside>
  );
}

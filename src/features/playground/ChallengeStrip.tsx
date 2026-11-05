"use client";

import * as React from "react";
import type { Challenge } from "@/data/challenges";
import type { ChallengeMode } from "@/hooks/useChallengeMode";
import { RotateCcw, CircleDot } from "lucide-react";
import { ChallengeHints } from "./challenge/ChallengeHints";
import {
  ChallengeCheckResults,
  type CheckResultData,
} from "./challenge/ChallengeCheckResults";
import { ChallengeSolutionDialog } from "./challenge/ChallengeSolutionDialog";

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
  const {
    challenge,
    progress,
    revealNextHint,
    recordCheckResult,
    viewSolution,
    resetChallenge,
  } = challengeMode;

  const [showSolutionConfirm, setShowSolutionConfirm] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<CheckResultData | null>(
    null
  );

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "2px 6px",
              borderRadius: "4px",
              color: difficultyColors[challenge.difficulty],
              background: difficultyBgColors[challenge.difficulty],
            }}
          >
            {challenge.difficulty}
          </span>
        </div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            margin: "0 0 6px",
            color: "var(--color-text-primary)",
          }}
        >
          {challenge.title}
        </h2>
        <p
          style={{
            margin: 0,
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
          }}
        >
          {challenge.summary}
        </p>
      </div>

      {/* Objectives */}
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
                style={{
                  marginTop: "2px",
                  color: "var(--color-accent, var(--focus))",
                }}
                aria-hidden="true"
              />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hints (progressive disclosure) */}
      <ChallengeHints
        hints={challenge.hints}
        hintsRevealed={progress.hintsRevealed}
        onRevealNextHint={revealNextHint}
      />

      {/* Check my fix */}
      <ChallengeCheckResults
        checkResult={checkResult}
        onCheckFix={handleCheckFix}
      />

      {/* Show solution */}
      <ChallengeSolutionDialog
        solutionViewed={progress.solutionViewed}
        showConfirm={showSolutionConfirm}
        setShowConfirm={setShowSolutionConfirm}
        onShowSolution={handleShowSolution}
      />

      {/* Manual verification steps */}
      {challenge.manualSteps.length > 0 && (
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

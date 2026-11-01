"use client";

import * as React from "react";
import type { Challenge } from "@/data/challenges";
import {
  type ChallengeProgress,
  defaultProgress,
  loadChallengeProgress,
  saveChallengeProgress,
} from "@/lib/challenge-progress";

export interface ChallengeMode {
  /** The active challenge, or null if not in challenge mode */
  readonly challenge: Challenge | null;
  /** Current progress state */
  readonly progress: ChallengeProgress;
  /** Reveal the next hint (increments hintsRevealed) */
  readonly revealNextHint: () => void;
  /** Record the result of a "Check my fix" run */
  readonly recordCheckResult: (remainingCount: number) => void;
  /** Mark the solution as viewed (user confirmed) */
  readonly viewSolution: () => void;
  /** Reset progress for this challenge */
  readonly resetChallenge: () => void;
}

export function useChallengeMode(challenge: Challenge | null): ChallengeMode {
  const [progress, setProgress] = React.useState<ChallengeProgress>(() => {
    if (!challenge) return defaultProgress();
    return loadChallengeProgress(challenge.id) ?? defaultProgress();
  });

  // Re-initialise when challenge changes
  const prevId = React.useRef(challenge?.id);
  if (challenge?.id !== prevId.current) {
    prevId.current = challenge?.id;
    const loaded = challenge
      ? (loadChallengeProgress(challenge.id) ?? defaultProgress())
      : defaultProgress();
    setProgress(loaded);
  }

  const persist = React.useCallback(
    (next: ChallengeProgress) => {
      setProgress(next);
      if (challenge) {
        saveChallengeProgress(challenge.id, next);
      }
    },
    [challenge]
  );

  const revealNextHint = React.useCallback(() => {
    if (!challenge) return;
    setProgress((prev) => {
      const next: ChallengeProgress = {
        ...prev,
        hintsRevealed: Math.min(prev.hintsRevealed + 1, challenge.hints.length),
        lastActivityMs: Date.now(),
      };
      saveChallengeProgress(challenge.id, next);
      return next;
    });
  }, [challenge]);

  const recordCheckResult = React.useCallback(
    (remainingCount: number) => {
      if (!challenge) return;
      setProgress((prev) => {
        const completed = remainingCount === 0;
        const best =
          prev.bestRemainingCount === null
            ? remainingCount
            : Math.min(prev.bestRemainingCount, remainingCount);
        const next: ChallengeProgress = {
          ...prev,
          bestRemainingCount: best,
          completed: prev.completed || completed,
          lastActivityMs: Date.now(),
        };
        saveChallengeProgress(challenge.id, next);
        return next;
      });
    },
    [challenge]
  );

  const viewSolution = React.useCallback(() => {
    if (!challenge) return;
    setProgress((prev) => {
      const next: ChallengeProgress = {
        ...prev,
        solutionViewed: true,
        lastActivityMs: Date.now(),
      };
      saveChallengeProgress(challenge.id, next);
      return next;
    });
  }, [challenge]);

  const resetChallenge = React.useCallback(() => {
    const fresh = defaultProgress();
    persist(fresh);
  }, [persist]);

  return {
    challenge,
    progress,
    revealNextHint,
    recordCheckResult,
    viewSolution,
    resetChallenge,
  };
}

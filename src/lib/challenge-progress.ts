/**
 * Local storage persistence for challenge progress.
 *
 * Progress is stored per-challenge in localStorage. No accounts, no fake stats.
 * The storage key is versioned to allow schema migration.
 */

import { z } from "zod";

const STORAGE_KEY_PREFIX = "ap_challenge_v1_";

const ChallengeProgressSchema = z.object({
  /** Whether the user has viewed the solution */
  solutionViewed: z.boolean(),
  /** Number of hints revealed (0 = none) */
  hintsRevealed: z.number().int().min(0),
  /** The user's best "check" result: number of expected rules still present */
  bestRemainingCount: z.number().int().min(0).nullable(),
  /** Whether all expected rules were absent on the last check */
  completed: z.boolean(),
  /** Timestamp of last activity */
  lastActivityMs: z.number(),
});

export type ChallengeProgress = z.infer<typeof ChallengeProgressSchema>;

function storageKey(challengeId: string): string {
  return `${STORAGE_KEY_PREFIX}${challengeId}`;
}

export function loadChallengeProgress(
  challengeId: string
): ChallengeProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(challengeId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return ChallengeProgressSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function saveChallengeProgress(
  challengeId: string,
  progress: ChallengeProgress
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(challengeId), JSON.stringify(progress));
  } catch {
    // Storage full — silently ignore
  }
}

export function defaultProgress(): ChallengeProgress {
  return {
    solutionViewed: false,
    hintsRevealed: 0,
    bestRemainingCount: null,
    completed: false,
    lastActivityMs: Date.now(),
  };
}

export function loadAllChallengeProgress(
  challengeIds: readonly string[]
): Map<string, ChallengeProgress> {
  const map = new Map<string, ChallengeProgress>();
  for (const id of challengeIds) {
    const p = loadChallengeProgress(id);
    if (p) map.set(id, p);
  }
  return map;
}

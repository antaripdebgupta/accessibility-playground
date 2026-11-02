/**
 * Local storage persistence for challenge progress.
 *
 * Progress is stored per-challenge in localStorage. No accounts, no fake stats.
 * The storage key is versioned to allow schema migration.
 */

import { z } from "zod";
import { storage } from "./storage";

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
  return storage.getJSON(storageKey(challengeId), ChallengeProgressSchema);
}

export function saveChallengeProgress(
  challengeId: string,
  progress: ChallengeProgress
): void {
  storage.setJSON(storageKey(challengeId), progress);
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

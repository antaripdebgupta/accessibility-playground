/**
 * Simple line-based diff utility for comparing baseline and current HTML.
 * Generates unified diff chunks without external dependencies.
 */

export interface DiffLine {
  readonly type: "added" | "removed" | "unchanged";
  readonly text: string;
  readonly oldLineNumber?: number;
  readonly newLineNumber?: number;
}

/**
 * Computes line-by-line differences between baseline and current text.
 * Uses a classic Longest Common Subsequence (LCS) dynamic programming algorithm.
 */
export function computeLineDiff(
  baselineText: string,
  currentText: string
): readonly DiffLine[] {
  if (baselineText === currentText) {
    return baselineText.split("\n").map((text, idx) => ({
      type: "unchanged" as const,
      text,
      oldLineNumber: idx + 1,
      newLineNumber: idx + 1,
    }));
  }

  const oldLines = baselineText.split("\n");
  const newLines = currentText.split("\n");

  const m = oldLines.length;
  const n = newLines.length;

  // For very large texts (> 1000 lines), avoid O(m*n) table allocation
  if (m * n > 1_000_000) {
    // Return simple chunked diff
    return [
      ...oldLines.map((text, idx) => ({
        type: "removed" as const,
        text,
        oldLineNumber: idx + 1,
      })),
      ...newLines.map((text, idx) => ({
        type: "added" as const,
        text,
        newLineNumber: idx + 1,
      })),
    ];
  }

  // DP table for LCS length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 0; i < m; i++) {
    const row = dp[i];
    const nextRow = dp[i + 1];
    if (!row || !nextRow) continue;
    for (let j = 0; j < n; j++) {
      if (oldLines[i] === newLines[j]) {
        nextRow[j + 1] = (row[j] ?? 0) + 1;
      } else {
        nextRow[j + 1] = Math.max(nextRow[j] ?? 0, row[j + 1] ?? 0);
      }
    }
  }

  // Backtrack to construct diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        type: "unchanged",
        text: oldLines[i - 1] ?? "",
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (
      j > 0 &&
      (i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))
    ) {
      result.push({
        type: "added",
        text: newLines[j - 1] ?? "",
        newLineNumber: j,
      });
      j--;
    } else if (i > 0) {
      result.push({
        type: "removed",
        text: oldLines[i - 1] ?? "",
        oldLineNumber: i,
      });
      i--;
    }
  }

  return result.reverse();
}

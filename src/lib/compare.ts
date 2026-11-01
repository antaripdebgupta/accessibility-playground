import type { Finding } from "@/types/a11y";

/**
 * Disposition of a finding when comparing baseline → current.
 *
 * - `resolved`:       Same rule on a matching element was re-evaluated and no longer fires.
 * - `element-removed`: The element is gone entirely — we cannot claim the issue is fixed.
 * - `remaining`:      Still present (fingerprint match).
 * - `introduced`:     New finding not present in the baseline.
 */
export type CompareDisposition =
  "resolved" | "element-removed" | "remaining" | "introduced";

export interface ComparedFinding {
  readonly finding: Finding;
  readonly disposition: CompareDisposition;
}

export interface CompareResult {
  readonly resolved: readonly ComparedFinding[];
  readonly remaining: readonly ComparedFinding[];
  readonly introduced: readonly ComparedFinding[];
}

/**
 * Extract target identifier from a finding's first node.
 */
function getFindingTargetId(f: Finding): string {
  return f.nodes[0]?.targetId || f.nodes[0]?.target?.join(" > ") || "";
}

/**
 * Compares a baseline snapshot of findings against the current findings.
 *
 * Classification rules:
 * - If a baseline finding's fingerprint exists in current → `remaining`.
 * - If a baseline finding's fingerprint is absent, but the element is still
 *   present (evaluated and no longer triggers this rule) → `resolved`.
 * - If a baseline finding's fingerprint is absent and the element is no longer
 *   present in the document → `element-removed`.
 * - Current findings not matched to any baseline fingerprint → `introduced`.
 */
export function compare(
  baseline: readonly Finding[],
  current: readonly Finding[],
  activeElementIds?: ReadonlySet<string> | readonly string[]
): CompareResult {
  const currentByFingerprint = new Set(current.map((f) => f.fingerprint));

  // Collect element identities that are present in current findings
  const currentElementIds = new Set<string>();
  for (const f of current) {
    for (const node of f.nodes) {
      if (node.targetId) {
        currentElementIds.add(node.targetId);
      }
      if (node.target && node.target.length > 0) {
        currentElementIds.add(node.target.join(" > "));
      }
    }
  }

  // Also include any active element IDs passed from DOM / tree
  if (activeElementIds) {
    for (const id of activeElementIds) {
      currentElementIds.add(id);
    }
  }

  const resolved: ComparedFinding[] = [];
  const remaining: ComparedFinding[] = [];

  for (const bf of baseline) {
    if (currentByFingerprint.has(bf.fingerprint)) {
      remaining.push({ finding: bf, disposition: "remaining" });
    } else {
      const bfTargetId = getFindingTargetId(bf);
      const isElementPresent =
        bfTargetId !== "" &&
        (currentElementIds.has(bfTargetId) ||
          bf.nodes.some(
            (n) =>
              (n.targetId && currentElementIds.has(n.targetId)) ||
              (n.target && currentElementIds.has(n.target.join(" > ")))
          ));

      if (isElementPresent) {
        resolved.push({ finding: bf, disposition: "resolved" });
      } else {
        resolved.push({ finding: bf, disposition: "element-removed" });
      }
    }
  }

  const baselineFingerprints = new Set(baseline.map((f) => f.fingerprint));
  const introduced: ComparedFinding[] = current
    .filter((f) => !baselineFingerprints.has(f.fingerprint))
    .map((f) => ({ finding: f, disposition: "introduced" as const }));

  return { resolved, remaining, introduced };
}

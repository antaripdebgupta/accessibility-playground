import type {
  AxeFinding,
  Finding,
  FindingConfidence,
  FindingStatus,
  WcagRef,
} from "@/types/a11y";
import { RULES } from "@/lib/rules";
import { WCAG_CRITERIA_BY_ID } from "@/data/wcag";
import { fnv1a } from "@/lib/hash";

/**
 * Normalizes HTML snippet for stable fingerprinting by stripping data-a11y-id
 * and collapsing whitespace.
 */
export function normalizeHtmlSnippet(html: string): string {
  return html
    .replace(/\s*data-a11y-id="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Stable finding fingerprint:
 * hash(ruleId + ":" + targetNodeStructuralId + ":" + normalizedHtml)
 */
export function computeFindingFingerprint(
  ruleId: string,
  targetId: string | undefined,
  html: string
): string {
  const normalized = normalizeHtmlSnippet(html);
  return fnv1a(`${ruleId}:${targetId || ""}:${normalized}`);
}

/**
 * Checks whether an axe-core rule and a custom playground rule represent the same issue.
 */
export function isEquivalentRule(
  axeRuleId: string,
  customRuleId: string
): boolean {
  if (axeRuleId === customRuleId) return true;
  const rule = RULES.find((r) => r.id === customRuleId);
  if (rule?.equivalentAxeIds && rule.equivalentAxeIds.includes(axeRuleId)) {
    return true;
  }
  // Check reverse if customRuleId is tested as axe ID
  const reverseRule = RULES.find((r) => r.id === axeRuleId);
  if (reverseRule?.equivalentAxeIds && reverseRule.equivalentAxeIds.includes(customRuleId)) {
    return true;
  }
  return false;
}

/**
 * Maps raw WCAG string references to structured WcagRef objects.
 */
export function parseWcagRefs(wcag?: readonly string[]): readonly WcagRef[] {
  if (!wcag || wcag.length === 0) return [];

  const refs: WcagRef[] = [];
  const seenIds = new Set<string>();

  for (const raw of wcag) {
    const match = raw.match(/(\d+\.\d+\.\d+)/);
    const id = match ? match[1]! : raw.trim();

    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const criterion = WCAG_CRITERIA_BY_ID.get(id);
    if (criterion) {
      refs.push({
        id: criterion.id,
        version: criterion.since,
        level: criterion.level,
      });
    } else {
      refs.push({
        id,
        version: "2.0",
        level: "AA",
      });
    }
  }

  return refs;
}

/**
 * Normalizes custom playground findings, axe violations, and axe incomplete checks
 * into the rich Finding model with stable fingerprints and node-level deduplication.
 */
export function normalizeFindings(
  customFindings: readonly AxeFinding[] = [],
  axeViolations: readonly AxeFinding[] = [],
  axeIncomplete: readonly AxeFinding[] = []
): Finding[] {
  const result: Finding[] = [];
  // Set of suppressed custom finding keys: `${cf.id}:${nodeId || normHtml}`
  const suppressedCustomNodeKeys = new Set<string>();

  // Process axe violations (status: "violation")
  for (const af of axeViolations) {
    let fix = af.fix;

    // Check for equivalent custom rules on matching nodes to inherit custom fix & suppress duplicate
    for (const afNode of af.nodes) {
      for (const cf of customFindings) {
        if (!isEquivalentRule(af.id, cf.id)) continue;

        for (const cfNode of cf.nodes) {
          const idMatch = Boolean(
            afNode.targetId &&
              cfNode.targetId &&
              afNode.targetId === cfNode.targetId
          );
          const htmlMatch = Boolean(
            normalizeHtmlSnippet(afNode.html) ===
              normalizeHtmlSnippet(cfNode.html)
          );

          if (idMatch || htmlMatch) {
            if (!fix && cf.fix) {
              fix = cf.fix;
            }
            const key = `${cf.id}:${cfNode.targetId || normalizeHtmlSnippet(cfNode.html)}`;
            suppressedCustomNodeKeys.add(key);
          }
        }
      }
    }

    const primaryNode = af.nodes[0];
    const fingerprint = af.fingerprint || computeFindingFingerprint(
      af.id,
      primaryNode?.targetId,
      primaryNode?.html || ""
    );

    result.push({
      fingerprint,
      ruleId: af.id,
      engine: "axe-core",
      status: "violation",
      confidence: "high",
      impact: af.impact,
      wcag: parseWcagRefs(af.wcag),
      help: af.help,
      description: af.description,
      helpUrl: af.helpUrl,
      nodes: af.nodes,
      fix,
    });
  }

  // Process axe incomplete checks (status: "needs-review")
  for (const af of axeIncomplete) {
    const primaryNode = af.nodes[0];
    const fingerprint = af.fingerprint || computeFindingFingerprint(
      af.id,
      primaryNode?.targetId,
      primaryNode?.html || ""
    );

    result.push({
      fingerprint,
      ruleId: af.id,
      engine: "axe-core",
      status: "needs-review",
      confidence: "medium",
      impact: af.impact,
      wcag: parseWcagRefs(af.wcag),
      help: af.help,
      description: af.description,
      helpUrl: af.helpUrl,
      nodes: af.nodes,
      fix: af.fix,
    });
  }

  // Process playground custom findings (excluding deduplicated ones)
  for (const cf of customFindings) {
    const remainingNodes = cf.nodes.filter((node) => {
      const key = `${cf.id}:${node.targetId || normalizeHtmlSnippet(node.html)}`;
      return !suppressedCustomNodeKeys.has(key);
    });

    if (remainingNodes.length === 0) {
      continue;
    }

    const primaryNode = remainingNodes[0]!;
    const fingerprint = cf.fingerprint || computeFindingFingerprint(
      cf.id,
      primaryNode.targetId,
      primaryNode.html
    );

    const ruleDef = RULES.find((r) => r.id === cf.id);
    const confidence: FindingConfidence = ruleDef?.confidence || "high";
    const status: FindingStatus = confidence === "low" ? "needs-review" : "violation";

    result.push({
      fingerprint,
      ruleId: cf.id,
      engine: "playground",
      status,
      confidence,
      impact: cf.impact,
      wcag: parseWcagRefs(cf.wcag),
      help: cf.help,
      description: cf.description,
      helpUrl: cf.helpUrl,
      nodes: remainingNodes,
      fix: cf.fix,
    });
  }

  return result;
}

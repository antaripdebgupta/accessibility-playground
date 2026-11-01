import type { AxeFinding } from "@/types/a11y";
import { isEquivalentRule as isRuleEquivalent, normalizeHtmlSnippet } from "./findings/normalize";

/**
 * Mapping between axe-core rule IDs and playground custom-rule IDs
 * for backwards compatibility.
 */
export const DEDUP_RULE_MAP: Readonly<Record<string, readonly string[]>> = {
  "image-alt": ["img-missing-alt"],
  tabindex: ["positive-tabindex"],
  "link-name": ["empty-interactive-name"],
  "button-name": ["empty-interactive-name"],
  label: ["input-no-label"],
  "duplicate-id": ["duplicate-id"],
  "aria-hidden-focus": ["aria-hidden-focusable"],
};

export function isEquivalentRule(
  axeRuleId: string,
  customRuleId: string
): boolean {
  return isRuleEquivalent(axeRuleId, customRuleId);
}

/**
 * Pure function to merge axe-core violations and playground custom findings,
 * deduplicating per-node while preserving custom fixes and fingerprints.
 */
export function mergeFindings(
  customFindings: readonly AxeFinding[],
  axeViolations: readonly AxeFinding[]
): AxeFinding[] {
  const list: AxeFinding[] = [];
  const suppressedCustomKeys = new Set<string>();

  for (const af of axeViolations) {
    let fix = af.fix;

    for (const afNode of af.nodes) {
      for (const cf of customFindings) {
        if (!isEquivalentRule(af.id, cf.id)) continue;

        for (const cfNode of cf.nodes) {
          const targetMatch = Boolean(
            (afNode.targetId &&
              cfNode.targetId &&
              afNode.targetId === cfNode.targetId) ||
            normalizeHtmlSnippet(afNode.html) ===
              normalizeHtmlSnippet(cfNode.html)
          );

          if (targetMatch) {
            if (!fix && cf.fix) {
              fix = cf.fix;
            }
            const key = `${cf.id}:${cfNode.targetId || normalizeHtmlSnippet(cfNode.html)}`;
            suppressedCustomKeys.add(key);
          }
        }
      }
    }

    list.push(fix ? { ...af, fix } : af);
  }

  for (const cf of customFindings) {
    const unsuppressedNodes = cf.nodes.filter((node) => {
      const key = `${cf.id}:${node.targetId || normalizeHtmlSnippet(node.html)}`;
      return !suppressedCustomKeys.has(key);
    });

    if (unsuppressedNodes.length > 0) {
      list.push(
        unsuppressedNodes.length === cf.nodes.length
          ? cf
          : { ...cf, nodes: unsuppressedNodes }
      );
    }
  }

  return list;
}

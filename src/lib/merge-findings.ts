import type { AxeFinding } from "@/types/a11y";

/**
 * Mapping between axe-core rule IDs and playground custom-rule IDs
 * for deduplicating findings reported on the same element.
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
  if (axeRuleId === customRuleId) return true;
  const mapped = DEDUP_RULE_MAP[axeRuleId];
  return Boolean(mapped && mapped.includes(customRuleId));
}

/**
 * Pure function to merge axe-core violations and playground custom findings,
 * avoiding duplicate issues for the same DOM element while preserving custom fixes.
 */
export function mergeFindings(
  customFindings: readonly AxeFinding[],
  axeViolations: readonly AxeFinding[]
): AxeFinding[] {
  const list: AxeFinding[] = [];
  const suppressedCustomKeys = new Set<string>();

  for (const af of axeViolations) {
    const targetId = af.nodes[0]?.targetId;
    const targetHtml = af.nodes[0]?.html;

    let fix = af.fix;
    const matchingCustom = customFindings.find((cf) => {
      const cfTargetId = cf.nodes[0]?.targetId;
      const cfHtml = cf.nodes[0]?.html;
      const targetMatch = Boolean(
        (targetId && cfTargetId && targetId === cfTargetId) ||
        (targetHtml && cfHtml && targetHtml === cfHtml)
      );
      if (!targetMatch) return false;

      return isEquivalentRule(af.id, cf.id);
    });

    if (matchingCustom) {
      if (!fix && matchingCustom.fix) {
        fix = matchingCustom.fix;
      }
      const cfTargetId = matchingCustom.nodes[0]?.targetId;
      const cfHtml = matchingCustom.nodes[0]?.html;
      suppressedCustomKeys.add(`${matchingCustom.id}:${cfTargetId || cfHtml}`);
    }

    list.push(fix ? { ...af, fix } : af);
  }

  for (const cf of customFindings) {
    const targetId = cf.nodes[0]?.targetId;
    const key = `${cf.id}:${targetId || cf.nodes[0]?.html}`;
    if (!suppressedCustomKeys.has(key)) {
      list.push(cf);
    }
  }

  return list;
}

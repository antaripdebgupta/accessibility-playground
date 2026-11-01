import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const ariaHiddenFocusableRule: Rule = {
  id: "aria-hidden-focusable",
  impact: "serious",
  confidence: "high",
  wcag: ["4.1.2"],
  help: "aria-hidden element is or contains focusable element",
  equivalentAxeIds: ["aria-hidden-focus"],
  checkNode(node, ctx) {
    const attrs = node.attributes || {};
    const ariaAttrs = node.ariaAttributes || {};
    const isAriaHidden =
      attrs["aria-hidden"] === "true" || ariaAttrs["aria-hidden"] === "true";

    if (isAriaHidden) {
      const selfFocusable = ctx.isFocusable(node);
      const childFocusable = ctx.hasFocusableDescendant(node);
      if (selfFocusable || childFocusable) {
        const tag = node.tagName.toLowerCase();
        return [
          makeFinding({
            id: "aria-hidden-focusable",
            impact: "serious",
            help: "aria-hidden element is or contains focusable element",
            description: `Element <${tag} aria-hidden="true"> contains or is a focusable element. Screen readers ignore aria-hidden content, but keyboard users can still tab into it, creating invisible focus traps.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Remove aria-hidden="true" or make the element non-focusable using tabindex="-1" or disabled.',
            node,
            html: ctx.html,
          }),
        ];
      }
    }

    return [];
  },
};

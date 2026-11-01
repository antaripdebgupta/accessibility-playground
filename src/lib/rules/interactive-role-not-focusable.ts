import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { INTERACTIVE_ROLES } from "./helpers";

export const interactiveRoleNotFocusableRule: Rule = {
  id: "interactive-role-not-focusable",
  impact: "critical",
  confidence: "high",
  wcag: ["2.1.1", "4.1.2"],
  help: "Interactive role is not focusable by keyboard",
  checkNode(node, ctx) {
    const attrs = node.attributes || {};
    const ariaAttrs = node.ariaAttributes || {};
    const isAriaHidden =
      attrs["aria-hidden"] === "true" || ariaAttrs["aria-hidden"] === "true";
    const tag = node.tagName.toLowerCase();

    if (
      INTERACTIVE_ROLES.has(node.role) &&
      !ctx.isNaturalFocusable(node) &&
      !isAriaHidden
    ) {
      const rawTab = attrs["tabindex"];
      const hasTab = rawTab !== undefined && parseInt(rawTab, 10) >= 0;
      if (!hasTab) {
        return [
          makeFinding({
            id: "interactive-role-not-focusable",
            impact: "critical",
            help: "Interactive role is not focusable by keyboard",
            description: `Element <${tag}> declares role="${node.role}" but does not have tabindex="0" or native keyboard focusability. Keyboard users cannot reach this control.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#keyboard",
            wcag: ["2.1.1", "4.1.2"],
            fix: 'Add tabindex="0" to include this element in the tab sequence, or use a native interactive HTML element like <button>.',
            node,
            html: ctx.html,
          }),
        ];
      }
    }

    return [];
  },
};

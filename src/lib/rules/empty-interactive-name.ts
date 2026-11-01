import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const emptyInteractiveNameRule: Rule = {
  id: "empty-interactive-name",
  impact: "critical",
  confidence: "high",
  wcag: ["4.1.2"],
  help: "Interactive element has no accessible name",
  equivalentAxeIds: ["link-name", "button-name"],
  checkNode(node, ctx) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    const ariaAttrs = node.ariaAttributes || {};
    const isAriaHidden =
      attrs["aria-hidden"] === "true" || ariaAttrs["aria-hidden"] === "true";

    const isInteractive =
      tag === "button" ||
      (tag === "a" && attrs["href"] !== undefined) ||
      node.role === "button" ||
      node.role === "link" ||
      node.role === "tab";

    if (isInteractive && !isAriaHidden) {
      if (!node.hasAccessibleName || !node.accessibleName.trim()) {
        return [
          makeFinding({
            id: "empty-interactive-name",
            impact: "critical",
            help: "Interactive element has no accessible name",
            description: `Interactive <${tag} role="${node.role}"> has no text content, aria-label, or aria-labelledby. Users cannot tell what activating this control will do.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Provide text content inside the control or add aria-label="Action description".',
            node,
            html: ctx?.html,
          }),
        ];
      }
    }

    return [];
  },
};

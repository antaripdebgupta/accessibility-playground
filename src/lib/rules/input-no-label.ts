import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { NATURAL_FORM_CONTROLS } from "./helpers";

export const inputNoLabelRule: Rule = {
  id: "input-no-label",
  impact: "critical",
  confidence: "high",
  wcag: ["1.3.1", "3.3.2", "4.1.2"],
  help: "Form control has no accessible name",
  equivalentAxeIds: ["label"],
  checkNode(node, ctx) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    if (
      NATURAL_FORM_CONTROLS.has(tag) &&
      attrs["type"] !== "hidden" &&
      attrs["type"] !== "submit" &&
      attrs["type"] !== "button"
    ) {
      if (!node.hasAccessibleName || !node.accessibleName.trim()) {
        return [
          makeFinding({
            id: "input-no-label",
            impact: "critical",
            help: "Form control has no accessible name",
            description: `Form control <${tag}> lacks any label. Assistive technology users will hear only the input type without knowing its purpose.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#labels-or-instructions",
            wcag: ["1.3.1", "3.3.2", "4.1.2"],
            fix: 'Add an associated <label for="..."> or an aria-label/aria-labelledby attribute.',
            node,
            html: ctx?.html,
          }),
        ];
      }
    }

    return [];
  },
};

import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const positiveTabindexRule: Rule = {
  id: "positive-tabindex",
  impact: "serious",
  wcag: ["2.4.3"],
  help: "Positive tabindex attribute disrupts natural tab order",
  checkNode(node) {
    const attrs = node.attributes || {};
    const tag = node.tagName.toLowerCase();
    const rawTab = attrs["tabindex"];
    if (rawTab !== undefined && rawTab !== null && rawTab.trim() !== "") {
      const parsed = parseInt(rawTab.trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        return [
          makeFinding({
            id: "positive-tabindex",
            impact: "serious",
            help: "Positive tabindex attribute disrupts natural tab order",
            description: `Element <${tag} tabindex="${parsed}"> has a positive tabindex. Positive values take precedence over natural document flow, causing unpredictable focus jumps.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#focus-order",
            wcag: ["2.4.3"],
            fix: 'Change to tabindex="0" to respect DOM order, or remove tabindex if the element is natively focusable.',
            node,
          }),
        ];
      }
    }
    return [];
  },
};

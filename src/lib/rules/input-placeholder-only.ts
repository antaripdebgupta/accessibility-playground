import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { NATURAL_FORM_CONTROLS } from "./helpers";

export const inputPlaceholderOnlyRule: Rule = {
  id: "input-placeholder-only",
  impact: "critical",
  confidence: "high",
  wcag: ["1.3.1", "4.1.2", "3.3.2"],
  help: "Form input labeled only by placeholder or title",
  checkNode(node, ctx) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    if (NATURAL_FORM_CONTROLS.has(tag) && attrs["type"] !== "hidden") {
      const hasPlaceholder = Boolean(attrs["placeholder"]?.trim());
      const hasTitle = Boolean(attrs["title"]?.trim());
      const hasAriaLabel = Boolean(attrs["aria-label"]?.trim());
      const hasAriaLabelledby = Boolean(attrs["aria-labelledby"]?.trim());
      const hasNativeLabel =
        node.accessibleNameSource === "<label for>" ||
        node.accessibleNameSource === "label[for]" ||
        node.accessibleNameSource === "enclosing <label>" ||
        node.accessibleNameSource.includes("label");

      const hasLegitimateLabel =
        hasNativeLabel || hasAriaLabel || hasAriaLabelledby;

      const reliesOnPlaceholderOrTitle =
        (hasPlaceholder || hasTitle) && !hasLegitimateLabel;

      if (reliesOnPlaceholderOrTitle) {
        return [
          makeFinding({
            id: "input-placeholder-only",
            impact: "critical",
            help: "Form input labeled only by placeholder or title",
            description: `Form control <${tag}> relies solely on placeholder="${attrs["placeholder"] || ""}" or title for its accessible name. Placeholders disappear upon user input and lack required contrast.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
            wcag: ["1.3.1", "4.1.2", "3.3.2"],
            fix: 'Add a persistent <label for="input-id"> element or aria-label attribute. Do not rely on placeholder as the sole label.',
            node,
            html: ctx?.html,
          }),
        ];
      }
    }
    return [];
  },
};

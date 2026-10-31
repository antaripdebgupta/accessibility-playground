import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { NATURAL_FORM_CONTROLS } from "./helpers";

export const inputPlaceholderOnlyRule: Rule = {
  id: "input-placeholder-only",
  impact: "critical",
  wcag: ["1.3.1", "4.1.2", "3.3.2"],
  help: "Form input labeled only by placeholder or title",
  checkNode(node) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    if (NATURAL_FORM_CONTROLS.has(tag) && attrs["type"] !== "hidden") {
      const hasPlaceholder = Boolean(attrs["placeholder"]?.trim());
      const hasTitle = Boolean(attrs["title"]?.trim());
      const hasLabelFor =
        node.accessibleNameSource === "<label for>" ||
        node.accessibleNameSource === "label[for]";
      const hasAriaLabel = Boolean(attrs["aria-label"]?.trim());
      const hasAriaLabelledby = Boolean(attrs["aria-labelledby"]?.trim());

      const onlyPlaceholderOrTitle =
        (hasPlaceholder || hasTitle) &&
        !hasLabelFor &&
        !hasAriaLabel &&
        !hasAriaLabelledby &&
        (node.accessibleNameSource === "placeholder" ||
          node.accessibleNameSource === "title" ||
          !node.hasAccessibleName);

      if (onlyPlaceholderOrTitle) {
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
          }),
        ];
      }
    }
    return [];
  },
};

import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { validateAriaAttribute } from "../aria-explorer";
import type { AxeFinding } from "@/types/a11y";

export const invalidAriaRule: Rule = {
  id: "invalid-aria",
  impact: "serious",
  wcag: ["4.1.2"],
  help: "Invalid ARIA attribute or value",
  checkNode(node) {
    const findings: AxeFinding[] = [];
    const ariaAttrs = node.ariaAttributes || {};

    for (const [attrName, attrValue] of Object.entries(ariaAttrs)) {
      const validity = validateAriaAttribute(attrName, attrValue, node.role);
      if (
        validity.status === "not-allowed" ||
        validity.status === "invalid-value"
      ) {
        findings.push(
          makeFinding({
            id: "invalid-aria",
            impact: "serious",
            help: `Invalid ARIA: ${attrName}`,
            description: validity.explanation,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: `Use valid WAI-ARIA attributes and value types compatible with role="${node.role}".`,
            node,
          })
        );
      }
    }
    return findings;
  },
};

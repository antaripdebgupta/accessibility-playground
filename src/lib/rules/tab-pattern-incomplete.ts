import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import type { AxeFinding } from "@/types/a11y";

export const tabPatternIncompleteRule: Rule = {
  id: "tab-pattern-incomplete",
  impact: "serious",
  confidence: "high",
  wcag: ["4.1.2"],
  help: "Incomplete WAI-ARIA tab pattern",
  checkNode(node, ctx) {
    const findings: AxeFinding[] = [];
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    const ariaAttrs = node.ariaAttributes || {};

    if (node.role === "tab" || attrs["role"] === "tab") {
      const hasSelected =
        attrs["aria-selected"] !== undefined ||
        ariaAttrs["aria-selected"] !== undefined;
      const hasControls =
        attrs["aria-controls"] !== undefined ||
        ariaAttrs["aria-controls"] !== undefined;
      const inTablist = ctx.isInsideTablist(node);

      if (!hasSelected || !hasControls || !inTablist) {
        const missing: string[] = [];
        if (!hasSelected) missing.push("aria-selected");
        if (!hasControls) missing.push("aria-controls");
        if (!inTablist) missing.push("enclosing role='tablist'");

        findings.push(
          makeFinding({
            id: "tab-pattern-incomplete",
            impact: "serious",
            help: "Incomplete WAI-ARIA tab pattern",
            description: `Element <${tag} role="tab"> is missing required ARIA tab attributes or container: ${missing.join(", ")}.`,
            helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
            wcag: ["4.1.2"],
            fix: 'Ensure tabs are contained in a role="tablist", and declare aria-selected="true|false" and aria-controls="panel-id".',
            node,
            html: ctx.html,
          })
        );
      }
    }

    if (node.role === "tabpanel" || attrs["role"] === "tabpanel") {
      const hasLabel =
        attrs["aria-labelledby"] !== undefined ||
        ariaAttrs["aria-labelledby"] !== undefined ||
        node.hasAccessibleName;
      if (!hasLabel) {
        findings.push(
          makeFinding({
            id: "tab-pattern-incomplete",
            impact: "serious",
            help: "Tabpanel missing accessible label",
            description: `Element <${tag} role="tabpanel"> lacks aria-labelledby pointing to its corresponding tab.`,
            helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
            wcag: ["4.1.2"],
            fix: 'Add aria-labelledby="tab-id" linking this tabpanel to its controlling tab.',
            node,
            html: ctx.html,
          })
        );
      }
    }


    return findings;
  },
};

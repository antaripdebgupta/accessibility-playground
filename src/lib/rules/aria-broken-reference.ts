import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import type { AxeFinding } from "@/types/a11y";

const REFERENCE_ATTRIBUTES = [
  "for",
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
] as const;

export const ariaBrokenReferenceRule: Rule = {
  id: "aria-broken-reference",
  impact: "serious",
  confidence: "high",
  wcag: ["1.3.1", "4.1.2"],
  help: "Broken ARIA or form ID reference",
  checkNode(node, ctx) {
    const findings: AxeFinding[] = [];
    const attrs = node.attributes || {};
    const tag = node.tagName.toLowerCase();

    for (const refAttr of REFERENCE_ATTRIBUTES) {
      const val = attrs[refAttr];
      if (val) {
        const targetIds = val.split(/\s+/).filter(Boolean);
        for (const tId of targetIds) {
          if (!ctx.idMap.has(tId)) {
            findings.push(
              makeFinding({
                id: "aria-broken-reference",
                impact: "serious",
                help: `Broken ${refAttr} ID reference`,
                description: `Element <${tag}> references id="${tId}" via ${refAttr}, but no element with id="${tId}" exists in the document.`,
                helpUrl:
                  "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
                wcag: ["1.3.1", "4.1.2"],
                fix: `Create an element with id="${tId}" or update the ${refAttr} attribute to reference an existing element.`,
                node,
                html: ctx.html,
              })
            );
          }
        }
      }
    }
    return findings;
  },
};

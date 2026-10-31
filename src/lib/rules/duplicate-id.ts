import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import type { AxeFinding } from "@/types/a11y";

const REFERENCE_ATTRIBUTES = [
  "for",
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
];

export const duplicateIdRule: Rule = {
  id: "duplicate-id",
  impact: "serious",
  wcag: ["1.3.1", "4.1.2"],
  help: "Duplicate id or broken ID reference",
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
                id: "duplicate-id",
                impact: "serious",
                help: `Broken ${refAttr} ID reference`,
                description: `Element <${tag}> references id="${tId}" via ${refAttr}, but no element with id="${tId}" exists in the document.`,
                helpUrl:
                  "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
                wcag: ["1.3.1", "4.1.2"],
                fix: `Create an element with id="${tId}" or update the ${refAttr} attribute to reference an existing element.`,
                node,
              })
            );
          }
        }
      }
    }
    return findings;
  },
  checkEnd(ctx) {
    const findings: AxeFinding[] = [];
    for (const [idValue, idNodes] of ctx.idMap.entries()) {
      if (idNodes.length > 1) {
        for (const node of idNodes) {
          findings.push(
            makeFinding({
              id: "duplicate-id",
              impact: "serious",
              help: `Duplicate id="${idValue}" attribute`,
              description: `The id="${idValue}" is used on multiple elements in this document. IDs must be unique to avoid broken form labels and ARIA references.`,
              helpUrl:
                "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
              wcag: ["1.3.1", "4.1.2"],
              fix: `Ensure every element has a unique id attribute value across the document.`,
              node,
            })
          );
        }
      }
    }
    return findings;
  },
};

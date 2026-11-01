import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import type { AxeFinding } from "@/types/a11y";

export const duplicateIdRule: Rule = {
  id: "duplicate-id",
  impact: "serious",
  confidence: "high",
  wcag: ["1.3.1", "4.1.2"],
  help: "Duplicate id attribute value",
  equivalentAxeIds: [
    "duplicate-id",
    "duplicate-id-active",
    "duplicate-id-aria",
  ],
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
              html: ctx.html,
            })
          );
        }
      }
    }
    return findings;
  },
};

import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const imgMissingAltRule: Rule = {
  id: "img-missing-alt",
  impact: "critical",
  wcag: ["1.1.1"],
  help: "Image is missing alt attribute",
  checkNode(node) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    if (tag === "img" && attrs["alt"] === undefined) {
      return [
        makeFinding({
          id: "img-missing-alt",
          impact: "critical",
          help: "Image is missing alt attribute",
          description: `Element <img src="${attrs["src"] || ""}"> has no alt attribute. Screen readers will read the file name or skip the image unpredictably.`,
          helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#non-text-content",
          wcag: ["1.1.1"],
          fix: 'Add alt="descriptive text" explaining the visual image, or alt="" if the image is decorative.',
          node,
        }),
      ];
    }
    return [];
  },
};

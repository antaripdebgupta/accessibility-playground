import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import type { AxeFinding } from "@/types/a11y";

export const headingOrderRule: Rule = {
  id: "heading-order",
  impact: "moderate",
  wcag: ["1.3.1"],
  help: "Skipped heading level in document structure",
  checkNode(node, ctx) {
    const tag = node.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag.slice(1), 10);
      ctx.headings.push({ level, node });
    }
    return [];
  },
  checkEnd(ctx) {
    const findings: AxeFinding[] = [];
    for (let i = 1; i < ctx.headings.length; i++) {
      const prev = ctx.headings[i - 1]!;
      const curr = ctx.headings[i]!;
      if (curr.level > prev.level + 1) {
        findings.push(
          makeFinding({
            id: "heading-order",
            impact: "moderate",
            help: "Skipped heading level in document structure",
            description: `Heading <h${curr.level}> follows <h${prev.level}>, skipping level <h${prev.level + 1}>. Screen reader users rely on consistent heading hierarchy for document navigation.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
            wcag: ["1.3.1"],
            fix: `Change <h${curr.level}> to <h${prev.level + 1}>, and adjust font sizes with CSS instead of choosing heading tags for appearance.`,
            node: curr.node,
          })
        );
      }
    }
    return findings;
  },
};

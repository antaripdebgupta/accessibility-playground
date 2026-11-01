import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const linkAsButtonRule: Rule = {
  id: "link-as-button",
  impact: "serious",
  confidence: "medium",
  wcag: ["4.1.2"],
  help: "Anchor element used as button",
  checkNode(node, ctx) {
    const tag = node.tagName.toLowerCase();
    if (tag !== "a") return [];
    const attrs = node.attributes || {};
    const href = attrs["href"]?.trim();
    const hasClick =
      attrs["onclick"] !== undefined || node.inlineHandlers.includes("onclick");
    const hasJsHref =
      href === "#" ||
      (href !== undefined && href.toLowerCase().startsWith("javascript:"));
    const isButtonLike = hasJsHref || (hasClick && (!href || href === ""));

    if (isButtonLike) {
      return [
        makeFinding({
          id: "link-as-button",
          impact: "serious",
          help: "Anchor element used as button",
          description: `Element <a href="${href || ""}"> behaves like an action button rather than a true navigation link. Links that perform actions instead of navigating confuse screen reader users.`,
          helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
          wcag: ["4.1.2"],
          fix: 'Use a <button type="button"> for script-driven actions. If this is a real link, provide a valid URL in href.',
          node,
          html: ctx?.html,
        }),
      ];
    }

    return [];
  },
};

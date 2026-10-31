import type { Rule } from "./types";
import { makeFinding } from "./make-finding";
import { INTERACTIVE_ROLES } from "./helpers";

const NON_INTERACTIVE_TAGS = new Set([
  "div",
  "span",
  "li",
  "p",
  "td",
  "th",
  "tr",
  "article",
  "section",
  "header",
  "footer",
  "b",
  "i",
  "strong",
  "em",
]);

export const clickOnNonInteractiveRule: Rule = {
  id: "click-on-non-interactive",
  impact: "critical",
  wcag: ["4.1.2", "2.1.1"],
  help: "Click handler attached to non-interactive element",
  checkNode(node) {
    const attrs = node.attributes || {};
    const tag = node.tagName.toLowerCase();
    const hasClick =
      attrs["onclick"] !== undefined ||
      attrs["onmousedown"] !== undefined ||
      attrs["onmouseup"] !== undefined ||
      attrs["onkeydown"] !== undefined ||
      node.inlineHandlers.some((h) =>
        ["onclick", "onmousedown", "onmouseup", "onkeydown"].includes(h)
      );

    if (
      hasClick &&
      NON_INTERACTIVE_TAGS.has(tag) &&
      (!node.explicitRole || !INTERACTIVE_ROLES.has(node.explicitRole))
    ) {
      return [
        makeFinding({
          id: "click-on-non-interactive",
          impact: "critical",
          help: "Click handler attached to non-interactive element",
          description: `Element <${tag}> has a click or keyboard handler but lacks an interactive semantic tag or role. Screen readers and keyboard users cannot interact with it as a control.`,
          helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
          wcag: ["4.1.2", "2.1.1"],
          fix: 'Replace with a native <button type="button"> or <a> element, or add role="button" with tabindex="0" and keyboard listeners for Enter/Space.',
          node,
        }),
      ];
    }
    return [];
  },
};

import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const outlineRemovedRule: Rule = {
  id: "outline-removed",
  impact: "serious",
  wcag: ["2.4.7", "2.4.11"],
  help: "Focus outline removed without replacement style",
  checkEnd(ctx) {
    if (!ctx.css) return [];

    const hasOutlineNone = /outline\s*:\s*(none|0\b)/i.test(ctx.css);
    const hasFocusVisibleReplacement =
      /:focus(-visible)?\s*\{[^}]*(outline|box-shadow)\s*:\s*(?!none|0\b)[^;]+;/i.test(
        ctx.css
      );

    if (hasOutlineNone && !hasFocusVisibleReplacement) {
      const focusableNode = ctx.nodes.find(ctx.isFocusable) || ctx.nodes[0];
      if (focusableNode) {
        return [
          makeFinding({
            id: "outline-removed",
            impact: "serious",
            help: "Focus outline removed without replacement style",
            description: `CSS removes default focus outlines (outline: none or 0) without defining a visible replacement :focus-visible style. Keyboard users will not be able to see which element is focused.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#focus-appearance",
            wcag: ["2.4.7", "2.4.11"],
            fix: "Provide a visible :focus-visible indicator (e.g. outline: 2px solid #1d4ed8; outline-offset: 2px;).",
            node: focusableNode,
          }),
        ];
      }
    }
    return [];
  },
};

import type { A11yNode, AxeFinding } from "@/types/a11y";
import { setAttributeInSource, removeAttributeFromSource } from "./mutate-html";

export const AUTO_FIXABLE_RULE_IDS = [
  "positive-tabindex",
  "aria-hidden-focusable",
  "img-missing-alt",
] as const;

export type AutoFixableRuleId = (typeof AUTO_FIXABLE_RULE_IDS)[number];

export function isAutoFixable(ruleId: string): ruleId is AutoFixableRuleId {
  return (AUTO_FIXABLE_RULE_IDS as readonly string[]).includes(ruleId);
}

export function computeFixPreview(
  finding: AxeFinding,
  hasVisibleCaption = false
): { beforeTag: string; afterTag: string } | null {
  if (!isAutoFixable(finding.id)) return null;

  const htmlSnippet = finding.nodes[0]?.html ?? "";
  const match = htmlSnippet.match(
    /^<[a-zA-Z][a-zA-Z0-9-]*((?:\s+[^<>"']*(?:"[^"]*"|'[^']*')*)*?)\s*(\/?)>/
  );
  const beforeTag = match ? match[0] : htmlSnippet;

  let afterTag = beforeTag;

  switch (finding.id) {
    case "positive-tabindex":
      afterTag = beforeTag.replace(
        /\btabindex\s*=\s*(?:"[^"]*"|'[^']*'|\d+)/i,
        'tabindex="0"'
      );
      break;

    case "aria-hidden-focusable":
      afterTag = beforeTag.replace(
        /\s+aria-hidden\s*=\s*(?:"[^"]*"|'[^']*'|\w+)/i,
        ""
      );
      break;

    case "img-missing-alt": {
      const altValue = hasVisibleCaption
        ? 'alt="TODO: describe this image"'
        : 'alt=""';
      if (/\s*\/>$/.test(beforeTag)) {
        afterTag = beforeTag.replace(/\s*\/>$/, ` ${altValue} />`);
      } else {
        afterTag = beforeTag.replace(/\s*>$/, ` ${altValue}>`);
      }
      break;
    }
  }

  return { beforeTag, afterTag };
}

export function applyAutoFixToHtml(
  html: string,
  finding: AxeFinding,
  node: A11yNode
): string {
  if (!isAutoFixable(finding.id)) return html;

  switch (finding.id) {
    case "positive-tabindex":
      return setAttributeInSource(html, node, "tabindex", "0");

    case "aria-hidden-focusable":
      return removeAttributeFromSource(html, node, "aria-hidden");

    case "img-missing-alt": {
      // Check if image is inside a figure with figcaption or has nearby caption
      const hasCaption =
        Boolean(node.attributes["aria-labelledby"]) ||
        Boolean(node.attributes["aria-describedby"]) ||
        (node.sourceRange
          ? html
              .slice(
                Math.max(0, node.sourceRange[0] - 300),
                Math.min(html.length, node.sourceRange[1] + 300)
              )
              .includes("<figcaption")
          : false);

      const altVal = hasCaption ? "TODO: describe this image" : "";
      return setAttributeInSource(html, node, "alt", altVal);
    }
  }
}

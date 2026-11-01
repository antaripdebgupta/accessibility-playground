import type { A11yNode, AxeFinding, AxeImpactLevel } from "@/types/a11y";
import { fnv1a } from "../hash";

/**
 * Extracts element snippet. If html and sourceRange are present, extracts real source slice
 * up to 300 characters. Otherwise falls back to the opening tag.
 */
export function getNodeSnippet(node: A11yNode, html?: string): string {
  if (html && node.sourceRange) {
    const [start, end] = node.sourceRange;
    if (start >= 0 && end > start && end <= html.length) {
      const slice = html.slice(start, end).trim();
      if (slice) {
        return slice.length > 300 ? slice.slice(0, 300) + "…" : slice;
      }
    }
  }

  const attrs = node.attributes || {};
  const attrStrings = Object.entries(attrs)
    .filter(([k]) => k !== "data-a11y-id")
    .map(([k, v]) => `${k}="${v}"`);
  const attrPart = attrStrings.length > 0 ? ` ${attrStrings.join(" ")}` : "";
  return `<${node.tagName}${attrPart}>`;
}

export function makeFinding(params: {
  id: string;
  impact: AxeImpactLevel;
  help: string;
  description: string;
  helpUrl: string;
  wcag: string[];
  fix: string;
  node: A11yNode;
  failureSummary?: string;
  html?: string;
}): AxeFinding {
  const snippet = getNodeSnippet(params.node, params.html);
  const fingerprint = fnv1a(`${params.id}:${params.node.id}:${snippet.trim()}`);

  return {
    id: params.id,
    impact: params.impact,
    help: params.help,
    description: params.description,
    helpUrl: params.helpUrl,
    wcag: params.wcag,
    source: "playground",
    type: "violation",
    fix: params.fix,
    fingerprint,
    nodes: [
      {
        html: snippet,
        target: [`[data-a11y-id="${params.node.id}"]`],
        targetId: params.node.id,
        failureSummary: params.failureSummary || params.description,
      },
    ],
  };
}

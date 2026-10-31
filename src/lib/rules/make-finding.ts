import type { A11yNode, AxeFinding, AxeImpactLevel } from "@/types/a11y";

export function getNodeSnippet(node: A11yNode): string {
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
}): AxeFinding {
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
    nodes: [
      {
        html: getNodeSnippet(params.node),
        target: [`[data-a11y-id="${params.node.id}"]`],
        targetId: params.node.id,
        failureSummary: params.failureSummary || params.description,
      },
    ],
  };
}

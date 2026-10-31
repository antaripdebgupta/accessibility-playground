import type { A11yNode } from "@/types/a11y";

/**
 * Set or replace an attribute within a node's own opening tag, using its sourceRange.
 */
export function setAttributeInSource(
  html: string,
  node: A11yNode,
  attrName: string,
  attrValue: string
): string {
  if (!node.sourceRange) return html;
  const [start, end] = node.sourceRange;
  const nodeSource = html.slice(start, end);

  // Match just the opening tag
  const openTagMatch = nodeSource.match(
    /^<[a-zA-Z][a-zA-Z0-9-]*((?:\s+[^<>"']*(?:"[^"]*"|'[^']*')*)*?)\s*(\/?)>/
  );
  if (!openTagMatch) return html;

  const attrPattern = new RegExp(
    `\\s+${attrName}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`
  );
  let newOpenTag: string;
  if (attrPattern.test(openTagMatch[0])) {
    newOpenTag = openTagMatch[0].replace(
      attrPattern,
      ` ${attrName}="${attrValue}"`
    );
  } else if (/\s*\/>$/.test(openTagMatch[0])) {
    newOpenTag = openTagMatch[0].replace(
      /\s*\/>$/,
      ` ${attrName}="${attrValue}" />`
    );
  } else {
    newOpenTag = openTagMatch[0].replace(
      /\s*>$/,
      ` ${attrName}="${attrValue}">`
    );
  }

  const newNodeSource = newOpenTag + nodeSource.slice(openTagMatch[0].length);
  return html.slice(0, start) + newNodeSource + html.slice(end);
}

/**
 * Remove an attribute from a node's own opening tag, using its sourceRange.
 */
export function removeAttributeFromSource(
  html: string,
  node: A11yNode,
  attrName: string
): string {
  if (!node.sourceRange) return html;
  const [start, end] = node.sourceRange;
  const nodeSource = html.slice(start, end);

  const openTagMatch = nodeSource.match(
    /^<[a-zA-Z][a-zA-Z0-9-]*((?:\s+[^<>"']*(?:"[^"]*"|'[^']*')*)*?)\s*(\/?)>/
  );
  if (!openTagMatch) return html;

  const attrPattern = new RegExp(
    `\\s+${attrName}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`
  );
  const newOpenTag = openTagMatch[0].replace(attrPattern, "");

  const newNodeSource = newOpenTag + nodeSource.slice(openTagMatch[0].length);
  return html.slice(0, start) + newNodeSource + html.slice(end);
}

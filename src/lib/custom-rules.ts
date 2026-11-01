import type { A11yNode, AxeFinding } from "@/types/a11y";
import {
  RULES,
  flattenTree,
  isFocusable,
  isNaturalFocusable,
  hasFocusableDescendant,
  type RuleContext,
} from "./rules";

export { RULES } from "./rules";

/**
 * Executes registered custom accessibility rules against the computed A11y tree and custom CSS.
 */
export function runCustomRules(
  root: A11yNode | null,
  css = "",
  html = ""
): readonly AxeFinding[] {
  if (!root) return [];

  const findings: AxeFinding[] = [];
  const nodes = flattenTree(root);

  // ID index for duplicate-id and broken-reference checks
  const idMap = new Map<string, A11yNode[]>();
  for (const n of nodes) {
    const rawId = n.attributes["id"]?.trim();
    if (rawId) {
      const existing = idMap.get(rawId) || [];
      existing.push(n);
      idMap.set(rawId, existing);
    }
  }

  // Heading order tracking
  const headings: Array<{ level: number; node: A11yNode }> = [];

  // Tablist containment tracking
  function isInsideTablist(target: A11yNode): boolean {
    function search(current: A11yNode): boolean {
      return (
        current.role === "tablist" || current.attributes["role"] === "tablist"
      );
    }
    function findPath(
      current: A11yNode,
      targetId: string,
      path: A11yNode[]
    ): boolean {
      if (current.id === targetId) return true;
      for (const child of current.children) {
        path.push(child);
        if (findPath(child, targetId, path)) return true;
        path.pop();
      }
      return false;
    }
    const path: A11yNode[] = [root!];
    if (findPath(root!, target.id, path)) {
      return path.some(
        (ancestor) => ancestor.id !== target.id && search(ancestor)
      );
    }
    return false;
  }

  const ctx: RuleContext = {
    root,
    nodes,
    idMap,
    headings,
    css,
    html,
    isInsideTablist,
    isFocusable,
    isNaturalFocusable,
    hasFocusableDescendant,
  };

  for (const node of nodes) {
    for (const rule of RULES) {
      if (rule.checkNode) {
        const results = rule.checkNode(node, ctx);
        if (results.length > 0) {
          findings.push(...results);
        }
      }
    }
  }

  for (const rule of RULES) {
    if (rule.checkEnd) {
      const results = rule.checkEnd(ctx);
      if (results.length > 0) {
        findings.push(...results);
      }
    }
  }

  return findings;
}

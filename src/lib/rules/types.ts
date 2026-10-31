import type { A11yNode, AxeFinding, AxeImpactLevel } from "@/types/a11y";

export interface RuleContext {
  readonly root: A11yNode;
  readonly nodes: readonly A11yNode[];
  readonly idMap: ReadonlyMap<string, A11yNode[]>;
  readonly headings: Array<{ level: number; node: A11yNode }>;
  readonly css: string;
  isInsideTablist(node: A11yNode): boolean;
  isFocusable(node: A11yNode): boolean;
  isNaturalFocusable(node: A11yNode): boolean;
  hasFocusableDescendant(node: A11yNode): boolean;
}

export interface Rule {
  readonly id: string;
  readonly impact: AxeImpactLevel;
  readonly wcag: readonly string[];
  readonly help: string;
  checkNode?(node: A11yNode, ctx: RuleContext): AxeFinding[];
  checkEnd?(ctx: RuleContext): AxeFinding[];
}

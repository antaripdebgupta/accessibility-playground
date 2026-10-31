import type { Rule } from "./types";
import { makeFinding } from "./make-finding";

export const dialogNoNameRule: Rule = {
  id: "dialog-no-name",
  impact: "serious",
  wcag: ["4.1.2"],
  help: "Dialog is missing accessible name or aria-modal",
  checkNode(node) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    if (
      node.role === "dialog" ||
      node.role === "alertdialog" ||
      tag === "dialog"
    ) {
      const hasName =
        node.hasAccessibleName && node.accessibleName.trim().length > 0;
      const isModal =
        attrs["aria-modal"] === "true" || attrs["modal"] !== undefined;

      if (!hasName || !isModal) {
        const issues: string[] = [];
        if (!hasName) {
          issues.push(
            "lacks an accessible name (use aria-labelledby or aria-label)"
          );
        }
        if (!isModal) issues.push('missing aria-modal="true"');

        return [
          makeFinding({
            id: "dialog-no-name",
            impact: "serious",
            help: "Dialog is missing accessible name or aria-modal",
            description: `Dialog <${tag} role="${node.role}"> ${issues.join(" and ")}.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Add aria-labelledby pointing to the dialog header title and add aria-modal="true".',
            node,
          }),
        ];
      }
    }
    return [];
  },
};

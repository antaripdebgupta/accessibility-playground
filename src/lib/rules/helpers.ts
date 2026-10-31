import type { A11yNode } from "@/types/a11y";

export const NATURAL_FORM_CONTROLS = new Set(["input", "textarea", "select"]);
export const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "tab",
  "checkbox",
  "radio",
  "switch",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "combobox",
  "searchbox",
  "spinbutton",
  "slider",
]);

export function isNaturalFocusable(node: A11yNode): boolean {
  const tag = node.tagName.toLowerCase();
  const attrs = node.attributes || {};
  if (attrs["disabled"] !== undefined) return false;
  if (tag === "button" || tag === "select" || tag === "textarea") return true;
  if (tag === "input" && attrs["type"] !== "hidden") return true;
  if (tag === "a" && attrs["href"] !== undefined) return true;
  if (tag === "summary") return true;
  return false;
}

export function isFocusable(node: A11yNode): boolean {
  const attrs = node.attributes || {};
  if (attrs["disabled"] !== undefined) return false;
  if (attrs["hidden"] !== undefined || attrs["inert"] !== undefined)
    return false;
  if (attrs["aria-hidden"] === "true") return false;

  const rawTab = attrs["tabindex"];
  if (rawTab !== undefined && rawTab !== null && rawTab.trim() !== "") {
    const parsed = parseInt(rawTab.trim(), 10);
    return !isNaN(parsed) && parsed >= 0;
  }
  return isNaturalFocusable(node);
}

export function hasFocusableDescendant(node: A11yNode): boolean {
  for (const child of node.children) {
    if (isFocusable(child) || hasFocusableDescendant(child)) {
      return true;
    }
  }
  return false;
}

export function flattenTree(root: A11yNode): A11yNode[] {
  const list: A11yNode[] = [];
  function traverse(n: A11yNode) {
    if (n.tagName !== "fragment") {
      list.push(n);
    }
    for (const child of n.children) {
      traverse(child);
    }
  }
  traverse(root);
  return list;
}

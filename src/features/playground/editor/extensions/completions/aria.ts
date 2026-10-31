import { syntaxTree } from "@codemirror/language";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import {
  ROLES,
  ARIA_ENUMS,
  getAllowedAriaAttributes,
} from "@/lib/aria-explorer";

export function ariaCompletionSource(
  ctx: CompletionContext
): CompletionResult | null {
  const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);

  // 1. Attribute Value completion (e.g. role="..." or aria-expanded="...")
  if (
    node.name === "AttributeValue" ||
    node.name === "UnquotedAttributeValue"
  ) {
    const attr = node.parent;
    const nameNode = attr?.getChild("AttributeName");
    if (!attr || !nameNode) return null;
    const attrName = ctx.state
      .sliceDoc(nameNode.from, nameNode.to)
      .toLowerCase();

    const quoted = /^["']/.test(ctx.state.sliceDoc(node.from, node.from + 1));
    const from = node.from + (quoted ? 1 : 0);

    if (attrName === "role") {
      const options = ROLES.map((r) => ({
        label: r.name,
        detail: r.description,
        type: "enum",
      }));
      return { from, options, validFor: /^[\w-]*$/ };
    }

    if (attrName in ARIA_ENUMS) {
      const values = ARIA_ENUMS[attrName] ?? [];
      const options = values.map((val) => ({
        label: val,
        type: "enum",
      }));
      return { from, options, validFor: /^[\w-]*$/ };
    }

    return null;
  }

  // 2. Attribute Name completion (e.g. typing aria-...)
  const word = ctx.matchBefore(/aria-[\w-]*/);
  if (word) {
    // Check if we are inside an HTML tag
    const tagNode =
      node.name === "Element" ||
      node.name === "OpenTag" ||
      node.name === "SelfClosingTag"
        ? node
        : node.parent;

    let computedRole = "generic";
    if (tagNode) {
      const roleAttr = tagNode.getChildren("Attribute").find((a) => {
        const nameNode = a.getChild("AttributeName");
        return (
          nameNode &&
          ctx.state.sliceDoc(nameNode.from, nameNode.to).toLowerCase() ===
            "role"
        );
      });
      if (roleAttr) {
        const valNode = roleAttr.getChild("AttributeValue");
        if (valNode) {
          computedRole = ctx.state
            .sliceDoc(valNode.from, valNode.to)
            .replace(/^["']|["']$/g, "")
            .trim();
        }
      }
    }

    const allowed = getAllowedAriaAttributes(computedRole);
    const options = allowed.map((attr) => ({
      label: attr,
      type: "property",
      boost: 1,
    }));

    return {
      from: word.from,
      options,
      validFor: /^aria-[\w-]*$/,
    };
  }

  return null;
}

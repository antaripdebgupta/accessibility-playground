import { syntaxTree } from "@codemirror/language";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

const ID_REF_ATTRIBUTES = new Set([
  "for",
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-owns",
  "aria-activedescendant",
  "headers",
]);

export function extractDocumentIds(docText: string): string[] {
  const ids: string[] = [];
  const regex = /\bid=["']([^"'\s>]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(docText)) !== null) {
    if (match[1] && !ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}

export function idRefCompletionSource(
  ctx: CompletionContext
): CompletionResult | null {
  const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);

  if (
    node.name !== "AttributeValue" &&
    node.name !== "UnquotedAttributeValue"
  ) {
    // Check if user is typing href="#..."
    const hrefHashMatch = ctx.matchBefore(/href=["']#[\w-]*/);
    if (hrefHashMatch) {
      const doc = ctx.state.doc.toString();
      const ids = extractDocumentIds(doc);
      const hashPos = hrefHashMatch.text.lastIndexOf("#");
      return {
        from: hrefHashMatch.from + hashPos + 1,
        options: ids.map((id) => ({
          label: id,
          type: "variable",
          detail: "ID target",
        })),
        validFor: /^[\w-]*$/,
      };
    }
    return null;
  }

  const attr = node.parent;
  const nameNode = attr?.getChild("AttributeName");
  if (!attr || !nameNode) return null;
  const attrName = ctx.state.sliceDoc(nameNode.from, nameNode.to).toLowerCase();

  if (!ID_REF_ATTRIBUTES.has(attrName)) return null;

  const doc = ctx.state.doc.toString();
  const ids = extractDocumentIds(doc);
  if (ids.length === 0) return null;

  const quoted = /^["']/.test(ctx.state.sliceDoc(node.from, node.from + 1));
  const textInside = ctx.state.sliceDoc(node.from + (quoted ? 1 : 0), ctx.pos);
  const lastSpace = textInside.lastIndexOf(" ");
  const from =
    node.from + (quoted ? 1 : 0) + (lastSpace >= 0 ? lastSpace + 1 : 0);

  return {
    from,
    options: ids.map((id) => ({
      label: id,
      type: "variable",
      detail: "Document ID",
    })),
    validFor: /^[\w-]*$/,
  };
}

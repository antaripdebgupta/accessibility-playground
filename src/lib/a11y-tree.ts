import type { A11yNode } from "@/types/a11y";
import { computeAccessibleName } from "./accessible-name";
import { getComputedRole } from "./aria-explorer";

export interface ParseResult {
  ast: A11yNode | null;
  instrumentedHtml: string;
  error: string | null;
  warnings?: readonly string[];
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

interface TagRange {
  tagName: string;
  start: number;
  end: number;
}

function extractTagRanges(html: string): {
  tagRanges: TagRange[];
  unclosedTags: string[];
} {
  const tagRegex = /<(\/)?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  const allNodes: TagRange[] = [];
  const stack: TagRange[] = [];

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html)) !== null) {
    const isClosing = match[1] === "/";
    const tagName = match[2]?.toLowerCase() ?? "";
    const startIndex = match.index;
    const matchLength = match[0].length;

    if (isClosing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const item = stack[i];
        if (item && item.tagName === tagName) {
          item.end = startIndex + matchLength;
          stack.splice(i, 1);
          break;
        }
      }
    } else {
      const isSelfClosing =
        match[3]?.trim().endsWith("/") || VOID_ELEMENTS.has(tagName);
      const node: TagRange = {
        tagName,
        start: startIndex,
        end: startIndex + matchLength,
      };
      allNodes.push(node);
      if (!isSelfClosing) {
        stack.push(node);
      }
    }
  }

  return {
    tagRanges: allNodes,
    unclosedTags: stack.map((item) => item.tagName),
  };
}

export function parseHtmlToA11yTree(html: string): ParseResult {
  const trimmed = html.trim();
  if (!trimmed) {
    return { ast: null, instrumentedHtml: "", error: null };
  }

  if (typeof window === "undefined") {
    return { ast: null, instrumentedHtml: "", error: null };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "text/html");

  const baseOffset = html.indexOf(trimmed);
  const { tagRanges, unclosedTags } = extractTagRanges(trimmed);
  const warnings: string[] = [];
  if (unclosedTags.length > 0) {
    warnings.push(
      `Unclosed HTML tag(s) detected: <${unclosedTags.join(">, <")}>.`
    );
  }

  let tagRangeIndex = 0;
  let counter = 0;

  function processElement(element: Element): A11yNode {
    counter += 1;
    const a11yId = `a11y-${counter}`;
    element.setAttribute("data-a11y-id", a11yId);

    const elTagName = element.tagName.toLowerCase();
    let sourceRange: [number, number] | undefined;

    // Match with sequential pre-order tag range
    while (tagRangeIndex < tagRanges.length) {
      const candidate = tagRanges[tagRangeIndex];
      tagRangeIndex += 1;
      if (candidate && candidate.tagName === elTagName) {
        sourceRange = [
          baseOffset + candidate.start,
          baseOffset + candidate.end,
        ];
        break;
      }
    }

    const { implicitRole, explicitRole, computedRole } =
      getComputedRole(element);
    const { name, source, hasAccessibleName } = computeAccessibleName(
      element,
      doc
    );

    const attributes: Record<string, string> = {};
    const inlineHandlers: string[] = [];
    const ariaAttributes: Record<string, string> = {};

    for (const attr of Array.from(element.attributes)) {
      const lower = attr.name.toLowerCase();
      attributes[lower] = attr.value;
      if (lower.startsWith("on")) {
        inlineHandlers.push(lower);
      }
      if (lower.startsWith("aria-")) {
        ariaAttributes[lower] = attr.value;
      }
    }

    const children: A11yNode[] = [];
    for (const child of Array.from(element.children)) {
      children.push(processElement(child));
    }

    return {
      id: a11yId,
      tagName: elTagName,
      role: computedRole,
      implicitRole,
      explicitRole,
      accessibleName: name,
      accessibleNameSource: source,
      ariaAttributes,
      attributes,
      hasInlineHandler: inlineHandlers.length > 0,
      inlineHandlers,
      hasAccessibleName,
      children,
      sourceRange,
    };
  }

  const bodyChildren = Array.from(doc.body.children);
  if (bodyChildren.length === 0) {
    return {
      ast: null,
      instrumentedHtml: "",
      error: "No HTML elements found in input.",
      warnings,
    };
  }

  let rootNode: A11yNode;
  if (bodyChildren.length === 1 && bodyChildren[0]) {
    rootNode = processElement(bodyChildren[0]);
  } else {
    // If multiple root elements, wrap in virtual container node
    counter += 1;
    const virtualId = `a11y-${counter}`;
    const childrenNodes = bodyChildren.map((el) => processElement(el));
    rootNode = {
      id: virtualId,
      tagName: "fragment",
      role: "generic",
      implicitRole: "generic",
      accessibleName: "Root Fragment",
      accessibleNameSource: "synthetic container",
      ariaAttributes: {},
      attributes: {},
      hasInlineHandler: false,
      inlineHandlers: [],
      hasAccessibleName: true,
      children: childrenNodes,
    };
  }

  return {
    ast: rootNode,
    instrumentedHtml: doc.body.innerHTML,
    error: null,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function findA11yNodeById(
  root: A11yNode | null,
  id: string
): A11yNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findA11yNodeById(child, id);
    if (found) return found;
  }
  return null;
}

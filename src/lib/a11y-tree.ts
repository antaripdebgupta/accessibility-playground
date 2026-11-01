import type { A11yNode } from "@/types/a11y";
import { fnv1a } from "./hash";
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

export function getElementStructuralPath(element: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (
    current &&
    current.parentElement &&
    current !== current.ownerDocument.body
  ) {
    const parent: Element = current.parentElement!;
    const tag = current.tagName.toLowerCase();
    let sameTagIndex = 0;
    for (const sibling of Array.from(parent.children) as Element[]) {
      if (sibling === current) break;
      if (sibling.tagName.toLowerCase() === tag) {
        sameTagIndex++;
      }
    }
    segments.unshift(`${tag}[${sameTagIndex}]`);
    current = parent;
  }

  if (segments.length === 0) {
    segments.push(`${element.tagName.toLowerCase()}[0]`);
  }

  return segments.join(">");
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

  function processElement(element: Element): A11yNode {
    const path = getElementStructuralPath(element);
    const a11yId = `a11y-${fnv1a(path)}`;
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
    const virtualId = "a11y-root";
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

export interface RematchCriteria {
  readonly id?: string;
  readonly tagName: string;
  readonly accessibleName?: string;
  readonly sourceRange?: readonly [number, number];
}

export function rematchA11yNode(
  previous: RematchCriteria | null | undefined,
  root: A11yNode | null
): A11yNode | null {
  if (!previous || !root) return null;

  const allNodes: A11yNode[] = [];
  function collect(node: A11yNode) {
    if (node.tagName !== "fragment") {
      allNodes.push(node);
    }
    for (const child of node.children) {
      collect(child);
    }
  }
  collect(root);

  // Exact ID match first if characteristics still match
  if (previous.id) {
    const exact = allNodes.find((n) => n.id === previous.id);
    if (exact) {
      if (
        !previous.accessibleName ||
        exact.accessibleName.toLowerCase() ===
          previous.accessibleName.toLowerCase()
      ) {
        return exact;
      }
      // If accessibleName differed, exact structural index was occupied by an inserted sibling!
      // Fall through to characteristic scoring.
    }
  }

  // Filter candidates by same tag name
  const sameTag = allNodes.filter(
    (n) => n.tagName.toLowerCase() === previous.tagName.toLowerCase()
  );
  if (sameTag.length === 0) return null;
  if (sameTag.length === 1) return sameTag[0]!;

  // Score each candidate
  let bestCandidate: A11yNode | null = null;
  let bestScore = -Infinity;

  const prevOffset = previous.sourceRange ? previous.sourceRange[0] : null;
  const prevName = previous.accessibleName?.trim().toLowerCase();

  for (const candidate of sameTag) {
    let score = 0;

    // Accessible name match: high confidence
    const candidateName = candidate.accessibleName?.trim().toLowerCase();
    if (prevName && candidateName) {
      if (candidateName === prevName) {
        score += 1000;
      }
    }

    // Source offset proximity
    if (prevOffset !== null && candidate.sourceRange) {
      const distance = Math.abs(candidate.sourceRange[0] - prevOffset);
      score += Math.max(0, 500 - distance);
    }

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate || sameTag[0] || null;
}

/**
 * Finds the deepest A11yNode in the AST whose sourceRange contains the given text offset.
 */
export function findA11yNodeAtOffset(
  root: A11yNode | null,
  offset: number
): A11yNode | null {
  if (!root) return null;

  let candidate: A11yNode | null = null;
  if (
    root.sourceRange &&
    offset >= root.sourceRange[0] &&
    offset <= root.sourceRange[1]
  ) {
    candidate = root;
  }

  for (const child of root.children) {
    const childMatch = findA11yNodeAtOffset(child, offset);
    if (childMatch) {
      return childMatch;
    }
  }

  return candidate;
}

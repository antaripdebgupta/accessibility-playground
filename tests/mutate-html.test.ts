import { describe, it, expect } from "vitest";
import {
  setAttributeInSource,
  removeAttributeFromSource,
} from "@/lib/mutate-html";
import type { A11yNode } from "@/types/a11y";

function makeNode(overrides: Partial<A11yNode>): A11yNode {
  return {
    id: "test",
    tagName: "div",
    role: "generic",
    implicitRole: "generic",
    accessibleName: "",
    accessibleNameSource: "none",
    hasAccessibleName: false,
    hasInlineHandler: false,
    inlineHandlers: [],
    ariaAttributes: {},
    attributes: {},
    children: [],
    ...overrides,
  };
}

describe("mutate-html helpers", () => {
  it("adds an attribute to an element without existing attributes", () => {
    const html = "<button>Click</button>";
    const node = makeNode({
      tagName: "button",
      sourceRange: [0, html.length],
    });

    const result = setAttributeInSource(html, node, "aria-expanded", "true");
    expect(result).toBe('<button aria-expanded="true">Click</button>');
  });

  it("updates an existing attribute value", () => {
    const html = '<button aria-expanded="false" class="nav">Click</button>';
    const node = makeNode({
      tagName: "button",
      sourceRange: [0, html.length],
    });

    const result = setAttributeInSource(html, node, "aria-expanded", "true");
    expect(result).toBe(
      '<button aria-expanded="true" class="nav">Click</button>'
    );
  });

  it("removes an attribute cleanly", () => {
    const html = '<button aria-expanded="false" class="nav">Click</button>';
    const node = makeNode({
      tagName: "button",
      sourceRange: [0, html.length],
    });

    const result = removeAttributeFromSource(html, node, "aria-expanded");
    expect(result).toBe('<button class="nav">Click</button>');
  });

  it("does not mutate siblings when modifying a specific node via sourceRange", () => {
    const partA = '<button aria-expanded="false">A</button>';
    const partB = '<button aria-expanded="false">B</button>';
    const html = `<div>${partA}${partB}</div>`;

    const startB = html.indexOf(partB);
    const endB = startB + partB.length;

    const nodeB = makeNode({
      tagName: "button",
      sourceRange: [startB, endB],
    });

    const result = setAttributeInSource(html, nodeB, "aria-expanded", "true");
    expect(result).toBe(
      '<div><button aria-expanded="false">A</button><button aria-expanded="true">B</button></div>'
    );
  });

  it("does not mutate child attributes when mutating parent", () => {
    const parentOpen = '<div aria-hidden="true">';
    const child = '<span aria-hidden="true">Text</span>';
    const parentClose = "</div>";
    const html = `${parentOpen}${child}${parentClose}`;

    const parentNode = makeNode({
      tagName: "div",
      sourceRange: [0, html.length],
    });

    const result = removeAttributeFromSource(html, parentNode, "aria-hidden");
    expect(result).toBe('<div><span aria-hidden="true">Text</span></div>');
  });

  it("does not mutate parent attributes when mutating child", () => {
    const parentOpen = '<div aria-hidden="true">';
    const child = '<span aria-hidden="true">Text</span>';
    const parentClose = "</div>";
    const html = `${parentOpen}${child}${parentClose}`;

    const startChild = html.indexOf(child);
    const endChild = startChild + child.length;

    const childNode = makeNode({
      tagName: "span",
      sourceRange: [startChild, endChild],
    });

    const result = removeAttributeFromSource(html, childNode, "aria-hidden");
    expect(result).toBe('<div aria-hidden="true"><span>Text</span></div>');
  });

  it("handles self-closing/void elements", () => {
    const html = '<img src="cat.png" alt="kitty" />';
    const node = makeNode({
      tagName: "img",
      sourceRange: [0, html.length],
    });

    const result = setAttributeInSource(html, node, "role", "presentation");
    expect(result).toBe(
      '<img src="cat.png" alt="kitty" role="presentation" />'
    );
  });
});

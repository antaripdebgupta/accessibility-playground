import { describe, it, expect } from "vitest";
import {
  parseHtmlToA11yTree,
  findA11yNodeById,
  rematchA11yNode,
} from "@/lib/a11y-tree";
import type { A11yNode } from "@/types/a11y";

describe("Stable Node Identity & Re-matching (P0-A)", () => {
  const sampleHtml = `
<header>
  <nav aria-label="Main">
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <h1>Accessibility Playground</h1>
  <button type="button" id="submit-btn">Submit Form</button>
</main>
`;

  it("same HTML twice produces identical structural IDs", () => {
    const parse1 = parseHtmlToA11yTree(sampleHtml);
    const parse2 = parseHtmlToA11yTree(sampleHtml);

    expect(parse1.ast).not.toBeNull();
    expect(parse2.ast).not.toBeNull();

    function collectIds(node: A11yNode): string[] {
      const ids = [node.id];
      for (const child of node.children) {
        ids.push(...collectIds(child));
      }
      return ids;
    }

    const ids1 = collectIds(parse1.ast!);
    const ids2 = collectIds(parse2.ast!);

    expect(ids1).toEqual(ids2);
  });

  it("inserting an unrelated element above does NOT change IDs of untouched elements in other subtrees", () => {
    const originalTree = parseHtmlToA11yTree(sampleHtml).ast!;
    // Find the button in <main>
    const originalButton = originalTree.children
      .flatMap((c) => (c.tagName === "main" ? c.children : []))
      .find((c) => c.tagName === "button");

    expect(originalButton).toBeDefined();
    const originalButtonId = originalButton!.id;

    // Mutate <header> by adding a new banner paragraph
    const editedHtml = `
<header>
  <p class="announcement">New Announcement!</p>
  <nav aria-label="Main">
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <h1>Accessibility Playground</h1>
  <button type="button" id="submit-btn">Submit Form</button>
</main>
`;

    const editedTree = parseHtmlToA11yTree(editedHtml).ast!;
    const editedButton = editedTree.children
      .flatMap((c) => (c.tagName === "main" ? c.children : []))
      .find((c) => c.tagName === "button");

    expect(editedButton).toBeDefined();
    // In other subtrees (like <main>), structural ID is completely unaffected!
    expect(editedButton!.id).toBe(originalButtonId);
  });

  it("selection re-match works for the common 'add a line above' edit", () => {
    const initialHtml = `<main>
  <button type="button">Primary Action</button>
</main>`;
    const initialTree = parseHtmlToA11yTree(initialHtml).ast!;
    const initialButton =
      findA11yNodeById(initialTree, initialTree.children[0]!.id) ||
      initialTree.children[0]!;

    // Now insert a sibling before the button
    const modifiedHtml = `<main>
  <button type="button">Added Sibling</button>
  <button type="button">Primary Action</button>
</main>`;
    const modifiedTree = parseHtmlToA11yTree(modifiedHtml).ast!;

    // Because a same-tag sibling was added before it, its structural index changed.
    // rematchA11yNode should accurately match it by accessibleName "Primary Action"!
    const rematched = rematchA11yNode(
      {
        id: initialButton.id,
        tagName: initialButton.tagName,
        accessibleName: initialButton.accessibleName,
        sourceRange: initialButton.sourceRange,
      },
      modifiedTree
    );

    expect(rematched).not.toBeNull();
    expect(rematched?.accessibleName).toBe("Primary Action");
  });
});

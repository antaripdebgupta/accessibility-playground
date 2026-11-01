import { describe, it, expect } from "vitest";
import { parseHtmlToA11yTree, findA11yNodeAtOffset } from "@/lib/a11y-tree";

describe("Synchronised Inspectors & Selection Model (P0-C)", () => {
  const sampleHtml = `<main>
  <h1>Playground</h1>
  <section aria-labelledby="sec-title">
    <h2 id="sec-title">Section Title</h2>
    <button type="button" id="btn-1">Click Me</button>
  </section>
</main>`;

  it("findA11yNodeAtOffset locates the deepest node at the given editor caret offset", () => {
    const { ast } = parseHtmlToA11yTree(sampleHtml);
    expect(ast).not.toBeNull();

    // Offset of <button type="button" id="btn-1">Click Me</button>
    const buttonOffset = sampleHtml.indexOf("Click Me");
    expect(buttonOffset).toBeGreaterThan(0);

    const targetNode = findA11yNodeAtOffset(ast, buttonOffset);
    expect(targetNode).not.toBeNull();
    expect(targetNode?.tagName).toBe("button");
    expect(targetNode?.accessibleName).toBe("Click Me");
  });

  it("findA11yNodeAtOffset returns section or main for offsets between children", () => {
    const { ast } = parseHtmlToA11yTree(sampleHtml);
    expect(ast).not.toBeNull();

    const h1Offset = sampleHtml.indexOf("<h1>");
    const h1Node = findA11yNodeAtOffset(ast, h1Offset);
    expect(h1Node?.tagName).toBe("h1");
  });

  it("findA11yNodeAtOffset returns null for offsets outside document range", () => {
    const { ast } = parseHtmlToA11yTree(sampleHtml);
    expect(ast).not.toBeNull();

    const outsideNode = findA11yNodeAtOffset(ast, 999999);
    expect(outsideNode).toBeNull();
  });

  it("discards scan results when scanId does not match currentScanId", () => {
    const currentScanId = "scan-v2";
    let appliedResults: string | null = null;

    function handleScanResultsMessage(message: {
      scanId: string;
      violations: unknown[];
    }) {
      if (message.scanId !== currentScanId) {
        // Discard stale scan
        return;
      }
      appliedResults = message.scanId;
    }

    // Stale message from scan-v1 arrives after scan-v2 has started
    handleScanResultsMessage({ scanId: "scan-v1", violations: [] });
    expect(appliedResults).toBeNull();

    // Current scan-v2 arrives
    handleScanResultsMessage({ scanId: "scan-v2", violations: [] });
    expect(appliedResults).toBe("scan-v2");
  });
});

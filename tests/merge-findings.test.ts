import { describe, it, expect } from "vitest";
import { mergeFindings, isEquivalentRule } from "@/lib/merge-findings";
import type { AxeFinding } from "@/types/a11y";

function createFinding(id: string, targetId: string, fix?: string): AxeFinding {
  return {
    id,
    impact: "serious",
    description: "test description",
    help: "test help",
    helpUrl: "https://example.com",
    fix,
    nodes: [
      {
        target: [targetId],
        targetId,
        html: `<div id="${targetId}"></div>`,
        failureSummary: "failed",
      },
    ],
  };
}

describe("mergeFindings", () => {
  it("recognizes equivalent axe and custom rules", () => {
    expect(isEquivalentRule("image-alt", "img-missing-alt")).toBe(true);
    expect(isEquivalentRule("tabindex", "positive-tabindex")).toBe(true);
    expect(isEquivalentRule("link-name", "empty-interactive-name")).toBe(true);
    expect(isEquivalentRule("button-name", "empty-interactive-name")).toBe(
      true
    );
    expect(isEquivalentRule("label", "input-no-label")).toBe(true);
    expect(isEquivalentRule("duplicate-id", "duplicate-id")).toBe(true);
    expect(isEquivalentRule("image-alt", "heading-order")).toBe(false);
  });

  it("deduplicates findings on matching target and copies fix over", () => {
    const axe = [createFinding("image-alt", "img-1")];
    const custom = [createFinding("img-missing-alt", "img-1", 'alt=""')];

    const merged = mergeFindings(custom, axe);
    expect(merged.length).toBe(1);
    expect(merged[0]?.id).toBe("image-alt");
    expect(merged[0]?.fix).toBe('alt=""');
  });

  it("keeps distinct findings from both axe and custom sets", () => {
    const axe = [createFinding("color-contrast", "node-1")];
    const custom = [createFinding("heading-order", "h2-1")];

    const merged = mergeFindings(custom, axe);
    expect(merged.length).toBe(2);
    expect(merged.map((f) => f.id)).toEqual([
      "color-contrast",
      "heading-order",
    ]);
  });
});

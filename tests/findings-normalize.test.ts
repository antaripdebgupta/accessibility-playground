import { describe, it, expect } from "vitest";
import {
  normalizeFindings,
  computeFindingFingerprint,
  isEquivalentRule,
} from "@/lib/findings/normalize";
import type { AxeFinding } from "@/types/a11y";

describe("Normalized Finding Model & Deduplication (P0-A)", () => {
  it("computes deterministic fingerprints", () => {
    const fp1 = computeFindingFingerprint(
      "image-alt",
      "a11y-1234",
      '<img src="cat.jpg">'
    );
    const fp2 = computeFindingFingerprint(
      "image-alt",
      "a11y-1234",
      '<img  src="cat.jpg"  data-a11y-id="a11y-1234">'
    );
    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(8);
  });

  it("recognizes equivalent rules using rule definitions", () => {
    expect(isEquivalentRule("image-alt", "img-missing-alt")).toBe(true);
    expect(isEquivalentRule("tabindex", "positive-tabindex")).toBe(true);
    expect(isEquivalentRule("link-name", "empty-interactive-name")).toBe(true);
    expect(isEquivalentRule("button-name", "empty-interactive-name")).toBe(
      true
    );
    expect(isEquivalentRule("label", "input-no-label")).toBe(true);
    expect(isEquivalentRule("aria-hidden-focus", "aria-hidden-focusable")).toBe(
      true
    );
    expect(isEquivalentRule("duplicate-id", "duplicate-id")).toBe(true);
    expect(isEquivalentRule("aria-valid-attr-value", "invalid-aria")).toBe(
      true
    );
    // Unrelated rules are NOT equivalent
    expect(isEquivalentRule("tabindex", "empty-interactive-name")).toBe(false);
  });

  it("normalizes axe violations, incomplete checks, and custom rules with distinct statuses and confidence", () => {
    const axeViolation: AxeFinding = {
      id: "image-alt",
      impact: "critical",
      description: "Images must have alt text",
      help: "Image missing alt",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
      wcag: ["1.1.1"],
      nodes: [
        {
          html: '<img src="dog.jpg">',
          target: ["img"],
          targetId: "a11y-1",
        },
      ],
    };

    const axeIncomplete: AxeFinding = {
      id: "color-contrast",
      impact: "serious",
      description: "Color contrast needs review",
      help: "Check color contrast",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
      wcag: ["1.4.3", "1.4.11"],
      nodes: [
        {
          html: "<button>Submit</button>",
          target: ["button"],
          targetId: "a11y-2",
        },
      ],
    };

    const customFinding: AxeFinding = {
      id: "link-as-button",
      impact: "serious",
      description: "Anchor behaves like button",
      help: "Anchor used as button",
      helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
      wcag: ["4.1.2"],
      nodes: [
        {
          html: '<a href="#" onclick="run()">Click</a>',
          target: ['[data-a11y-id="a11y-3"]'],
          targetId: "a11y-3",
        },
      ],
    };

    const normalized = normalizeFindings(
      [customFinding],
      [axeViolation],
      [axeIncomplete]
    );

    expect(normalized).toHaveLength(3);

    const normAxe = normalized.find((f) => f.ruleId === "image-alt")!;
    expect(normAxe.engine).toBe("axe-core");
    expect(normAxe.status).toBe("violation");
    expect(normAxe.confidence).toBe("high");
    expect(normAxe.wcag).toEqual([{ id: "1.1.1", version: "2.0", level: "A" }]);

    const normIncomplete = normalized.find(
      (f) => f.ruleId === "color-contrast"
    )!;
    expect(normIncomplete.engine).toBe("axe-core");
    expect(normIncomplete.status).toBe("needs-review");
    expect(normIncomplete.confidence).toBe("medium");
    expect(normIncomplete.wcag).toEqual([
      { id: "1.4.3", version: "2.0", level: "AA" },
      { id: "1.4.11", version: "2.1", level: "AA" },
    ]);

    const normCustom = normalized.find((f) => f.ruleId === "link-as-button")!;
    expect(normCustom.engine).toBe("playground");
    expect(normCustom.status).toBe("violation");
    expect(normCustom.confidence).toBe("medium");
  });

  it("deduplicates per node and inherits custom fix without merging unrelated issues on the same node", () => {
    // Both axe and custom detect missing alt on the same element a11y-1
    const axeViolation: AxeFinding = {
      id: "image-alt",
      impact: "critical",
      description: "Images must have alt text",
      help: "Image missing alt",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
      nodes: [
        { html: '<img src="pic.jpg">', target: ["img"], targetId: "a11y-1" },
      ],
    };

    const customAlt: AxeFinding = {
      id: "img-missing-alt",
      impact: "critical",
      description: "Missing alt attribute",
      help: "Image is missing alt attribute",
      helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#non-text-content",
      fix: 'Add alt="description"',
      nodes: [
        {
          html: '<img src="pic.jpg">',
          target: ['[data-a11y-id="a11y-1"]'],
          targetId: "a11y-1",
        },
      ],
    };

    // Another failure on the same element a11y-1: positive tabindex
    const customTabindex: AxeFinding = {
      id: "positive-tabindex",
      impact: "serious",
      description: "Positive tabindex",
      help: "Positive tabindex attribute disrupts natural tab order",
      helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#focus-order",
      nodes: [
        {
          html: '<img src="pic.jpg" tabindex="1">',
          target: ['[data-a11y-id="a11y-1"]'],
          targetId: "a11y-1",
        },
      ],
    };

    const findings = normalizeFindings(
      [customAlt, customTabindex],
      [axeViolation]
    );

    // image-alt should be deduplicated (1 finding for image-alt inheriting fix),
    // while positive-tabindex stays distinct!
    expect(findings).toHaveLength(2);

    const imageFinding = findings.find((f) => f.ruleId === "image-alt")!;
    expect(imageFinding).toBeDefined();
    expect(imageFinding.fix).toBe('Add alt="description"');

    const tabindexFinding = findings.find(
      (f) => f.ruleId === "positive-tabindex"
    )!;
    expect(tabindexFinding).toBeDefined();
  });
});

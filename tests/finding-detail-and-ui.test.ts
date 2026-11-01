import { describe, it, expect } from "vitest";
import type { Finding } from "@/types/a11y";
import { generateContextualFix } from "@/features/playground/FindingDetail";
import { normalizeFindings } from "@/lib/findings/normalize";

describe("Finding Detail & UI Logic (P0-B)", () => {
  const mockBaseFinding: Finding = {
    fingerprint: "fp-123",
    ruleId: "img-missing-alt",
    engine: "playground",
    status: "violation",
    confidence: "high",
    impact: "critical",
    wcag: [{ id: "1.1.1", version: "2.0", level: "A" }],
    help: "Images must have alt text",
    description: "Ensures <img> elements have alternate text",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
    nodes: [
      {
        html: '<img src="avatar.jpg" class="rounded">',
        target: ["img"],
        targetId: "a11y-img-1",
      },
    ],
  };

  describe("Contextual Fix Generator", () => {
    it("generates contextual fix for img-missing-alt by inserting alt attribute", () => {
      const fix = generateContextualFix(
        mockBaseFinding,
        '<img src="test.png" alt="Test">'
      );
      expect(fix).toContain('alt="Meaningful description of the image"');
      expect(fix).toContain('src="avatar.jpg"');
    });

    it("generates contextual fix for button-name by adding aria-label", () => {
      const buttonFinding: Finding = {
        ...mockBaseFinding,
        ruleId: "button-name",
        nodes: [
          {
            html: '<button type="button" class="btn"><svg></svg></button>',
            target: ["button"],
          },
        ],
      };
      const fix = generateContextualFix(
        buttonFinding,
        "<button>Action</button>"
      );
      expect(fix).toContain('aria-label="Action description"');
      expect(fix).toContain('type="button"');
    });

    it("generates contextual fix for link-name by adding aria-label", () => {
      const linkFinding: Finding = {
        ...mockBaseFinding,
        ruleId: "link-name",
        nodes: [
          {
            html: '<a href="/dashboard"><svg></svg></a>',
            target: ["a"],
          },
        ],
      };
      const fix = generateContextualFix(
        linkFinding,
        '<a href="/dashboard">Dashboard</a>'
      );
      expect(fix).toContain('aria-label="Destination description"');
    });

    it("generates contextual fix for input-no-label with matching label for/id", () => {
      const inputFinding: Finding = {
        ...mockBaseFinding,
        ruleId: "input-no-label",
        nodes: [
          {
            html: '<input type="email" id="user-email" placeholder="you@domain.com">',
            target: ["input"],
          },
        ],
      };
      const fix = generateContextualFix(
        inputFinding,
        "<label>Email</label><input>"
      );
      expect(fix).toContain('<label for="user-email">');
      expect(fix).toContain('id="user-email"');
    });

    it("falls back to default good example when rule does not support contextual synthesis", () => {
      const otherFinding: Finding = {
        ...mockBaseFinding,
        ruleId: "duplicate-id",
        nodes: [{ html: '<div id="dup"></div>', target: ["div"] }],
      };
      const fix = generateContextualFix(
        otherFinding,
        '<div id="unique-id"></div>'
      );
      expect(fix).toBe('<div id="unique-id"></div>');
    });
  });

  describe("Status and Severity Separation", () => {
    it("keeps violation and needs-review counts separated in normalized output", () => {
      const normalized = normalizeFindings(
        [
          {
            id: "img-missing-alt",
            impact: "critical",
            description: "Missing alt",
            help: "Image alt required",
            helpUrl: "https://example.com",
            nodes: [{ html: "<img>", target: ["img"] }],
          },
        ],
        [],
        [
          {
            id: "color-contrast",
            impact: "serious",
            description: "Contrast uncertain",
            help: "Check color contrast",
            helpUrl: "https://example.com",
            nodes: [{ html: "<p>Text</p>", target: ["p"] }],
          },
        ]
      );

      const violations = normalized.filter((f) => f.status === "violation");
      const needsReview = normalized.filter((f) => f.status === "needs-review");

      expect(violations).toHaveLength(1);
      expect(needsReview).toHaveLength(1);
      expect(violations[0]!.ruleId).toBe("img-missing-alt");
      expect(needsReview[0]!.ruleId).toBe("color-contrast");
    });
  });
});

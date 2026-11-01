import { describe, it, expect } from "vitest";
import { STARTER_TEMPLATES } from "@/data/templates";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import { runCustomRules } from "@/lib/custom-rules";

describe("Starter Templates Audit (W8 False Positives Resolution)", () => {
  it("verifies all starter templates parse cleanly", () => {
    for (const template of STARTER_TEMPLATES) {
      const result = parseHtmlToA11yTree(template.html);
      expect(
        result.error,
        `Template ${template.id} should not produce parse error`
      ).toBeNull();
      expect(
        result.ast,
        `Template ${template.id} should produce an AST`
      ).not.toBeNull();
    }
  });

  it("verifies accessible starter templates produce 0 playground rule violations", () => {
    const accessibleTemplates = [
      "welcome",
      "form-field",
      "dialog",
      "tabs",
      "nav-menu",
      "accordion",
      "combobox",
      "data-table",
      "image-alt",
      "live-region",
      "custom-switch",
      "tailwind-form-field",
      "tailwind-tabs",
    ];

    for (const id of accessibleTemplates) {
      const template = STARTER_TEMPLATES.find((t) => t.id === id);
      expect(template, `Template ${id} must exist`).toBeDefined();

      const parseResult = parseHtmlToA11yTree(template!.html);
      const findings = runCustomRules(
        parseResult.ast,
        template!.css || "",
        template!.html
      );

      expect(
        findings.map((f) => ({ id: f.id, help: f.help })),
        `Template "${id}" must not produce false positive violations`
      ).toEqual([]);
    }
  });

  it("verifies deliberately broken starter templates produce their intended teaching findings", () => {
    const teachingIntentExpected: Record<string, string> = {
      "bad-div-button": "click-on-non-interactive",
      "link-as-button": "link-as-button",
      "input-placeholder-only": "input-placeholder-only",
      "outline-removed": "outline-removed",
    };

    for (const [templateId, expectedRuleId] of Object.entries(
      teachingIntentExpected
    )) {
      const template = STARTER_TEMPLATES.find((t) => t.id === templateId);
      expect(template, `Template ${templateId} must exist`).toBeDefined();

      const parseResult = parseHtmlToA11yTree(template!.html);
      const findings = runCustomRules(
        parseResult.ast,
        template!.css || "",
        template!.html
      );

      const hasExpected = findings.some((f) => f.id === expectedRuleId);
      expect(
        hasExpected,
        `Teaching template "${templateId}" must trigger rule "${expectedRuleId}"`
      ).toBe(true);
    }
  });
});

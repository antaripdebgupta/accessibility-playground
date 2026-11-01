import { describe, it, expect } from "vitest";
import { RULES } from "@/lib/rules";
import { RULE_KNOWLEDGE, getRuleKnowledge } from "@/data/rule-knowledge";

describe("Rule Knowledge Registry (P0-B)", () => {
  const ALLOWED_DOMAINS = [
    "www.w3.org",
    "w3.org",
    "developer.mozilla.org",
    "dequeuniversity.com",
  ];

  it("every playground rule in RULES has an entry in RULE_KNOWLEDGE", () => {
    for (const rule of RULES) {
      const entry = getRuleKnowledge(rule.id);
      expect(
        entry,
        `Missing knowledge entry for playground rule: ${rule.id}`
      ).toBeDefined();
      expect(entry?.ruleId).toBe(rule.id);
      expect(entry?.whatIsHappening.length).toBeGreaterThan(10);
      expect(entry?.whyItMatters.length).toBeGreaterThan(10);
      expect(entry?.badExample.length).toBeGreaterThan(0);
      expect(entry?.goodExample.length).toBeGreaterThan(0);
      expect(entry?.whyFixWorks.length).toBeGreaterThan(10);
      expect(entry?.howToVerify.length).toBeGreaterThan(0);
      expect(entry?.resources.length).toBeGreaterThan(0);
    }
  });

  it("every inspector value is valid", () => {
    const validInspectors = new Set([
      "tree",
      "aria",
      "accname",
      "focus",
      "announce",
    ]);

    for (const entry of RULE_KNOWLEDGE) {
      expect(
        validInspectors.has(entry.inspector),
        `Invalid inspector '${entry.inspector}' for rule '${entry.ruleId}'`
      ).toBe(true);
    }
  });

  it("every resource URL uses https and is on the allowlist", () => {
    for (const entry of RULE_KNOWLEDGE) {
      for (const res of entry.resources) {
        expect(res.url.startsWith("https://")).toBe(true);
        const url = new URL(res.url);
        const isAllowed = ALLOWED_DOMAINS.some(
          (domain) =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );
        expect(
          isAllowed,
          `Resource URL domain not on allowlist: ${res.url} (rule: ${entry.ruleId})`
        ).toBe(true);
      }
    }
  });

  it("whoIsAffected array contains valid categories", () => {
    const validCategories = new Set([
      "screen-reader",
      "keyboard",
      "magnification",
      "voice-control",
      "switch-device",
      "low-vision-contrast",
    ]);

    for (const entry of RULE_KNOWLEDGE) {
      expect(entry.whoIsAffected.length).toBeGreaterThan(0);
      for (const cat of entry.whoIsAffected) {
        expect(validCategories.has(cat)).toBe(true);
      }
    }
  });
});

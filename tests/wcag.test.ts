import { describe, it, expect } from "vitest";
import { WCAG_CRITERIA, WCAG_CRITERIA_BY_ID } from "@/data/wcag";
import { PATTERNS } from "@/data/patterns";

describe("WCAG Dataset completeness", () => {
  it("contains more than 50 criteria across WCAG 2.2", () => {
    expect(WCAG_CRITERIA.length).toBeGreaterThan(50);
  });

  it("resolves all WCAG IDs cited in PATTERNS", () => {
    const citedIds = new Set<string>();
    for (const pattern of PATTERNS) {
      for (const id of pattern.wcagCriteria) {
        citedIds.add(id);
      }
    }

    for (const id of citedIds) {
      const criterion = WCAG_CRITERIA_BY_ID.get(id);
      expect(
        criterion,
        `WCAG criterion ${id} cited in patterns must exist`
      ).toBeDefined();
    }
  });

  it("resolves all WCAG IDs cited in custom-rules.ts", () => {
    const citedIds = [
      "1.1.1",
      "1.3.1",
      "2.1.1",
      "2.1.2",
      "2.4.3",
      "2.4.7",
      "2.4.11",
      "3.3.1",
      "3.3.2",
      "4.1.2",
    ];

    for (const id of citedIds) {
      const criterion = WCAG_CRITERIA_BY_ID.get(id);
      expect(
        criterion,
        `WCAG criterion ${id} cited in custom-rules must exist`
      ).toBeDefined();
    }
  });
});

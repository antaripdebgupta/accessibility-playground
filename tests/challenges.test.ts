import { describe, it, expect } from "vitest";
import { CHALLENGES, getChallengeById } from "@/data/challenges";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import { runCustomRules } from "@/lib/custom-rules";

/**
 * Helper: parse HTML and run playground custom rules, returning the set of
 * triggered rule IDs. (Axe-core runs in-browser, so we can only verify
 * playground rules in unit tests.)
 */
function getTriggeredRuleIds(html: string, css?: string): string[] {
  const { ast } = parseHtmlToA11yTree(html);
  if (!ast) return [];
  const findings = runCustomRules(ast, css ?? "", html);
  return [...new Set(findings.map((f) => f.id))];
}

describe("Challenge data integrity", () => {
  it("CHALLENGES array is non-empty", () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(5);
  });

  it("every challenge has a unique id", () => {
    const ids = CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getChallengeById returns the correct challenge", () => {
    for (const c of CHALLENGES) {
      expect(getChallengeById(c.id)).toBe(c);
    }
    expect(getChallengeById("nonexistent")).toBeUndefined();
  });

  it("every challenge has at least one objective", () => {
    for (const c of CHALLENGES) {
      expect(c.objectives.length).toBeGreaterThan(0);
    }
  });

  it("every challenge has at least one hint", () => {
    for (const c of CHALLENGES) {
      expect(c.hints.length).toBeGreaterThan(0);
    }
  });

  it("every challenge has a valid difficulty", () => {
    for (const c of CHALLENGES) {
      expect(["beginner", "intermediate", "advanced"]).toContain(c.difficulty);
    }
  });

  it("every challenge has non-empty startHtml and solutionHtml", () => {
    for (const c of CHALLENGES) {
      expect(c.startHtml.trim().length).toBeGreaterThan(0);
      expect(c.solutionHtml.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("Challenge starter code triggers expected playground rules", () => {
  // For each challenge, filter to expected rules that are playground rules
  // (not axe-only like color-contrast) and verify the starter triggers them.
  const playgroundRuleIds = new Set([
    "img-missing-alt",
    "empty-interactive-name",
    "input-placeholder-only",
    "input-no-label",
    "heading-order",
    "click-on-non-interactive",
    "dialog-no-name",
    "positive-tabindex",
    "aria-hidden-focusable",
    "interactive-role-not-focusable",
    "link-as-button",
    "outline-removed",
    "duplicate-id",
    "aria-broken-reference",
    "invalid-aria",
    "tab-pattern-incomplete",
  ]);

  for (const challenge of CHALLENGES) {
    const expectedPlaygroundRules = challenge.expected
      .map((e) => e.ruleId)
      .filter((id) => playgroundRuleIds.has(id));

    if (expectedPlaygroundRules.length === 0) continue;

    it(`"${challenge.id}" starter triggers: ${expectedPlaygroundRules.join(", ")}`, () => {
      const triggered = getTriggeredRuleIds(
        challenge.startHtml,
        challenge.startCss
      );
      for (const expectedRule of expectedPlaygroundRules) {
        expect(
          triggered,
          `Expected rule "${expectedRule}" to be triggered by "${challenge.id}" starter code`
        ).toContain(expectedRule);
      }
    });
  }
});

describe("Challenge solution code resolves expected rules", () => {
  for (const challenge of CHALLENGES) {
    const playgroundMustBeAbsent = challenge.verify.ruleIdsMustBeAbsent.filter(
      (id) =>
        [
          "img-missing-alt",
          "empty-interactive-name",
          "input-placeholder-only",
          "input-no-label",
          "heading-order",
          "click-on-non-interactive",
          "dialog-no-name",
          "positive-tabindex",
          "aria-hidden-focusable",
          "interactive-role-not-focusable",
          "link-as-button",
          "outline-removed",
          "duplicate-id",
          "aria-broken-reference",
          "invalid-aria",
          "tab-pattern-incomplete",
        ].includes(id)
    );

    if (playgroundMustBeAbsent.length === 0) continue;

    it(`"${challenge.id}" solution does not trigger: ${playgroundMustBeAbsent.join(", ")}`, () => {
      const triggered = getTriggeredRuleIds(
        challenge.solutionHtml,
        challenge.solutionCss
      );
      for (const absent of playgroundMustBeAbsent) {
        expect(
          triggered,
          `Rule "${absent}" should NOT be triggered by "${challenge.id}" solution code`
        ).not.toContain(absent);
      }
    });
  }
});

describe("Challenge solution does not introduce new playground violations", () => {
  for (const challenge of CHALLENGES) {
    it(`"${challenge.id}" solution introduces no new violations`, () => {
      const starterRules = getTriggeredRuleIds(
        challenge.startHtml,
        challenge.startCss
      );
      const solutionRules = getTriggeredRuleIds(
        challenge.solutionHtml,
        challenge.solutionCss
      );
      const newViolations = solutionRules.filter(
        (id) => !starterRules.includes(id)
      );
      expect(
        newViolations,
        `Solution for "${challenge.id}" should not introduce new violations, but found: ${newViolations.join(", ")}`
      ).toEqual([]);
    });
  }
});

describe("Challenge progress storage", () => {
  it("loadChallengeProgress returns null for unknown challenge", async () => {
    const { loadChallengeProgress } = await import("@/lib/challenge-progress");
    expect(loadChallengeProgress("nonexistent")).toBeNull();
  });

  it("saveChallengeProgress round-trips correctly", async () => {
    const { saveChallengeProgress, loadChallengeProgress, defaultProgress } =
      await import("@/lib/challenge-progress");
    const progress = {
      ...defaultProgress(),
      hintsRevealed: 2,
      completed: true,
    };
    saveChallengeProgress("test-challenge", progress);
    const loaded = loadChallengeProgress("test-challenge");
    expect(loaded).toEqual(progress);
  });

  it("loadChallengeProgress rejects malformed data", async () => {
    const { loadChallengeProgress } = await import("@/lib/challenge-progress");
    localStorage.setItem(
      "ap_challenge_v1_bad",
      JSON.stringify({ garbage: true })
    );
    expect(loadChallengeProgress("bad")).toBeNull();
  });

  it("loadAllChallengeProgress returns map of known challenges", async () => {
    const { loadAllChallengeProgress, saveChallengeProgress, defaultProgress } =
      await import("@/lib/challenge-progress");
    const progress = { ...defaultProgress(), completed: true };
    saveChallengeProgress("c1", progress);
    saveChallengeProgress("c2", { ...defaultProgress(), hintsRevealed: 1 });
    const map = loadAllChallengeProgress(["c1", "c2", "c3"]);
    expect(map.size).toBe(2);
    expect(map.get("c1")?.completed).toBe(true);
    expect(map.get("c2")?.hintsRevealed).toBe(1);
    expect(map.has("c3")).toBe(false);
  });
});

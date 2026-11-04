import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import HomePage from "@/app/(site)/page";
import { STARTER_TEMPLATES } from "@/data/templates";
import { loadAllChallenges } from "@/data/challenges";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import { runCustomRules } from "@/lib/custom-rules";
import {
  normalizeFindings,
  findingsToAxeFindings,
} from "@/lib/findings/normalize";

describe("Baseline Behavior Snapshots", () => {
  it("locks findings output for every starter template", () => {
    const templateFindings: Record<string, unknown> = {};

    for (const template of STARTER_TEMPLATES) {
      const { ast } = parseHtmlToA11yTree(template.html);
      const customFindings = ast
        ? runCustomRules(ast, template.css || "", template.html)
        : [];
      const normalized = normalizeFindings(customFindings, [], []);
      const legacyMerged = findingsToAxeFindings(normalized);

      templateFindings[template.id] = {
        normalizedRuleIds: normalized.map((f) => f.ruleId).sort(),
        legacyRuleIds: legacyMerged.map((f) => f.id).sort(),
      };
    }

    expect(templateFindings).toMatchSnapshot();
  });

  it("locks findings output for every challenge (starter and solution)", async () => {
    const challenges = await loadAllChallenges();
    const challengeFindings: Record<string, unknown> = {};

    for (const challenge of challenges) {
      const starterAst = parseHtmlToA11yTree(challenge.startHtml).ast;
      const starterCustom = starterAst
        ? runCustomRules(
            starterAst,
            challenge.startCss || "",
            challenge.startHtml
          )
        : [];

      const solutionAst = parseHtmlToA11yTree(challenge.solutionHtml).ast;
      const solutionCustom = solutionAst
        ? runCustomRules(
            solutionAst,
            challenge.solutionCss || "",
            challenge.solutionHtml
          )
        : [];

      const starterNormalized = normalizeFindings(starterCustom, [], []);
      const solutionNormalized = normalizeFindings(solutionCustom, [], []);

      challengeFindings[challenge.id] = {
        starterNormalizedRuleIds: starterNormalized.map((f) => f.ruleId).sort(),
        starterLegacyRuleIds: findingsToAxeFindings(starterNormalized)
          .map((f) => f.id)
          .sort(),
        solutionNormalizedRuleIds: solutionNormalized
          .map((f) => f.ruleId)
          .sort(),
        solutionLegacyRuleIds: findingsToAxeFindings(solutionNormalized)
          .map((f) => f.id)
          .sort(),
      };
    }

    expect(challengeFindings).toMatchSnapshot();
  });

  it("locks rendered HTML structure of Home Page", () => {
    const html = renderToString(React.createElement(HomePage));
    // Verify major landmarks are present in rendered HTML
    expect(html).toContain("You can&#x27;t fix what you can&#x27;t see.");
    expect(html).toContain("What the inspector shows you");
    expect(html).toContain("Open the Playground");
    expect(html).toMatchSnapshot();
  });
});

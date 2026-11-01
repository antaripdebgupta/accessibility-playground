import { describe, it, expect } from "vitest";
import {
  LEARN_TOPICS,
  getLearnTopicBySlug,
  getLearnTopicForRuleId,
  getPlaygroundUrlForExample,
} from "@/data/learn-topics";
import { decodeSnippet } from "@/lib/snippet-share";
import { WCAG_CRITERIA_BY_ID } from "@/data/wcag";

describe("Knowledge Centre (Phase P2)", () => {
  it("includes all 15 required topics from learn.md", () => {
    const requiredSlugs = [
      "semantic-html",
      "accessible-names",
      "aria",
      "keyboard",
      "focus",
      "forms",
      "contrast",
      "images",
      "tables",
      "dialogs",
      "navigation",
      "dynamic-content",
      "screen-readers",
      "reflow",
      "motion",
    ];

    const actualSlugs = LEARN_TOPICS.map((t) => t.slug);
    for (const slug of requiredSlugs) {
      expect(actualSlugs, `Missing required topic slug "${slug}"`).toContain(
        slug
      );
    }
    expect(LEARN_TOPICS.length).toBe(15);
  });

  it("every topic has unique slug and title", () => {
    const slugs = LEARN_TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const titles = LEARN_TOPICS.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("every topic contains complete, non-empty content sections", () => {
    for (const topic of LEARN_TOPICS) {
      expect(topic.title.trim().length, `${topic.slug} title`).toBeGreaterThan(
        0
      );
      expect(
        topic.summary.trim().length,
        `${topic.slug} summary`
      ).toBeGreaterThan(0);
      expect(
        topic.plainExplanation.trim().length,
        `${topic.slug} plainExplanation`
      ).toBeGreaterThan(0);
      expect(
        topic.technicalExplanation.trim().length,
        `${topic.slug} technicalExplanation`
      ).toBeGreaterThan(0);
      expect(
        topic.whyItMatters.trim().length,
        `${topic.slug} whyItMatters`
      ).toBeGreaterThan(0);
      expect(
        topic.browserBehaviour.trim().length,
        `${topic.slug} browserBehaviour`
      ).toBeGreaterThan(0);

      expect(
        topic.wcagCriteria.length,
        `${topic.slug} wcagCriteria`
      ).toBeGreaterThan(0);
      for (const sc of topic.wcagCriteria) {
        expect(
          WCAG_CRITERIA_BY_ID.has(sc),
          `Topic ${topic.slug} references unknown WCAG SC ${sc}`
        ).toBe(true);
      }

      expect(
        topic.commonMistakes.length,
        `${topic.slug} commonMistakes`
      ).toBeGreaterThan(0);
      expect(
        topic.manualTest.length,
        `${topic.slug} manualTest`
      ).toBeGreaterThan(0);
      expect(topic.links.length, `${topic.slug} links`).toBeGreaterThan(0);
      for (const link of topic.links) {
        expect(link.url.startsWith("http")).toBe(true);
        expect(link.title.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("every topic has valid bad and good examples that open in the playground", () => {
    for (const topic of LEARN_TOPICS) {
      // Bad example
      expect(topic.badExample.html.trim().length).toBeGreaterThan(0);
      expect(topic.badExample.description.trim().length).toBeGreaterThan(0);
      const badUrl = getPlaygroundUrlForExample(topic.badExample);
      expect(badUrl.startsWith("/playground?s=")).toBe(true);
      const badSnippetParam = badUrl.replace("/playground?s=", "");
      const decodedBad = decodeSnippet(badSnippetParam);
      expect(
        decodedBad,
        `Failed to decode bad example for ${topic.slug}`
      ).not.toBeNull();
      expect(decodedBad?.html).toBe(topic.badExample.html);

      // Good example
      expect(topic.goodExample.html.trim().length).toBeGreaterThan(0);
      expect(topic.goodExample.description.trim().length).toBeGreaterThan(0);
      const goodUrl = getPlaygroundUrlForExample(topic.goodExample);
      expect(goodUrl.startsWith("/playground?s=")).toBe(true);
      const goodSnippetParam = goodUrl.replace("/playground?s=", "");
      const decodedGood = decodeSnippet(goodSnippetParam);
      expect(
        decodedGood,
        `Failed to decode good example for ${topic.slug}`
      ).not.toBeNull();
      expect(decodedGood?.html).toBe(topic.goodExample.html);
    }
  });

  it("getLearnTopicBySlug resolves existing slugs and returns undefined for unknowns", () => {
    expect(getLearnTopicBySlug("semantic-html")?.title).toBe("Semantic HTML");
    expect(getLearnTopicBySlug("contrast")?.title).toBe(
      "Colour Contrast and Visual Perception"
    );
    expect(getLearnTopicBySlug("non-existent-slug")).toBeUndefined();
  });

  it("getLearnTopicForRuleId maps rule IDs to relevant topics", () => {
    expect(getLearnTopicForRuleId("img-missing-alt")?.slug).toBe("images");
    expect(getLearnTopicForRuleId("empty-interactive-name")?.slug).toBe(
      "accessible-names"
    );
    expect(getLearnTopicForRuleId("input-no-label")?.slug).toBe(
      "accessible-names"
    );
    expect(getLearnTopicForRuleId("color-contrast")?.slug).toBe("contrast");
    expect(getLearnTopicForRuleId("dialog-no-name")?.slug).toBe("dialogs");
    expect(getLearnTopicForRuleId("outline-removed")?.slug).toBe("focus");
  });
});

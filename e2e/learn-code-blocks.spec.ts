import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { LEARN_TOPICS } from "../src/data/learn-topics";

for (const topic of LEARN_TOPICS) {
  test.describe(`Learn topic: ${topic.slug}`, () => {
    test("code examples are readable on dark blocks", async ({ page }) => {
      await page.goto(`/learn/${topic.slug}`);
      await page.waitForLoadState("networkidle");

      // axe with color-contrast enabled (not enhanced)
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast-enhanced"])
        .analyze();

      expect(results.violations).toEqual([]);

      // Assert that <code> inside the dark blocks is NOT the background colour (#1e1e1e)
      const darkBlockBackground = "rgb(30, 30, 30)";
      const codeColors = await page
        .locator('[role="region"] code')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));

      for (const color of codeColors) {
        expect(color).not.toBe(darkBlockBackground);
      }
    });
  });
}

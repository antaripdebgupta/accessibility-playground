import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ALL_ROUTES = ["/", "/playground", "/contrast", "/about"];
const SITE_ROUTES = ["/", "/contrast", "/about"];

for (const route of ALL_ROUTES) {
  test.describe(`Route: ${route}`, () => {
    test("has 0 WCAG 2.2 AA axe violations", async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
}

for (const route of SITE_ROUTES) {
  test.describe(`Site Nav: ${route}`, () => {
    test("header has exactly one nav landmark with all 3 items", async ({
      page,
    }) => {
      await page.goto(route);

      // Single <nav> landmark in header
      const headerNavs = page.locator("header nav");
      await expect(headerNavs).toHaveCount(1);
      await expect(headerNavs).toHaveAttribute("aria-label", "Main");

      // Verify the 3 nav destinations exist
      const links = headerNavs.locator("a");
      const hrefs = await links.evaluateAll((anchors) =>
        anchors.map((a) => a.getAttribute("href"))
      );

      expect(hrefs).toContain("/playground");
      expect(hrefs).toContain("/contrast");
      expect(hrefs).toContain("/about");
    });
  });
}

test.describe("Workbench chrome-less shell", () => {
  test("/playground has no marketing nav or footer, but has workbench toolbar", async ({
    page,
  }) => {
    await page.goto("/playground");

    // No marketing header nav
    const siteNav = page.locator("header nav");
    await expect(siteNav).toHaveCount(0);

    // No footer
    const footer = page.locator("footer");
    await expect(footer).toHaveCount(0);

    // Has workbench home link
    const homeLink = page.getByRole("link", {
      name: "Accessibility Playground — back to home",
    });
    await expect(homeLink).toBeVisible();
  });
});

test.describe("Footer landmark", () => {
  test("footer landmark exists only on home route ('/')", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toHaveCount(1);

    await page.goto("/about");
    await expect(page.locator("footer")).toHaveCount(0);
  });
});

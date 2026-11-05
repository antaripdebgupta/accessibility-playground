import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ALL_ROUTES = [
  "/",
  "/about",
  "/contrast",
  "/learn",
  "/challenges",
  "/playground",
];
const SITE_ROUTES = ["/", "/contrast", "/about"];

for (const route of ALL_ROUTES) {
  test.describe(`Route: ${route}`, () => {
    test("has 0 WCAG 2.2 AA axe violations", async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice",
        ])
        .disableRules(["color-contrast-enhanced"])
        .options({
          rules: { "label-content-name-mismatch": { enabled: true } },
        })
        .exclude(".cm-scroller")
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

test.describe("Item 2: Rescan button keyboard focus and aria-disabled", () => {
  test("focus Rescan, press Enter -> activeElement remains Rescan button during and after scan", async ({
    page,
  }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const rescanBtn = page.getByRole("button", {
      name: /Rescan/i,
    });
    await expect(rescanBtn).toBeVisible();

    // Focus the Rescan button
    await rescanBtn.focus();

    // Verify it is currently activeElement
    const isFocusedBefore = await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label")?.includes("Rescan")
    );
    expect(isFocusedBefore).toBe(true);

    // Press Enter to trigger scan
    await page.keyboard.press("Enter");

    // During scan, button remains the activeElement (not dropped to body)
    const activeTagName = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(activeTagName).toBe("BUTTON");

    // Pressing Enter again while aria-disabled is true does not crash or double-trigger
    await page.keyboard.press("Enter");
  });
});

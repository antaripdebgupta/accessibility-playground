import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const VIEWPORT_WIDTHS = [1280, 1024, 900, 768, 640, 390, 320];

test.describe("TASK 1A — Site Header Responsiveness", () => {
  for (const width of VIEWPORT_WIDTHS) {
    test(`Header on '/' at ${width}px fits viewport and does not exceed 68px height`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify no horizontal page scroll (reflow SC 1.4.10)
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(hasHorizontalScroll).toBe(false);

      // Verify header height stays one row (<= 68px)
      const header = page.locator("header.site-header");
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeLessThanOrEqual(68);
      }

      // Verify brand link accessible name is preserved at all widths
      const brandLink = page.getByRole("link", {
        name: "Accessibility Playground — home",
      });
      await expect(brandLink).toBeVisible();

      if (width <= 900) {
        // Disclosure menu button should be visible
        const menuBtn = page.getByRole("button", { name: /menu/i });
        await expect(menuBtn).toBeVisible();
        await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
        const controlsId = await menuBtn.getAttribute("aria-controls");
        expect(controlsId).toBeTruthy();

        // Nav list is collapsed initially
        const nav = page.locator(`#${controlsId}`);
        await expect(nav).toBeAttached();

        // Target size >= 44x44px
        const btnBox = await menuBtn.boundingBox();
        expect(btnBox).not.toBeNull();
        if (btnBox) {
          expect(btnBox.width).toBeGreaterThanOrEqual(44);
          expect(btnBox.height).toBeGreaterThanOrEqual(44);
        }
      } else {
        // Desktop: inline nav visible, menu button hidden
        const menuBtn = page.getByRole("button", { name: /menu/i });
        await expect(menuBtn).toBeHidden();
        const nav = page.getByRole("navigation", { name: "Main" });
        await expect(nav).toBeVisible();
      }
    });
  }

  test("Disclosure menu interactions on mobile (open, close, Esc, click outside)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuBtn = page.getByRole("button", { name: /menu/i });
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");

    // Click to open
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true");

    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();

    // Verify all 5 nav links are accessible
    const links = nav.getByRole("link");
    expect(await links.count()).toBe(5);

    // Press Escape -> closes and returns focus to menu button
    await page.keyboard.press("Escape");
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    await expect(menuBtn).toBeFocused();

    // Reopen and click outside -> closes
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(10, 500); // click main body outside header
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
  });

  test("Axe accessibility test on '/' and '/contrast' with menu open and closed", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 700 });

    for (const route of ["/", "/contrast"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Closed state axe scan
      const closedResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast-enhanced"])
        .options({
          rules: { "label-content-name-mismatch": { enabled: true } },
        })
        .exclude(".cm-scroller")
        .analyze();
      expect(closedResults.violations).toEqual([]);

      // Open menu
      const menuBtn = page.getByRole("button", { name: /menu/i });
      await menuBtn.click();
      await expect(menuBtn).toHaveAttribute("aria-expanded", "true");

      // Open state axe scan
      const openResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast-enhanced"])
        .options({
          rules: { "label-content-name-mismatch": { enabled: true } },
        })
        .exclude(".cm-scroller")
        .analyze();
      expect(openResults.violations).toEqual([]);

      // Close for next loop
      await menuBtn.click();
    }
  });
});

test.describe("TASK 1B — Playground Toolbar Responsiveness", () => {
  for (const width of VIEWPORT_WIDTHS) {
    test(`WorkbenchToolbar at ${width}px has no horizontal page scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/playground");
      await page.waitForLoadState("networkidle");

      // Verify no horizontal overflow at 320px and all widths
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(hasHorizontalScroll).toBe(false);

      // Home link exists and is labeled
      const homeLink = page.getByRole("link", {
        name: "Accessibility Playground — back to home",
      });
      await expect(homeLink).toBeVisible();

      // Rescan button always visible, has shortcut
      const rescanBtn = page.getByRole("button", { name: /rescan/i });
      await expect(rescanBtn).toBeVisible();
      await expect(rescanBtn).toHaveAttribute("aria-disabled", "false");
      await expect(rescanBtn).toHaveAttribute(
        "aria-keyshortcuts",
        /Control\+Enter/
      );

      if (width < 1024) {
        // Layout menu should be completely absent on mobile (< 1024px)
        const layoutMenu = page.getByRole("button", { name: /layout/i });
        await expect(layoutMenu).toHaveCount(0);

        // More actions menu should be visible
        const moreBtn = page.getByRole("button", { name: /more actions/i });
        await expect(moreBtn).toBeVisible();
      } else {
        // Desktop: layout menu is visible
        const layoutMenu = page.getByRole("button", { name: /layout/i });
        await expect(layoutMenu).toBeVisible();
      }
    });
  }

  test("Workbench toolbar at 320px reaches all actions via More menu", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const moreBtn = page.getByRole("button", { name: /more actions/i });
    await expect(moreBtn).toBeVisible();

    // Open More actions menu
    await moreBtn.click();

    // Verify Start Fresh, Reset Example, Set Baseline, and Export items exist
    const startFreshItem = page.getByRole("menuitem", { name: /start fresh/i });
    await expect(startFreshItem).toBeVisible();

    const resetExampleItem = page.getByRole("menuitem", {
      name: /reset example/i,
    });
    await expect(resetExampleItem).toBeVisible();

    const baselineItem = page.getByRole("menuitem", { name: /baseline/i });
    await expect(baselineItem).toBeVisible();

    const exportJson = page.getByRole("menuitem", { name: /export json/i });
    await expect(exportJson).toBeVisible();

    const exportCsv = page.getByRole("menuitem", { name: /export csv/i });
    await expect(exportCsv).toBeVisible();

    const exportMd = page.getByRole("menuitem", { name: /export markdown/i });
    await expect(exportMd).toBeVisible();

    const copyMd = page.getByRole("menuitem", { name: /copy markdown/i });
    await expect(copyMd).toBeVisible();

    // Close menu with Escape
    await page.keyboard.press("Escape");
    await expect(startFreshItem).toBeHidden();
  });

  test("Axe scan on /playground at 320px with toolbar", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast-enhanced"])
      .options({
        rules: { "label-content-name-mismatch": { enabled: true } },
      })
      .exclude(".cm-scroller")
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

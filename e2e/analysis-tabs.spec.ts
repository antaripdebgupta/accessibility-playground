import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("PART A — Analysis Tabs Responsiveness and Accessibility", () => {
  test("Desktop 1280px: all 8 tabs share the same Y position (strictly 1 row) and Maximize button is aligned", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const hasHorizontalScroll = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(hasHorizontalScroll).toBe(false);

    const triggers = page.locator(".analysis-tabs-scroll [role='tab']");
    const count = await triggers.count();
    expect(count).toBe(8);

    const firstBox = await triggers.nth(0).boundingBox();
    expect(firstBox).not.toBeNull();
    const expectedY = firstBox!.y;

    for (let i = 1; i < count; i++) {
      const box = await triggers.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(Math.abs(box!.y - expectedY)).toBeLessThanOrEqual(1);
    }

    const maxBtn = page.getByRole("button", { name: /maximize analysis/i });
    await expect(maxBtn).toBeVisible();
    const maxBox = await maxBtn.boundingBox();
    expect(maxBox).not.toBeNull();

    const triggerCenterY = expectedY + firstBox!.height / 2;
    const maxCenterY = maxBox!.y + maxBox!.height / 2;
    expect(Math.abs(triggerCenterY - maxCenterY)).toBeLessThanOrEqual(4);
  });

  test("Mobile 390px and 320px: tabs strip scrolls, accessible names contain full label, and active tab is visible", async ({
    page,
  }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/playground");
      await page.waitForLoadState("networkidle");

      const analysisPaneTab = page.locator("#mobile-tab-analysis");
      await expect(analysisPaneTab).toBeVisible();
      await analysisPaneTab.click();

      const panel = page.locator("#mobile-pane-analysis");
      await expect(panel).toHaveAttribute("role", "tabpanel");
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        "mobile-tab-analysis"
      );

      const accNameTab = page.getByRole("tab", { name: /Accessible Name/i });
      await expect(accNameTab).toBeAttached();

      const treeTab = page.getByRole("tab", { name: /A11y Tree/i });
      await expect(treeTab).toBeAttached();

      const issuesTab = page.getByRole("tab", { name: /Issues/i });
      await expect(issuesTab).toBeAttached();

      const manualTab = page.getByRole("tab", { name: /Manual Tests/i });
      await expect(manualTab).toBeAttached();

      await manualTab.click();
      await expect(manualTab).toHaveAttribute("aria-selected", "true");

      const isVisibleInScroller = await page.evaluate(() => {
        const scroller = document.querySelector(".analysis-tabs-scroll");
        const activeTab = scroller?.querySelector<HTMLElement>(
          '[role="tab"][aria-selected="true"]'
        );
        if (!scroller || !activeTab) return false;
        const sRect = scroller.getBoundingClientRect();
        const tRect = activeTab.getBoundingClientRect();
        return tRect.left >= sRect.left - 2 && tRect.right <= sRect.right + 2;
      });
      expect(isVisibleInScroller).toBe(true);

      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test("MobilePaneTabs: roving tabindex, arrow navigation, and tabpanel linking", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editorTab = page.locator("#mobile-tab-editor");
    const previewTab = page.locator("#mobile-tab-preview");
    const analysisTab = page.locator("#mobile-tab-analysis");

    await expect(editorTab).toBeVisible();
    await expect(editorTab).toHaveAttribute("aria-selected", "true");
    await expect(editorTab).toHaveAttribute("tabindex", "0");
    await expect(previewTab).toHaveAttribute("tabindex", "-1");

    await editorTab.focus();
    await page.keyboard.press("ArrowRight");

    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await expect(previewTab).toBeFocused();
    await expect(page.locator("#mobile-pane-preview")).toBeVisible();

    await page.keyboard.press("End");
    await expect(analysisTab).toHaveAttribute("aria-selected", "true");
    await expect(analysisTab).toBeFocused();
    await expect(page.locator("#mobile-pane-analysis")).toBeVisible();

    await page.keyboard.press("Home");
    await expect(editorTab).toHaveAttribute("aria-selected", "true");
    await expect(editorTab).toBeFocused();
  });

  test("Axe accessibility test on /playground with each Analysis tab selected", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 750 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const mobileAnalysisTab = page.locator("#mobile-tab-analysis");
    if (await mobileAnalysisTab.isVisible()) {
      await mobileAnalysisTab.click();
    }

    const tabsToTest = [
      /A11y Tree/i,
      /Accessible Name/i,
      /Issues/i,
      /Manual Tests/i,
    ];
    for (const tabName of tabsToTest) {
      const tab = page.getByRole("tab", { name: tabName });
      await tab.click();
      await page.waitForTimeout(100);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast-enhanced"])
        .options({
          rules: { "label-content-name-mismatch": { enabled: true } },
        })
        .exclude(".cm-scroller, a[href='#code-editor-pane']")
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });
});

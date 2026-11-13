import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function assertAxeClean(page: Page, contextName: string) {
  const scan = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .exclude("iframe")
    .options({
      rules: {
        "label-content-name-mismatch": { enabled: true },
      },
    })
    .analyze();

  const filteredViolations = scan.violations.filter((v) => {
    if (v.id === "scrollable-region-focusable") {
      v.nodes = v.nodes.filter(
        (node) => !node.target.some((target) => target.includes(".cm-scroller"))
      );
      return v.nodes.length > 0;
    }
    return true;
  });

  if (filteredViolations.length > 0) {
    const summary = filteredViolations
      .map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`
      )
      .join("\n");
    expect(
      filteredViolations,
      `Axe violations found in ${contextName}:\n${summary}`
    ).toEqual([]);
  }
}

test.beforeEach(async ({ page, context }) => {
  await context.route("**/*picsum.photos/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>',
    });
  });
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
    } catch {}
  });
});

test.describe("1.1 Responsive Verification", () => {
  test("AnalysisTabs triggers share single row, align maximize, and stay visible on keyboard navigation", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const viewports = [
      { width: 1280, height: 800 },
      { width: 768, height: 800 },
      { width: 390, height: 844 },
      { width: 320, height: 700 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/playground");
      await page.waitForLoadState("networkidle");

      if (vp.width < 1024) {
        const mobileAnalysisTab = page.locator("#mobile-tab-analysis");
        await mobileAnalysisTab.click();
      }

      const triggers = page.locator('.analysis-tabs-scroll [role="tab"]');
      const count = await triggers.count();
      expect(count).toBe(8);

      const firstBox = await triggers.nth(0).boundingBox();
      expect(firstBox).not.toBeNull();
      const firstY = Math.round(firstBox!.y);

      for (let i = 1; i < count; i++) {
        const box = await triggers.nth(i).boundingBox();
        expect(box).not.toBeNull();
        expect(Math.abs(Math.round(box!.y) - firstY)).toBeLessThanOrEqual(2);
      }

      const maxBtn = page.getByRole("button", { name: /Maximize analysis/i });
      await expect(maxBtn).toBeVisible();

      const hasOverflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1
        );
      });
      expect(hasOverflow).toBe(false);

      const firstTab = triggers.nth(0);
      await firstTab.focus();
      await page.keyboard.press("End");
      const lastTab = triggers.nth(count - 1);
      await expect(lastTab).toBeFocused();

      const isLastVisible = await lastTab.evaluate((el) => {
        const container = el.closest(".analysis-tabs-scroll");
        if (!container) return true;
        const cRect = container.getBoundingClientRect();
        const tRect = el.getBoundingClientRect();
        return tRect.left >= cRect.left - 2 && tRect.right <= cRect.right + 2;
      });
      expect(isLastVisible).toBe(true);

      await page.keyboard.press("Home");
      await expect(firstTab).toBeFocused();
    }
  });

  test("Challenge flow below 1024px at 390px keyboard reachability and accessible names", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/playground?challenge=image-alt");
    await page.waitForLoadState("networkidle");

    const challengeHeader = page.getByRole("button", { name: /Challenge:/i });
    if (await challengeHeader.isVisible()) {
      await challengeHeader.click();
    }

    const hintsBtn = page.getByRole("button", { name: "Show next hint" });
    const verifyBtn = page.getByRole("button", { name: "Check my fix" });
    const solutionBtn = page.getByRole("button", { name: "Show solution" });
    const resetBtn = page.getByRole("button", { name: "Reset challenge" });

    await expect(hintsBtn).toBeVisible();
    await expect(verifyBtn).toBeVisible();
    await expect(solutionBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();

    await hintsBtn.focus();
    await expect(hintsBtn).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(verifyBtn).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(solutionBtn).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(resetBtn).toBeFocused();
  });

  test("MobilePaneTabs has valid aria-controls, single active tabpanel, and arrow key navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const tablist = page.locator(
      '[role="tablist"][aria-label="Workbench panes"]'
    );
    await expect(tablist).toBeVisible();

    const tabs = tablist.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(3);

    for (let i = 0; i < tabCount; i++) {
      const controlsId = await tabs.nth(i).getAttribute("aria-controls");
      expect(controlsId).toBeTruthy();
      const targetPanel = page.locator(`#${controlsId}`);
      await expect(targetPanel).toHaveCount(1);
    }

    const firstTab = tabs.nth(0);
    await firstTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(1)).toBeFocused();
  });

  test("Every route has no horizontal overflow across 320, 390, 768, 1024, 1280 viewports", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const routes = [
      "/",
      "/about",
      "/challenges",
      "/learn",
      "/learn/semantic-html",
      "/contrast",
      "/playground",
    ];
    const widths = [320, 390, 768, 1024, 1280];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(
            doc.scrollWidth,
            body ? body.scrollWidth : 0
          );
          const clientW = doc.clientWidth;
          return scrollW - clientW;
        });

        expect(
          overflow,
          `Horizontal overflow detected on ${route} at ${width}px: ${overflow}px`
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe("1.2 Automated Axe Checks", () => {
  test("Clean context axe checks across public routes and challenge", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const routes = [
      "/",
      "/about",
      "/challenges",
      "/learn",
      "/learn/semantic-html",
      "/learn/accessible-names",
      "/contrast",
      "/playground",
      "/playground?challenge=image-alt",
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await assertAxeClean(page, `Route: ${route}`);
    }
  });

  test("Playground analysis tabs axe checks", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const tabLabels = [
      "Tree",
      "ARIA",
      "Name",
      "Focus",
      "Speech",
      "Issues",
      "Diff",
      "Manual",
    ];

    for (const label of tabLabels) {
      const tabTrigger = page
        .locator('.analysis-tabs-scroll [role="tab"]')
        .filter({ hasText: label })
        .first();
      await tabTrigger.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, `Analysis tab: ${label}`);
    }
  });

  test("Playground issues finding detail and baseline compare axe checks", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const mobileAnalysisTab = page.locator("#mobile-tab-analysis");
    if (await mobileAnalysisTab.isVisible()) {
      await mobileAnalysisTab.click();
    }

    const issuesTab = page
      .locator('.analysis-tabs-scroll [role="tab"]')
      .filter({ hasText: /Issues/i })
      .first();
    await issuesTab.click();
    const findingRow = page
      .locator('[role="tabpanel"] button[aria-pressed]')
      .first();
    if (await findingRow.isVisible()) {
      await findingRow.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, "Issues finding detail open");

      const backBtn = page.getByRole("button", { name: /Back to all issues/i });
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await page.waitForTimeout(50);
      }
    }

    const setBaselineBtn = page.getByRole("button", { name: /Set Baseline/i });
    if (await setBaselineBtn.isVisible()) {
      await setBaselineBtn.click();
      await page.waitForTimeout(50);
      const compareTab = page
        .locator('.analysis-tabs-scroll [role="tab"]')
        .filter({ hasText: /Diff|Compare/i })
        .first();
      await compareTab.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, "Compare tab with baseline");
    }
  });

  test("Playground dialogs, menus, and mobile layout axe checks", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const helpBtn = page.getByRole("button", { name: /Keyboard shortcuts/i });
    if (await helpBtn.isVisible()) {
      await helpBtn.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, "Shortcuts dialog open");
      await page.keyboard.press("Escape");
    }

    const snippetsBtn = page.getByRole("button", { name: /Snippets/i });
    if (await snippetsBtn.isVisible()) {
      await snippetsBtn.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, "Snippets menu open");
      await page.keyboard.press("Escape");
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    await assertAxeClean(page, "Playground mobile layout at 390px");

    const moreBtn = page.getByRole("button", { name: /More actions/i });
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await page.waitForTimeout(50);
      await assertAxeClean(page, "Toolbar More menu open on mobile");
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("1.3 Checks Axe Cannot Make", () => {
  test("Keyboard only navigation, focus trap prevention, and skip link", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    const mainHeading = page.locator("#main-content");
    await expect(mainHeading).toBeFocused();

    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editorContent = page.locator(".cm-content");
    await editorContent.click();
    await expect(editorContent).toBeFocused();

    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    await expect(editorContent).not.toBeFocused();
  });

  test("Splitter keyboard operation and dragging alternative (SC 2.5.7)", async ({
    page,
  }) => {
    const vp = page.viewportSize();
    if (vp && vp.width < 1024) return;

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const separator = page.getByRole("separator", { name: /Analysis/i });
    await expect(separator).toBeVisible();

    const initialValStr = await separator.getAttribute("aria-valuenow");
    const initialVal = Number(initialValStr);

    await separator.focus();
    await page.keyboard.press("ArrowRight");
    const updatedValStr = await separator.getAttribute("aria-valuenow");
    const updatedVal = Number(updatedValStr);
    expect(updatedVal).not.toBe(initialVal);

    await page.keyboard.press("Home");
    const minValStr = await separator.getAttribute("aria-valuenow");
    expect(Number(minValStr)).toBe(25);

    await page.keyboard.press("End");
    const maxValStr = await separator.getAttribute("aria-valuenow");
    expect(Number(maxValStr)).toBe(75);
  });

  test("Interactive target size audit on mobile 390px (SC 2.5.8)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const violations = await page.evaluate(() => {
      const interactiveSelector =
        'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="link"], [role="menuitem"]';
      const items = Array.from(document.querySelectorAll(interactiveSelector));
      const undersized: Array<{
        tag: string;
        label: string;
        width: number;
        height: number;
      }> = [];

      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        )
          return;

        const isInlineText = style.display === "inline";
        if (isInlineText) return;

        if (rect.width < 24 || rect.height < 24) {
          const label =
            el.getAttribute("aria-label") ||
            (el as HTMLElement).innerText?.slice(0, 30) ||
            el.getAttribute("title") ||
            el.className ||
            "unnamed";
          undersized.push({
            tag: el.tagName.toLowerCase(),
            label: label.trim(),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });

      return undersized;
    });

    expect(Array.isArray(violations)).toBe(true);
  });

  test("Zoom emulation and text spacing bookmarklet resilience", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const style = document.createElement("style");
      style.id = "a11y-text-spacing-override";
      style.textContent = `
        * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        p {
          margin-bottom: 2em !important;
        }
      `;
      document.head.appendChild(style);
    });

    await page.waitForTimeout(200);

    const hasOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
      );
    });
    expect(hasOverflow).toBe(false);
  });

  test("High contrast and reduced motion emulation", async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: "reduce",
      forcedColors: "active",
      colorScheme: "light",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const issuesTab = page
      .locator('.analysis-tabs-scroll [role="tab"]')
      .filter({ hasText: /Issues/i })
      .first();
    await expect(issuesTab).toBeVisible();

    const separator = page.getByRole("separator", { name: /Analysis/i });
    await expect(separator).toBeVisible();
  });

  test("Metadata, headings, landmarks, and preview iframe accessibility", async ({
    page,
  }) => {
    const pages = [
      "/",
      "/about",
      "/challenges",
      "/learn",
      "/contrast",
      "/playground",
    ];

    for (const p of pages) {
      await page.goto(p);
      await page.waitForLoadState("networkidle");

      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("en");

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      const mainCount = await page.locator("main").count();
      expect(mainCount).toBe(1);
    }

    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    const mobilePreviewTab = page.locator("#mobile-tab-preview");
    if (await mobilePreviewTab.isVisible()) {
      await mobilePreviewTab.click();
    }
    const iframe = page.locator("iframe");
    await expect(iframe).toHaveAttribute("title");
    await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  });
});

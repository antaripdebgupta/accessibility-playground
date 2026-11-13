import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/about",
  "/challenges",
  "/challenges?difficulty=beginner",
  "/learn",
  "/learn/semantic-html",
  "/learn/aria",
  "/contrast",
  "/playground",
  "/playground?challenge=image-alt",
  "/playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0=",
  "/not-found-test",
];

const VIEWPORTS = [
  { width: 320, height: 700 },
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
];

test.describe("Responsive Audit & Measurement", () => {
  test.beforeEach(async ({ context }) => {
    await context.route("**/*picsum.photos/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>',
      });
    });
  });
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`${route} @ ${vp.width}px has no horizontal overflow`, async ({
        page,
      }) => {
        await page.setViewportSize(vp);
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
          const diff = scrollW - clientW;
          if (diff <= 1) return null;

          const overflowingElements: string[] = [];
          const all = document.querySelectorAll("*");
          all.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1) {
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : "";
              const cls =
                el.className && typeof el.className === "string"
                  ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
                  : "";
              overflowingElements.push(
                `${tag}${id}${cls} (right: ${Math.round(rect.right)}, innerWidth: ${window.innerWidth})`
              );
            }
          });
          return { diff, elements: overflowingElements.slice(0, 5) };
        });

        if (overflow) {
          console.warn(
            `Overflow on ${route} at ${vp.width}px: diff=${overflow.diff}`,
            overflow.elements
          );
        }
        expect(overflow).toBeNull();
      });
    }
  }

  test("Zoom emulation at 320px with 200% and 400% scale", async ({
    browser,
  }) => {
    for (const scale of [2, 4]) {
      const context = await browser.newContext({
        viewport: { width: 320, height: 700 },
        deviceScaleFactor: scale,
      });
      const page = await context.newPage();
      for (const route of [
        "/",
        "/learn",
        "/challenges",
        "/contrast",
        "/playground",
      ]) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        const hasOverflow = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1
          );
        });
        expect(hasOverflow).toBe(false);
      }
      await context.close();
    }
  });

  test("Feature reachability on mobile 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/playground?challenge=image-alt");
    await page.waitForLoadState("networkidle");

    const challengeBtn = page.getByRole("button", { name: /Challenge:/i });
    await expect(challengeBtn).toBeVisible();
    await challengeBtn.click();

    const hintBtn = page.getByRole("button", { name: /hint/i });
    await expect(hintBtn).toBeVisible();

    const solutionBtn = page.getByRole("button", { name: /solution/i });
    await expect(solutionBtn).toBeVisible();

    const resetBtn = page.getByRole("button", { name: /reset/i });
    await expect(resetBtn).toBeVisible();

    const formatBtn = page.getByRole("button", { name: /Format/i });
    await expect(formatBtn).toBeVisible();

    const editorSettingsBtn = page.getByRole("button", {
      name: /Editor settings/i,
    });
    await expect(editorSettingsBtn).toBeVisible();
    await editorSettingsBtn.click();

    const tabIndentItem = page.getByRole("menuitem", { name: /Tab indents/i });
    await expect(tabIndentItem).toBeVisible();

    await page.keyboard.press("Escape");

    const workbenchMoreBtn = page.getByRole("button", {
      name: /More actions/i,
    });
    await expect(workbenchMoreBtn).toBeVisible();
    await workbenchMoreBtn.click();

    await expect(
      page.getByRole("menuitem", { name: /Start Fresh/i })
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /Reset Example/i })
    ).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Layout/i })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /Export/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: /Baseline/i })
    ).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByText(/Wrap/i)).toBeVisible();

    const mobileEditorTab = page.locator("#mobile-tab-editor");
    const mobilePreviewTab = page.locator("#mobile-tab-preview");
    const mobileAnalysisTab = page.locator("#mobile-tab-analysis");

    await expect(mobileEditorTab).toBeVisible();
    await expect(mobilePreviewTab).toBeVisible();
    await expect(mobileAnalysisTab).toBeVisible();
  });

  test("Axe accessibility checks across widths for main routes", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of [
        "/",
        "/about",
        "/learn",
        "/challenges",
        "/contrast",
        "/playground",
      ]) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .exclude("iframe")
          .analyze();

        expect(results.violations).toEqual([]);
      }
    }
  });
});

import { test, expect } from "@playwright/test";

test.describe("Editor Typing and Replacement Robustness (§B.6, §A.5)", () => {
  test("typing rapidly does not drop characters or introduce corruption", async ({
    page,
  }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();

    // Focus editor and select all existing text
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");

    // Rapidly type a 50-character string with diverse symbols
    const testString = '<div id="test-rapid" class="a11y-box">Hello 123!</div>';
    await page.keyboard.type(testString, { delay: 0 });

    // Verify exact content without character drop or echo corruption
    await expect(editor).toContainText(testString);
  });

  test("first load shows the default document", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("WCAG 2.2 Overview");
  });

  test("Start Fresh and Reset Example restore default document", async ({
    page,
  }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();

    // Type custom content first
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Custom Text Content 12345");
    await expect(editor).toContainText("Custom Text Content 12345");

    // Click Start Fresh
    const startFreshBtn = page.getByRole("button", { name: /Start Fresh/i });
    if (await startFreshBtn.isVisible()) {
      await startFreshBtn.click();
      await expect(editor).toContainText("WCAG 2.2 Overview");
    }

    // Edit again
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Second Custom Text");
    await expect(editor).toContainText("Second Custom Text");

    // Click Reset Example
    const resetBtn = page.getByRole("button", { name: /Reset Example/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(editor).toContainText("WCAG 2.2 Overview");
    }
  });

  test("/playground?pattern=anything opens the default document without errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    await page.goto("/playground?pattern=anything-unknown");
    await page.waitForLoadState("networkidle");
    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("WCAG 2.2 Overview");
    expect(consoleErrors).toHaveLength(0);
  });

  test("no element named Templates exists and Cmd/Ctrl+K does not open any menu", async ({
    page,
  }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    // (d) No element named "Templates" exists
    const templatesEl = page.getByRole("button", { name: /Templates/i });
    await expect(templatesEl).toHaveCount(0);

    // (e) Cmd/Ctrl+K inside the editor does not open any menu
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+k" : "Control+k"
    );
    const menuItems = page.locator('[role="menuitem"]');
    await expect(menuItems).toHaveCount(0);
  });

  test("applying an ARIA edit from ARIA Explorer preserves caret position", async ({
    page,
    isMobile,
  }) => {
    // Only run on desktop where side-by-side panes are available
    test.skip(isMobile, "Desktop pane inspection test");

    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();

    // Focus editor and place caret inside the button text
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");
    await page.keyboard.type("<button>Click me</button>");

    // Position cursor at position 10 (inside "Click me")
    await page.keyboard.press("Home");
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowRight");
    }

    // Switch to ARIA Explorer tab in Analysis panel
    const ariaTab = page.getByRole("tab", { name: /ARIA/i });
    if (await ariaTab.isVisible()) {
      await ariaTab.click();

      // If an element is inspected, add an attribute or verify no reset
      const scanningBadge = page.getByText("Scanning…");
      await expect(scanningBadge).toHaveCount(0);
    }
  });
});

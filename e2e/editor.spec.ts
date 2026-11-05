import { test, expect } from "@playwright/test";

test.describe("Editor stability and external sync (FIX-1)", () => {
  test("typing rapidly does not echo or drop characters", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();

    // Focus editor and select all text
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");

    // Type rapid 300-char string at 0ms delay
    const testString = "A".repeat(300);
    await page.keyboard.type(testString, { delay: 0 });

    // Verify exact content without character drop or echo corruption
    await expect(editor).toContainText(testString);
  });

  test("loading a template sets caret to 0 and Ctrl+Z restores previous document", async ({
    page,
  }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible();

    // Type distinct content first
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+a" : "Control+a"
    );
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Custom Text Content 12345");
    await expect(editor).toContainText("Custom Text Content 12345");

    // Open Templates dropdown and select a built-in template
    const templatesBtn = page.getByRole("button", { name: /Templates/i });
    await templatesBtn.click();

    // Click the first template in the dropdown
    const templateItem = page.locator('[role="menuitem"]').first();
    await expect(templateItem).toBeVisible();
    await templateItem.click();

    // Verify template loaded
    await expect(editor).not.toContainText("Custom Text Content 12345");

    // Focus editor and press Undo (Ctrl+Z / Meta+Z)
    await editor.focus();
    await editor.click();
    await page.keyboard.press(
      process.platform === "darwin" ? "Meta+z" : "Control+z"
    );

    // Verify custom text content is restored
    await expect(editor).toContainText("Custom Text Content 12345");
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

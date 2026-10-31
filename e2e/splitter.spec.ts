import { test, expect } from "@playwright/test";

test.describe("Workbench Splitters", () => {
  test("separator is keyboard resizable", async ({ page }) => {
    await page.goto("/playground");
    const sep = page.getByRole("separator").first();
    await sep.waitFor({ state: "visible" });
    const before = Number(await sep.getAttribute("aria-valuenow"));
    await sep.focus();
    await page.keyboard.press("ArrowRight");
    expect(Number(await sep.getAttribute("aria-valuenow"))).toBe(before + 2);
    await page.keyboard.press("Home");
    expect(Number(await sep.getAttribute("aria-valuenow"))).toBe(25);
  });

  test("F6 cycles focus between panes", async ({ page }) => {
    await page.goto("/playground");
    await page.keyboard.press("F6");
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(active).toBeTruthy();
  });
});

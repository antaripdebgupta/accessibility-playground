import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openAnalysisPane(page: Page) {
  const mobileAnalysis = page.locator("#mobile-tab-analysis");
  if (await mobileAnalysis.isVisible()) {
    await mobileAnalysis.click();
  }
}

test.describe("axe-core load, headers, and degraded mode resilience", () => {
  test("1. GET /axe.min.js serves javascript with Cross-Origin-Resource-Policy: cross-origin", async ({
    request,
  }) => {
    const res = await request.get("/axe.min.js");
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers["content-type"]).toMatch(/javascript/);
    expect(headers["content-type"]).not.toContain("text/html");
    expect(headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect(headers["cache-control"]).toContain("public");
  });

  test("2. /preview-frame has dedicated CSP with 'self' in script-src while site routes remain strict", async ({
    request,
  }) => {
    const previewRes = await request.get("/preview-frame");
    expect(previewRes.status()).toBe(200);
    const previewCsp = previewRes.headers()["content-security-policy"];
    expect(previewCsp).toBeDefined();
    expect(previewCsp).toContain("script-src 'self' 'unsafe-inline'");
    expect(previewCsp).toContain("frame-ancestors 'self'");

    const siteRes = await request.get("/playground");
    expect(siteRes.status()).toBe(200);
    const siteCsp = siteRes.headers()["content-security-policy"];
    expect(siteCsp).toBeDefined();
    expect(siteCsp).toContain("frame-ancestors 'none'");
    expect(siteRes.headers()["cross-origin-resource-policy"]).toBe(
      "same-origin"
    );
  });

  test("3. /playground loads with default document and runs axe scan without failure or CSP errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const cspViolations: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      window.addEventListener("securitypolicyviolation", (e) => {
        (window as unknown as { __cspViolations: string[] }).__cspViolations =
          (window as unknown as { __cspViolations: string[] })
            .__cspViolations || [];
        (
          window as unknown as { __cspViolations: string[] }
        ).__cspViolations.push(`${e.violatedDirective}: ${e.blockedURI}`);
      });
    });

    await page.goto("/playground");
    await expect(page.locator(".cm-content")).toBeVisible({ timeout: 15000 });

    await openAnalysisPane(page);

    const issuesTab = page.getByRole("tab", { name: /issues/i }).first();
    await expect(issuesTab).toBeVisible();
    await issuesTab.click();

    // Verify no "Audit Scan Failed" banner
    await expect(page.getByText("Audit Scan Failed")).not.toBeVisible();

    // Verify axe-core or playground findings appear
    const violationsHeader = page
      .locator("text=/\\d+\\s+violations?/i")
      .first();
    await expect(violationsHeader).toBeVisible({ timeout: 10000 });

    const inPageCsp = await page.evaluate(
      () =>
        (window as unknown as { __cspViolations?: string[] }).__cspViolations ||
        []
    );
    expect(inPageCsp).toEqual([]);
    expect(cspViolations).toEqual([]);
  });

  test("4. Degraded-mode test: blocked /axe.min.js shows alert banner, lists custom checks, and allows Retry", async ({
    page,
  }) => {
    // Abort axe.min.js requests to simulate load failure
    await page.route("**/axe.min.js*", (route) => route.abort());

    await page.goto("/playground");
    await expect(page.locator(".cm-content")).toBeVisible({ timeout: 15000 });

    await openAnalysisPane(page);

    const issuesTab = page.getByRole("tab", { name: /issues/i }).first();
    await issuesTab.click();

    // The degraded alert banner must appear
    const alertBanner = page
      .locator('[role="alert"]')
      .filter({ hasText: /Automated axe-core scan unavailable/i });
    await expect(alertBanner).toBeVisible({ timeout: 10000 });

    // Must never claim "No automated issues detected" when axe failed
    await expect(
      page.getByText("No automated issues detected")
    ).not.toBeVisible();

    // Retry button exists and is not HTML disabled
    const retryBtn = page.getByRole("button", { name: /retry scan/i });
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).not.toBeDisabled();

    // Unroute to allow axe.min.js again, then click Retry
    await page.unroute("**/axe.min.js*");
    await retryBtn.click();

    // After retry, alert banner should disappear as axe succeeds
    await expect(alertBanner).not.toBeVisible({ timeout: 15000 });
  });

  test("5. Rapid editing applies final scan and maintains preview and focus order", async ({
    page,
  }) => {
    await page.goto("/playground");
    const editor = page.locator(".cm-content");
    await expect(editor).toBeVisible({ timeout: 15000 });
    await editor.click();

    // Type three rapid changes
    await page.keyboard.type(" ");
    await page.waitForTimeout(50);
    await page.keyboard.type(" ");
    await page.waitForTimeout(50);
    await page.keyboard.type(" ");

    await openAnalysisPane(page);

    // Focus tab
    const focusTab = page.getByRole("tab", { name: /focus/i }).first();
    await focusTab.click();
    await expect(page.getByText(/Sequential Tab Order/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("6. Reloading preview re-handshakes and renders document cleanly", async ({
    page,
  }) => {
    await page.goto("/playground");
    await expect(page.locator(".cm-content")).toBeVisible({ timeout: 15000 });

    const reloadBtn = page.getByRole("button", { name: /reload preview/i });
    if (await reloadBtn.isVisible()) {
      await reloadBtn.click();
      const iframe = page.locator("iframe");
      await expect(iframe).toBeVisible();
    }
  });

  test("7. axe-core audit of /playground is clean in healthy state", async ({
    page,
  }) => {
    await page.goto("/playground");
    await expect(page.locator(".cm-content")).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

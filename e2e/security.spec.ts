import { test, expect } from "@playwright/test";
import { encodeSnippet } from "../src/lib/snippet-share";

test.describe("Security Headers & Isolation (acc.md Part 2)", () => {
  test("enforces strict security headers on site routes", async ({
    request,
  }) => {
    const routes = [
      "/",
      "/playground",
      "/about",
      "/contrast",
      "/challenges",
      "/learn",
    ];
    for (const route of routes) {
      const response = await request.get(route);
      expect(response.status()).toBe(200);

      const headers = response.headers();
      expect(headers["content-security-policy"]).toBeDefined();
      expect(headers["content-security-policy"]).toContain(
        "frame-ancestors 'none'"
      );
      expect(headers["content-security-policy"]).toContain("object-src 'none'");
      expect(headers["content-security-policy"]).toContain("base-uri 'self'");
      expect(headers["content-security-policy"]).toContain(
        "form-action 'self'"
      );
      expect(headers["content-security-policy"]).toContain(
        "upgrade-insecure-requests"
      );

      expect(headers["strict-transport-security"]).toBe(
        "max-age=63072000; includeSubDomains"
      );
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(headers["permissions-policy"]).toContain("camera=()");
      expect(headers["permissions-policy"]).toContain("microphone=()");
      expect(headers["permissions-policy"]).toContain("geolocation=()");
      expect(headers["permissions-policy"]).toContain("payment=()");
      expect(headers["permissions-policy"]).toContain("usb=()");
      expect(headers["permissions-policy"]).toContain("interest-cohort=()");
      expect(headers["permissions-policy"]).not.toContain("clipboard-write=()");
      expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
      expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
      expect(headers["x-powered-by"]).toBeUndefined();
    }
  });

  test("serves /preview-frame with dedicated relaxed preview CSP and sameorigin framing", async ({
    request,
  }) => {
    const response = await request.get("/preview-frame");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    const csp = headers["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("form-action 'none'");
    expect(csp).toContain("https://cdn.tailwindcss.com");

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("serves /axe.min.js with immutable long cache and same-origin resource policy", async ({
    request,
  }) => {
    const response = await request.get("/axe.min.js");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["cache-control"]).toContain("public");
    expect(headers["cache-control"]).toContain("max-age=31536000");
    expect(headers["cache-control"]).toContain("immutable");
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
  });

  test("exercises playground workflows with zero CSP violations", async ({
    page,
  }) => {
    const cspViolations: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("Refused to") ||
        text.includes("Content Security Policy")
      ) {
        cspViolations.push(text);
      }
    });

    await page.addInitScript(() => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations = [];
      window.addEventListener("securitypolicyviolation", (e) => {
        (
          window as unknown as { __cspViolations: string[] }
        ).__cspViolations.push(
          `${e.violatedDirective}: ${e.blockedURI} | source: ${e.sourceFile}:${e.lineNumber} | sample: ${e.sample}`
        );
      });
    });

    await page.goto("/playground");
    const cm = page.locator(".cm-content");
    await expect(cm).toBeVisible({ timeout: 15000 });
    await cm.click();
    await page.keyboard.type(" <p>Accessible text</p>");

    const rescanBtn = page.getByRole("button", { name: "Rescan", exact: true });
    if (await rescanBtn.isVisible()) {
      await rescanBtn.click();
    }

    const tabNames = [
      "Issues",
      "Elements",
      "Manual",
      "Contrast",
      "Headings",
      "Landmarks",
      "Alt Text",
      "Compare",
    ];

    for (const name of tabNames) {
      const tab = page
        .getByRole("tab", { name: new RegExp(name, "i") })
        .first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(50);
      }
    }

    const snippetsBtn = page.getByRole("button", { name: "Snippets" });
    if (await snippetsBtn.isVisible()) {
      await snippetsBtn.click();
      const snippetItem = page.getByRole("menuitem").first();
      if (await snippetItem.isVisible()) {
        await snippetItem.click();
      }
    }

    const exportBtn = page.getByRole("button", { name: "Export" });
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      const exportJson = page.getByRole("menuitem", { name: /json/i }).first();
      if (await exportJson.isVisible()) {
        await page.keyboard.press("Escape");
      }
    }

    const moreBtn = page.getByRole("button", { name: /more tools/i });
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await page.keyboard.press("Escape");
    }

    await page.goto("/contrast");
    const fgInput = page.locator("#fg-hex");
    await expect(fgInput).toBeVisible({ timeout: 10000 });
    await fgInput.fill("#000000");

    await page.goto("/challenges");
    const firstChallenge = page
      .getByRole("link", { name: /open|start|solve/i })
      .first();
    if (await firstChallenge.isVisible()) {
      await firstChallenge.click();
      await expect(page.locator(".cm-content")).toBeVisible({ timeout: 10000 });
    }

    const inPageViolations = await page.evaluate(() => {
      return (
        (window as unknown as { __cspViolations?: string[] }).__cspViolations ||
        []
      );
    });

    expect(cspViolations).toEqual([]);
    expect(inPageViolations).toEqual([]);
  });

  test("isolates hostile payload in sandboxed iframe and prevents parent origin compromise", async ({
    page,
  }) => {
    const maliciousHtml = `<script>
      try {
        window.parent.localStorage.setItem('pwned_local', 'true');
      } catch (e) {
        window.__parentStorageBlocked = true;
      }
      try {
        window.parent.__hostileScriptRan = true;
      } catch (e) {
        window.__parentPropertyBlocked = true;
      }
    </script>
    <img src="invalid-url" onerror="try { window.parent.__hostileImgRan = true; } catch(e){}" />
    <a href="javascript:try{window.parent.__hostileLinkRan=true}catch(e){}">click</a>`;

    const encoded = encodeSnippet(maliciousHtml, "body { background: red; }");

    await page.goto(`/playground?s=${encoded}`);
    await expect(page.locator(".cm-content")).toBeVisible({ timeout: 15000 });

    const parentCheck = await page.evaluate(() => {
      return {
        localStoragePwned: window.localStorage.getItem("pwned_local"),
        hostileScriptRan: (
          window as unknown as { __hostileScriptRan?: boolean }
        ).__hostileScriptRan,
        hostileImgRan: (window as unknown as { __hostileImgRan?: boolean })
          .__hostileImgRan,
        hostileLinkRan: (window as unknown as { __hostileLinkRan?: boolean })
          .__hostileLinkRan,
      };
    });

    expect(parentCheck.localStoragePwned).toBeNull();
    expect(parentCheck.hostileScriptRan).toBeUndefined();
    expect(parentCheck.hostileImgRan).toBeUndefined();
    expect(parentCheck.hostileLinkRan).toBeUndefined();

    const previewMobileTab = page.getByRole("tab", { name: "Preview" });
    if (await previewMobileTab.isVisible()) {
      await previewMobileTab.click();
    }

    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    await expect(iframe).toHaveAttribute("src", "/preview-frame");
  });
});

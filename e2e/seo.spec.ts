import { test, expect } from "@playwright/test";

test.describe("SEO and Sharing Endpoints", () => {
  test("GET /robots.txt returns valid robots content and references sitemap", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toMatch(/text\/plain/);

    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /*?s=");
    expect(body).toContain("Sitemap: https://");
    expect(body).toContain("/sitemap.xml");
  });

  test("GET /sitemap.xml returns valid xml containing public routes and no query strings", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toMatch(/application\/xml|text\/xml/);

    const xml = await res.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>");

    const expectedPaths = [
      "/about",
      "/challenges",
      "/learn",
      "/contrast",
      "/playground",
      "/learn/semantic-html",
      "/learn/aria",
    ];

    for (const path of expectedPaths) {
      expect(xml).toContain(path);
    }

    expect(xml).not.toContain("?s=");
    expect(xml).not.toContain("?challenge=");
  });

  test("GET /manifest.webmanifest returns valid web manifest", async ({
    request,
  }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toMatch(/application\/(manifest\+)?json/);

    const manifest = await res.json();
    expect(manifest.name).toBe("Accessibility Playground");
    expect(manifest.short_name).toBe("A11y Playground");
    expect(manifest.display).toBe("browser");
    expect(manifest.theme_color).toBe("#1d4ed8");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("Shared playground URL includes noindex robots meta tag", async ({
    page,
  }) => {
    const shareUrl = "/playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0=";
    await page.goto(shareUrl);
    await page.waitForLoadState("domcontentloaded");

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveCount(1);
    const content = await robotsMeta.getAttribute("content");
    expect(content).toContain("noindex");
    expect(content).toContain("nofollow");
  });

  test("Public routes have title, description, and do not have noindex", async ({
    page,
  }) => {
    const publicRoutes = [
      "/",
      "/about",
      "/challenges",
      "/learn",
      "/contrast",
      "/playground",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);

      const robotsMeta = page.locator('meta[name="robots"]');
      const count = await robotsMeta.count();
      if (count > 0) {
        const content = await robotsMeta.getAttribute("content");
        expect(content).not.toContain("noindex");
      }
    }
  });

  test("Structured data JSON-LD is truthful and parses correctly", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const appJsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(appJsonLd).toBeTruthy();
    const appData = JSON.parse(appJsonLd!);
    expect(appData["@type"]).toBe("WebApplication");
    expect(appData["name"]).toBe("Accessibility Playground");

    await page.goto("/learn/semantic-html");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const parsed = scripts.map((s) => JSON.parse(s));
    const learningResource = parsed.find(
      (item) => item["@type"] === "LearningResource"
    );
    expect(learningResource).toBeDefined();
    expect(learningResource!["name"]).toContain("Semantic HTML");
  });
});

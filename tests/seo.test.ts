import { describe, it, expect } from "vitest";

const SITE_URL = "https://accessibility-playground.example.com";

describe("robots.ts", () => {
  it("exports a valid robots function", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();
    expect(result.rules).toBeDefined();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const mainRule = rules.find(
      (r) =>
        r && typeof r === "object" && "userAgent" in r && r.userAgent === "*"
    );
    expect(mainRule).toBeDefined();
    expect(mainRule!.allow).toBe("/");

    const disallow = Array.isArray(mainRule!.disallow)
      ? mainRule!.disallow
      : [mainRule!.disallow];
    expect(disallow).toContain("/*?s=");
  });
});

describe("sitemap.ts", () => {
  it("exports a sitemap with all public routes", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const result = sitemap();
    expect(Array.isArray(result)).toBe(true);

    const urls = result.map((entry) => entry.url);
    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/about`);
    expect(urls).toContain(`${SITE_URL}/challenges`);
    expect(urls).toContain(`${SITE_URL}/learn`);
    expect(urls).toContain(`${SITE_URL}/contrast`);
    expect(urls).toContain(`${SITE_URL}/playground`);
  });

  it("includes all learn topic routes", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const { LEARN_TOPICS } = await import("@/data/learn-topics");
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    for (const topic of LEARN_TOPICS) {
      expect(urls).toContain(`${SITE_URL}/learn/${topic.slug}`);
    }
  });

  it("does not include query-param URLs", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    for (const url of urls) {
      expect(url).not.toContain("?");
    }
  });
});

describe("manifest.ts", () => {
  it("exports a valid manifest", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const result = manifest();
    expect(result.name).toBe("Accessibility Playground");
    expect(result.short_name).toBe("A11y Playground");
    expect(result.display).toBe("browser");
    expect(result.theme_color).toBe("#1d4ed8");
    expect(result.icons).toBeDefined();
    expect(result.icons!.length).toBeGreaterThanOrEqual(2);
  });
});

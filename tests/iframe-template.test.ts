import { describe, it, expect } from "vitest";
import { generatePreviewSrcDoc } from "@/lib/iframe-template";

describe("generatePreviewSrcDoc template", () => {
  it("does not include Tailwind script when useTailwind is false (default)", () => {
    const srcDoc = generatePreviewSrcDoc("<button>Click</button>", ".btn {}");
    expect(srcDoc).not.toContain("cdn.tailwindcss.com");
    expect(srcDoc).toContain('<style id="user-css">.btn {}</style>');
  });

  it("injects Tailwind script before user-css when useTailwind is true", () => {
    const srcDoc = generatePreviewSrcDoc(
      "<button>Click</button>",
      ".btn {}",
      "/axe.min.js",
      true
    );

    expect(srcDoc).toContain(
      '<script src="https://cdn.tailwindcss.com" onerror="window.__tailwindFailed=true;"></script>'
    );

    const tailwindIndex = srcDoc.indexOf("cdn.tailwindcss.com");
    const userCssIndex = srcDoc.indexOf('<style id="user-css">');

    expect(tailwindIndex).toBeGreaterThan(-1);
    expect(userCssIndex).toBeGreaterThan(tailwindIndex);
  });

  it("escapes closing style tags in user CSS", () => {
    const srcDoc = generatePreviewSrcDoc(
      "<p>Test</p>",
      "body { content: '</style>'; }"
    );
    expect(srcDoc).not.toContain("</style>';");
    expect(srcDoc).toContain("<\\/style>';");
  });

  it("produces valid JavaScript with no empty catch blocks", () => {
    const srcDoc = generatePreviewSrcDoc("<p>Test</p>");
    const scriptMatch = srcDoc.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptCode = scriptMatch ? scriptMatch[1] : "";

    // Test that the script body parses as valid JavaScript
    expect(() => new Function(scriptCode)).not.toThrow();

    // Verify there are no empty catch blocks: catch (...) { }
    // Note: comments inside catch blocks are permitted, but completely empty braces are prohibited
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
    const emptyMatches = scriptCode.match(emptyCatchRegex);
    expect(emptyMatches).toBeNull();
  });
});

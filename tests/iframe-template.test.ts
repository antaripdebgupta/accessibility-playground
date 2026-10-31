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
});

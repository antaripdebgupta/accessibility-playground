import { describe, it, expect } from "vitest";
import { extractDocumentIds } from "@/features/playground/editor/extensions/completions/id-refs";
import { extractCssCustomProperties } from "@/features/playground/editor/extensions/completions/css-a11y";
import { HTML_A11Y_SNIPPETS, CSS_A11Y_SNIPPETS } from "@/data/editor-snippets";

describe("Editor completions data & extraction", () => {
  it("extracts document IDs accurately without duplicates", () => {
    const html = `
      <div id="main-content">
        <label for="username">User</label>
        <input id="username" aria-describedby="user-hint user-error" />
        <span id="user-hint">Hint</span>
        <span id="user-error">Error</span>
        <div id="username">Duplicate</div>
      </div>
    `;
    const ids = extractDocumentIds(html);
    expect(ids).toEqual([
      "main-content",
      "username",
      "user-hint",
      "user-error",
    ]);
  });

  it("extracts CSS custom properties accurately without duplicates", () => {
    const css = `
      :root {
        --color-primary: #2563eb;
        --color-focus: #1d4ed8;
        --spacing-md: 16px;
      }
      .card {
        --card-bg: #fff;
        --color-primary: #1e40af;
      }
    `;
    const props = extractCssCustomProperties(css);
    expect(props).toEqual([
      "--color-primary",
      "--color-focus",
      "--spacing-md",
      "--card-bg",
    ]);
  });

  it("contains all specified HTML a11y snippets", () => {
    const labels = HTML_A11Y_SNIPPETS.map((s) => s.label);
    expect(labels).toContain("a11y:button");
    expect(labels).toContain("a11y:skip-link");
    expect(labels).toContain("a11y:dialog");
    expect(labels).toContain("a11y:tabs");
    expect(labels).toContain("a11y:disclosure");
    expect(labels).toContain("a11y:form-field");
    expect(labels).toContain("a11y:img-decorative");
    expect(labels).toContain("a11y:table");
    expect(labels).toContain("a11y:live-region");
  });

  it("contains all specified CSS a11y snippets", () => {
    const labels = CSS_A11Y_SNIPPETS.map((s) => s.label);
    expect(labels).toContain("a11y:focus-ring");
    expect(labels).toContain("a11y:sr-only");
    expect(labels).toContain("a11y:reduced-motion");
    expect(labels).toContain("a11y:forced-colors");
  });
});

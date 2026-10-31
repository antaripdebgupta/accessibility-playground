import { describe, it, expect } from "vitest";
import { htmlToJsx } from "@/lib/html-to-jsx";
import { PATTERNS } from "@/data/patterns";

describe("htmlToJsx transform", () => {
  it("converts class to className", () => {
    const input = '<div class="btn primary">Text</div>';
    expect(htmlToJsx(input)).toBe('<div className="btn primary">Text</div>');
  });

  it("converts for to htmlFor", () => {
    const input = '<label for="username">Username</label>';
    expect(htmlToJsx(input)).toBe('<label htmlFor="username">Username</label>');
  });

  it("converts inline style to JSX style object", () => {
    const input =
      '<div style="color: red; font-size: 14px; background-color: #fff">Text</div>';
    const output = htmlToJsx(input);
    expect(output).toBe(
      `<div style={{ color: 'red', fontSize: '14px', backgroundColor: '#fff' }}>Text</div>`
    );
  });

  it("self-closes void elements", () => {
    expect(htmlToJsx('<img src="a.png" alt="test">')).toBe(
      '<img src="a.png" alt="test" />'
    );
    expect(htmlToJsx('<input type="text" class="inp">')).toBe(
      '<input type="text" className="inp" />'
    );
    expect(htmlToJsx("<br>")).toBe("<br />");
    expect(htmlToJsx("<hr>")).toBe("<hr />");
    // Already self-closed should remain self-closed
    expect(htmlToJsx('<img src="a.png" alt="" />')).toBe(
      '<img src="a.png" alt="" />'
    );
  });

  it("preserves aria-* and data-* attributes unchanged", () => {
    const input =
      '<button aria-expanded="true" data-testid="toggle-btn" class="btn">Toggle</button>';
    expect(htmlToJsx(input)).toBe(
      '<button aria-expanded="true" data-testid="toggle-btn" className="btn">Toggle</button>'
    );
  });

  it("transforms all existing pattern pairs in PATTERNS successfully", () => {
    for (const pattern of PATTERNS) {
      const badJsx = htmlToJsx(pattern.badCode);
      const goodJsx = htmlToJsx(pattern.goodCode);

      // Must not contain raw class="..." or for="..."
      expect(badJsx).not.toMatch(/\bclass=/);
      expect(badJsx).not.toMatch(/\bfor=/);
      expect(goodJsx).not.toMatch(/\bclass=/);
      expect(goodJsx).not.toMatch(/\bfor=/);

      // Length should be non-empty
      expect(badJsx.length).toBeGreaterThan(0);
      expect(goodJsx.length).toBeGreaterThan(0);
    }
  });
});

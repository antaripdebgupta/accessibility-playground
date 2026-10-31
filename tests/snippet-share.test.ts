import { describe, it, expect } from "vitest";
import { encodeSnippet, decodeSnippet } from "@/lib/snippet-share";

describe("Snippet sharing permalink", () => {
  it("encodes and decodes simple HTML and CSS round-trip", () => {
    const html = '<button class="btn">Click me</button>';
    const css = ".btn { color: red; }";

    const encoded = encodeSnippet(html, css);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeSnippet(encoded);
    expect(decoded).toEqual({ html, css });
  });

  it("handles empty CSS gracefully", () => {
    const html = "<h1>Hello World</h1>";
    const css = "";

    const encoded = encodeSnippet(html, css);
    const decoded = decodeSnippet(encoded);
    expect(decoded).toEqual({ html, css: "" });
  });

  it("handles special characters and unicode", () => {
    const html = '<div>🚀 "Quotes" & <brackets> 測試 éàç</div>';
    const css = "body::after { content: '✨'; }";

    const encoded = encodeSnippet(html, css);
    const decoded = decodeSnippet(encoded);
    expect(decoded).toEqual({ html, css });
  });

  it("returns null for invalid base64 or corrupted payload", () => {
    expect(decodeSnippet("invalid-base64-content!")).toBeNull();
    // Valid base64 but not JSON
    expect(decodeSnippet(btoa("just plain text"))).toBeNull();
    // Valid JSON but missing required fields
    expect(decodeSnippet(btoa(JSON.stringify({ notH: 123 })))).toBeNull();
  });
});

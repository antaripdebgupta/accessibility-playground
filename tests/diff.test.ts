import { describe, it, expect } from "vitest";
import { computeLineDiff } from "@/lib/diff";

describe("computeLineDiff", () => {
  it("returns unchanged lines for identical texts", () => {
    const text = "<button>Click me</button>\n<p>Hello</p>";
    const diff = computeLineDiff(text, text);
    expect(diff.every((d) => d.type === "unchanged")).toBe(true);
    expect(diff).toHaveLength(2);
  });

  it("detects added lines", () => {
    const oldText = "<main>\n</main>";
    const newText = "<main>\n  <h1>Title</h1>\n</main>";
    const diff = computeLineDiff(oldText, newText);

    const added = diff.filter((d) => d.type === "added");
    expect(added).toHaveLength(1);
    expect(added[0]?.text).toBe("  <h1>Title</h1>");
  });

  it("detects removed lines", () => {
    const oldText = "<main>\n  <img src='x.png'>\n</main>";
    const newText = "<main>\n</main>";
    const diff = computeLineDiff(oldText, newText);

    const removed = diff.filter((d) => d.type === "removed");
    expect(removed).toHaveLength(1);
    expect(removed[0]?.text).toBe("  <img src='x.png'>");
  });

  it("detects modified lines (removed + added)", () => {
    const oldText = '<img src="x.png">';
    const newText = '<img src="x.png" alt="Photo">';
    const diff = computeLineDiff(oldText, newText);

    expect(diff.some((d) => d.type === "removed")).toBe(true);
    expect(diff.some((d) => d.type === "added")).toBe(true);
  });
});

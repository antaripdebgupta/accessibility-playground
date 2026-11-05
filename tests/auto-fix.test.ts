import { describe, it, expect } from "vitest";
import {
  isAutoFixable,
  computeFixPreview,
  applyAutoFixToHtml,
} from "@/lib/auto-fix";
import type { A11yNode, AxeFinding } from "@/types/a11y";

function makeFinding(id: string, targetId: string, html: string): AxeFinding {
  return {
    id,
    impact: "serious",
    description: "test rule",
    help: "test help",
    helpUrl: "https://example.com",
    wcag: ["2.1.1"],
    nodes: [
      {
        targetId,
        target: [targetId],
        html,
        failureSummary: "failed",
      },
    ],
  };
}

function makeNode(overrides: Partial<A11yNode>): A11yNode {
  return {
    id: "node-1",
    tagName: "div",
    role: "generic",
    implicitRole: "generic",
    accessibleName: "",
    accessibleNameSource: "none",
    hasAccessibleName: false,
    hasInlineHandler: false,
    inlineHandlers: [],
    ariaAttributes: {},
    attributes: {},
    children: [],
    ...overrides,
  };
}

describe("Auto-Fix Suggestions", () => {
  it("only allows positive-tabindex, aria-hidden-focusable, and img-missing-alt", () => {
    expect(isAutoFixable("positive-tabindex")).toBe(true);
    expect(isAutoFixable("aria-hidden-focusable")).toBe(true);
    expect(isAutoFixable("img-missing-alt")).toBe(true);

    // Explicitly un-fixable per prompt scope
    expect(isAutoFixable("input-no-label")).toBe(false);
    expect(isAutoFixable("empty-interactive-name")).toBe(false);
    expect(isAutoFixable("heading-order")).toBe(false);
  });

  describe("positive-tabindex auto-fix", () => {
    it("computes preview rewriting tabindex to 0", () => {
      const finding = makeFinding(
        "positive-tabindex",
        "btn-1",
        '<button tabindex="3">Submit</button>'
      );
      const diff = computeFixPreview(finding);
      expect(diff).not.toBeNull();
      expect(diff?.beforeTag).toBe('<button tabindex="3">');
      expect(diff?.afterTag).toBe('<button tabindex="0">');
    });

    it("applies fix to HTML source", () => {
      const html = '<button tabindex="3">Submit</button>';
      const finding = makeFinding("positive-tabindex", "btn-1", html);
      const node = makeNode({
        tagName: "button",
        sourceRange: [0, html.length],
        attributes: { tabindex: "3" },
      });

      const fixed = applyAutoFixToHtml(html, finding, node);
      expect(fixed.html).toBe('<button tabindex="0">Submit</button>');
    });
  });

  describe("aria-hidden-focusable auto-fix", () => {
    it("computes preview removing aria-hidden", () => {
      const finding = makeFinding(
        "aria-hidden-focusable",
        "btn-1",
        '<button aria-hidden="true">Menu</button>'
      );
      const diff = computeFixPreview(finding);
      expect(diff).not.toBeNull();
      expect(diff?.beforeTag).toBe('<button aria-hidden="true">');
      expect(diff?.afterTag).toBe("<button>");
    });

    it("applies fix to HTML source", () => {
      const html = '<button aria-hidden="true">Menu</button>';
      const finding = makeFinding("aria-hidden-focusable", "btn-1", html);
      const node = makeNode({
        tagName: "button",
        sourceRange: [0, html.length],
        attributes: { "aria-hidden": "true" },
        ariaAttributes: { "aria-hidden": "true" },
      });

      const fixed = applyAutoFixToHtml(html, finding, node);
      expect(fixed.html).toBe("<button>Menu</button>");
    });
  });

  describe("img-missing-alt auto-fix", () => {
    it("never writes 'TODO' placeholder string into user code in any preview or output", () => {
      const finding = makeFinding(
        "img-missing-alt",
        "img-1",
        '<img src="photo.jpg">'
      );
      const previewWithCaption = computeFixPreview(finding, {
        hasVisibleCaption: true,
        mode: "use-caption",
      });
      const previewInformative = computeFixPreview(finding, {
        mode: "informative",
      });
      const previewDecorative = computeFixPreview(finding, {
        mode: "decorative",
      });

      expect(previewWithCaption?.afterTag).not.toContain("TODO");
      expect(previewInformative?.afterTag).not.toContain("TODO");
      expect(previewDecorative?.afterTag).not.toContain("TODO");
    });

    it("computes preview for decorative image (alt='')", () => {
      const finding = makeFinding(
        "img-missing-alt",
        "img-1",
        '<img src="photo.jpg" />'
      );
      const diff = computeFixPreview(finding, { mode: "decorative" });
      expect(diff).not.toBeNull();
      expect(diff?.afterTag).toBe('<img src="photo.jpg" alt="" />');
    });

    it("computes preview for informative image (alt='') with note", () => {
      const finding = makeFinding(
        "img-missing-alt",
        "img-1",
        '<img src="photo.jpg" />'
      );
      const diff = computeFixPreview(finding, { mode: "informative" });
      expect(diff).not.toBeNull();
      expect(diff?.afterTag).toBe('<img src="photo.jpg" alt="" />');
      expect(diff?.note).toBe(
        "Describe what the image shows and why it's there."
      );
    });

    it("computes preview for use-caption when caption exists", () => {
      const finding = makeFinding(
        "img-missing-alt",
        "img-1",
        '<img src="photo.jpg">'
      );
      const diff = computeFixPreview(finding, {
        hasVisibleCaption: true,
        mode: "use-caption",
      });
      expect(diff).not.toBeNull();
      expect(diff?.afterTag).toBe('<img src="photo.jpg" alt="">');
      expect(diff?.note).toBe(
        "Nearby caption describes this image; empty alt prevents double announcement."
      );
    });

    it("applies informative alt='' and returns caret position inside the quotes", () => {
      const html = '<img src="banner.jpg" />';
      const finding = makeFinding("img-missing-alt", "img-1", html);
      const node = makeNode({
        tagName: "img",
        sourceRange: [0, html.length],
        attributes: { src: "banner.jpg" },
      });

      const result = applyAutoFixToHtml(html, finding, node, {
        mode: "informative",
      });
      expect(result.html).toBe('<img src="banner.jpg" alt="" />');
      // Caret must be inside quotes: right after alt="
      const expectedCaret = result.html.indexOf('alt="') + 'alt="'.length;
      expect(result.caretOffset).toBe(expectedCaret);
    });

    it("applies decorative alt='' without caret positioning", () => {
      const html = '<figure><img src="chart.png"><figcaption>Q3 Sales Growth</figcaption></figure>';
      const imgStr = '<img src="chart.png">';
      const start = html.indexOf(imgStr);
      const end = start + imgStr.length;

      const finding = makeFinding("img-missing-alt", "img-1", imgStr);
      const node = makeNode({
        tagName: "img",
        sourceRange: [start, end],
        attributes: { src: "chart.png" },
      });

      const result = applyAutoFixToHtml(html, finding, node, {
        mode: "decorative",
      });
      expect(result.html).not.toContain("TODO");
      expect(result.html).toBe(
        '<figure><img src="chart.png" alt=""><figcaption>Q3 Sales Growth</figcaption></figure>'
      );
      expect(result.caretOffset).toBeUndefined();
    });
  });
});

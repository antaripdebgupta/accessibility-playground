import { describe, it, expect } from "vitest";
import { runCustomRules } from "@/lib/custom-rules";
import type { A11yNode } from "@/types/a11y";

function createMockNode(overrides: Partial<A11yNode>): A11yNode {
  return {
    id: "node-1",
    tagName: "div",
    role: "generic",
    implicitRole: "generic",
    accessibleName: "Mock Element",
    accessibleNameSource: "text",
    ariaAttributes: {},
    attributes: {},
    hasInlineHandler: false,
    inlineHandlers: [],
    hasAccessibleName: true,
    children: [],
    ...overrides,
  };
}

describe("Custom Playground Rules Engine (Task 5b)", () => {
  it("detects click-on-non-interactive", () => {
    const node = createMockNode({
      tagName: "div",
      role: "generic",
      attributes: { onclick: "alert(1)" },
      hasInlineHandler: true,
      inlineHandlers: ["onclick"],
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "click-on-non-interactive")).toBe(
      true
    );
  });

  it("detects interactive-role-not-focusable", () => {
    const node = createMockNode({
      tagName: "div",
      role: "button",
      explicitRole: "button",
      attributes: { role: "button" },
    });
    const findings = runCustomRules(node);
    expect(
      findings.some((f) => f.id === "interactive-role-not-focusable")
    ).toBe(true);
  });

  it("detects link-as-button for href='#'", () => {
    const node = createMockNode({
      tagName: "a",
      role: "link",
      attributes: { href: "#", onclick: "deleteItem()" },
      hasInlineHandler: true,
      inlineHandlers: ["onclick"],
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "link-as-button")).toBe(true);
  });

  it("detects input-placeholder-only", () => {
    const node = createMockNode({
      tagName: "input",
      role: "textbox",
      attributes: { type: "text", placeholder: "Your Email" },
      accessibleName: "Your Email",
      accessibleNameSource: "placeholder",
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "input-placeholder-only")).toBe(true);
  });

  it("detects input-no-label", () => {
    const node = createMockNode({
      tagName: "input",
      role: "textbox",
      attributes: { type: "text" },
      hasAccessibleName: false,
      accessibleName: "",
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "input-no-label")).toBe(true);
  });

  it("detects img-missing-alt", () => {
    const node = createMockNode({
      tagName: "img",
      role: "image",
      attributes: { src: "/photo.png" }, // alt missing
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "img-missing-alt")).toBe(true);
  });

  it("detects empty-interactive-name", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      attributes: { type: "button" },
      hasAccessibleName: false,
      accessibleName: "",
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "empty-interactive-name")).toBe(true);
  });

  it("detects positive-tabindex", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      attributes: { type: "button", tabindex: "2" },
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "positive-tabindex")).toBe(true);
  });

  it("detects aria-hidden-focusable", () => {
    const focusableChild = createMockNode({
      id: "child-btn",
      tagName: "button",
      role: "button",
      attributes: { type: "button" },
    });
    const parentNode = createMockNode({
      id: "hidden-wrapper",
      tagName: "div",
      attributes: { "aria-hidden": "true" },
      children: [focusableChild],
    });
    const findings = runCustomRules(parentNode);
    expect(findings.some((f) => f.id === "aria-hidden-focusable")).toBe(true);
  });

  it("detects heading-order skipping (h1 -> h3)", () => {
    const h1 = createMockNode({ id: "h1", tagName: "h1", role: "heading" });
    const h3 = createMockNode({ id: "h3", tagName: "h3", role: "heading" });
    const root = createMockNode({
      id: "doc",
      tagName: "fragment",
      children: [h1, h3],
    });
    const findings = runCustomRules(root);
    expect(findings.some((f) => f.id === "heading-order")).toBe(true);
  });

  it("detects dialog-no-name", () => {
    const node = createMockNode({
      tagName: "div",
      role: "dialog",
      attributes: { role: "dialog" },
      hasAccessibleName: false,
      accessibleName: "",
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "dialog-no-name")).toBe(true);
  });

  it("detects tab-pattern-incomplete", () => {
    const node = createMockNode({
      tagName: "div",
      role: "tab",
      attributes: { role: "tab" },
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "tab-pattern-incomplete")).toBe(true);
  });

  it("detects duplicate-id and broken reference", () => {
    const el1 = createMockNode({
      id: "e1",
      tagName: "div",
      attributes: { id: "user-name" },
    });
    const el2 = createMockNode({
      id: "e2",
      tagName: "span",
      attributes: { id: "user-name" },
    });
    const label = createMockNode({
      id: "lbl",
      tagName: "label",
      attributes: { for: "missing-target" },
    });
    const root = createMockNode({
      id: "root",
      tagName: "fragment",
      children: [el1, el2, label],
    });
    const findings = runCustomRules(root);
    expect(findings.some((f) => f.id === "duplicate-id")).toBe(true);
  });

  it("detects invalid-aria", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      ariaAttributes: { "aria-orientation": "horizontal" }, // not allowed on button
    });
    const findings = runCustomRules(node);
    expect(findings.some((f) => f.id === "invalid-aria")).toBe(true);
  });

  it("detects outline-removed when CSS has outline: none without focus style", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      attributes: { type: "button" },
    });
    const css = "button { outline: none; }";
    const findings = runCustomRules(node, css);
    expect(findings.some((f) => f.id === "outline-removed")).toBe(true);
  });
});

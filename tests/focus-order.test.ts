import { describe, it, expect } from "vitest";
import { computeFocusOrder } from "@/lib/focus-order";
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

describe("Focus Order Computation (WCAG 2.2 SC 2.4.3)", () => {
  it("reads tabindex from attributes correctly", () => {
    const root = createMockNode({
      id: "btn-1",
      tagName: "div",
      role: "button",
      attributes: { role: "button", tabindex: "0" },
      hasAccessibleName: true,
      accessibleName: "Save",
    });

    const result = computeFocusOrder(root);
    expect(result.sequence).toHaveLength(1);
    expect(result.sequence[0]!.tabIndex).toBe(0);
    // Should NOT be flagged as unreachable
    const unreachable = result.findings.find((f) =>
      f.id.startsWith("unreachable-role")
    );
    expect(unreachable).toBeUndefined();
  });

  it("flags interactive role without keyboard focusability as unreachable", () => {
    const root = createMockNode({
      id: "div-btn",
      tagName: "div",
      role: "button",
      attributes: { role: "button" },
      hasAccessibleName: true,
      accessibleName: "Click Me",
    });

    const result = computeFocusOrder(root);
    expect(result.sequence).toHaveLength(0);
    const unreachable = result.findings.find(
      (f) => f.id === "unreachable-role-div-btn"
    );
    expect(unreachable).toBeDefined();
    expect(unreachable!.impact).toBe("critical");
  });

  it("flags positive tabindex as serious violation", () => {
    const root = createMockNode({
      id: "pos-btn",
      tagName: "button",
      role: "button",
      attributes: { tabindex: "3" },
      hasAccessibleName: true,
      accessibleName: "Jump",
    });

    const result = computeFocusOrder(root);
    expect(result.sequence).toHaveLength(1);
    expect(result.sequence[0]!.tabIndex).toBe(3);
    const positiveFinding = result.findings.find(
      (f) => f.id === "positive-tabindex-pos-btn"
    );
    expect(positiveFinding).toBeDefined();
    expect(positiveFinding!.impact).toBe("serious");
  });

  it("treats disabled, hidden, inert, and aria-hidden as non-focusable", () => {
    const disabledBtn = createMockNode({
      id: "btn-disabled",
      tagName: "button",
      role: "button",
      attributes: { disabled: "" },
    });

    const hiddenBtn = createMockNode({
      id: "btn-hidden",
      tagName: "button",
      role: "button",
      attributes: { hidden: "" },
    });

    const inertBtn = createMockNode({
      id: "btn-inert",
      tagName: "button",
      role: "button",
      attributes: { inert: "" },
    });

    const ariaHiddenBtn = createMockNode({
      id: "btn-aria-hidden",
      tagName: "button",
      role: "button",
      attributes: { "aria-hidden": "true" },
    });

    const root = createMockNode({
      id: "container",
      tagName: "fragment",
      children: [disabledBtn, hiddenBtn, inertBtn, ariaHiddenBtn],
    });

    const result = computeFocusOrder(root);
    expect(result.sequence).toHaveLength(0);
  });

  it("orders positive tabindex before zero tabindex, sorted ascending", () => {
    const btn1 = createMockNode({
      id: "b1",
      tagName: "button",
      role: "button",
      attributes: { tabindex: "0" },
      accessibleName: "Normal 1",
    });
    const btn2 = createMockNode({
      id: "b2",
      tagName: "button",
      role: "button",
      attributes: { tabindex: "2" },
      accessibleName: "Second Priority",
    });
    const btn3 = createMockNode({
      id: "b3",
      tagName: "button",
      role: "button",
      attributes: { tabindex: "1" },
      accessibleName: "First Priority",
    });

    const root = createMockNode({
      id: "fragment",
      tagName: "fragment",
      children: [btn1, btn2, btn3],
    });

    const result = computeFocusOrder(root);
    expect(result.sequence).toHaveLength(3);
    expect(result.sequence[0]!.id).toBe("b3"); // tabindex 1
    expect(result.sequence[1]!.id).toBe("b2"); // tabindex 2
    expect(result.sequence[2]!.id).toBe("b1"); // tabindex 0
  });
});

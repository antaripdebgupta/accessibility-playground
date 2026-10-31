import { describe, it, expect } from "vitest";
import {
  computeAnnouncement,
  computeAnnouncementDetails,
} from "@/lib/announcement";
import type { A11yNode } from "@/types/a11y";

function createMockNode(overrides: Partial<A11yNode>): A11yNode {
  return {
    id: "test-node",
    role: "generic",
    tagName: "div",
    accessibleName: "",
    hasAccessibleName: false,
    accessibleNameSource: "none",
    ariaAttributes: {},
    attributes: {},
    children: [],
    hasInlineHandler: false,
    inlineHandlers: [],
    implicitRole: "generic",
    ...overrides,
  };
}

describe("Screen-reader Announcement computation", () => {
  it("computes announcement for a simple button", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      accessibleName: "Submit",
      hasAccessibleName: true,
      accessibleNameSource: "subtree text",
    });

    expect(computeAnnouncement(node)).toBe("Submit, button");
    const details = computeAnnouncementDetails(node);
    expect(details.text).toBe("Submit, button");
    expect(details.parts).toEqual([
      { type: "name", label: "Accessible Name", value: "Submit" },
      { type: "role", label: "Role", value: "button" },
    ]);
  });

  it("computes announcement for a checked checkbox", () => {
    const node = createMockNode({
      tagName: "input",
      role: "checkbox",
      accessibleName: "Accept terms",
      hasAccessibleName: true,
      ariaAttributes: { "aria-checked": "true" },
    });

    expect(computeAnnouncement(node)).toBe("Accept terms, checkbox, checked");
  });

  it("computes announcement for an expanded disclosure button", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      accessibleName: "Details",
      hasAccessibleName: true,
      ariaAttributes: { "aria-expanded": "true" },
    });

    expect(computeAnnouncement(node)).toBe("Details, button, expanded");
  });

  it("computes announcement for an invalid required input", () => {
    const node = createMockNode({
      tagName: "input",
      role: "textbox",
      accessibleName: "Email",
      hasAccessibleName: true,
      ariaAttributes: {
        "aria-invalid": "true",
        "aria-required": "true",
      },
    });

    expect(computeAnnouncement(node)).toBe(
      "Email, textbox, invalid entry, required"
    );
  });

  it("computes announcement for a current-page link", () => {
    const node = createMockNode({
      tagName: "a",
      role: "link",
      accessibleName: "Home",
      hasAccessibleName: true,
      ariaAttributes: { "aria-current": "page" },
    });

    expect(computeAnnouncement(node)).toBe("Home, link, current page");
  });

  it("handles dimmed state for disabled elements", () => {
    const node = createMockNode({
      tagName: "button",
      role: "button",
      accessibleName: "Save",
      hasAccessibleName: true,
      attributes: { disabled: "" },
    });

    expect(computeAnnouncement(node)).toBe("Save, button, dimmed");
  });

  it("handles partially checked checkbox", () => {
    const node = createMockNode({
      tagName: "div",
      role: "checkbox",
      accessibleName: "Select all",
      hasAccessibleName: true,
      ariaAttributes: { "aria-checked": "mixed" },
    });

    expect(computeAnnouncement(node)).toBe(
      "Select all, checkbox, partially checked"
    );
  });
});

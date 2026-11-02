import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { usePlaygroundAnalysis } from "@/features/playground/hooks/usePlaygroundAnalysis";
import type { AxeFinding, Finding } from "@/types/a11y";

function runHook<T>(hook: () => T): T {
  let value!: T;
  function Test() {
    value = hook();
    return null;
  }
  renderToStaticMarkup(React.createElement(Test));
  return value;
}

describe("usePlaygroundAnalysis", () => {
  it("derives AST, focus order, custom findings, and normalized findings", () => {
    const rawHtml = '<button id="btn">Click me</button><img src="x.png">';
    const result = runHook(() =>
      usePlaygroundAnalysis({
        debouncedHtml: rawHtml,
        rawHtml,
        debouncedCss: "",
        isOverSizeLimit: false,
        axeViolations: [],
        axeIncomplete: [],
      })
    );

    expect(result.ast).not.toBeNull();
    expect(result.parseError).toBeNull();
    expect(result.focusOrder).not.toBeNull();
    expect(result.focusOrder?.sequence.length).toBeGreaterThan(0);
    expect(result.instrumentedHtml).toContain("data-a11y-id");
    // custom rules should catch img-missing-alt
    expect(
      result.customFindings.some((f: AxeFinding) => f.id === "img-missing-alt")
    ).toBe(true);
    expect(result.violationCount).toBeGreaterThan(0);
    expect(result.currentViolationRuleIds).toContain("img-missing-alt");
  });

  it("handles oversize limit gracefully by skipping live AST parsing", () => {
    const rawHtml = '<div id="test">Hello</div>';
    const result = runHook(() =>
      usePlaygroundAnalysis({
        debouncedHtml: rawHtml,
        rawHtml,
        debouncedCss: "",
        isOverSizeLimit: true,
        axeViolations: [],
        axeIncomplete: [],
      })
    );

    expect(result.ast).toBeNull();
    expect(result.parseError).toBe("Document too large for live AST parsing.");
    expect(result.focusOrder).toBeNull();
    expect(result.customFindings).toEqual([]);
  });

  it("merges axe violations with custom findings cleanly", () => {
    const rawHtml = '<button id="btn">Click me</button>';
    const mockAxeViolation: AxeFinding = {
      id: "color-contrast",
      impact: "serious",
      description: "Low contrast ratio",
      help: "Ensure contrast ratio meets threshold",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
      nodes: [
        {
          targetId: "btn",
          html: "<button>Click me</button>",
          target: ["#btn"],
        },
      ],
    };

    const result = runHook(() =>
      usePlaygroundAnalysis({
        debouncedHtml: rawHtml,
        rawHtml,
        debouncedCss: "",
        isOverSizeLimit: false,
        axeViolations: [mockAxeViolation],
        axeIncomplete: [],
      })
    );

    expect(
      result.findings.some((f: Finding) => f.ruleId === "color-contrast")
    ).toBe(true);
    expect(
      result.mergedViolations.some((f: AxeFinding) => f.id === "color-contrast")
    ).toBe(true);
  });
});

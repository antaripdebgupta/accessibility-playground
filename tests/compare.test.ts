import { describe, it, expect } from "vitest";
import { compare } from "@/lib/compare";
import type { Finding } from "@/types/a11y";

/** Helper to build a minimal Finding with overrides */
function makeFinding(
  overrides: Partial<Finding> & Pick<Finding, "fingerprint" | "ruleId">
): Finding {
  return {
    engine: "playground",
    status: "violation",
    confidence: "high",
    impact: "serious",
    wcag: [],
    help: "test help",
    description: "test desc",
    helpUrl: "",
    nodes: [{ html: "<div></div>", target: [".el"], targetId: "el-1" }],
    ...overrides,
  };
}

describe("compare()", () => {
  it("classifies identical sets as all remaining", () => {
    const findings = [
      makeFinding({ fingerprint: "aaa", ruleId: "img-missing-alt" }),
      makeFinding({ fingerprint: "bbb", ruleId: "button-name" }),
    ];
    const result = compare(findings, findings);

    expect(result.remaining).toHaveLength(2);
    expect(result.resolved).toHaveLength(0);
    expect(result.introduced).toHaveLength(0);
    expect(result.remaining.every((r) => r.disposition === "remaining")).toBe(
      true
    );
  });

  it("classifies removed fingerprint with same element key as resolved", () => {
    const baseline = [
      makeFinding({
        fingerprint: "aaa",
        ruleId: "img-missing-alt",
        nodes: [{ html: "<img>", target: ["img"], targetId: "el-1" }],
      }),
    ];
    // Same element key (ruleId + targetId) but different fingerprint (HTML changed)
    const current = [
      makeFinding({
        fingerprint: "bbb",
        ruleId: "link-name",
        nodes: [
          { html: '<img alt="desc">', target: ["img"], targetId: "el-1" },
        ],
      }),
    ];
    const result = compare(baseline, current);

    // The img-missing-alt finding is gone, but el-1 still exists (link-name on it).
    // So img-missing-alt is resolved (re-evaluated, no longer fires).
    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0]?.disposition).toBe("resolved");
    expect(result.remaining).toHaveLength(0);
    expect(result.introduced).toHaveLength(1);
  });

  it("classifies removed fingerprint with no element key as element-removed", () => {
    const baseline = [
      makeFinding({
        fingerprint: "aaa",
        ruleId: "img-missing-alt",
        nodes: [{ html: "<img>", target: ["img"], targetId: "el-removed" }],
      }),
    ];
    // Element is completely gone from current
    const current: Finding[] = [];
    const result = compare(baseline, current);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0]?.disposition).toBe("element-removed");
    expect(result.remaining).toHaveLength(0);
    expect(result.introduced).toHaveLength(0);
  });

  it("classifies new findings as introduced", () => {
    const baseline: Finding[] = [];
    const current = [
      makeFinding({ fingerprint: "new1", ruleId: "button-name" }),
    ];
    const result = compare(baseline, current);

    expect(result.introduced).toHaveLength(1);
    expect(result.introduced[0]?.disposition).toBe("introduced");
    expect(result.resolved).toHaveLength(0);
    expect(result.remaining).toHaveLength(0);
  });

  it("handles mixed scenario: some resolved, some remaining, some introduced", () => {
    const shared = makeFinding({
      fingerprint: "shared",
      ruleId: "heading-order",
      nodes: [{ html: "<h3>X</h3>", target: ["h3"], targetId: "el-2" }],
    });
    const baseline = [
      makeFinding({
        fingerprint: "will-resolve",
        ruleId: "img-missing-alt",
        nodes: [{ html: "<img>", target: ["img"], targetId: "el-1" }],
      }),
      shared,
    ];
    const current = [
      shared,
      makeFinding({
        fingerprint: "new-finding",
        ruleId: "color-contrast",
        nodes: [{ html: "<p>text</p>", target: ["p"], targetId: "el-3" }],
      }),
    ];
    const result = compare(baseline, current);

    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0]?.finding.fingerprint).toBe("shared");

    // el-1 is gone from current → element-removed
    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0]?.disposition).toBe("element-removed");

    expect(result.introduced).toHaveLength(1);
    expect(result.introduced[0]?.finding.fingerprint).toBe("new-finding");
  });

  it("handles duplicate elements (same ruleId different nodes)", () => {
    const baseline = [
      makeFinding({
        fingerprint: "f1",
        ruleId: "button-name",
        nodes: [
          {
            html: "<button></button>",
            target: ["button:nth-of-type(1)"],
            targetId: "btn-1",
          },
        ],
      }),
      makeFinding({
        fingerprint: "f2",
        ruleId: "button-name",
        nodes: [
          {
            html: "<button></button>",
            target: ["button:nth-of-type(2)"],
            targetId: "btn-2",
          },
        ],
      }),
    ];
    // Only btn-1 fixed (fingerprint gone, element still present with other rule)
    const current = [
      makeFinding({
        fingerprint: "f2",
        ruleId: "button-name",
        nodes: [
          {
            html: "<button></button>",
            target: ["button:nth-of-type(2)"],
            targetId: "btn-2",
          },
        ],
      }),
    ];
    const result = compare(baseline, current);

    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0]?.finding.fingerprint).toBe("f2");
    // btn-1 element is gone from current → element-removed
    expect(result.resolved).toHaveLength(1);
  });

  it("handles edge case: rename element id with activeElementIds provided", () => {
    // When element id is renamed, the original targetId won't match, so it's element-removed
    // unless activeElementIds tracks the updated/new targetId
    const baseline = [
      makeFinding({
        fingerprint: "fp-old-id",
        ruleId: "img-missing-alt",
        nodes: [
          {
            html: '<img id="pic-old">',
            target: ["#pic-old"],
            targetId: "pic-old",
          },
        ],
      }),
    ];
    // Renamed to pic-new and fixed the alt tag (no img-missing-alt finding)
    const current: Finding[] = [];
    const activeIds = new Set(["pic-new"]);
    const result = compare(baseline, current, activeIds);

    // Old element targetId "pic-old" is not in activeIds, so marked as element-removed
    expect(result.resolved[0]?.disposition).toBe("element-removed");
  });

  it("handles edge case: move element within DOM hierarchy", () => {
    const baseline = [
      makeFinding({
        fingerprint: "fp-header-btn",
        ruleId: "button-name",
        nodes: [
          {
            html: "<button></button>",
            target: ["header > button"],
            targetId: "btn-submit",
          },
        ],
      }),
    ];
    // Moved from header to main, still unfixed (same fingerprint or same targetId)
    const current = [
      makeFinding({
        fingerprint: "fp-header-btn",
        ruleId: "button-name",
        nodes: [
          {
            html: "<button></button>",
            target: ["main > button"],
            targetId: "btn-submit",
          },
        ],
      }),
    ];
    const result = compare(baseline, current);

    // Fingerprint matches -> remaining
    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0]?.disposition).toBe("remaining");
  });

  it("handles edge case: delete element completely", () => {
    const baseline = [
      makeFinding({
        fingerprint: "fp-del",
        ruleId: "link-name",
        nodes: [
          { html: "<a></a>", target: ["a#del-link"], targetId: "del-link" },
        ],
      }),
    ];
    const current: Finding[] = [];
    const result = compare(baseline, current);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0]?.disposition).toBe("element-removed");
    expect(result.remaining).toHaveLength(0);
    expect(result.introduced).toHaveLength(0);
  });

  it("handles empty baseline and empty current", () => {
    const result = compare([], []);
    expect(result.resolved).toHaveLength(0);
    expect(result.remaining).toHaveLength(0);
    expect(result.introduced).toHaveLength(0);
  });
});

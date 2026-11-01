import { describe, it, expect } from "vitest";
import { toJson, toCsv, toMarkdown, escapeCsvCell } from "@/lib/report";
import { compare } from "@/lib/compare";
import type { Finding } from "@/types/a11y";

function makeFinding(overrides: Partial<Finding> & Pick<Finding, "fingerprint" | "ruleId">): Finding {
  return {
    engine: "playground",
    status: "violation",
    confidence: "high",
    impact: "serious",
    wcag: [{ id: "1.1.1", version: "2.0", level: "A" }],
    help: "Images must have alternative text",
    description: "Ensures <img> elements have alternate text or a role of none",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
    nodes: [
      {
        html: '<img src="photo.jpg">',
        target: ["img"],
        targetId: "el-1",
      },
    ],
    ...overrides,
  };
}

const sampleFindings: Finding[] = [
  makeFinding({ fingerprint: "fp-1", ruleId: "img-missing-alt", impact: "critical" }),
  makeFinding({
    fingerprint: "fp-2",
    ruleId: "button-name",
    impact: "serious",
    status: "needs-review",
    help: "Buttons must have discernible text",
    nodes: [{ html: "<button></button>", target: ["button"], targetId: "el-2" }],
  }),
];

describe("toJson()", () => {
  it("produces valid JSON with metadata, summary, findings, and limitations", () => {
    const json = toJson(sampleFindings);
    const parsed = JSON.parse(json);

    expect(parsed.meta).toBeDefined();
    expect(parsed.meta.engines).toContain("axe-core");
    expect(parsed.meta.engines).toContain("playground");
    expect(parsed.meta.disclaimer).toContain("does not mean the page is accessible");
    expect(parsed.meta.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    expect(parsed.summary.total).toBe(2);
    expect(parsed.summary.byStatus.violation).toBe(1);
    expect(parsed.summary.byStatus["needs-review"]).toBe(1);
    expect(parsed.summary.bySeverity.critical).toBe(1);
    expect(parsed.summary.bySeverity.serious).toBe(1);

    expect(parsed.findings).toHaveLength(2);
    expect(parsed.limitations).toBeDefined();
  });

  it("includes comparison when provided", () => {
    const baseline = [sampleFindings[0]!];
    const current = [sampleFindings[1]!];
    const comparison = compare(baseline, current);
    const json = toJson(current, comparison);
    const parsed = JSON.parse(json);

    expect(parsed.comparison).toBeDefined();
    expect(parsed.comparison.resolved).toBeDefined();
    expect(parsed.comparison.remaining).toBeDefined();
    expect(parsed.comparison.introduced).toBeDefined();
  });

  it("includes axeVersion when provided", () => {
    const json = toJson([], undefined, "4.10.2");
    const parsed = JSON.parse(json);
    expect(parsed.meta.axeVersion).toBe("4.10.2");
  });
});

describe("escapeCsvCell()", () => {
  it("escapes quotes", () => {
    expect(escapeCsvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  it("neutralises formula injection with leading =", () => {
    const escaped = escapeCsvCell("=SUM(A1)");
    expect(escaped).toContain("\t");
    expect(escaped).not.toMatch(/^=/);
  });

  it("neutralises formula injection with leading +", () => {
    const escaped = escapeCsvCell("+cmd|' /C calc'!A0");
    expect(escaped).toContain("\t");
  });

  it("neutralises formula injection with leading -", () => {
    const escaped = escapeCsvCell("-1+2");
    expect(escaped).toContain("\t");
  });

  it("neutralises formula injection with leading @", () => {
    const escaped = escapeCsvCell("@SUM(A1)");
    expect(escaped).toContain("\t");
  });

  it("handles commas", () => {
    const escaped = escapeCsvCell("one, two");
    expect(escaped).toBe('"one, two"');
  });

  it("replaces newlines", () => {
    const escaped = escapeCsvCell("line1\nline2");
    expect(escaped).toBe("line1 line2");
  });
});

describe("toCsv()", () => {
  it("produces a header row followed by data rows", () => {
    const csv = toCsv(sampleFindings);
    const lines = csv.split("\n");

    expect(lines[0]).toContain("Fingerprint");
    expect(lines[0]).toContain("Rule ID");
    expect(lines[0]).toContain("Status");
    expect(lines[0]).toContain("Severity");
    // Data rows
    expect(lines).toHaveLength(3); // header + 2 findings
  });

  it("includes comparison section when provided", () => {
    const comparison = compare(sampleFindings, []);
    const csv = toCsv(sampleFindings, comparison);
    expect(csv).toContain("# Comparison Results");
    expect(csv).toContain("element-removed");
  });

  it("handles empty findings", () => {
    const csv = toCsv([]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(1); // header only
  });
});

describe("toMarkdown()", () => {
  it("includes title, disclaimer, summary table, and findings table", () => {
    const md = toMarkdown(sampleFindings);

    expect(md).toContain("# Accessibility Report");
    expect(md).toContain("does not mean the page is accessible");
    expect(md).toContain("## Summary");
    expect(md).toContain("## Findings");
    expect(md).toContain("`img-missing-alt`");
    expect(md).toContain("`button-name`");
    expect(md).toContain("🔴 critical"); // critical severity
    expect(md).toContain("🟠 serious"); // serious severity
    expect(md).toContain("## Testing Limitations");
  });

  it("includes comparison section when provided", () => {
    const baseline = [sampleFindings[0]!];
    const current = [sampleFindings[1]!];
    const comparison = compare(baseline, current);
    const md = toMarkdown(current, comparison);

    expect(md).toContain("## Comparison with Baseline");
    expect(md).toContain("Resolved:");
    expect(md).toContain("Introduced:");
  });

  it("includes axeVersion when provided", () => {
    const md = toMarkdown([], undefined, "4.10.2");
    expect(md).toContain("axe-core 4.10.2");
  });

  it("escapes pipe characters in markdown", () => {
    const f = makeFinding({
      fingerprint: "fp-pipe",
      ruleId: "test",
      help: "This | has | pipes",
    });
    const md = toMarkdown([f]);
    // Pipes should be escaped to not break the table
    expect(md).toContain("This \\| has \\| pipes");
  });

  it("handles empty findings gracefully", () => {
    const md = toMarkdown([]);
    expect(md).toContain("# Accessibility Report");
    expect(md).toContain("| **Total** | 0 |");
    expect(md).not.toContain("## Findings");
  });
});

describe("Golden-file report exports", () => {
  const fixedFinding = makeFinding({
    fingerprint: "golden-fp-1",
    ruleId: "img-missing-alt",
    status: "violation",
    impact: "critical",
    help: "Images must have alt",
    nodes: [{ html: '<img src="cat.jpg">', target: ["img#cat"], targetId: "cat" }],
  });

  it("JSON export matches exact schema and contains all required sections", () => {
    const json = toJson([fixedFinding], undefined, "4.10.0");
    const parsed = JSON.parse(json);

    expect(Object.keys(parsed).sort()).toEqual([
      "findings",
      "limitations",
      "meta",
      "summary",
    ]);
    expect(parsed.meta.engines).toEqual(["axe-core", "playground"]);
    expect(parsed.meta.axeVersion).toBe("4.10.0");
    expect(parsed.summary.total).toBe(1);
    expect(parsed.summary.bySeverity.critical).toBe(1);
    expect(parsed.findings[0].fingerprint).toBe("golden-fp-1");
  });

  it("CSV export matches expected column count and header structure", () => {
    const csv = toCsv([fixedFinding]);
    const lines = csv.trim().split("\n");
    expect(lines.length).toBe(2);

    const headers = lines[0]?.split(",") ?? [];
    expect(headers).toContain("Fingerprint");
    expect(headers).toContain("Rule ID");
    expect(headers).toContain("Severity");
    expect(headers).toContain("WCAG");

    const row = lines[1]?.split(",") ?? [];
    expect(row[0]).toBe("golden-fp-1");
    expect(row[1]).toBe("img-missing-alt");
  });

  it("Markdown export matches required header and table structure", () => {
    const md = toMarkdown([fixedFinding], undefined, "4.10.0");
    expect(md).toMatch(/^# Accessibility Report/);
    expect(md).toContain("## Summary");
    expect(md).toContain("## Findings");
    expect(md).toContain("## Testing Limitations");
    expect(md).toContain("`img-missing-alt`");
    expect(md).toContain("`img#cat`");
  });

  it("exports manual test checklist results into JSON, CSV, and Markdown", () => {
    const manualRecords = {
      "kb-tab-navigation": {
        testId: "kb-tab-navigation",
        status: "passed" as const,
        updatedAt: "2026-10-31T12:00:00.000Z",
      },
      "kb-focus-visible": {
        testId: "kb-focus-visible",
        status: "failed" as const,
        note: "Focus ring missing on custom submit button",
        updatedAt: "2026-10-31T12:05:00.000Z",
      },
    };

    // JSON
    const json = toJson([fixedFinding], undefined, "4.10.0", manualRecords);
    const parsed = JSON.parse(json);
    expect(parsed.manualTests).toBeDefined();
    expect(parsed.manualTests).toHaveLength(2);
    expect(parsed.manualTests[1].note).toBe("Focus ring missing on custom submit button");

    // CSV
    const csv = toCsv([fixedFinding], undefined, manualRecords);
    expect(csv).toContain("# Manual Test Checklist Results");
    expect(csv).toContain("Focus ring missing on custom submit button");

    // Markdown
    const md = toMarkdown([fixedFinding], undefined, "4.10.0", manualRecords);
    expect(md).toContain("## Manual Testing Checklist");
    expect(md).toContain("✅ Passed");
    expect(md).toContain("❌ Failed");
    expect(md).toContain("Focus ring missing on custom submit button");
  });
});

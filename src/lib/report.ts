import type { Finding, FindingStatus, AxeImpactLevel } from "@/types/a11y";
import type { CompareResult, ComparedFinding } from "./compare";
import { MANUAL_TESTS, type ManualTestRecord } from "@/data/manual-tests";

/* ────────────────────────────────────────────────────────────
 * Report metadata
 * ──────────────────────────────────────────────────────────── */

export interface ReportMetadata {
  readonly generatedAt: string; // ISO 8601
  readonly engines: readonly string[];
  readonly axeVersion?: string;
  readonly disclaimer: string;
}

const DISCLAIMER =
  "Automated checks find only a subset of WCAG issues. Passing them does not mean the page is accessible. Manual testing with assistive technologies is always required.";

function buildMetadata(axeVersion?: string): ReportMetadata {
  return {
    generatedAt: new Date().toISOString(),
    engines: ["axe-core", "playground"],
    axeVersion,
    disclaimer: DISCLAIMER,
  };
}

/* ────────────────────────────────────────────────────────────
 * Count helpers
 * ──────────────────────────────────────────────────────────── */

interface StatusCounts {
  violation: number;
  "needs-review": number;
  "manual-required": number;
}

interface SeverityCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

function countByStatus(findings: readonly Finding[]): StatusCounts {
  const counts: StatusCounts = {
    violation: 0,
    "needs-review": 0,
    "manual-required": 0,
  };
  for (const f of findings) {
    counts[f.status]++;
  }
  return counts;
}

function countBySeverity(findings: readonly Finding[]): SeverityCounts {
  const counts: SeverityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const f of findings) {
    counts[f.impact]++;
  }
  return counts;
}

/* ────────────────────────────────────────────────────────────
 * JSON export
 * ──────────────────────────────────────────────────────────── */

export interface JsonReport {
  readonly meta: ReportMetadata;
  readonly summary: {
    readonly byStatus: StatusCounts;
    readonly bySeverity: SeverityCounts;
    readonly total: number;
  };
  readonly findings: readonly Finding[];
  readonly comparison?: {
    readonly resolved: readonly ComparedFinding[];
    readonly remaining: readonly ComparedFinding[];
    readonly introduced: readonly ComparedFinding[];
  };
  readonly limitations: string;
}

export function toJson(
  findings: readonly Finding[],
  comparison?: CompareResult,
  axeVersion?: string,
  manualTests?: Record<string, ManualTestRecord>
): string {
  const manualRecords = manualTests
    ? Object.values(manualTests).map((r) => {
        const item = MANUAL_TESTS.find((t) => t.id === r.testId);
        return {
          id: r.testId,
          title: item?.title ?? r.testId,
          category: item?.category ?? "general",
          status: r.status,
          ...(r.note ? { note: r.note } : {}),
          updatedAt: r.updatedAt,
        };
      })
    : undefined;

  const report: JsonReport & { manualTests?: unknown } = {
    meta: buildMetadata(axeVersion),
    summary: {
      byStatus: countByStatus(findings),
      bySeverity: countBySeverity(findings),
      total: findings.length,
    },
    findings,
    ...(comparison ? { comparison } : {}),
    ...(manualRecords ? { manualTests: manualRecords } : {}),
    limitations:
      "Results are from automated checks only (axe-core and playground custom rules) " +
      "run in a sandboxed iframe. Inspector data is simulated and may differ from real " +
      "browser accessibility trees. Manual testing is required for full coverage.",
  };
  return JSON.stringify(report, null, 2);
}

/* ────────────────────────────────────────────────────────────
 * CSV export
 * ──────────────────────────────────────────────────────────── */

/**
 * Escapes a CSV cell value following RFC 4180 and neutralises
 * formula injection (leading `= + - @` characters).
 */
export function escapeCsvCell(value: string): string {
  // Neutralise formula injection: prepend a tab if leading char is dangerous
  let safe = value;
  if (/^[=+\-@]/.test(safe)) {
    safe = "\t" + safe;
  }
  // Replace newlines with space for single-line cells
  safe = safe.replace(/\r?\n/g, " ");
  // If the value contains quotes, commas, or tabs, wrap in quotes and escape internal quotes
  if (/[",\t]/.test(safe)) {
    safe = '"' + safe.replace(/"/g, '""') + '"';
  }
  return safe;
}

const CSV_HEADERS = [
  "Fingerprint",
  "Rule ID",
  "Engine",
  "Status",
  "Severity",
  "Confidence",
  "WCAG",
  "Help",
  "Description",
  "Help URL",
  "Selector",
  "HTML Snippet",
  "Fix",
] as const;

function findingToCsvRow(f: Finding): string {
  const wcag = f.wcag.map((w) => `${w.id} (${w.version}, ${w.level})`).join("; ");
  const selector = f.nodes[0]?.target.join(" > ") ?? "";
  const snippet = f.nodes[0]?.html ?? "";
  const fix = f.fix ?? "";

  return [
    f.fingerprint,
    f.ruleId,
    f.engine,
    f.status,
    f.impact,
    f.confidence,
    wcag,
    f.help,
    f.description,
    f.helpUrl,
    selector,
    snippet,
    fix,
  ]
    .map(escapeCsvCell)
    .join(",");
}

export function toCsv(
  findings: readonly Finding[],
  comparison?: CompareResult,
  manualTests?: Record<string, ManualTestRecord>
): string {
  const rows: string[] = [CSV_HEADERS.join(",")];

  for (const f of findings) {
    rows.push(findingToCsvRow(f));
  }

  if (comparison) {
    rows.push("");
    rows.push("# Comparison Results");
    rows.push("Disposition," + CSV_HEADERS.join(","));

    for (const cf of comparison.resolved) {
      rows.push(`${escapeCsvCell(cf.disposition)},${findingToCsvRow(cf.finding)}`);
    }
    for (const cf of comparison.remaining) {
      rows.push(`${escapeCsvCell(cf.disposition)},${findingToCsvRow(cf.finding)}`);
    }
    for (const cf of comparison.introduced) {
      rows.push(`${escapeCsvCell(cf.disposition)},${findingToCsvRow(cf.finding)}`);
    }
  }

  if (manualTests && Object.keys(manualTests).length > 0) {
    rows.push("");
    rows.push("# Manual Test Checklist Results");
    rows.push(["Test ID", "Category", "Title", "Status", "Note", "Updated At"].map(escapeCsvCell).join(","));

    for (const record of Object.values(manualTests)) {
      const item = MANUAL_TESTS.find((t) => t.id === record.testId);
      rows.push(
        [
          record.testId,
          item?.category ?? "general",
          item?.title ?? record.testId,
          record.status,
          record.note ?? "",
          record.updatedAt,
        ]
          .map(escapeCsvCell)
          .join(",")
      );
    }
  }

  return rows.join("\n");
}

/* ────────────────────────────────────────────────────────────
 * Markdown export
 * ──────────────────────────────────────────────────────────── */

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function severityEmoji(impact: AxeImpactLevel): string {
  switch (impact) {
    case "critical":
      return "🔴";
    case "serious":
      return "🟠";
    case "moderate":
      return "🟡";
    case "minor":
      return "🔵";
  }
}

function statusLabel(status: FindingStatus): string {
  switch (status) {
    case "violation":
      return "Violation";
    case "needs-review":
      return "Needs Review";
    case "manual-required":
      return "Manual Required";
  }
}

export function toMarkdown(
  findings: readonly Finding[],
  comparison?: CompareResult,
  axeVersion?: string,
  manualTests?: Record<string, ManualTestRecord>
): string {
  const meta = buildMetadata(axeVersion);
  const byStatus = countByStatus(findings);
  const bySeverity = countBySeverity(findings);

  const lines: string[] = [];

  lines.push("# Accessibility Report");
  lines.push("");
  lines.push(`**Generated:** ${meta.generatedAt}`);
  lines.push(`**Engines:** ${meta.engines.join(", ")}${meta.axeVersion ? ` (axe-core ${meta.axeVersion})` : ""}`);
  lines.push("");
  lines.push(`> ⚠️ ${DISCLAIMER}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Category | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| **Total** | ${findings.length} |`);
  lines.push(`| Violations | ${byStatus.violation} |`);
  lines.push(`| Needs Review | ${byStatus["needs-review"]} |`);
  lines.push(`| Manual Required | ${byStatus["manual-required"]} |`);
  lines.push(`| 🔴 Critical | ${bySeverity.critical} |`);
  lines.push(`| 🟠 Serious | ${bySeverity.serious} |`);
  lines.push(`| 🟡 Moderate | ${bySeverity.moderate} |`);
  lines.push(`| 🔵 Minor | ${bySeverity.minor} |`);
  lines.push("");

  // Findings table
  if (findings.length > 0) {
    lines.push("## Findings");
    lines.push("");
    lines.push("| # | Severity | Status | Rule | WCAG | Description | Selector |");
    lines.push("|---|----------|--------|------|------|-------------|----------|");

    findings.forEach((f, i) => {
      const wcag = f.wcag.map((w) => `${w.id}`).join(", ");
      const selector = escapeMarkdown(f.nodes[0]?.target.join(" > ") ?? "—");
      const desc = escapeMarkdown(f.help);
      lines.push(
        `| ${i + 1} | ${severityEmoji(f.impact)} ${f.impact} | ${statusLabel(f.status)} | \`${f.ruleId}\` | ${wcag} | ${desc} | \`${selector}\` |`
      );
    });
    lines.push("");
  }

  // Comparison
  if (comparison) {
    lines.push("## Comparison with Baseline");
    lines.push("");
    lines.push(`- ✅ **Resolved:** ${comparison.resolved.length}`);
    lines.push(`- ⏳ **Remaining:** ${comparison.remaining.length}`);
    lines.push(`- 🆕 **Introduced:** ${comparison.introduced.length}`);
    lines.push("");

    if (comparison.resolved.length > 0) {
      lines.push("### Resolved");
      lines.push("");
      for (const cf of comparison.resolved) {
        const label = cf.disposition === "element-removed" ? "(element removed)" : "(fixed)";
        lines.push(`- ~~\`${cf.finding.ruleId}\`~~ ${label}: ${escapeMarkdown(cf.finding.help)}`);
      }
      lines.push("");
    }

    if (comparison.introduced.length > 0) {
      lines.push("### Introduced");
      lines.push("");
      for (const cf of comparison.introduced) {
        lines.push(`- \`${cf.finding.ruleId}\`: ${escapeMarkdown(cf.finding.help)}`);
      }
      lines.push("");
    }
  }

  // Manual tests checklist
  if (manualTests && Object.keys(manualTests).length > 0) {
    lines.push("## Manual Testing Checklist");
    lines.push("");
    lines.push("| Test | Category | Status | Notes |");
    lines.push("|------|----------|--------|-------|");

    for (const record of Object.values(manualTests)) {
      const item = MANUAL_TESTS.find((t) => t.id === record.testId);
      const title = escapeMarkdown(item?.title ?? record.testId);
      const cat = item?.category ?? "general";
      const status =
        record.status === "passed"
          ? "✅ Passed"
          : record.status === "failed"
          ? "❌ Failed"
          : record.status === "not-applicable"
          ? "⚪ N/A"
          : "⏳ Not Tested";
      const note = escapeMarkdown(record.note ?? "—");

      lines.push(`| ${title} | ${cat} | ${status} | ${note} |`);
    }
    lines.push("");
  }

  // Testing limitations
  lines.push("## Testing Limitations");
  lines.push("");
  lines.push("- Results are from automated checks only (axe-core and playground custom rules).");
  lines.push("- Scans run in a sandboxed iframe; some checks may behave differently than in a real page.");
  lines.push("- Inspector data (accessible name, ARIA) is simulated and may differ from real browser accessibility trees.");
  lines.push("- Manual testing with assistive technologies (screen readers, keyboard, magnification) is required for full coverage.");
  lines.push("");

  return lines.join("\n");
}

/* ────────────────────────────────────────────────────────────
 * Download helper (browser only)
 * ──────────────────────────────────────────────────────────── */

export function downloadBlob(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

import { describe, it, expect } from "vitest";
import { RULES } from "@/lib/rules";
import { parseHtmlToA11yTree } from "@/lib/a11y-tree";
import { runCustomRules } from "@/lib/custom-rules";

interface RuleTestCase {
  ruleId: string;
  expectedWcag: readonly string[];
  failingFixture: { html: string; css?: string };
  passingFixture: { html: string; css?: string };
  edgeCaseFixture: { html: string; css?: string; shouldPass: boolean };
}

const RULE_TEST_CASES: RuleTestCase[] = [
  {
    ruleId: "click-on-non-interactive",
    expectedWcag: ["4.1.2", "2.1.1"],
    failingFixture: { html: `<div onclick="doSomething()">Clickable Div</div>` },
    passingFixture: { html: `<button type="button" onclick="doSomething()">Button</button>` },
    edgeCaseFixture: { html: `<div role="button" tabindex="0" onclick="doSomething()">Custom Button</div>`, shouldPass: true },
  },
  {
    ruleId: "interactive-role-not-focusable",
    expectedWcag: ["2.1.1", "4.1.2"],
    failingFixture: { html: `<div role="button">Unfocusable button</div>` },
    passingFixture: { html: `<div role="button" tabindex="0">Focusable custom button</div>` },
    edgeCaseFixture: { html: `<div role="button" aria-hidden="true">Hidden button</div>`, shouldPass: true },
  },
  {
    ruleId: "link-as-button",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<a href="#" onclick="deleteItem()">Delete</a>` },
    passingFixture: { html: `<a href="/overview">Overview Page</a>` },
    edgeCaseFixture: { html: `<a href="#section-content">Skip to content</a>`, shouldPass: true },
  },
  {
    ruleId: "input-placeholder-only",
    expectedWcag: ["1.3.1", "4.1.2", "3.3.2"],
    failingFixture: { html: `<input type="text" placeholder="Enter your email">` },
    passingFixture: { html: `<label for="email-in">Email</label><input id="email-in" type="text" placeholder="you@example.com">` },
    edgeCaseFixture: { html: `<input type="hidden" placeholder="Ignore">`, shouldPass: true },
  },
  {
    ruleId: "input-no-label",
    expectedWcag: ["1.3.1", "3.3.2", "4.1.2"],
    failingFixture: { html: `<input type="text">` },
    passingFixture: { html: `<input type="text" aria-label="Search site">` },
    edgeCaseFixture: { html: `<input type="submit" value="Send">`, shouldPass: true },
  },
  {
    ruleId: "img-missing-alt",
    expectedWcag: ["1.1.1"],
    failingFixture: { html: `<img src="/hero.jpg">` },
    passingFixture: { html: `<img src="/hero.jpg" alt="Company Headquarters">` },
    edgeCaseFixture: { html: `<img src="/divider.png" alt="">`, shouldPass: true },
  },
  {
    ruleId: "empty-interactive-name",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<button type="button"></button>` },
    passingFixture: { html: `<button type="button">Save Settings</button>` },
    edgeCaseFixture: { html: `<button type="button" aria-label="Close dialog"><svg aria-hidden="true"></svg></button>`, shouldPass: true },
  },
  {
    ruleId: "positive-tabindex",
    expectedWcag: ["2.4.3"],
    failingFixture: { html: `<button type="button" tabindex="2">Second</button>` },
    passingFixture: { html: `<button type="button" tabindex="0">Normal</button>` },
    edgeCaseFixture: { html: `<div tabindex="-1">Programmatic focus target</div>`, shouldPass: true },
  },
  {
    ruleId: "aria-hidden-focusable",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<div aria-hidden="true"><button type="button">Inside hidden</button></div>` },
    passingFixture: { html: `<div aria-hidden="true"><p>Decorative info</p></div>` },
    edgeCaseFixture: { html: `<div aria-hidden="true"><button type="button" disabled tabindex="-1">Disabled inside</button></div>`, shouldPass: true },
  },
  {
    ruleId: "heading-order",
    expectedWcag: ["1.3.1"],
    failingFixture: { html: `<h1>Title</h1><h3>Subheading</h3>` },
    passingFixture: { html: `<h1>Title</h1><h2>Section</h2><h3>Subheading</h3>` },
    edgeCaseFixture: { html: `<h3>Top heading on widget fragment</h3>`, shouldPass: true },
  },
  {
    ruleId: "dialog-no-name",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<dialog><p>Unnamed dialog</p></dialog>` },
    passingFixture: { html: `<dialog aria-labelledby="dlg-title" aria-modal="true"><h2 id="dlg-title">Confirmation</h2></dialog>` },
    edgeCaseFixture: { html: `<div role="dialog" aria-label="Quick preview" aria-modal="true"><p>Content</p></div>`, shouldPass: true },
  },
  {
    ruleId: "tab-pattern-incomplete",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<div role="tablist"><button role="tab">Tab 1</button></div>` },
    passingFixture: {
      html: `<div role="tablist" aria-label="Tabs"><button role="tab" id="t1" aria-selected="true" aria-controls="p1">Tab 1</button></div><div role="tabpanel" id="p1" aria-labelledby="t1"><p>Panel 1</p></div>`,
    },
    edgeCaseFixture: {
      html: `<div role="tablist" aria-label="Tabs"><button role="tab" id="t1" aria-selected="false" aria-controls="p1">Tab 1</button></div><div role="tabpanel" id="p1" aria-labelledby="t1"><p>Panel</p></div>`,
      shouldPass: true,
    },
  },
  {
    ruleId: "duplicate-id",
    expectedWcag: ["1.3.1", "4.1.2"],
    failingFixture: { html: `<div id="dup">A</div><div id="dup">B</div>` },
    passingFixture: { html: `<div id="unique-a">A</div><div id="unique-b">B</div>` },
    edgeCaseFixture: { html: `<div>No IDs at all</div>`, shouldPass: true },
  },
  {
    ruleId: "aria-broken-reference",
    expectedWcag: ["1.3.1", "4.1.2"],
    failingFixture: { html: `<button type="button" aria-labelledby="nonexistent-id">Test</button>` },
    passingFixture: { html: `<span id="label-target">Submit</span><button type="button" aria-labelledby="label-target">Test</button>` },
    edgeCaseFixture: { html: `<label for="valid-id">Name</label><input id="valid-id">`, shouldPass: true },
  },
  {
    ruleId: "invalid-aria",
    expectedWcag: ["4.1.2"],
    failingFixture: { html: `<button type="button" aria-selected="invalid-bool">Click</button>` },
    passingFixture: { html: `<button type="button" aria-pressed="true">Pressed Button</button>` },
    edgeCaseFixture: { html: `<div role="switch" aria-checked="true">Toggle</div>`, shouldPass: true },
  },
  {
    ruleId: "outline-removed",
    expectedWcag: ["2.4.7", "2.4.11"],
    failingFixture: { html: `<button type="button">No Outline</button>`, css: `button { outline: none; }` },
    passingFixture: { html: `<button type="button">Outlined</button>`, css: `button:focus-visible { outline: 2px solid #1d4ed8; }` },
    edgeCaseFixture: { html: `<button type="button">Replaced</button>`, css: `button { outline: none; } button:focus-visible { outline: 2px solid #000; }`, shouldPass: true },
  },
];

describe("Table-Driven Rule Tests (All Rules Covered)", () => {
  it("covers every registered rule in RULES", () => {
    const testedRuleIds = new Set(RULE_TEST_CASES.map((t) => t.ruleId));
    for (const rule of RULES) {
      expect(testedRuleIds.has(rule.id), `Rule ${rule.id} must be in test matrix`).toBe(true);
    }
  });

  for (const tc of RULE_TEST_CASES) {
    describe(`Rule: ${tc.ruleId}`, () => {
      it("has expected WCAG Success Criteria mappings", () => {
        const rule = RULES.find((r) => r.id === tc.ruleId);
        expect(rule).toBeDefined();
        for (const wcag of tc.expectedWcag) {
          expect(rule!.wcag).toContain(wcag);
        }
      });

      it("fires for failing fixture", () => {
        const ast = parseHtmlToA11yTree(tc.failingFixture.html).ast!;
        const findings = runCustomRules(ast, tc.failingFixture.css || "", tc.failingFixture.html);
        expect(
          findings.some((f) => f.id === tc.ruleId),
          `Rule ${tc.ruleId} must fire on failing fixture: ${tc.failingFixture.html}`
        ).toBe(true);
      });

      it("passes for passing fixture", () => {
        const ast = parseHtmlToA11yTree(tc.passingFixture.html).ast!;
        const findings = runCustomRules(ast, tc.passingFixture.css || "", tc.passingFixture.html);
        expect(
          findings.some((f) => f.id === tc.ruleId),
          `Rule ${tc.ruleId} must NOT fire on passing fixture: ${tc.passingFixture.html}`
        ).toBe(false);
      });

      it("evaluates edge case correctly", () => {
        const ast = parseHtmlToA11yTree(tc.edgeCaseFixture.html).ast!;
        const findings = runCustomRules(ast, tc.edgeCaseFixture.css || "", tc.edgeCaseFixture.html);
        const fired = findings.some((f) => f.id === tc.ruleId);
        expect(
          fired,
          `Rule ${tc.ruleId} edge case (shouldPass=${tc.edgeCaseFixture.shouldPass}): ${tc.edgeCaseFixture.html}`
        ).toBe(!tc.edgeCaseFixture.shouldPass);
      });
    });
  }

  describe("Bug Fix Regressions (W8)", () => {
    it("input-placeholder-only fires for <input placeholder='Email'> with no label", () => {
      const html = `<input placeholder="Email">`;
      const ast = parseHtmlToA11yTree(html).ast!;
      const findings = runCustomRules(ast, "", html);
      expect(findings.some((f) => f.id === "input-placeholder-only")).toBe(true);
    });

    it("broken aria-labelledby reference produces aria-broken-reference, NOT duplicate-id", () => {
      const html = `<button type="button" aria-labelledby="missing-title">Click</button>`;
      const ast = parseHtmlToA11yTree(html).ast!;
      const findings = runCustomRules(ast, "", html);
      expect(findings.some((f) => f.id === "aria-broken-reference")).toBe(true);
      expect(findings.some((f) => f.id === "duplicate-id")).toBe(false);
    });

    it("duplicate IDs across document produce duplicate-id, NOT aria-broken-reference", () => {
      const html = `<div id="test-id">One</div><div id="test-id">Two</div>`;
      const ast = parseHtmlToA11yTree(html).ast!;
      const findings = runCustomRules(ast, "", html);
      expect(findings.some((f) => f.id === "duplicate-id")).toBe(true);
      expect(findings.some((f) => f.id === "aria-broken-reference")).toBe(false);
    });

    it("custom switch with role='switch' and aria-checked='true' does not trigger invalid-aria", () => {
      const html = `<button type="button" role="switch" aria-checked="true" aria-label="Notifications"></button>`;
      const ast = parseHtmlToA11yTree(html).ast!;
      const findings = runCustomRules(ast, "", html);
      expect(findings.some((f) => f.id === "invalid-aria")).toBe(false);
    });

    it("data table with th scope='col' and aria-sort='ascending' does not trigger invalid-aria", () => {
      const html = `<table><thead><tr><th scope="col" aria-sort="ascending">Role</th></tr></thead></table>`;
      const ast = parseHtmlToA11yTree(html).ast!;
      const findings = runCustomRules(ast, "", html);
      expect(findings.some((f) => f.id === "invalid-aria")).toBe(false);
    });
  });
});

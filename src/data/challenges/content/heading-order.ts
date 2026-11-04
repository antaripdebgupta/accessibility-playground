import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    "<article>\n  <h1>Accessibility Best Practices</h1>\n  <p>A guide to building inclusive web experiences.</p>\n  <h4>Understanding WCAG</h4>\n  <p>WCAG provides a shared standard for web accessibility. It has three conformance levels: A, AA, and AAA.</p>\n  <h2>Perceivable</h2>\n  <p>Information must be presentable in ways that users can perceive.</p>\n  <h6>Text Alternatives</h6>\n  <p>Provide text alternatives for non-text content so it can be changed to other forms.</p>\n  <h2>Operable</h2>\n  <p>UI components and navigation must be operable.</p>\n</article>",
  startCss:
    "article {\n  max-width: 640px; line-height: 1.6;\n  font-family: system-ui, sans-serif;\n}\nh1 { font-size: 1.75rem; margin-bottom: 0.25rem; }\nh2 { font-size: 1.375rem; margin-top: 1.5rem; }\nh4 { font-size: 1.125rem; margin-top: 1.25rem; color: #4b5563; }\nh6 { font-size: 0.9375rem; margin-top: 1rem; color: #4b5563; }\np { color: #4b5563; }",
  expected: [
    {
      ruleId: "heading-order",
      wcag: ["1.3.1"],
    },
  ],
  hints: [
    "Heading levels should descend by one: h1 → h2 → h3. Never skip from h1 to h4.",
    "If you want a smaller visual size, use CSS — don't choose a heading level for its default appearance.",
    "After h1, the next section heading should be h2. Sub-sections under h2 use h3.",
  ],
  solutionHtml:
    "<article>\n  <h1>Accessibility Best Practices</h1>\n  <p>A guide to building inclusive web experiences.</p>\n  <h2>Understanding WCAG</h2>\n  <p>WCAG provides a shared standard for web accessibility. It has three conformance levels: A, AA, and AAA.</p>\n  <h2>Perceivable</h2>\n  <p>Information must be presentable in ways that users can perceive.</p>\n  <h3>Text Alternatives</h3>\n  <p>Provide text alternatives for non-text content so it can be changed to other forms.</p>\n  <h2>Operable</h2>\n  <p>UI components and navigation must be operable.</p>\n</article>",
  solutionCss:
    "article {\n  max-width: 640px; line-height: 1.6;\n  font-family: system-ui, sans-serif;\n}\nh1 { font-size: 1.75rem; margin-bottom: 0.25rem; }\nh2 { font-size: 1.375rem; margin-top: 1.5rem; }\nh3 { font-size: 1.125rem; margin-top: 1.25rem; color: #4b5563; }\np { color: #4b5563; }",
  verify: {
    ruleIdsMustBeAbsent: ["heading-order"],
  },
  manualSteps: [
    "Use a screen reader heading shortcut (H key in NVDA) to navigate headings. Is the structure logical?",
    "Check the heading outline — does it read like a table of contents?",
  ],
};

export default content;

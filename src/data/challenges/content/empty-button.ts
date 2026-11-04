import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<div class="toolbar" role="toolbar" aria-label="Text formatting">\n  <button type="button" class="icon-btn">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h10a4 4 0 0 1 0 8H6v-8z"/></svg>\n  </button>\n  <button type="button" class="icon-btn">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="4" x2="14" y2="4"/><line x1="4" y1="20" x2="16" y2="4"/><line x1="4" y1="20" x2="12" y2="20"/></svg>\n  </button>\n  <button type="button" class="icon-btn">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="8" y1="4" x2="20" y2="4"/><line x1="4" y1="20" x2="16" y2="20"/></svg>\n  </button>\n</div>',
  startCss:
    ".toolbar {\n  display: flex; gap: 4px; padding: 6px;\n  border: 1px solid #e2e4e9; border-radius: 8px;\n  background: #fafaf9; width: fit-content;\n}\n.icon-btn {\n  display: grid; place-items: center;\n  width: 36px; height: 36px; border: none;\n  border-radius: 6px; background: transparent;\n  color: #14161b; cursor: pointer;\n}\n.icon-btn:hover { background: #eef3fd; color: #1d4ed8; }",
  expected: [
    {
      ruleId: "empty-interactive-name",
      wcag: ["4.1.2"],
    },
  ],
  hints: [
    "An icon alone does not give a button a name. Add aria-label to each button.",
    'Example: <button aria-label="Bold"> — screen readers will announce "Bold, button".',
    'Make sure the SVG has aria-hidden="true" so its paths aren\'t read out.',
  ],
  solutionHtml:
    '<div class="toolbar" role="toolbar" aria-label="Text formatting">\n  <button type="button" class="icon-btn" aria-label="Bold">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h10a4 4 0 0 1 0 8H6v-8z"/></svg>\n  </button>\n  <button type="button" class="icon-btn" aria-label="Italic">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="6" y1="4" x2="14" y2="4"/><line x1="4" y1="20" x2="16" y2="4"/><line x1="4" y1="20" x2="12" y2="20"/></svg>\n  </button>\n  <button type="button" class="icon-btn" aria-label="Strikethrough">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="8" y1="4" x2="20" y2="4"/><line x1="4" y1="20" x2="16" y2="20"/></svg>\n  </button>\n</div>',
  solutionCss:
    ".toolbar {\n  display: flex; gap: 4px; padding: 6px;\n  border: 1px solid #e2e4e9; border-radius: 8px;\n  background: #fafaf9; width: fit-content;\n}\n.icon-btn {\n  display: grid; place-items: center;\n  width: 36px; height: 36px; border: none;\n  border-radius: 6px; background: transparent;\n  color: #14161b; cursor: pointer;\n}\n.icon-btn:hover { background: #eef3fd; color: #1d4ed8; }",
  verify: {
    ruleIdsMustBeAbsent: ["empty-interactive-name", "button-name"],
  },
  manualSteps: [
    "Tab to each button. Does the screen reader announce a meaningful label?",
    "Are the SVG elements hidden from assistive technology?",
  ],
};

export default content;

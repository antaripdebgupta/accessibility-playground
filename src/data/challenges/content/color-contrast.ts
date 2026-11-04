import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<div class="dashboard">\n  <h2>System Status</h2>\n  <ul class="status-list">\n    <li class="status-ok">\n      <span class="dot dot-ok"></span>\n      <span class="status-label">API Gateway</span>\n      <span class="status-value ok-text">Operational</span>\n    </li>\n    <li class="status-warn">\n      <span class="dot dot-warn"></span>\n      <span class="status-label">Database</span>\n      <span class="status-value warn-text">Degraded</span>\n    </li>\n    <li class="status-err">\n      <span class="dot dot-err"></span>\n      <span class="status-label">CDN</span>\n      <span class="status-value err-text">Down</span>\n    </li>\n  </ul>\n</div>',
  startCss:
    ".dashboard {\n  max-width: 420px; font-family: system-ui, sans-serif;\n  border: 1px solid #e2e4e9; border-radius: 10px; padding: 1.25rem;\n}\n.status-list { list-style: none; padding: 0; margin: 0.75rem 0 0; display: flex; flex-direction: column; gap: 8px; }\n.status-list li {\n  display: flex; align-items: center; gap: 10px;\n  padding: 10px 14px; border-radius: 6px;\n}\n.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }\n.dot-ok { background: #bbf7d0; }\n.dot-warn { background: #fef08a; }\n.dot-err { background: #fecaca; }\n.status-label { flex: 1; font-size: 0.9375rem; color: #14161b; }\n.status-value { font-size: 0.875rem; font-weight: 600; }\n.ok-text { color: #bbf7d0; }\n.warn-text { color: #fef08a; }\n.err-text { color: #fecaca; }\n.status-ok { background: #f0fdf4; }\n.status-warn { background: #fefce8; }\n.status-err { background: #fef2f2; }",
  expected: [
    {
      ruleId: "color-contrast",
      wcag: ["1.4.3"],
    },
  ],
  hints: [
    "Light green text (#bbf7d0) on a light green background (#f0fdf4) has very low contrast.",
    "Use a contrast checker — aim for at least 4.5:1 for normal-sized text.",
    "Consider adding a text icon or prefix (✓, ⚠, ✕) so colour is not the only indicator.",
  ],
  solutionHtml:
    '<div class="dashboard">\n  <h2>System Status</h2>\n  <ul class="status-list">\n    <li class="status-ok">\n      <span class="dot dot-ok"></span>\n      <span class="status-label">API Gateway</span>\n      <span class="status-value ok-text">✓ Operational</span>\n    </li>\n    <li class="status-warn">\n      <span class="dot dot-warn"></span>\n      <span class="status-label">Database</span>\n      <span class="status-value warn-text">⚠ Degraded</span>\n    </li>\n    <li class="status-err">\n      <span class="dot dot-err"></span>\n      <span class="status-label">CDN</span>\n      <span class="status-value err-text">✕ Down</span>\n    </li>\n  </ul>\n</div>',
  solutionCss:
    ".dashboard {\n  max-width: 420px; font-family: system-ui, sans-serif;\n  border: 1px solid #e2e4e9; border-radius: 10px; padding: 1.25rem;\n}\n.status-list { list-style: none; padding: 0; margin: 0.75rem 0 0; display: flex; flex-direction: column; gap: 8px; }\n.status-list li {\n  display: flex; align-items: center; gap: 10px;\n  padding: 10px 14px; border-radius: 6px;\n}\n.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }\n.dot-ok { background: #065f46; }\n.dot-warn { background: #92400e; }\n.dot-err { background: #b91c1c; }\n.status-label { flex: 1; font-size: 0.9375rem; color: #14161b; }\n.status-value { font-size: 0.875rem; font-weight: 600; }\n.ok-text { color: #065f46; }\n.warn-text { color: #92400e; }\n.err-text { color: #b91c1c; }\n.status-ok { background: #f0fdf4; }\n.status-warn { background: #fefce8; }\n.status-err { background: #fef2f2; }",
  verify: {
    ruleIdsMustBeAbsent: ["color-contrast"],
  },
  manualSteps: [
    "Enable Windows High Contrast or forced-colors mode. Can you still distinguish the three states?",
    "Can you understand the status of each service without seeing colours?",
  ],
};

export default content;

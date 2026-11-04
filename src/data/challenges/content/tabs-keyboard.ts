import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<div class="tabs-container">\n  <div class="tab-buttons">\n    <div class="tab active" onclick="switchTab(0)">Overview</div>\n    <div class="tab" onclick="switchTab(1)">Features</div>\n    <div class="tab" onclick="switchTab(2)">Pricing</div>\n  </div>\n  <div class="panel" id="panel-0">\n    <h3>Overview</h3>\n    <p>Our platform helps teams ship accessible products faster.</p>\n  </div>\n  <div class="panel hidden" id="panel-1">\n    <h3>Features</h3>\n    <p>Automated scanning, manual test checklists, and real-world challenges.</p>\n  </div>\n  <div class="panel hidden" id="panel-2">\n    <h3>Pricing</h3>\n    <p>Free for open-source projects. Team plans start at $29/month.</p>\n  </div>\n</div>\n\n<script>\nfunction switchTab(index) {\n  document.querySelectorAll(\'.tab\').forEach(function(t, i) {\n    t.classList.toggle(\'active\', i === index);\n  });\n  document.querySelectorAll(\'.panel\').forEach(function(p, i) {\n    p.classList.toggle(\'hidden\', i !== index);\n  });\n}\n</script>',
  startCss:
    ".tabs-container { max-width: 500px; font-family: system-ui, sans-serif; }\n.tab-buttons { display: flex; border-bottom: 2px solid #e2e4e9; }\n.tab {\n  padding: 10px 20px; cursor: pointer; font-size: 0.9375rem;\n  border-bottom: 2px solid transparent; margin-bottom: -2px; color: #4b5563;\n}\n.tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }\n.tab:hover { color: #1d4ed8; }\n.panel { padding: 1rem 0; }\n.panel h3 { font-size: 1rem; margin: 0 0 0.25rem; }\n.panel p { color: #4b5563; }\n.hidden { display: none; }",
  expected: [
    {
      ruleId: "click-on-non-interactive",
      wcag: ["4.1.2"],
    },
  ],
  hints: [
    "The tab bar uses <div> elements with onclick. These are not keyboard-focusable or announced correctly.",
    'Add role="tablist" on the container, role="tab" on each tab, and role="tabpanel" on each panel.',
    'Use <button> elements (or tabindex) for tabs. The active tab gets aria-selected="true"; others get aria-selected="false" and tabindex="-1".',
  ],
  solutionHtml:
    '<div class="tabs-container">\n  <div class="tab-buttons" role="tablist" aria-label="Product information">\n    <button type="button" role="tab" class="tab active" id="tab-0" aria-selected="true" aria-controls="panel-0" onclick="switchTab(0)">Overview</button>\n    <button type="button" role="tab" class="tab" id="tab-1" aria-selected="false" aria-controls="panel-1" tabindex="-1" onclick="switchTab(1)">Features</button>\n    <button type="button" role="tab" class="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1" onclick="switchTab(2)">Pricing</button>\n  </div>\n  <div class="panel" id="panel-0" role="tabpanel" aria-labelledby="tab-0">\n    <h3>Overview</h3>\n    <p>Our platform helps teams ship accessible products faster.</p>\n  </div>\n  <div class="panel hidden" id="panel-1" role="tabpanel" aria-labelledby="tab-1">\n    <h3>Features</h3>\n    <p>Automated scanning, manual test checklists, and real-world challenges.</p>\n  </div>\n  <div class="panel hidden" id="panel-2" role="tabpanel" aria-labelledby="tab-2">\n    <h3>Pricing</h3>\n    <p>Free for open-source projects. Team plans start at $29/month.</p>\n  </div>\n</div>\n\n<script>\nfunction switchTab(index) {\n  document.querySelectorAll(\'[role="tab"]\').forEach(function(t, i) {\n    t.classList.toggle(\'active\', i === index);\n    t.setAttribute(\'aria-selected\', i === index ? \'true\' : \'false\');\n    t.setAttribute(\'tabindex\', i === index ? \'0\' : \'-1\');\n  });\n  document.querySelectorAll(\'[role="tabpanel"]\').forEach(function(p, i) {\n    p.classList.toggle(\'hidden\', i !== index);\n  });\n}\ndocument.querySelector(\'[role="tablist"]\').addEventListener(\'keydown\', function(e) {\n  var tabs = Array.from(document.querySelectorAll(\'[role="tab"]\'));\n  var index = tabs.indexOf(e.target);\n  if (e.key === \'ArrowRight\') { index = (index + 1) % tabs.length; }\n  else if (e.key === \'ArrowLeft\') { index = (index - 1 + tabs.length) % tabs.length; }\n  else { return; }\n  switchTab(index);\n  tabs[index].focus();\n});\n</script>',
  solutionCss:
    ".tabs-container { max-width: 500px; font-family: system-ui, sans-serif; }\n.tab-buttons { display: flex; border-bottom: 2px solid #e2e4e9; }\n.tab {\n  padding: 10px 20px; cursor: pointer; font-size: 0.9375rem;\n  border: none; background: none;\n  border-bottom: 2px solid transparent; margin-bottom: -2px; color: #4b5563;\n}\n.tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }\n.tab:hover { color: #1d4ed8; }\n.tab:focus-visible { outline: 2px solid #1d4ed8; outline-offset: -2px; border-radius: 4px; }\n.panel { padding: 1rem 0; }\n.panel h3 { font-size: 1rem; margin: 0 0 0.25rem; }\n.panel p { color: #4b5563; }\n.hidden { display: none; }",
  verify: {
    ruleIdsMustBeAbsent: ["click-on-non-interactive"],
  },
  manualSteps: [
    "Tab to the tab bar. Use Arrow Left/Right to switch tabs. Does focus follow?",
    "Press Tab from a tab — does focus move to the active panel content?",
    "Does the screen reader announce the tab role and selection state?",
  ],
};

export default content;

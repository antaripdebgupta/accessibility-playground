import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<div class="accordion">\n  <div class="acc-header" onclick="toggleAccordion(this)">What is WCAG?</div>\n  <div class="acc-panel">\n    <p>WCAG (Web Content Accessibility Guidelines) is an international standard for web accessibility published by the W3C.</p>\n  </div>\n\n  <div class="acc-header" onclick="toggleAccordion(this)">What conformance level should I target?</div>\n  <div class="acc-panel hidden">\n    <p>Most organisations target WCAG 2.2 Level AA. It covers the most impactful criteria without requiring niche accommodations that Level AAA demands.</p>\n  </div>\n\n  <div class="acc-header" onclick="toggleAccordion(this)">Is WCAG legally required?</div>\n  <div class="acc-panel hidden">\n    <p>In many jurisdictions, yes. The EU\'s European Accessibility Act, the US ADA, and Section 508 all reference WCAG or equivalent standards.</p>\n  </div>\n</div>\n\n<script>\nfunction toggleAccordion(header) {\n  var panel = header.nextElementSibling;\n  panel.classList.toggle(\'hidden\');\n}\n</script>',
  startCss:
    ".accordion {\n  max-width: 540px; font-family: system-ui, sans-serif;\n  border: 1px solid #e2e4e9; border-radius: 10px; overflow: hidden;\n}\n.acc-header {\n  padding: 14px 18px; background: #fafaf9; cursor: pointer;\n  font-weight: 600; font-size: 0.9375rem; border-bottom: 1px solid #e2e4e9;\n}\n.acc-header:hover { background: #eef3fd; }\n.acc-panel { padding: 14px 18px; }\n.acc-panel p { margin: 0; color: #4b5563; font-size: 0.9375rem; line-height: 1.6; }\n.hidden { display: none; }",
  expected: [
    {
      ruleId: "click-on-non-interactive",
      wcag: ["4.1.2"],
    },
  ],
  hints: [
    "The <div> headers have onclick but are not focusable or announced as interactive controls.",
    'Replace each <div class="acc-header"> with a <button> (or at minimum <h3><button>).',
    'Add aria-expanded="true|false" to each button to communicate the panel\'s open/closed state.',
  ],
  solutionHtml:
    '<div class="accordion">\n  <h3>\n    <button type="button" id="acc-btn-1" class="acc-header" aria-expanded="true" aria-controls="acc-panel-1" onclick="toggleAccordion(this)">What is WCAG?</button>\n  </h3>\n  <div class="acc-panel" id="acc-panel-1" role="region" aria-labelledby="acc-btn-1">\n    <p>WCAG (Web Content Accessibility Guidelines) is an international standard for web accessibility published by the W3C.</p>\n  </div>\n\n  <h3>\n    <button type="button" id="acc-btn-2" class="acc-header" aria-expanded="false" aria-controls="acc-panel-2" onclick="toggleAccordion(this)">What conformance level should I target?</button>\n  </h3>\n  <div class="acc-panel hidden" id="acc-panel-2" role="region" aria-labelledby="acc-btn-2">\n    <p>Most organisations target WCAG 2.2 Level AA. It covers the most impactful criteria without requiring niche accommodations that Level AAA demands.</p>\n  </div>\n\n  <h3>\n    <button type="button" id="acc-btn-3" class="acc-header" aria-expanded="false" aria-controls="acc-panel-3" onclick="toggleAccordion(this)">Is WCAG legally required?</button>\n  </h3>\n  <div class="acc-panel hidden" id="acc-panel-3" role="region" aria-labelledby="acc-btn-3">\n    <p>In many jurisdictions, yes. The EU\'s European Accessibility Act, the US ADA, and Section 508 all reference WCAG or equivalent standards.</p>\n  </div>\n</div>\n\n<script>\nfunction toggleAccordion(btn) {\n  var expanded = btn.getAttribute(\'aria-expanded\') === \'true\';\n  btn.setAttribute(\'aria-expanded\', String(!expanded));\n  var panelId = btn.getAttribute(\'aria-controls\');\n  document.getElementById(panelId).classList.toggle(\'hidden\');\n}\n</script>',
  solutionCss:
    ".accordion {\n  max-width: 540px; font-family: system-ui, sans-serif;\n  border: 1px solid #e2e4e9; border-radius: 10px; overflow: hidden;\n}\nh3 { margin: 0; }\n.acc-header {\n  display: block; width: 100%;\n  padding: 14px 18px; background: #fafaf9; cursor: pointer;\n  font-weight: 600; font-size: 0.9375rem; border: none;\n  border-bottom: 1px solid #e2e4e9; text-align: left;\n}\n.acc-header:hover { background: #eef3fd; }\n.acc-header:focus-visible { outline: 2px solid #1d4ed8; outline-offset: -2px; }\n.acc-panel { padding: 14px 18px; }\n.acc-panel p { margin: 0; color: #4b5563; font-size: 0.9375rem; line-height: 1.6; }\n.hidden { display: none; }",
  verify: {
    ruleIdsMustBeAbsent: ["click-on-non-interactive"],
  },
  manualSteps: [
    "Tab to each accordion header. Press Enter or Space — does the panel toggle?",
    "Does the screen reader announce the expanded/collapsed state?",
    "Are the heading levels correct in the document outline?",
  ],
};

export default content;

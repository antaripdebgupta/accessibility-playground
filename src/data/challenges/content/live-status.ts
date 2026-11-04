import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<form class="subscribe-form" onsubmit="handleSubmit(event)">\n  <h2>Newsletter Signup</h2>\n  <div class="form-row">\n    <label for="sub-email">Email address</label>\n    <input id="sub-email" type="email" required class="field" placeholder="you@example.com">\n  </div>\n  <button type="submit" class="btn-primary">Subscribe</button>\n  <div id="status-msg" class="status-msg"></div>\n</form>\n\n<script>\nfunction handleSubmit(e) {\n  e.preventDefault();\n  var msg = document.getElementById(\'status-msg\');\n  msg.textContent = \'Thank you! You have been subscribed.\';\n  msg.style.display = \'block\';\n  e.target.reset();\n}\n</script>',
  startCss:
    ".subscribe-form {\n  max-width: 400px; display: flex; flex-direction: column; gap: 12px;\n  font-family: system-ui, sans-serif;\n}\n.form-row { display: flex; flex-direction: column; gap: 4px; }\n.form-row label { font-size: 0.875rem; font-weight: 600; }\n.field {\n  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;\n  font-size: 0.9375rem;\n}\n.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }\n.btn-primary {\n  background: #1d4ed8; color: #fff; padding: 10px 20px;\n  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;\n}\n.status-msg {\n  display: none; padding: 10px 14px; border-radius: 6px;\n  background: #ecfdf5; color: #065f46; font-size: 0.875rem;\n}",
  expected: [
    {
      ruleId: "status-messages",
      wcag: ["4.1.3"],
    },
  ],
  hints: [
    "The status message appears visually but screen readers don't know about it. They need an ARIA live region.",
    'Add role="status" (implicit aria-live="polite") to the status message container.',
    "The live region container must be in the DOM at page load — only the text content should change dynamically.",
  ],
  solutionHtml:
    '<form class="subscribe-form" onsubmit="handleSubmit(event)">\n  <h2>Newsletter Signup</h2>\n  <div class="form-row">\n    <label for="sub-email">Email address</label>\n    <input id="sub-email" type="email" required class="field" placeholder="you@example.com">\n  </div>\n  <button type="submit" class="btn-primary">Subscribe</button>\n  <div id="status-msg" class="status-msg" role="status"></div>\n</form>\n\n<script>\nfunction handleSubmit(e) {\n  e.preventDefault();\n  var msg = document.getElementById(\'status-msg\');\n  msg.textContent = \'Thank you! You have been subscribed.\';\n  msg.style.display = \'block\';\n  e.target.reset();\n}\n</script>',
  solutionCss:
    ".subscribe-form {\n  max-width: 400px; display: flex; flex-direction: column; gap: 12px;\n  font-family: system-ui, sans-serif;\n}\n.form-row { display: flex; flex-direction: column; gap: 4px; }\n.form-row label { font-size: 0.875rem; font-weight: 600; }\n.field {\n  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;\n  font-size: 0.9375rem;\n}\n.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }\n.btn-primary {\n  background: #1d4ed8; color: #fff; padding: 10px 20px;\n  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;\n}\n.status-msg {\n  display: none; padding: 10px 14px; border-radius: 6px;\n  background: #ecfdf5; color: #065f46; font-size: 0.875rem;\n}",
  verify: {
    ruleIdsMustBeAbsent: [],
  },
  manualSteps: [
    "Submit the form. Does the screen reader announce the success message?",
    "Is the announcement polite (does not interrupt the user)?",
    "If you submit again, is the new message announced again?",
  ],
};

export default content;

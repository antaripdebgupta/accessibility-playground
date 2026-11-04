import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<form class="contact-form">\n  <h2>Contact Us</h2>\n  <input type="text" placeholder="Full name" class="field">\n  <input type="email" class="field">\n  <textarea placeholder="Your message" class="field" rows="4"></textarea>\n  <button type="submit">Send Message</button>\n</form>',
  startCss:
    '.contact-form {\n  max-width: 400px; display: flex; flex-direction: column; gap: 12px;\n  font-family: system-ui, sans-serif;\n}\n.field {\n  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;\n  font-size: 0.9375rem;\n}\n.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }\nbutton[type="submit"] {\n  background: #1d4ed8; color: #fff; padding: 10px 20px;\n  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;\n}',
  expected: [
    {
      ruleId: "input-placeholder-only",
      wcag: ["1.3.1", "3.3.2"],
    },
    {
      ruleId: "input-no-label",
      wcag: ["1.3.1", "4.1.2"],
    },
  ],
  hints: [
    "Placeholder text disappears when the user starts typing. It cannot replace a label.",
    "Add a <label> element before each input. Use the for attribute matching the input's id.",
    'Example: <label for="name">Full name</label><input id="name" type="text">',
  ],
  solutionHtml:
    '<form class="contact-form">\n  <h2>Contact Us</h2>\n  <div class="form-group">\n    <label for="contact-name">Full name</label>\n    <input id="contact-name" type="text" placeholder="e.g. Jane Doe" class="field">\n  </div>\n  <div class="form-group">\n    <label for="contact-email">Email address</label>\n    <input id="contact-email" type="email" placeholder="e.g. jane@example.com" class="field">\n  </div>\n  <div class="form-group">\n    <label for="contact-message">Your message</label>\n    <textarea id="contact-message" placeholder="Tell us how we can help…" class="field" rows="4"></textarea>\n  </div>\n  <button type="submit">Send Message</button>\n</form>',
  solutionCss:
    '.contact-form {\n  max-width: 400px; display: flex; flex-direction: column; gap: 12px;\n  font-family: system-ui, sans-serif;\n}\n.form-group { display: flex; flex-direction: column; gap: 4px; }\n.form-group label { font-size: 0.875rem; font-weight: 600; color: #14161b; }\n.field {\n  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;\n  font-size: 0.9375rem;\n}\n.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }\nbutton[type="submit"] {\n  background: #1d4ed8; color: #fff; padding: 10px 20px;\n  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;\n}',
  verify: {
    ruleIdsMustBeAbsent: ["input-placeholder-only", "input-no-label", "label"],
  },
  manualSteps: [
    "Click each label — does it focus the associated input?",
    "With a screen reader, tab to each field. Is the label announced?",
  ],
};

export default content;

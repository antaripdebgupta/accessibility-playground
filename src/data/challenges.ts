/**
 * Real-world accessibility challenges.
 *
 * Each challenge ships a deliberately broken `startHtml` that must trigger the
 * `expected` rule IDs. The `solutionHtml` must make `ruleIdsMustBeAbsent` go
 * away. Build-time tests in `tests/challenges.test.ts` enforce both invariants.
 */

export interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly summary: string;
  readonly objectives: readonly string[];
  readonly startHtml: string;
  readonly startCss?: string;
  readonly expected: readonly { ruleId: string; wcag: readonly string[] }[];
  readonly hints: readonly string[];
  readonly solutionHtml: string;
  readonly solutionCss?: string;
  readonly verify: {
    readonly ruleIdsMustBeAbsent: readonly string[];
  };
  readonly manualSteps: readonly string[];
}

/* ────────────────────────────────────────────────────────────────
 * Challenge 1: Image Alt Text
 * ──────────────────────────────────────────────────────────────── */
const imageAlt: Challenge = {
  id: "image-alt",
  title: "Image Alt Text",
  difficulty: "beginner",
  summary:
    "A product card uses images without alternative text. Screen readers announce the filename instead of the content.",
  objectives: [
    "Add descriptive alt text to the product image",
    "Mark the decorative divider image as presentational",
  ],
  startHtml: `<section class="product-card">
  <img src="https://picsum.photos/seed/shoes/400/300" class="product-img">
  <img src="https://picsum.photos/seed/line/400/4" class="divider">
  <h2>Running Shoes</h2>
  <p>Lightweight, breathable running shoes for daily training.</p>
  <button type="button">Add to Cart</button>
</section>`,
  startCss: `.product-card {
  max-width: 360px;
  border: 1px solid #e2e4e9;
  border-radius: 10px;
  padding: 1rem;
  font-family: system-ui, sans-serif;
}
.product-img { width: 100%; border-radius: 8px; }
.divider { width: 100%; margin: 0.75rem 0; }
button {
  background: #1d4ed8; color: #fff;
  padding: 8px 16px; border: none; border-radius: 6px;
  cursor: pointer; font-size: 0.875rem;
}
button:hover { background: #1e40af; }`,
  expected: [
    { ruleId: "img-missing-alt", wcag: ["1.1.1"] },
  ],
  hints: [
    "Every <img> needs an alt attribute. Describe what the image shows, or use alt=\"\" for decoration.",
    'For the product image, describe what the user would see: alt="Blue running shoes on white background".',
    "The divider is decorative — use alt=\"\" and optionally role=\"presentation\".",
  ],
  solutionHtml: `<section class="product-card">
  <img src="https://picsum.photos/seed/shoes/400/300" class="product-img" alt="Blue running shoes on a white background">
  <img src="https://picsum.photos/seed/line/400/4" class="divider" alt="" role="presentation">
  <h2>Running Shoes</h2>
  <p>Lightweight, breathable running shoes for daily training.</p>
  <button type="button">Add to Cart</button>
</section>`,
  solutionCss: `.product-card {
  max-width: 360px;
  border: 1px solid #e2e4e9;
  border-radius: 10px;
  padding: 1rem;
  font-family: system-ui, sans-serif;
}
.product-img { width: 100%; border-radius: 8px; }
.divider { width: 100%; margin: 0.75rem 0; }
button {
  background: #1d4ed8; color: #fff;
  padding: 8px 16px; border: none; border-radius: 6px;
  cursor: pointer; font-size: 0.875rem;
}
button:hover { background: #1e40af; }`,
  verify: {
    ruleIdsMustBeAbsent: ["img-missing-alt", "image-alt"],
  },
  manualSteps: [
    "Turn on a screen reader (NVDA / VoiceOver) and navigate to the image. Does the announcement make sense?",
    "Is the decorative divider skipped by the screen reader?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 2: Empty Button
 * ──────────────────────────────────────────────────────────────── */
const emptyButton: Challenge = {
  id: "empty-button",
  title: "Buttons Without Labels",
  difficulty: "beginner",
  summary:
    "A toolbar uses icon-only buttons with no accessible name. Screen readers announce \"button\" with no context.",
  objectives: [
    "Give every icon button an accessible name using aria-label or visually hidden text",
    "Keep the visual appearance icon-only",
  ],
  startHtml: `<div class="toolbar" role="toolbar" aria-label="Text formatting">
  <button type="button" class="icon-btn">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h10a4 4 0 0 1 0 8H6v-8z"/></svg>
  </button>
  <button type="button" class="icon-btn">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="4" x2="14" y2="4"/><line x1="4" y1="20" x2="16" y2="4"/><line x1="4" y1="20" x2="12" y2="20"/></svg>
  </button>
  <button type="button" class="icon-btn">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="8" y1="4" x2="20" y2="4"/><line x1="4" y1="20" x2="16" y2="20"/></svg>
  </button>
</div>`,
  startCss: `.toolbar {
  display: flex; gap: 4px; padding: 6px;
  border: 1px solid #e2e4e9; border-radius: 8px;
  background: #fafaf9; width: fit-content;
}
.icon-btn {
  display: grid; place-items: center;
  width: 36px; height: 36px; border: none;
  border-radius: 6px; background: transparent;
  color: #14161b; cursor: pointer;
}
.icon-btn:hover { background: #eef3fd; color: #1d4ed8; }`,
  expected: [
    { ruleId: "empty-interactive-name", wcag: ["4.1.2"] },
  ],
  hints: [
    "An icon alone does not give a button a name. Add aria-label to each button.",
    'Example: <button aria-label="Bold"> — screen readers will announce "Bold, button".',
    "Make sure the SVG has aria-hidden=\"true\" so its paths aren't read out.",
  ],
  solutionHtml: `<div class="toolbar" role="toolbar" aria-label="Text formatting">
  <button type="button" class="icon-btn" aria-label="Bold">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h10a4 4 0 0 1 0 8H6v-8z"/></svg>
  </button>
  <button type="button" class="icon-btn" aria-label="Italic">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="6" y1="4" x2="14" y2="4"/><line x1="4" y1="20" x2="16" y2="4"/><line x1="4" y1="20" x2="12" y2="20"/></svg>
  </button>
  <button type="button" class="icon-btn" aria-label="Strikethrough">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="8" y1="4" x2="20" y2="4"/><line x1="4" y1="20" x2="16" y2="20"/></svg>
  </button>
</div>`,
  solutionCss: `.toolbar {
  display: flex; gap: 4px; padding: 6px;
  border: 1px solid #e2e4e9; border-radius: 8px;
  background: #fafaf9; width: fit-content;
}
.icon-btn {
  display: grid; place-items: center;
  width: 36px; height: 36px; border: none;
  border-radius: 6px; background: transparent;
  color: #14161b; cursor: pointer;
}
.icon-btn:hover { background: #eef3fd; color: #1d4ed8; }`,
  verify: {
    ruleIdsMustBeAbsent: ["empty-interactive-name", "button-name"],
  },
  manualSteps: [
    "Tab to each button. Does the screen reader announce a meaningful label?",
    "Are the SVG elements hidden from assistive technology?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 3: Form Labels
 * ──────────────────────────────────────────────────────────────── */
const formLabels: Challenge = {
  id: "form-labels",
  title: "Form Labels and Instructions",
  difficulty: "beginner",
  summary:
    "A contact form uses placeholder text instead of proper labels. When a user clears a field, they lose context.",
  objectives: [
    "Add a visible <label> for every input",
    "Remove reliance on placeholder as the only label",
    "Associate each label with its input using for/id",
  ],
  startHtml: `<form class="contact-form">
  <h2>Contact Us</h2>
  <input type="text" placeholder="Full name" class="field">
  <input type="email" class="field">
  <textarea placeholder="Your message" class="field" rows="4"></textarea>
  <button type="submit">Send Message</button>
</form>`,
  startCss: `.contact-form {
  max-width: 400px; display: flex; flex-direction: column; gap: 12px;
  font-family: system-ui, sans-serif;
}
.field {
  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;
  font-size: 0.9375rem;
}
.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }
button[type="submit"] {
  background: #1d4ed8; color: #fff; padding: 10px 20px;
  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;
}`,
  expected: [
    { ruleId: "input-placeholder-only", wcag: ["1.3.1", "3.3.2"] },
    { ruleId: "input-no-label", wcag: ["1.3.1", "4.1.2"] },
  ],
  hints: [
    "Placeholder text disappears when the user starts typing. It cannot replace a label.",
    "Add a <label> element before each input. Use the for attribute matching the input's id.",
    "Example: <label for=\"name\">Full name</label><input id=\"name\" type=\"text\">",
  ],
  solutionHtml: `<form class="contact-form">
  <h2>Contact Us</h2>
  <div class="form-group">
    <label for="contact-name">Full name</label>
    <input id="contact-name" type="text" placeholder="e.g. Jane Doe" class="field">
  </div>
  <div class="form-group">
    <label for="contact-email">Email address</label>
    <input id="contact-email" type="email" placeholder="e.g. jane@example.com" class="field">
  </div>
  <div class="form-group">
    <label for="contact-message">Your message</label>
    <textarea id="contact-message" placeholder="Tell us how we can help…" class="field" rows="4"></textarea>
  </div>
  <button type="submit">Send Message</button>
</form>`,
  solutionCss: `.contact-form {
  max-width: 400px; display: flex; flex-direction: column; gap: 12px;
  font-family: system-ui, sans-serif;
}
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #14161b; }
.field {
  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;
  font-size: 0.9375rem;
}
.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }
button[type="submit"] {
  background: #1d4ed8; color: #fff; padding: 10px 20px;
  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;
}`,
  verify: {
    ruleIdsMustBeAbsent: ["input-placeholder-only", "input-no-label", "label"],
  },
  manualSteps: [
    "Click each label — does it focus the associated input?",
    "With a screen reader, tab to each field. Is the label announced?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 4: Heading Order
 * ──────────────────────────────────────────────────────────────── */
const headingOrder: Challenge = {
  id: "heading-order",
  title: "Heading Hierarchy",
  difficulty: "beginner",
  summary:
    "A blog page skips heading levels and uses headings for visual styling rather than document structure.",
  objectives: [
    "Fix the heading hierarchy so levels are not skipped",
    "Use CSS for visual sizing instead of picking heading levels for appearance",
  ],
  startHtml: `<article>
  <h1>Accessibility Best Practices</h1>
  <p>A guide to building inclusive web experiences.</p>
  <h4>Understanding WCAG</h4>
  <p>WCAG provides a shared standard for web accessibility. It has three conformance levels: A, AA, and AAA.</p>
  <h2>Perceivable</h2>
  <p>Information must be presentable in ways that users can perceive.</p>
  <h6>Text Alternatives</h6>
  <p>Provide text alternatives for non-text content so it can be changed to other forms.</p>
  <h2>Operable</h2>
  <p>UI components and navigation must be operable.</p>
</article>`,
  startCss: `article {
  max-width: 640px; line-height: 1.6;
  font-family: system-ui, sans-serif;
}
h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
h2 { font-size: 1.375rem; margin-top: 1.5rem; }
h4 { font-size: 1.125rem; margin-top: 1.25rem; color: #4b5563; }
h6 { font-size: 0.9375rem; margin-top: 1rem; color: #4b5563; }
p { color: #4b5563; }`,
  expected: [
    { ruleId: "heading-order", wcag: ["1.3.1"] },
  ],
  hints: [
    "Heading levels should descend by one: h1 → h2 → h3. Never skip from h1 to h4.",
    "If you want a smaller visual size, use CSS — don't choose a heading level for its default appearance.",
    "After h1, the next section heading should be h2. Sub-sections under h2 use h3.",
  ],
  solutionHtml: `<article>
  <h1>Accessibility Best Practices</h1>
  <p>A guide to building inclusive web experiences.</p>
  <h2>Understanding WCAG</h2>
  <p>WCAG provides a shared standard for web accessibility. It has three conformance levels: A, AA, and AAA.</p>
  <h2>Perceivable</h2>
  <p>Information must be presentable in ways that users can perceive.</p>
  <h3>Text Alternatives</h3>
  <p>Provide text alternatives for non-text content so it can be changed to other forms.</p>
  <h2>Operable</h2>
  <p>UI components and navigation must be operable.</p>
</article>`,
  solutionCss: `article {
  max-width: 640px; line-height: 1.6;
  font-family: system-ui, sans-serif;
}
h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
h2 { font-size: 1.375rem; margin-top: 1.5rem; }
h3 { font-size: 1.125rem; margin-top: 1.25rem; color: #4b5563; }
p { color: #4b5563; }`,
  verify: {
    ruleIdsMustBeAbsent: ["heading-order"],
  },
  manualSteps: [
    "Use a screen reader heading shortcut (H key in NVDA) to navigate headings. Is the structure logical?",
    "Check the heading outline — does it read like a table of contents?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 5: Colour Contrast
 * ──────────────────────────────────────────────────────────────── */
const colorContrast: Challenge = {
  id: "color-contrast",
  title: "Colour Contrast",
  difficulty: "beginner",
  summary:
    "A status dashboard uses light text on light backgrounds. Users with low vision cannot read the content.",
  objectives: [
    "Ensure all text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)",
    "Do not rely on colour alone to convey status",
  ],
  startHtml: `<div class="dashboard">
  <h2>System Status</h2>
  <ul class="status-list">
    <li class="status-ok">
      <span class="dot dot-ok"></span>
      <span class="status-label">API Gateway</span>
      <span class="status-value ok-text">Operational</span>
    </li>
    <li class="status-warn">
      <span class="dot dot-warn"></span>
      <span class="status-label">Database</span>
      <span class="status-value warn-text">Degraded</span>
    </li>
    <li class="status-err">
      <span class="dot dot-err"></span>
      <span class="status-label">CDN</span>
      <span class="status-value err-text">Down</span>
    </li>
  </ul>
</div>`,
  startCss: `.dashboard {
  max-width: 420px; font-family: system-ui, sans-serif;
  border: 1px solid #e2e4e9; border-radius: 10px; padding: 1.25rem;
}
.status-list { list-style: none; padding: 0; margin: 0.75rem 0 0; display: flex; flex-direction: column; gap: 8px; }
.status-list li {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 6px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-ok { background: #bbf7d0; }
.dot-warn { background: #fef08a; }
.dot-err { background: #fecaca; }
.status-label { flex: 1; font-size: 0.9375rem; color: #14161b; }
.status-value { font-size: 0.875rem; font-weight: 600; }
.ok-text { color: #bbf7d0; }
.warn-text { color: #fef08a; }
.err-text { color: #fecaca; }
.status-ok { background: #f0fdf4; }
.status-warn { background: #fefce8; }
.status-err { background: #fef2f2; }`,
  expected: [
    { ruleId: "color-contrast", wcag: ["1.4.3"] },
  ],
  hints: [
    "Light green text (#bbf7d0) on a light green background (#f0fdf4) has very low contrast.",
    "Use a contrast checker — aim for at least 4.5:1 for normal-sized text.",
    "Consider adding a text icon or prefix (✓, ⚠, ✕) so colour is not the only indicator.",
  ],
  solutionHtml: `<div class="dashboard">
  <h2>System Status</h2>
  <ul class="status-list">
    <li class="status-ok">
      <span class="dot dot-ok"></span>
      <span class="status-label">API Gateway</span>
      <span class="status-value ok-text">✓ Operational</span>
    </li>
    <li class="status-warn">
      <span class="dot dot-warn"></span>
      <span class="status-label">Database</span>
      <span class="status-value warn-text">⚠ Degraded</span>
    </li>
    <li class="status-err">
      <span class="dot dot-err"></span>
      <span class="status-label">CDN</span>
      <span class="status-value err-text">✕ Down</span>
    </li>
  </ul>
</div>`,
  solutionCss: `.dashboard {
  max-width: 420px; font-family: system-ui, sans-serif;
  border: 1px solid #e2e4e9; border-radius: 10px; padding: 1.25rem;
}
.status-list { list-style: none; padding: 0; margin: 0.75rem 0 0; display: flex; flex-direction: column; gap: 8px; }
.status-list li {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 6px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-ok { background: #065f46; }
.dot-warn { background: #92400e; }
.dot-err { background: #b91c1c; }
.status-label { flex: 1; font-size: 0.9375rem; color: #14161b; }
.status-value { font-size: 0.875rem; font-weight: 600; }
.ok-text { color: #065f46; }
.warn-text { color: #92400e; }
.err-text { color: #b91c1c; }
.status-ok { background: #f0fdf4; }
.status-warn { background: #fefce8; }
.status-err { background: #fef2f2; }`,
  verify: {
    ruleIdsMustBeAbsent: ["color-contrast"],
  },
  manualSteps: [
    "Enable Windows High Contrast or forced-colors mode. Can you still distinguish the three states?",
    "Can you understand the status of each service without seeing colours?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 6: Modal Dialog Focus
 * ──────────────────────────────────────────────────────────────── */
const modalDialog: Challenge = {
  id: "modal-dialog",
  title: "Accessible Modal Dialog",
  difficulty: "intermediate",
  summary:
    "A confirmation dialog is built with a plain <div>. Focus escapes to the background, and screen readers don't know it's a dialog.",
  objectives: [
    "Use the native <dialog> element or proper ARIA role and attributes",
    "Give the dialog an accessible name",
    "Ensure focus moves into the dialog when opened",
  ],
  startHtml: `<button type="button" id="open-dialog">Delete Account</button>

<div class="modal-overlay" id="modal-overlay">
  <div class="modal" id="modal" role="dialog">
    <h2>Confirm Deletion</h2>
    <p>This action is permanent. All your data will be removed.</p>
    <div class="modal-actions">
      <button type="button" class="btn-cancel" onclick="document.getElementById('modal-overlay').style.display='none'">Cancel</button>
      <button type="button" class="btn-danger">Delete</button>
    </div>
  </div>
</div>

<script>
document.getElementById('open-dialog').addEventListener('click', function() {
  document.getElementById('modal-overlay').style.display = 'flex';
});
</script>`,
  startCss: `.modal-overlay {
  display: flex; position: fixed; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.4); align-items: center; justify-content: center;
}
.modal {
  background: #fff; border-radius: 12px; padding: 1.5rem; max-width: 400px;
  width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  font-family: system-ui, sans-serif;
}
.modal h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }
.modal p { color: #4b5563; margin: 0 0 1.25rem; font-size: 0.9375rem; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel {
  padding: 8px 16px; border: 1px solid #c9ccd3; border-radius: 6px;
  background: #fff; cursor: pointer;
}
.btn-danger {
  padding: 8px 16px; border: none; border-radius: 6px;
  background: #dc2626; color: #fff; cursor: pointer;
}`,
  expected: [
    { ruleId: "dialog-no-name", wcag: ["4.1.2"] },
  ],
  hints: [
    "The <div> acting as a dialog has no role or accessible name. Use <dialog> or role=\"dialog\".",
    "Add aria-labelledby pointing to the dialog heading, or aria-label.",
    "Native <dialog> with showModal() provides built-in focus trapping and Escape handling.",
  ],
  solutionHtml: `<button type="button" id="open-dialog" onclick="document.getElementById('confirm-dialog').showModal()">Delete Account</button>

<dialog id="confirm-dialog" class="modal" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p>This action is permanent. All your data will be removed.</p>
  <div class="modal-actions">
    <button type="button" class="btn-cancel" onclick="document.getElementById('confirm-dialog').close()">Cancel</button>
    <button type="button" class="btn-danger" onclick="document.getElementById('confirm-dialog').close()">Delete</button>
  </div>
</dialog>`,
  solutionCss: `.modal {
  border: none; border-radius: 12px; padding: 1.5rem; max-width: 400px;
  width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  font-family: system-ui, sans-serif;
}
.modal::backdrop { background: rgba(0,0,0,0.4); }
.modal h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }
.modal p { color: #4b5563; margin: 0 0 1.25rem; font-size: 0.9375rem; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-cancel {
  padding: 8px 16px; border: 1px solid #c9ccd3; border-radius: 6px;
  background: #fff; cursor: pointer;
}
.btn-danger {
  padding: 8px 16px; border: none; border-radius: 6px;
  background: #dc2626; color: #fff; cursor: pointer;
}`,
  verify: {
    ruleIdsMustBeAbsent: ["dialog-no-name"],
  },
  manualSteps: [
    "Open the dialog. Can you close it with Escape?",
    "Tab through — does focus stay inside the dialog?",
    "When closed, does focus return to the trigger button?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 7: Tabs Keyboard Pattern
 * ──────────────────────────────────────────────────────────────── */
const tabsKeyboard: Challenge = {
  id: "tabs-keyboard",
  title: "Keyboard-Accessible Tabs",
  difficulty: "intermediate",
  summary:
    "A tabbed interface uses <div>s with click handlers. Keyboard users cannot navigate between tabs.",
  objectives: [
    "Use proper ARIA roles: tablist, tab, and tabpanel",
    "Implement arrow key navigation between tabs",
    "Connect each tab to its panel with aria-controls / aria-labelledby",
  ],
  startHtml: `<div class="tabs-container">
  <div class="tab-buttons">
    <div class="tab active" onclick="switchTab(0)">Overview</div>
    <div class="tab" onclick="switchTab(1)">Features</div>
    <div class="tab" onclick="switchTab(2)">Pricing</div>
  </div>
  <div class="panel" id="panel-0">
    <h3>Overview</h3>
    <p>Our platform helps teams ship accessible products faster.</p>
  </div>
  <div class="panel hidden" id="panel-1">
    <h3>Features</h3>
    <p>Automated scanning, manual test checklists, and real-world challenges.</p>
  </div>
  <div class="panel hidden" id="panel-2">
    <h3>Pricing</h3>
    <p>Free for open-source projects. Team plans start at $29/month.</p>
  </div>
</div>

<script>
function switchTab(index) {
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.panel').forEach(function(p, i) {
    p.classList.toggle('hidden', i !== index);
  });
}
</script>`,
  startCss: `.tabs-container { max-width: 500px; font-family: system-ui, sans-serif; }
.tab-buttons { display: flex; border-bottom: 2px solid #e2e4e9; }
.tab {
  padding: 10px 20px; cursor: pointer; font-size: 0.9375rem;
  border-bottom: 2px solid transparent; margin-bottom: -2px; color: #4b5563;
}
.tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }
.tab:hover { color: #1d4ed8; }
.panel { padding: 1rem 0; }
.panel h3 { font-size: 1rem; margin: 0 0 0.25rem; }
.panel p { color: #4b5563; }
.hidden { display: none; }`,
  expected: [
    { ruleId: "click-on-non-interactive", wcag: ["4.1.2"] },
  ],
  hints: [
    "The tab bar uses <div> elements with onclick. These are not keyboard-focusable or announced correctly.",
    "Add role=\"tablist\" on the container, role=\"tab\" on each tab, and role=\"tabpanel\" on each panel.",
    "Use <button> elements (or tabindex) for tabs. The active tab gets aria-selected=\"true\"; others get aria-selected=\"false\" and tabindex=\"-1\".",
  ],
  solutionHtml: `<div class="tabs-container">
  <div class="tab-buttons" role="tablist" aria-label="Product information">
    <button type="button" role="tab" class="tab active" id="tab-0" aria-selected="true" aria-controls="panel-0" onclick="switchTab(0)">Overview</button>
    <button type="button" role="tab" class="tab" id="tab-1" aria-selected="false" aria-controls="panel-1" tabindex="-1" onclick="switchTab(1)">Features</button>
    <button type="button" role="tab" class="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1" onclick="switchTab(2)">Pricing</button>
  </div>
  <div class="panel" id="panel-0" role="tabpanel" aria-labelledby="tab-0">
    <h3>Overview</h3>
    <p>Our platform helps teams ship accessible products faster.</p>
  </div>
  <div class="panel hidden" id="panel-1" role="tabpanel" aria-labelledby="tab-1">
    <h3>Features</h3>
    <p>Automated scanning, manual test checklists, and real-world challenges.</p>
  </div>
  <div class="panel hidden" id="panel-2" role="tabpanel" aria-labelledby="tab-2">
    <h3>Pricing</h3>
    <p>Free for open-source projects. Team plans start at $29/month.</p>
  </div>
</div>

<script>
function switchTab(index) {
  document.querySelectorAll('[role="tab"]').forEach(function(t, i) {
    t.classList.toggle('active', i === index);
    t.setAttribute('aria-selected', i === index ? 'true' : 'false');
    t.setAttribute('tabindex', i === index ? '0' : '-1');
  });
  document.querySelectorAll('[role="tabpanel"]').forEach(function(p, i) {
    p.classList.toggle('hidden', i !== index);
  });
}
document.querySelector('[role="tablist"]').addEventListener('keydown', function(e) {
  var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  var index = tabs.indexOf(e.target);
  if (e.key === 'ArrowRight') { index = (index + 1) % tabs.length; }
  else if (e.key === 'ArrowLeft') { index = (index - 1 + tabs.length) % tabs.length; }
  else { return; }
  switchTab(index);
  tabs[index].focus();
});
</script>`,
  solutionCss: `.tabs-container { max-width: 500px; font-family: system-ui, sans-serif; }
.tab-buttons { display: flex; border-bottom: 2px solid #e2e4e9; }
.tab {
  padding: 10px 20px; cursor: pointer; font-size: 0.9375rem;
  border: none; background: none;
  border-bottom: 2px solid transparent; margin-bottom: -2px; color: #4b5563;
}
.tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }
.tab:hover { color: #1d4ed8; }
.tab:focus-visible { outline: 2px solid #1d4ed8; outline-offset: -2px; border-radius: 4px; }
.panel { padding: 1rem 0; }
.panel h3 { font-size: 1rem; margin: 0 0 0.25rem; }
.panel p { color: #4b5563; }
.hidden { display: none; }`,
  verify: {
    ruleIdsMustBeAbsent: ["click-on-non-interactive"],
  },
  manualSteps: [
    "Tab to the tab bar. Use Arrow Left/Right to switch tabs. Does focus follow?",
    "Press Tab from a tab — does focus move to the active panel content?",
    "Does the screen reader announce the tab role and selection state?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 8: Accordion
 * ──────────────────────────────────────────────────────────────── */
const accordion: Challenge = {
  id: "accordion",
  title: "Accessible Accordion",
  difficulty: "intermediate",
  summary:
    "A FAQ uses clickable <div> headers that are invisible to keyboard users and screen readers.",
  objectives: [
    "Use <button> elements as accordion triggers",
    "Use aria-expanded to communicate open/closed state",
    "Ensure keyboard users can open and close sections",
  ],
  startHtml: `<div class="accordion">
  <div class="acc-header" onclick="toggleAccordion(this)">What is WCAG?</div>
  <div class="acc-panel">
    <p>WCAG (Web Content Accessibility Guidelines) is an international standard for web accessibility published by the W3C.</p>
  </div>

  <div class="acc-header" onclick="toggleAccordion(this)">What conformance level should I target?</div>
  <div class="acc-panel hidden">
    <p>Most organisations target WCAG 2.2 Level AA. It covers the most impactful criteria without requiring niche accommodations that Level AAA demands.</p>
  </div>

  <div class="acc-header" onclick="toggleAccordion(this)">Is WCAG legally required?</div>
  <div class="acc-panel hidden">
    <p>In many jurisdictions, yes. The EU's European Accessibility Act, the US ADA, and Section 508 all reference WCAG or equivalent standards.</p>
  </div>
</div>

<script>
function toggleAccordion(header) {
  var panel = header.nextElementSibling;
  panel.classList.toggle('hidden');
}
</script>`,
  startCss: `.accordion {
  max-width: 540px; font-family: system-ui, sans-serif;
  border: 1px solid #e2e4e9; border-radius: 10px; overflow: hidden;
}
.acc-header {
  padding: 14px 18px; background: #fafaf9; cursor: pointer;
  font-weight: 600; font-size: 0.9375rem; border-bottom: 1px solid #e2e4e9;
}
.acc-header:hover { background: #eef3fd; }
.acc-panel { padding: 14px 18px; }
.acc-panel p { margin: 0; color: #4b5563; font-size: 0.9375rem; line-height: 1.6; }
.hidden { display: none; }`,
  expected: [
    { ruleId: "click-on-non-interactive", wcag: ["4.1.2"] },
  ],
  hints: [
    "The <div> headers have onclick but are not focusable or announced as interactive controls.",
    "Replace each <div class=\"acc-header\"> with a <button> (or at minimum <h3><button>).",
    "Add aria-expanded=\"true|false\" to each button to communicate the panel's open/closed state.",
  ],
  solutionHtml: `<div class="accordion">
  <h3>
    <button type="button" id="acc-btn-1" class="acc-header" aria-expanded="true" aria-controls="acc-panel-1" onclick="toggleAccordion(this)">What is WCAG?</button>
  </h3>
  <div class="acc-panel" id="acc-panel-1" role="region" aria-labelledby="acc-btn-1">
    <p>WCAG (Web Content Accessibility Guidelines) is an international standard for web accessibility published by the W3C.</p>
  </div>

  <h3>
    <button type="button" id="acc-btn-2" class="acc-header" aria-expanded="false" aria-controls="acc-panel-2" onclick="toggleAccordion(this)">What conformance level should I target?</button>
  </h3>
  <div class="acc-panel hidden" id="acc-panel-2" role="region" aria-labelledby="acc-btn-2">
    <p>Most organisations target WCAG 2.2 Level AA. It covers the most impactful criteria without requiring niche accommodations that Level AAA demands.</p>
  </div>

  <h3>
    <button type="button" id="acc-btn-3" class="acc-header" aria-expanded="false" aria-controls="acc-panel-3" onclick="toggleAccordion(this)">Is WCAG legally required?</button>
  </h3>
  <div class="acc-panel hidden" id="acc-panel-3" role="region" aria-labelledby="acc-btn-3">
    <p>In many jurisdictions, yes. The EU's European Accessibility Act, the US ADA, and Section 508 all reference WCAG or equivalent standards.</p>
  </div>
</div>

<script>
function toggleAccordion(btn) {
  var expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  var panelId = btn.getAttribute('aria-controls');
  document.getElementById(panelId).classList.toggle('hidden');
}
</script>`,
  solutionCss: `.accordion {
  max-width: 540px; font-family: system-ui, sans-serif;
  border: 1px solid #e2e4e9; border-radius: 10px; overflow: hidden;
}
h3 { margin: 0; }
.acc-header {
  display: block; width: 100%;
  padding: 14px 18px; background: #fafaf9; cursor: pointer;
  font-weight: 600; font-size: 0.9375rem; border: none;
  border-bottom: 1px solid #e2e4e9; text-align: left;
}
.acc-header:hover { background: #eef3fd; }
.acc-header:focus-visible { outline: 2px solid #1d4ed8; outline-offset: -2px; }
.acc-panel { padding: 14px 18px; }
.acc-panel p { margin: 0; color: #4b5563; font-size: 0.9375rem; line-height: 1.6; }
.hidden { display: none; }`,
  verify: {
    ruleIdsMustBeAbsent: ["click-on-non-interactive"],
  },
  manualSteps: [
    "Tab to each accordion header. Press Enter or Space — does the panel toggle?",
    "Does the screen reader announce the expanded/collapsed state?",
    "Are the heading levels correct in the document outline?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 9: Live Status Message
 * ──────────────────────────────────────────────────────────────── */
const liveStatusMessage: Challenge = {
  id: "live-status",
  title: "Live Status Announcements",
  difficulty: "advanced",
  summary:
    "A form shows a success message after submission, but screen readers never announce it.",
  objectives: [
    "Use an ARIA live region to announce dynamic status messages",
    "Choose the correct politeness level (polite vs assertive)",
    "Ensure the live region exists in the DOM before the message appears",
  ],
  startHtml: `<form class="subscribe-form" onsubmit="handleSubmit(event)">
  <h2>Newsletter Signup</h2>
  <div class="form-row">
    <label for="sub-email">Email address</label>
    <input id="sub-email" type="email" required class="field" placeholder="you@example.com">
  </div>
  <button type="submit" class="btn-primary">Subscribe</button>
  <div id="status-msg" class="status-msg"></div>
</form>

<script>
function handleSubmit(e) {
  e.preventDefault();
  var msg = document.getElementById('status-msg');
  msg.textContent = 'Thank you! You have been subscribed.';
  msg.style.display = 'block';
  e.target.reset();
}
</script>`,
  startCss: `.subscribe-form {
  max-width: 400px; display: flex; flex-direction: column; gap: 12px;
  font-family: system-ui, sans-serif;
}
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 0.875rem; font-weight: 600; }
.field {
  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;
  font-size: 0.9375rem;
}
.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }
.btn-primary {
  background: #1d4ed8; color: #fff; padding: 10px 20px;
  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;
}
.status-msg {
  display: none; padding: 10px 14px; border-radius: 6px;
  background: #ecfdf5; color: #065f46; font-size: 0.875rem;
}`,
  expected: [
    { ruleId: "status-messages", wcag: ["4.1.3"] },
  ],
  hints: [
    "The status message appears visually but screen readers don't know about it. They need an ARIA live region.",
    "Add role=\"status\" (implicit aria-live=\"polite\") to the status message container.",
    "The live region container must be in the DOM at page load — only the text content should change dynamically.",
  ],
  solutionHtml: `<form class="subscribe-form" onsubmit="handleSubmit(event)">
  <h2>Newsletter Signup</h2>
  <div class="form-row">
    <label for="sub-email">Email address</label>
    <input id="sub-email" type="email" required class="field" placeholder="you@example.com">
  </div>
  <button type="submit" class="btn-primary">Subscribe</button>
  <div id="status-msg" class="status-msg" role="status"></div>
</form>

<script>
function handleSubmit(e) {
  e.preventDefault();
  var msg = document.getElementById('status-msg');
  msg.textContent = 'Thank you! You have been subscribed.';
  msg.style.display = 'block';
  e.target.reset();
}
</script>`,
  solutionCss: `.subscribe-form {
  max-width: 400px; display: flex; flex-direction: column; gap: 12px;
  font-family: system-ui, sans-serif;
}
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 0.875rem; font-weight: 600; }
.field {
  padding: 10px 12px; border: 1px solid #c9ccd3; border-radius: 6px;
  font-size: 0.9375rem;
}
.field:focus { outline: 2px solid #1d4ed8; outline-offset: 1px; }
.btn-primary {
  background: #1d4ed8; color: #fff; padding: 10px 20px;
  border: none; border-radius: 6px; font-size: 0.9375rem; cursor: pointer;
}
.status-msg {
  display: none; padding: 10px 14px; border-radius: 6px;
  background: #ecfdf5; color: #065f46; font-size: 0.875rem;
}`,
  verify: {
    ruleIdsMustBeAbsent: [],
  },
  manualSteps: [
    "Submit the form. Does the screen reader announce the success message?",
    "Is the announcement polite (does not interrupt the user)?",
    "If you submit again, is the new message announced again?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Challenge 10: Skip Link
 * ──────────────────────────────────────────────────────────────── */
const skipLink: Challenge = {
  id: "skip-link",
  title: "Skip Navigation Link",
  difficulty: "advanced",
  summary:
    "A page with a long navigation menu forces keyboard users to tab through every link before reaching the main content.",
  objectives: [
    "Add a skip link as the first focusable element that jumps to main content",
    "Make the skip link visible on focus so sighted keyboard users can find it",
    "Ensure the main content landmark is correctly labelled",
  ],
  startHtml: `<header class="site-nav">
  <nav aria-label="Main navigation">
    <a href="#home">Home</a>
    <a href="#products">Products</a>
    <a href="#solutions">Solutions</a>
    <a href="#docs">Documentation</a>
    <a href="#pricing">Pricing</a>
    <a href="#blog">Blog</a>
    <a href="#support">Support</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<div class="content">
  <h1>Welcome to Our Platform</h1>
  <p>We provide tools to help development teams build accessible web applications. Our platform includes automated scanning, real-world challenges, and comprehensive learning resources.</p>
  <p>Get started by exploring our documentation or trying the interactive playground.</p>
</div>`,
  startCss: `.site-nav {
  padding: 12px 20px; border-bottom: 1px solid #e2e4e9;
  font-family: system-ui, sans-serif;
}
.site-nav nav { display: flex; gap: 16px; flex-wrap: wrap; }
.site-nav a {
  color: #4b5563; text-decoration: none; font-size: 0.9375rem;
  padding: 4px 0;
}
.site-nav a:hover { color: #1d4ed8; }
.site-nav a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; border-radius: 3px; }
.content {
  max-width: 640px; padding: 2rem 20px; line-height: 1.6;
  font-family: system-ui, sans-serif;
}
.content h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
.content p { color: #4b5563; }`,
  expected: [
    { ruleId: "bypass-blocks", wcag: ["2.4.1"] },
  ],
  hints: [
    "Keyboard users must tab through all 8 navigation links to reach the content. A skip link lets them bypass the navigation.",
    "Add an <a href=\"#main-content\"> as the very first element inside <body>. Use CSS to hide it until focused.",
    "Change the content <div> to <main id=\"main-content\"> so the skip link has a target and screen readers recognise the landmark.",
  ],
  solutionHtml: `<a href="#main-content" class="skip-link">Skip to main content</a>

<header class="site-nav">
  <nav aria-label="Main navigation">
    <a href="#home">Home</a>
    <a href="#products">Products</a>
    <a href="#solutions">Solutions</a>
    <a href="#docs">Documentation</a>
    <a href="#pricing">Pricing</a>
    <a href="#blog">Blog</a>
    <a href="#support">Support</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<main id="main-content" class="content">
  <h1>Welcome to Our Platform</h1>
  <p>We provide tools to help development teams build accessible web applications. Our platform includes automated scanning, real-world challenges, and comprehensive learning resources.</p>
  <p>Get started by exploring our documentation or trying the interactive playground.</p>
</main>`,
  solutionCss: `.skip-link {
  position: absolute; top: -100%; left: 16px;
  padding: 8px 16px; background: #1d4ed8; color: #fff;
  border-radius: 0 0 6px 6px; font-size: 0.875rem; font-weight: 600;
  text-decoration: none; z-index: 100;
  transition: top 0.15s ease;
}
.skip-link:focus { top: 0; }
.site-nav {
  padding: 12px 20px; border-bottom: 1px solid #e2e4e9;
  font-family: system-ui, sans-serif;
}
.site-nav nav { display: flex; gap: 16px; flex-wrap: wrap; }
.site-nav a {
  color: #4b5563; text-decoration: none; font-size: 0.9375rem;
  padding: 4px 0;
}
.site-nav a:hover { color: #1d4ed8; }
.site-nav a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; border-radius: 3px; }
.content {
  max-width: 640px; padding: 2rem 20px; line-height: 1.6;
  font-family: system-ui, sans-serif;
}
.content h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
.content p { color: #4b5563; }`,
  verify: {
    ruleIdsMustBeAbsent: [],
  },
  manualSteps: [
    "Press Tab once — does the skip link appear visually?",
    "Press Enter on the skip link — does focus move to the main content area?",
    "Does the screen reader announce the main landmark?",
  ],
};

/* ────────────────────────────────────────────────────────────────
 * Exported collection
 * ──────────────────────────────────────────────────────────────── */

export const CHALLENGES: readonly Challenge[] = [
  imageAlt,
  emptyButton,
  formLabels,
  headingOrder,
  colorContrast,
  modalDialog,
  tabsKeyboard,
  accordion,
  liveStatusMessage,
  skipLink,
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export interface StarterTemplate {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly html: string;
  readonly css?: string;
}

export const STARTER_TEMPLATES: readonly StarterTemplate[] = [
  {
    id: "welcome",
    label: "Welcome",
    description:
      "An accessible card component with heading, button, and status badge.",
    html: `<article class="card">
  <header>
    <span class="badge" aria-label="Status: Published">Published</span>
    <h2>WCAG 2.2 Overview</h2>
  </header>
  <p>
    Accessible web development ensures that digital tools are operable,
    understandable, and robust for every person.
  </p>
  <footer>
    <button type="button" class="btn-primary">
      Read Guideline
    </button>
  </footer>
</article>`,
    css: `.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  background: #ffffff;
  max-width: 400px;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}
.btn-primary {
  background: #5b21b6;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary:focus-visible {
  outline: 2px solid #5b21b6;
  outline-offset: 2px;
}`,
  },
  {
    id: "form-field",
    label: "Form Field",
    description:
      "Input with accessible label, help text, and validation error.",
    html: `<form class="form-group" onsubmit="event.preventDefault()">
  <label for="username-input">Username</label>
  <input
    id="username-input"
    name="username"
    type="text"
    aria-describedby="username-hint username-err"
    aria-invalid="true"
    required
  />
  <p id="username-hint" class="hint">Use 4-20 alphanumeric characters.</p>
  <p id="username-err" class="error" role="alert">Username is already taken.</p>
</form>`,
    css: `.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}
label {
  font-weight: 600;
  font-size: 14px;
}
input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}
input:focus-visible {
  outline: 2px solid #5b21b6;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}
.error {
  font-size: 12px;
  color: #b91c1c;
  font-weight: 500;
  margin: 0;
}`,
  },
  {
    id: "bad-div-button",
    label: "Bad: div button",
    description:
      "Anti-pattern of a div acting as a button without keyboard or ARIA support.",
    html: `<div class="fake-button" onclick="alert('Clicked!')">
  Click me (Div button)
</div>`,
    css: `.fake-button {
  display: inline-block;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}`,
  },
  {
    id: "low-contrast",
    label: "Bad: low-contrast text",
    description: "Text failing WCAG 2.2 SC 1.4.3 minimum contrast requirement.",
    html: `<div class="contrast-container">
  <h2>Low Contrast Example</h2>
  <p class="failing-text">
    This light gray text on a white background has a contrast ratio around 2.1:1, failing the 4.5:1 requirement.
  </p>
</div>`,
    css: `.contrast-container {
  padding: 16px;
  background: #ffffff;
}
.failing-text {
  color: #a1a1aa;
  background-color: #ffffff;
  font-size: 14px;
}`,
  },
  {
    id: "tiny-target",
    label: "Bad: tiny 12×12px touch target",
    description:
      "Button violating WCAG 2.2 SC 2.5.8 Target Size (Minimum 24×24px).",
    html: `<div class="target-demo">
  <p>Close notification dialog:</p>
  <button type="button" class="tiny-btn" aria-label="Close dialog">×</button>
</div>`,
    css: `.tiny-btn {
  width: 12px;
  height: 12px;
  padding: 0;
  font-size: 10px;
  line-height: 1;
  background: #e4e4e7;
  border: 1px solid #71717a;
  border-radius: 2px;
  cursor: pointer;
}`,
  },
  {
    id: "outline-removed",
    label: "Bad: outline none without replacement",
    description:
      "Focus indicator removed with outline: none, violating WCAG 2.4.7.",
    html: `<form onsubmit="event.preventDefault()">
  <button type="button" class="no-outline-btn">Focus me with Tab</button>
</form>`,
    css: `button.no-outline-btn {
  padding: 8px 16px;
  background: #f4f4f5;
  border: 1px solid #71717a;
  border-radius: 6px;
  outline: none;
}`,
  },
  {
    id: "link-as-button",
    label: "Bad: link as button",
    description:
      "Anchor tag with href='#' triggering script action instead of navigating.",
    html: `<p>Project options:</p>
<a href="#" onclick="alert('Deleting...'); return false;" class="delete-link">
  Delete Project
</a>`,
    css: `.delete-link {
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
}`,
  },
  {
    id: "input-placeholder-only",
    label: "Bad: input placeholder only",
    description:
      "Form input without a persistent label, relying solely on placeholder text.",
    html: `<form onsubmit="event.preventDefault()">
  <input type="text" placeholder="Enter your full name" />
</form>`,
    css: `input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}`,
  },
  {
    id: "dialog",
    label: "Dialog",
    description:
      "Accessible modal dialog container with labelledby, describedby, and action controls.",
    html: `<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
  class="dialog-box"
>
  <h2 id="modal-title">Delete Project</h2>
  <p id="modal-desc">
    This action cannot be undone. All project files will be permanently deleted.
  </p>
  <div class="actions">
    <button type="button" class="btn-secondary">Cancel</button>
    <button type="button" class="btn-danger">Confirm Delete</button>
  </div>
</div>`,
    css: `.dialog-box {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  background: #ffffff;
  max-width: 420px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.btn-secondary {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}
.btn-danger {
  padding: 6px 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}`,
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "ARIA tablist and tabpanel pattern with selection states.",
    html: `<div role="tablist" aria-label="Project tabs">
  <button
    role="tab"
    id="tab-1"
    aria-selected="true"
    aria-controls="panel-1"
    tabindex="0"
  >
    Details
  </button>
  <button
    role="tab"
    id="tab-2"
    aria-selected="false"
    aria-controls="panel-2"
    tabindex="-1"
  >
    Activity
  </button>
</div>
<section
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
  tabindex="0"
>
  <p>Project details and configuration options are displayed here.</p>
</section>`,
  },
  {
    id: "nav-menu",
    label: "Nav Menu",
    description: "Semantic navigation landmark with current page indicator.",
    html: `<nav aria-label="Main Navigation">
  <ul class="nav-list">
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/playground">Playground</a></li>
    <li><a href="/contrast">Contrast</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>`,
  },
  {
    id: "accordion",
    label: "Accordion",
    description:
      "Disclosure pattern using native <details>/<summary> with correct ARIA state.",
    html: `<div class="accordion">
  <details>
    <summary>What is WCAG 2.2?</summary>
    <p>WCAG 2.2 is the current W3C standard for web accessibility, published as nine new success criteria on top of WCAG 2.1.</p>
  </details>
  <details>
    <summary>Who needs to follow it?</summary>
    <p>Any organization building public-facing or internal web software, especially where legal accessibility requirements apply.</p>
  </details>
</div>`,
  },
  {
    id: "combobox",
    label: "Combobox",
    description:
      "Accessible autocomplete combobox with listbox popup and active-descendant tracking.",
    html: `<div class="combobox-wrapper">
  <label for="country-input">Country</label>
  <input
    id="country-input"
    type="text"
    role="combobox"
    aria-expanded="true"
    aria-controls="country-listbox"
    aria-autocomplete="list"
    aria-activedescendant="country-option-2"
  />
  <ul id="country-listbox" role="listbox" aria-label="Country suggestions">
    <li id="country-option-1" role="option" aria-selected="false">Canada</li>
    <li id="country-option-2" role="option" aria-selected="true">India</li>
    <li id="country-option-3" role="option" aria-selected="false">Japan</li>
  </ul>
</div>`,
  },
  {
    id: "data-table",
    label: "Data Table",
    description:
      "Sortable data table with scoped headers and a caption for screen reader context.",
    html: `<table>
  <caption>Team members and their roles</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col" aria-sort="ascending">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jane Doe</td>
      <td>Admin</td>
    </tr>
    <tr>
      <td>Sam Rivera</td>
      <td>Editor</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    id: "image-alt",
    label: "Image: decorative vs. informative",
    description:
      "Side-by-side comparison of a decorative image (empty alt) and an informative one (descriptive alt).",
    html: `<figure>
  <img src="/divider.svg" alt="" />
  <figcaption class="visually-hidden">Decorative divider, correctly hidden from assistive tech.</figcaption>
</figure>
<figure>
  <img src="/chart.png" alt="Bar chart showing Q3 revenue grew 18% over Q2" />
  <figcaption>Quarterly revenue comparison</figcaption>
</figure>`,
  },
  {
    id: "live-region",
    label: "Live Region / Toast",
    description:
      "A polite ARIA live region announcing an async status update, the pattern behind most toast notifications.",
    html: `<div aria-live="polite" aria-atomic="true" class="toast">
  Changes saved successfully.
</div>
<button type="button" class="btn-secondary">Trigger another save</button>`,
  },
  {
    id: "custom-switch",
    label: "Custom Switch",
    description:
      "A toggle switch built from a button with role=switch, not a native checkbox styled to look like one.",
    html: `<button
  type="button"
  role="switch"
  aria-checked="true"
  aria-labelledby="notif-switch-label"
  class="switch"
>
  <span class="switch-thumb"></span>
</button>
<span id="notif-switch-label">Enable email notifications</span>`,
  },
];

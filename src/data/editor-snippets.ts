export interface EditorSnippet {
  readonly label: string;
  readonly detail: string;
  readonly template: string;
  readonly type: "snippet";
}

export const HTML_A11Y_SNIPPETS: readonly EditorSnippet[] = [
  {
    label: "a11y:button",
    detail: "Accessible button with explicit type and label",
    template:
      '<button type="button" class="${1:btn}">${2:Button Label}</button>',
    type: "snippet",
  },
  {
    label: "a11y:skip-link",
    detail: "Skip to main content bypass link",
    template:
      '<a href="#main-content" class="sr-only focus:not-sr-only">${1:Skip to main content}</a>',
    type: "snippet",
  },
  {
    label: "a11y:dialog",
    detail: "Accessible modal dialog with role and labelling",
    template: `<div role="dialog" aria-modal="true" aria-labelledby="\${1:dialog-title}" class="dialog">
  <h2 id="\${1:dialog-title}">\${2:Dialog Title}</h2>
  <p>\${3:Dialog content goes here.}</p>
  <button type="button" class="btn">\${4:Close}</button>
</div>`,
    type: "snippet",
  },
  {
    label: "a11y:tabs",
    detail: "WAI-ARIA tabs pattern with tablist, tab, and tabpanel",
    template: `<div class="tabs">
  <div role="tablist" aria-label="\${1:Content Tabs}">
    <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">\${2:Tab 1}</button>
    <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">\${3:Tab 2}</button>
  </div>
  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
    <p>\${4:Panel 1 content.}</p>
  </div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>
    <p>\${5:Panel 2 content.}</p>
  </div>
</div>`,
    type: "snippet",
  },
  {
    label: "a11y:disclosure",
    detail: "Accessible disclosure using native details/summary",
    template: `<details class="disclosure">
  <summary>\${1:Toggle details}</summary>
  <div class="content">
    <p>\${2:Expanded disclosure content.}</p>
  </div>
</details>`,
    type: "snippet",
  },
  {
    label: "a11y:form-field",
    detail: "Form control with linked label and error message",
    template: `<div class="form-field">
  <label for="\${1:field-id}">\${2:Field Label}</label>
  <input type="\${3:text}" id="\${1:field-id}" aria-describedby="\${1:field-id}-hint \${1:field-id}-error" />
  <span id="\${1:field-id}-hint" class="hint">\${4:Helper text}</span>
  <span id="\${1:field-id}-error" class="error" role="alert">\${5:Error text}</span>
</div>`,
    type: "snippet",
  },
  {
    label: "a11y:img-decorative",
    detail: "Decorative image with empty alt attribute",
    template: '<img src="${1:image.svg}" alt="" aria-hidden="true" />',
    type: "snippet",
  },
  {
    label: "a11y:table",
    detail: "Accessible data table with caption and column scope",
    template: `<table>
  <caption>\${1:Table Caption}</caption>
  <thead>
    <tr>
      <th scope="col">\${2:Header 1}</th>
      <th scope="col">\${3:Header 2}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>\${4:Data 1}</td>
      <td>\${5:Data 2}</td>
    </tr>
  </tbody>
</table>`,
    type: "snippet",
  },
  {
    label: "a11y:live-region",
    detail: "Polite live region for asynchronous status updates",
    template:
      '<div role="status" aria-live="polite" aria-atomic="true">${1:Status message}</div>',
    type: "snippet",
  },
];

export const CSS_A11Y_SNIPPETS: readonly EditorSnippet[] = [
  {
    label: "a11y:focus-ring",
    detail: "High-contrast :focus-visible outline",
    template: `:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}`,
    type: "snippet",
  },
  {
    label: "a11y:sr-only",
    detail: "Screen-reader only visually-hidden utility",
    template: `.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}`,
    type: "snippet",
  },
  {
    label: "a11y:reduced-motion",
    detail: "Respect prefers-reduced-motion OS preference",
    template: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
    type: "snippet",
  },
  {
    label: "a11y:forced-colors",
    detail: "High contrast forced-colors mode adaptation",
    template: `@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid Highlight;
  }
  .selected {
    forced-color-adjust: none;
    background-color: Highlight;
    color: HighlightText;
  }
}`,
    type: "snippet",
  },
];

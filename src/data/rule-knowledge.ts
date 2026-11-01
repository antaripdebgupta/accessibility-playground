export type WhoIsAffected =
  | "screen-reader"
  | "keyboard"
  | "magnification"
  | "voice-control"
  | "switch-device"
  | "low-vision-contrast";

export type InspectorTarget =
  "tree" | "aria" | "accname" | "focus" | "announce";

export interface RuleResource {
  readonly title: string;
  readonly url: string;
}

export interface RuleKnowledge {
  readonly ruleId: string;
  readonly whatIsHappening: string;
  readonly whyItMatters: string;
  readonly whoIsAffected: readonly WhoIsAffected[];
  readonly whoIsAffectedNote?: string;
  readonly badExample: string;
  readonly goodExample: string;
  readonly whyFixWorks: string;
  readonly howToVerify: readonly string[];
  readonly inspector: InspectorTarget;
  readonly resources: readonly RuleResource[];
}

export const RULE_KNOWLEDGE: readonly RuleKnowledge[] = [
  // --- 16 Playground Rules ---
  {
    ruleId: "click-on-non-interactive",
    whatIsHappening:
      "A non-interactive element has an onclick or keyboard click listener without interactive semantics or keyboard operability.",
    whyItMatters:
      "Keyboard and switch users cannot focus or trigger standard click handlers on static elements like div or span by default.",
    whoIsAffected: [
      "keyboard",
      "screen-reader",
      "switch-device",
      "voice-control",
    ],
    whoIsAffectedNote:
      "People navigating without a pointing device rely on elements participating in the tab sequence and responding to Enter/Space.",
    badExample: `<div onclick="submitForm()">Submit</div>`,
    goodExample: `<button type="button" onclick="submitForm()">Submit</button>`,
    whyFixWorks:
      "Native button elements are implicitly focusable, keyboard operable with Enter and Space, and announce the 'button' role to assistive technology.",
    howToVerify: [
      "Press Tab to navigate to the control.",
      "Press Enter and Space to ensure the action triggers.",
      "Check the Accessibility Tree to verify the element exposes a button role.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "MDN: The Button element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button",
      },
      {
        title: "W3C WAI: ARIA Authoring Practices - Button Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
      },
    ],
  },
  {
    ruleId: "interactive-role-not-focusable",
    whatIsHappening:
      "An element has an interactive ARIA role such as button, link, or tab, but lacks tabindex='0'.",
    whyItMatters:
      "Assigning an ARIA role communicates interactivity to screen readers, but ARIA does not grant native keyboard focus.",
    whoIsAffected: ["keyboard", "switch-device", "screen-reader"],
    whoIsAffectedNote:
      "Users expecting an interactive control will be unable to reach or activate it using keyboard commands.",
    badExample: `<span role="button">Save</span>`,
    goodExample: `<button type="button">Save</button>`,
    whyFixWorks:
      "Native interactive elements have built-in focusability. If a custom element is required, tabindex='0' inserts it into sequential focus navigation.",
    howToVerify: [
      "Press Tab to verify the element receives focus.",
      "Verify a visible focus outline appears.",
      "Confirm the accessibility tree reports the role and focused state.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "W3C WAI: Using ARIA - Rule 2",
        url: "https://www.w3.org/TR/using-aria/#rule2",
      },
      {
        title: "MDN: Keyboard-navigable JavaScript widgets",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets",
      },
    ],
  },
  {
    ruleId: "link-as-button",
    whatIsHappening:
      "A hyperlink with href='#' or javascript: is used to perform an in-page action instead of navigating to a destination URL.",
    whyItMatters:
      "Links announce as navigation targets and activate with Enter, whereas buttons trigger actions and activate with both Enter and Space.",
    whoIsAffected: ["screen-reader", "keyboard", "voice-control"],
    badExample: `<a href="#" onclick="openModal()">Open Details</a>`,
    goodExample: `<button type="button" onclick="openModal()">Open Details</button>`,
    whyFixWorks:
      "Using a semantic button element gives accurate screen reader role announcements and correct keyboard activation keys (Space and Enter).",
    howToVerify: [
      "Open the ARIA Explorer to inspect the computed role.",
      "Verify the control triggers on Space keypress.",
      "Ensure the browser status bar does not display a misleading '# ' target.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "MDN: Links vs Buttons",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#links_and_buttons",
      },
      {
        title: "W3C WAI: Developing a Web Accessibility Business Case",
        url: "https://www.w3.org/WAI/planning/business-case/",
      },
    ],
  },
  {
    ruleId: "input-placeholder-only",
    whatIsHappening:
      "A form input relies solely on a placeholder attribute without an associated label element or accessible name.",
    whyItMatters:
      "Placeholders disappear when text is entered, frequently lack sufficient contrast, and are not reliably announced as labels by screen readers.",
    whoIsAffected: [
      "screen-reader",
      "voice-control",
      "magnification",
      "low-vision-contrast",
    ],
    whoIsAffectedNote:
      "Users with memory impairments or low vision lose the prompt once text input starts.",
    badExample: `<input type="text" placeholder="First Name">`,
    goodExample: `<label for="fname">First Name</label>\n<input type="text" id="fname" placeholder="e.g. Alex">`,
    whyFixWorks:
      "A native label element establishes a permanent, programmatic link that provides an accessible name and clickable touch target.",
    howToVerify: [
      "Check Accessible Name inspector to confirm the input derives its name from the label.",
      "Click the label text and confirm the input receives focus.",
      "Type into the input and verify the label remains visible above or beside the input.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: Labeling Controls",
        url: "https://www.w3.org/WAI/tutorials/forms/labels/",
      },
      {
        title: "MDN: <input> Placeholder attribute accessibility",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder",
      },
    ],
  },
  {
    ruleId: "input-no-label",
    whatIsHappening:
      "A form control lacks an accessible name from a label, aria-label, aria-labelledby, or title.",
    whyItMatters:
      "Assistive technologies announce the control type without describing what data the user is expected to provide.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<input type="email" id="user-email">`,
    goodExample: `<label for="user-email">Email Address</label>\n<input type="email" id="user-email">`,
    whyFixWorks:
      "Associating a label element with for/id creates an accessible name calculation winner that screen readers read upon focus.",
    howToVerify: [
      "Inspect the Accessible Name tab and check that name computation resolves cleanly.",
      "Check that clicking the label focuses the corresponding input.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: Form Labels Tutorial",
        url: "https://www.w3.org/WAI/tutorials/forms/labels/",
      },
      {
        title: "MDN: Accessible forms",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#accessible_forms",
      },
    ],
  },
  {
    ruleId: "img-missing-alt",
    whatIsHappening: "An img element is missing the alt attribute entirely.",
    whyItMatters:
      "Screen readers may announce the raw file URL or ignore the image unpredictably, confusing users about the image content.",
    whoIsAffected: ["screen-reader", "low-vision-contrast"],
    badExample: `<img src="hero.jpg">`,
    goodExample: `<img src="hero.jpg" alt="Antigravity team collaborating in the IDE">`,
    whyFixWorks:
      "Providing alt text describes visual content. If the image is purely decorative, alt='' explicitly marks it for screen readers to skip.",
    howToVerify: [
      "Examine the Accessibility Tree inspector: decorative images with alt='' must be ignored.",
      "Informative images must present their alt string as the computed accessible name.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: An alt Decision Tree",
        url: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
      },
      {
        title: "MDN: Images in HTML",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#text_alternatives",
      },
    ],
  },
  {
    ruleId: "empty-interactive-name",
    whatIsHappening:
      "An interactive element (such as a button, link, or menuitem) has no discernible text or label.",
    whyItMatters:
      "Users navigating with speech recognition cannot target the control by name, and screen readers announce an unlabelled control.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<button type="button"><svg viewBox="0 0 24 24"><path d="..."/></svg></button>`,
    goodExample: `<button type="button" aria-label="Close dialog"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="..."/></svg></button>`,
    whyFixWorks:
      "Adding aria-label or visible inner text supplies an accessible name that assistive tools read and speech software can invoke.",
    howToVerify: [
      "Open the Accessible Name inspector and verify the calculated name string.",
      "Check the Announcement tab to verify the simulated speech output.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: Accessible Name and Description Computation",
        url: "https://www.w3.org/TR/accname-1.1/",
      },
      {
        title: "MDN: ARIA: Button role",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role",
      },
    ],
  },
  {
    ruleId: "positive-tabindex",
    whatIsHappening:
      "An element has a tabindex attribute with a positive value greater than 0.",
    whyItMatters:
      "Positive tabindex disrupts natural reading order by hijacking focus before natural DOM elements, disorienting keyboard users.",
    whoIsAffected: ["keyboard", "switch-device", "screen-reader"],
    badExample: `<button tabindex="5">Submit</button>`,
    goodExample: `<button type="button">Submit</button>`,
    whyFixWorks:
      "Relying on natural DOM ordering or tabindex='0' preserves intuitive top-to-bottom keyboard tab sequence.",
    howToVerify: [
      "Switch to the Focus Order panel.",
      "Verify tab order matches natural visual and document layout sequence.",
      "Ensure no elements jump unexpectedly ahead of preceding interactive items.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "MDN: tabindex attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex",
      },
      {
        title: "W3C WAI: Understanding SC 2.4.3 Focus Order",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
      },
    ],
  },
  {
    ruleId: "aria-hidden-focusable",
    whatIsHappening:
      "An element with aria-hidden='true' contains focusable or interactive descendants, or is focusable itself.",
    whyItMatters:
      "Keyboard users can tab into an invisible focus stop that screen readers will refuse to announce, creating a phantom focus trap.",
    whoIsAffected: ["screen-reader", "keyboard"],
    badExample: `<div aria-hidden="true">\n  <button type="button">Hidden action</button>\n</div>`,
    goodExample: `<div aria-hidden="true">\n  <button type="button" tabindex="-1" disabled>Hidden action</button>\n</div>`,
    whyFixWorks:
      "Disabling the control or removing it with inert or display:none keeps both visual focus and assistive trees in alignment.",
    howToVerify: [
      "Tab through the document to verify focus does not land inside aria-hidden regions.",
      "Check the Accessibility Tree inspector to verify hidden elements have no active focusable children.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "W3C WAI: ARIA in HTML - aria-hidden",
        url: "https://www.w3.org/TR/html-aria/#aria-hidden",
      },
      {
        title: "MDN: aria-hidden attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden",
      },
    ],
  },
  {
    ruleId: "heading-order",
    whatIsHappening:
      "Heading levels skip one or more hierarchy levels (e.g., jumping directly from h1 to h3).",
    whyItMatters:
      "Screen reader users frequently navigate pages using heading shortcut keys to understand content organization and structure.",
    whoIsAffected: ["screen-reader", "magnification"],
    badExample: `<h1>Playground Documentation</h1>\n<h3>Getting Started</h3>`,
    goodExample: `<h1>Playground Documentation</h1>\n<h2>Getting Started</h2>`,
    whyFixWorks:
      "Progressive heading levels maintain a logical outline structure. Visual sizing should be customized with CSS rather than skipping heading tags.",
    howToVerify: [
      "Inspect heading hierarchy in the Accessibility Tree panel.",
      "Ensure heading levels increment by no more than one level at a time.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "W3C WAI: Headings Tutorial",
        url: "https://www.w3.org/WAI/tutorials/page-structure/headings/",
      },
      {
        title: "MDN: HTML Heading elements",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements",
      },
    ],
  },
  {
    ruleId: "dialog-no-name",
    whatIsHappening:
      "A dialog element or role='dialog' container does not have an accessible name via aria-labelledby or aria-label.",
    whyItMatters:
      "When a modal opens and claims focus, assistive technologies announce the dialog role without identifying its title or purpose.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<dialog open>\n  <h2>Confirm Delete</h2>\n  <p>Are you sure?</p>\n</dialog>`,
    goodExample: `<dialog open aria-labelledby="dlg-title">\n  <h2 id="dlg-title">Confirm Delete</h2>\n  <p>Are you sure?</p>\n</dialog>`,
    whyFixWorks:
      "aria-labelledby links the dialog container directly to its internal heading, which screen readers speak upon dialog entrance.",
    howToVerify: [
      "Check the Accessible Name inspector on the dialog node.",
      "Open Announcement panel to preview the dialog announcement.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: ARIA Authoring Practices - Dialog (Modal) Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      },
      {
        title: "MDN: Dialog element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog",
      },
    ],
  },
  {
    ruleId: "tab-pattern-incomplete",
    whatIsHappening:
      "A tab component pattern is missing required sibling relationships (e.g. role='tab' without role='tablist' parent or matching tabpanel).",
    whyItMatters:
      "Tab widgets rely on specialized keyboard navigation and compound relationships (tab controls panel) to function correctly.",
    whoIsAffected: ["screen-reader", "keyboard"],
    badExample: `<div>\n  <div role="tab">Tab 1</div>\n</div>`,
    goodExample: `<div role="tablist" aria-label="Settings">\n  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">Tab 1</button>\n</div>\n<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">Panel content</div>`,
    whyFixWorks:
      "Adhering to the ARIA tablist/tab/tabpanel composite structure allows screen readers to announce position in list and associated content.",
    howToVerify: [
      "Check ARIA Explorer panel for invalid role structures.",
      "Confirm each tab element has aria-controls and each tabpanel has aria-labelledby.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "W3C WAI: ARIA Authoring Practices - Tabs Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
      },
      {
        title: "MDN: ARIA: tab role",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role",
      },
    ],
  },
  {
    ruleId: "duplicate-id",
    whatIsHappening:
      "The same id attribute value is used on more than one element in the document.",
    whyItMatters:
      "IDs must be unique. References like for, aria-labelledby, and aria-describedby resolve only to the first element found.",
    whoIsAffected: ["screen-reader", "voice-control", "keyboard"],
    badExample: `<button id="save-btn">Save Draft</button>\n<button id="save-btn">Save Final</button>`,
    goodExample: `<button id="save-draft-btn">Save Draft</button>\n<button id="save-final-btn">Save Final</button>`,
    whyFixWorks:
      "Unique IDs ensure that DOM queries, form label mappings, and ARIA relationship lookups resolve deterministically to the intended element.",
    howToVerify: [
      "Search the document for duplicate occurrences of the identifier.",
      "Check the Accessibility Tree to ensure labels point to the intended unique target.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "MDN: id global attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id",
      },
      {
        title: "W3C WAI: Understanding SC 4.1.2 Name, Role, Value",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
      },
    ],
  },
  {
    ruleId: "aria-broken-reference",
    whatIsHappening:
      "An ARIA ID reference (such as aria-labelledby, aria-describedby, or aria-controls) targets an ID that does not exist in the DOM.",
    whyItMatters:
      "Assistive technologies cannot compute the accessible name, description, or controlled element, leading to silent calculation failures.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<button aria-describedby="helper-tip">Submit</button>`,
    goodExample: `<button aria-describedby="helper-tip">Submit</button>\n<p id="helper-tip">Takes up to 2 business days.</p>`,
    whyFixWorks:
      "Matching the referenced ID with an existing element allows the browser accessible name computation engine to retrieve referenced text.",
    howToVerify: [
      "Open the Accessible Name inspector and observe whether reference resolution succeeds.",
      "Verify the target ID exists in the DOM.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: ARIA in HTML - Reference Validity",
        url: "https://www.w3.org/TR/html-aria/",
      },
      {
        title: "MDN: aria-labelledby attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby",
      },
    ],
  },
  {
    ruleId: "invalid-aria",
    whatIsHappening:
      "An element specifies an unknown or misspelled ARIA attribute, or an attribute not permitted on its role.",
    whyItMatters:
      "Browsers ignore invalid ARIA attributes, leaving the intended accessibility enhancements completely non-functional.",
    whoIsAffected: ["screen-reader"],
    badExample: `<button aria-labeledby="btn-text">Action</button>`,
    goodExample: `<button aria-labelledby="btn-text">Action</button>`,
    whyFixWorks:
      "Standard ARIA attributes defined in the W3C specification are recognized and translated into accessibility API properties.",
    howToVerify: [
      "Check the ARIA Explorer tab for attribute validity warnings.",
      "Verify spelling against the W3C ARIA specification.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "W3C WAI: Accessible Rich Internet Applications (WAI-ARIA) 1.2",
        url: "https://www.w3.org/TR/wai-aria-1.2/",
      },
      {
        title: "MDN: ARIA states and properties",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes",
      },
    ],
  },
  {
    ruleId: "outline-removed",
    whatIsHappening:
      "CSS removes the focus outline (outline: none or outline: 0) without providing an alternative visible focus indicator.",
    whyItMatters:
      "Keyboard users rely on visible focus indicators to know which interactive control will receive input when typing or pressing Enter.",
    whoIsAffected: ["keyboard", "switch-device", "low-vision-contrast"],
    badExample: `button:focus { outline: none; }`,
    goodExample: `button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }`,
    whyFixWorks:
      "Using :focus-visible with a high-contrast outline preserves clarity for keyboard navigation while suppressing outlines on mouse clicks if desired.",
    howToVerify: [
      "Open the Focus Order panel and run simulated focus navigation.",
      "Verify the focus ring remains clearly visible against background colors.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "W3C WAI: Understanding SC 2.4.7 Focus Visible",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
      },
      {
        title: "MDN: :focus-visible pseudo-class",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible",
      },
    ],
  },

  // --- ~25 Common Axe Rules ---
  {
    ruleId: "image-alt",
    whatIsHappening:
      "An image element does not have an alt attribute or appropriate accessible text alternative.",
    whyItMatters:
      "Screen readers cannot convey the visual purpose of the image to users who cannot see it.",
    whoIsAffected: ["screen-reader", "low-vision-contrast"],
    badExample: `<img src="profile.png">`,
    goodExample: `<img src="profile.png" alt="Profile photo of Jordan Doe">`,
    whyFixWorks:
      "The alt attribute supplies text that screen readers speak and browsers render if the image fails to load.",
    howToVerify: [
      "Inspect the element in the Accessible Name panel.",
      "Confirm the alt text matches the information conveyed by the graphic.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "W3C WAI: Images Tutorial",
        url: "https://www.w3.org/WAI/tutorials/images/",
      },
      {
        title: "Deque University: Image alt rule",
        url: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
      },
    ],
  },
  {
    ruleId: "button-name",
    whatIsHappening:
      "A button does not have discernible text or an accessible name.",
    whyItMatters:
      "Screen readers will announce an unlabelled 'button' without indicating what action will occur when triggered.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<button><i class="icon-trash"></i></button>`,
    goodExample: `<button aria-label="Delete item"><i class="icon-trash" aria-hidden="true"></i></button>`,
    whyFixWorks:
      "aria-label or inner text provides an accessible name for speech input software and screen readers.",
    howToVerify: [
      "Inspect the Accessible Name panel to confirm the computed name.",
      "Check Announcement tab to review the simulated screen reader output.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "Deque University: Buttons must have discernible text",
        url: "https://dequeuniversity.com/rules/axe/4.4/button-name",
      },
      {
        title: "MDN: ARIA: Button role",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role",
      },
    ],
  },
  {
    ruleId: "link-name",
    whatIsHappening:
      "A link does not have discernible text or an accessible name.",
    whyItMatters:
      "Links without text are announced as 'link' without a destination, making navigation impossible for screen reader users.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<a href="/cart"><svg><circle r="5"/></svg></a>`,
    goodExample: `<a href="/cart" aria-label="Shopping Cart"><svg aria-hidden="true"><circle r="5"/></svg></a>`,
    whyFixWorks:
      "Providing text inside the link or an aria-label ensures the link destination is clear in screen reader link lists.",
    howToVerify: [
      "Inspect Accessible Name panel to verify the link name.",
      "Verify the link text explains the target destination.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "Deque University: Links must have discernible text",
        url: "https://dequeuniversity.com/rules/axe/4.4/link-name",
      },
      {
        title: "W3C WAI: Understanding SC 2.4.4 Link Purpose",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html",
      },
    ],
  },
  {
    ruleId: "label",
    whatIsHappening: "A form element is missing a programmatic label.",
    whyItMatters:
      "Users filling out forms will not hear the purpose of the input when navigating into the field.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<input type="text" name="username">`,
    goodExample: `<label for="username">Username</label>\n<input type="text" id="username" name="username">`,
    whyFixWorks:
      "Linking label for with input id ensures both visual clarity and programmatic accessible name calculation.",
    howToVerify: [
      "Click the label and ensure the input receives focus.",
      "Check the Accessible Name inspector.",
    ],
    inspector: "accname",
    resources: [
      {
        title: "Deque University: Form elements must have labels",
        url: "https://dequeuniversity.com/rules/axe/4.4/label",
      },
      {
        title: "W3C WAI: Labeling Controls",
        url: "https://www.w3.org/WAI/tutorials/forms/labels/",
      },
    ],
  },
  {
    ruleId: "color-contrast",
    whatIsHappening:
      "The contrast ratio between text and its background is below the required WCAG threshold.",
    whyItMatters:
      "Low contrast makes text difficult or impossible to read for users with low vision or when viewing screens in bright sunlight.",
    whoIsAffected: ["low-vision-contrast", "magnification"],
    badExample: `<p style="color: #999; background: #fff;">Faint text</p>`,
    goodExample: `<p style="color: #595959; background: #fff;">Readable text (4.5:1 ratio)</p>`,
    whyFixWorks:
      "Adjusting foreground lightness guarantees at least 4.5:1 contrast for normal text and 3:1 for large text.",
    howToVerify: [
      "Open the Contrast tab to test foreground and background colors.",
      "Verify the contrast ratio is at or above 4.5:1 for regular text.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "Deque University: Color contrast rule",
        url: "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
      },
      {
        title: "W3C WAI: Understanding SC 1.4.3 Contrast (Minimum)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      },
    ],
  },
  {
    ruleId: "aria-valid-attr-value",
    whatIsHappening:
      "An ARIA attribute contains an unsupported or invalid value.",
    whyItMatters:
      "When an ARIA attribute value is invalid, browsers ignore it or fall back unpredictably, breaking assistive features.",
    whoIsAffected: ["screen-reader"],
    badExample: `<div role="button" aria-expanded="yes">Menu</div>`,
    goodExample: `<div role="button" aria-expanded="true">Menu</div>`,
    whyFixWorks:
      "Using standard booleans ('true'/'false') or valid tokens as defined in ARIA specs allows assistive APIs to expose the state.",
    howToVerify: [
      "Inspect the ARIA Explorer tab to confirm attribute values parse successfully.",
      "Verify allowed values on MDN or W3C ARIA specifications.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "Deque University: ARIA attributes must have valid values",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-valid-attr-value",
      },
      {
        title: "W3C WAI: WAI-ARIA 1.2 State and Property Definitions",
        url: "https://www.w3.org/TR/wai-aria-1.2/#state_prop_def",
      },
    ],
  },
  {
    ruleId: "aria-required-attr",
    whatIsHappening:
      "An element with an ARIA role does not provide all mandatory attributes required by that role.",
    whyItMatters:
      "Roles like slider, combobox, and checkbox require specific attributes (e.g. aria-valuenow or aria-checked) to communicate state.",
    whoIsAffected: ["screen-reader"],
    badExample: `<div role="checkbox">Accept terms</div>`,
    goodExample: `<div role="checkbox" aria-checked="false" tabindex="0">Accept terms</div>`,
    whyFixWorks:
      "Providing required attributes completes the contract expected by assistive technologies for that widget role.",
    howToVerify: [
      "Check ARIA Explorer panel for missing required state warnings.",
      "Check the Accessibility Tree inspector to verify state representation.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "Deque University: Required ARIA attributes must be provided",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-required-attr",
      },
      {
        title: "W3C WAI: ARIA Authoring Practices Guide",
        url: "https://www.w3.org/WAI/ARIA/apg/",
      },
    ],
  },
  {
    ruleId: "aria-allowed-attr",
    whatIsHappening:
      "An ARIA attribute is present on an element that is not allowed to have that attribute according to ARIA specifications.",
    whyItMatters:
      "Unallowed attributes provide false expectations in code and are discarded by assistive technologies.",
    whoIsAffected: ["screen-reader"],
    badExample: `<span role="presentation" aria-label="Main heading">Heading</span>`,
    goodExample: `<h2>Heading</h2>`,
    whyFixWorks:
      "Using valid semantic elements or attributes supported by the element's role guarantees proper accessibility API exposure.",
    howToVerify: [
      "Open ARIA Explorer to inspect role-attribute compatibility.",
      "Verify semantic HTML alternatives on MDN.",
    ],
    inspector: "aria",
    resources: [
      {
        title:
          "Deque University: Elements must only use allowed ARIA attributes",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-allowed-attr",
      },
      {
        title: "W3C WAI: WAI-ARIA 1.2 Role Definitions",
        url: "https://www.w3.org/TR/wai-aria-1.2/#role_definitions",
      },
    ],
  },
  {
    ruleId: "aria-roles",
    whatIsHappening:
      "An element has a role attribute with an invalid, misspelled, or abstract role name.",
    whyItMatters:
      "Abstract or invalid roles fail to communicate semantics to screen readers, reverting the element to generic container semantics.",
    whoIsAffected: ["screen-reader"],
    badExample: `<div role="btn">Click me</div>`,
    goodExample: `<button type="button">Click me</button>`,
    whyFixWorks:
      "Using recognized concrete roles or native HTML tags lets assistive technology announce the proper control type.",
    howToVerify: [
      "Check the ARIA Explorer panel for invalid role warnings.",
      "Inspect the Accessibility Tree to confirm the node has an active role.",
    ],
    inspector: "aria",
    resources: [
      {
        title: "Deque University: ARIA roles must be valid",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-roles",
      },
      {
        title: "MDN: ARIA Roles",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles",
      },
    ],
  },
  {
    ruleId: "landmark-one-main",
    whatIsHappening:
      "The page lacks a main landmark or contains multiple top-level main landmarks.",
    whyItMatters:
      "Users navigating by landmarks use the main landmark to skip repetitive header and navigation links and jump directly to primary content.",
    whoIsAffected: ["screen-reader", "keyboard"],
    badExample: `<div>\n  <h1>Welcome</h1>\n</div>`,
    goodExample: `<main>\n  <h1>Welcome</h1>\n</main>`,
    whyFixWorks:
      "The main element provides a standard landmark recognized by screen reader navigation shortcut keys.",
    howToVerify: [
      "Inspect the Accessibility Tree panel to verify a single main landmark exists.",
      "Ensure all primary page content lives inside the main element.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: Document must have one main landmark",
        url: "https://dequeuniversity.com/rules/axe/4.4/landmark-one-main",
      },
      {
        title: "W3C WAI: Page Regions and Landmarks",
        url: "https://www.w3.org/WAI/tutorials/page-structure/regions/",
      },
    ],
  },
  {
    ruleId: "landmark-complementary-is-top-level",
    whatIsHappening:
      "A complementary landmark (aside) is nested inside another landmark rather than at the top level.",
    whyItMatters:
      "Complementary content should support the document as a whole. Nesting it can cause confusion in landmark outlines.",
    whoIsAffected: ["screen-reader"],
    badExample: `<main>\n  <aside>Related articles</aside>\n</main>`,
    goodExample: `<main>...</main>\n<aside>Related articles</aside>`,
    whyFixWorks:
      "Top-level landmarks present a clear, un-muddled high-level page outline to screen reader landmark menus.",
    howToVerify: [
      "Inspect the Accessibility Tree to check landmark hierarchy.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: Complementary landmarks should be top level",
        url: "https://dequeuniversity.com/rules/axe/4.4/landmark-complementary-is-top-level",
      },
      {
        title: "W3C WAI: ARIA Landmarks Example",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/",
      },
    ],
  },
  {
    ruleId: "region",
    whatIsHappening:
      "A generic region landmark lacks an accessible name or label.",
    whyItMatters:
      "Screen readers announce unlabelled regions simply as 'region', giving no indication of what section of content it contains.",
    whoIsAffected: ["screen-reader"],
    badExample: `<section>\n  <p>Content</p>\n</section>`,
    goodExample: `<section aria-labelledby="section-heading">\n  <h2 id="section-heading">Customer Reviews</h2>\n</section>`,
    whyFixWorks:
      "Providing aria-labelledby turns the generic section into a distinct, named landmark in screen reader navigation listings.",
    howToVerify: [
      "Check Accessible Name panel on the section element.",
      "Confirm the region announces with its title in the Accessibility Tree.",
    ],
    inspector: "accname",
    resources: [
      {
        title:
          "Deque University: All page content must be contained by landmarks",
        url: "https://dequeuniversity.com/rules/axe/4.4/region",
      },
      {
        title: "MDN: <section> element accessibility",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section#accessibility_concerns",
      },
    ],
  },
  {
    ruleId: "tabindex",
    whatIsHappening:
      "An element has a positive tabindex attribute value (> 0).",
    whyItMatters:
      "Positive tabindices override standard DOM tab order, frequently causing focus to jump erratically across the interface.",
    whoIsAffected: ["keyboard", "switch-device", "screen-reader"],
    badExample: `<input tabindex="2">`,
    goodExample: `<input>`,
    whyFixWorks:
      "Removing explicit positive tabindex restores the natural document sequence.",
    howToVerify: [
      "Open the Focus Order tab and step through the focus sequence.",
      "Confirm focus flows naturally according to visual reading order.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "Deque University: Elements must not have positive tabindex",
        url: "https://dequeuniversity.com/rules/axe/4.4/tabindex",
      },
      {
        title: "MDN: tabindex",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex",
      },
    ],
  },
  {
    ruleId: "target-size",
    whatIsHappening:
      "The interactive target has a clickable area smaller than the WCAG 2.2 minimum threshold (24x24 CSS pixels).",
    whyItMatters:
      "Small targets are difficult to tap accurately on mobile screens or with tremor, motor impairments, or switch controls.",
    whoIsAffected: ["switch-device", "keyboard"],
    whoIsAffectedNote:
      "People with motor impairments or those using mobile touchscreens experience accidental clicks on small targets.",
    badExample: `<button style="width: 16px; height: 16px;">x</button>`,
    goodExample: `<button style="min-width: 24px; min-height: 24px; padding: 4px;">x</button>`,
    whyFixWorks:
      "Padding or minimum dimensions expand the hit target to at least 24 by 24 pixels without compromising visual compactness.",
    howToVerify: [
      "Inspect the button's computed dimensions in browser dev tools.",
      "Confirm bounding box is at least 24x24 pixels.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "W3C WAI: Understanding SC 2.5.8 Target Size (Minimum)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
      },
      {
        title: "Deque University: Target size rule",
        url: "https://dequeuniversity.com/rules/axe/4.4/target-size",
      },
    ],
  },
  {
    ruleId: "html-has-lang",
    whatIsHappening: "The root <html> element is missing the lang attribute.",
    whyItMatters:
      "Screen readers use the document language attribute to select the correct speech synthesis voice and pronunciation dictionary.",
    whoIsAffected: ["screen-reader"],
    badExample: `<html>\n<head>...</head>`,
    goodExample: `<html lang="en">\n<head>...</head>`,
    whyFixWorks:
      "Specifying a valid BCP 47 language code ensures screen readers pronounce words correctly rather than applying wrong phonetic rules.",
    howToVerify: [
      "Inspect the html tag in the document root.",
      "Verify the lang attribute specifies a valid language code (e.g. 'en', 'fr').",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: <html> element must have a lang attribute",
        url: "https://dequeuniversity.com/rules/axe/4.4/html-has-lang",
      },
      {
        title: "W3C WAI: Understanding SC 3.1.1 Language of Page",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html",
      },
    ],
  },
  {
    ruleId: "document-title",
    whatIsHappening:
      "The document does not have a non-empty <title> element inside <head>.",
    whyItMatters:
      "The page title is the very first thing announced by screen readers when loading a page, and is shown on browser tabs and bookmarks.",
    whoIsAffected: ["screen-reader", "keyboard"],
    badExample: `<head><meta charset="utf-8"></head>`,
    goodExample: `<head><title>Accessibility Playground - Interactive Testing</title></head>`,
    whyFixWorks:
      "A descriptive title informs users of page content and context before they begin navigating.",
    howToVerify: [
      "Check the document <head> for a non-empty <title> tag.",
      "Verify the title concisely describes the current page content.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: Documents must have <title> element",
        url: "https://dequeuniversity.com/rules/axe/4.4/document-title",
      },
      {
        title: "W3C WAI: Understanding SC 2.4.2 Page Titled",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html",
      },
    ],
  },
  {
    ruleId: "aria-hidden-focus",
    whatIsHappening:
      "An element with aria-hidden='true' contains focusable descendants.",
    whyItMatters:
      "Keyboard users can navigate to elements that assistive technology hides, causing silence and disorientation.",
    whoIsAffected: ["screen-reader", "keyboard"],
    badExample: `<div aria-hidden="true"><a href="/terms">Terms</a></div>`,
    goodExample: `<div aria-hidden="true"><a href="/terms" tabindex="-1">Terms</a></div>`,
    whyFixWorks:
      "Setting tabindex='-1' or using the inert attribute prevents keyboard focus from reaching hidden subtrees.",
    howToVerify: [
      "Tab through the page and verify hidden elements do not receive focus.",
      "Inspect Accessibility Tree panel for unexpected active elements inside aria-hidden containers.",
    ],
    inspector: "tree",
    resources: [
      {
        title:
          "Deque University: aria-hidden elements must not contain focusable elements",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-hidden-focus",
      },
      {
        title: "W3C WAI: ARIA in HTML",
        url: "https://www.w3.org/TR/html-aria/",
      },
    ],
  },
  {
    ruleId: "bypass",
    whatIsHappening:
      "The page does not provide a mechanism to bypass repetitive navigation blocks, such as a skip link.",
    whyItMatters:
      "Keyboard and screen reader users must tab through dozens of navigation links on every page load before reaching main content.",
    whoIsAffected: ["keyboard", "screen-reader", "switch-device"],
    badExample: `<body>\n<nav>...30 links...</nav>\n<main>Content</main>`,
    goodExample: `<body>\n<a href="#main-content" class="skip-link">Skip to main content</a>\n<nav>...</nav>\n<main id="main-content">Content</main>`,
    whyFixWorks:
      "A skip link at the start of the body allows immediate navigation directly to the primary container.",
    howToVerify: [
      "Press Tab upon loading the page.",
      "Verify the skip link becomes visible on focus and jumping moves focus to main.",
    ],
    inspector: "focus",
    resources: [
      {
        title:
          "Deque University: Page must have means to bypass repeated blocks",
        url: "https://dequeuniversity.com/rules/axe/4.4/bypass",
      },
      {
        title: "W3C WAI: Understanding SC 2.4.1 Bypass Blocks",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html",
      },
    ],
  },
  {
    ruleId: "list",
    whatIsHappening:
      "An element with role='list' (or <ul>/<ol>) contains direct children other than <li> or elements with role='listitem'.",
    whyItMatters:
      "Screen readers announce lists with item counts (e.g., 'list, 4 items'). Invalid direct children break list structure announcements.",
    whoIsAffected: ["screen-reader"],
    badExample: `<ul>\n  <div>Item 1</div>\n</ul>`,
    goodExample: `<ul>\n  <li>Item 1</li>\n</ul>`,
    whyFixWorks:
      "Ensuring all immediate children of list containers are list items maintains valid accessibility tree groupings.",
    howToVerify: [
      "Inspect the list hierarchy in the Accessibility Tree panel.",
      "Verify the list node reports accurate child item counts.",
    ],
    inspector: "tree",
    resources: [
      {
        title:
          "Deque University: <ul> and <ol> must only directly contain <li> elements",
        url: "https://dequeuniversity.com/rules/axe/4.4/list",
      },
      {
        title: "MDN: <ul> unordered list element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul",
      },
    ],
  },
  {
    ruleId: "listitem",
    whatIsHappening:
      "An <li> element or role='listitem' is not contained inside a parent <ul>, <ol>, or role='list'.",
    whyItMatters:
      "Orphaned list items lose list semantics and will not announce position or total item count in screen readers.",
    whoIsAffected: ["screen-reader"],
    badExample: `<div>\n  <li>Standalone item</li>\n</div>`,
    goodExample: `<ul>\n  <li>Standalone item</li>\n</ul>`,
    whyFixWorks:
      "Wrapping items in a list parent establishes the parent-child relationship in accessibility APIs.",
    howToVerify: [
      "Inspect the element in the Accessibility Tree.",
      "Confirm the item is nested within a list container.",
    ],
    inspector: "tree",
    resources: [
      {
        title:
          "Deque University: <li> elements must be contained within a list",
        url: "https://dequeuniversity.com/rules/axe/4.4/listitem",
      },
      {
        title: "MDN: <li> list item element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li",
      },
    ],
  },
  {
    ruleId: "meta-viewport",
    whatIsHappening:
      "The <meta name='viewport'> tag disables user zooming using user-scalable=no or maximum-scale < 2.",
    whyItMatters:
      "Users with low vision frequently need to zoom web pages on mobile devices to read text.",
    whoIsAffected: ["magnification", "low-vision-contrast"],
    badExample: `<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">`,
    goodExample: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    whyFixWorks:
      "Allowing zooming enables browser pinch-to-zoom and text magnification gestures.",
    howToVerify: [
      "Check viewport meta tag attributes in HTML head.",
      "Ensure user-scalable is not set to no or 0, and maximum-scale is not restricted.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: Zooming and scaling must not be disabled",
        url: "https://dequeuniversity.com/rules/axe/4.4/meta-viewport",
      },
      {
        title: "W3C WAI: Understanding SC 1.4.4 Resize Text",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
      },
    ],
  },
  {
    ruleId: "nested-interactive",
    whatIsHappening:
      "An interactive control is nested inside another interactive control (e.g. a button inside a link).",
    whyItMatters:
      "Nested interactive controls cause conflicting keyboard activation behaviors and render accessibility trees invalid.",
    whoIsAffected: ["screen-reader", "keyboard", "voice-control"],
    badExample: `<a href="/details">\n  View Item <button type="button">Delete</button>\n</a>`,
    goodExample: `<div>\n  <a href="/details">View Item</a>\n  <button type="button">Delete</button>\n</div>`,
    whyFixWorks:
      "Separating controls into distinct siblings removes focus collisions and activation ambiguity.",
    howToVerify: [
      "Open the Focus Order tab and tab through the elements.",
      "Check the Accessibility Tree to ensure controls are not nested inside each other.",
    ],
    inspector: "focus",
    resources: [
      {
        title: "Deque University: Interactive controls must not be nested",
        url: "https://dequeuniversity.com/rules/axe/4.4/nested-interactive",
      },
      {
        title: "MDN: HTML Button element accessibility",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#accessibility_concerns",
      },
    ],
  },
  {
    ruleId: "page-has-heading-one",
    whatIsHappening: "The page does not contain a level 1 heading (<h1>).",
    whyItMatters:
      "An <h1> identifies the primary subject of the page and serves as the main orientation anchor for assistive technology users.",
    whoIsAffected: ["screen-reader", "magnification"],
    badExample: `<h2>Sub section</h2>\n<p>Content</p>`,
    goodExample: `<h1>Main Page Title</h1>\n<h2>Sub section</h2>`,
    whyFixWorks:
      "Including an <h1> provides a clear top-level landmark in screen reader heading outlines.",
    howToVerify: [
      "Check the Accessibility Tree for an h1 node.",
      "Verify the h1 accurately summarizes the page topic.",
    ],
    inspector: "tree",
    resources: [
      {
        title: "Deque University: Page should contain a level-one heading",
        url: "https://dequeuniversity.com/rules/axe/4.4/page-has-heading-one",
      },
      {
        title: "W3C WAI: Headings Tutorial",
        url: "https://www.w3.org/WAI/tutorials/page-structure/headings/",
      },
    ],
  },
  {
    ruleId: "aria-input-field-name",
    whatIsHappening:
      "An element with an ARIA input role (e.g. combobox, searchbox, spinbutton, textbox) does not have an accessible name.",
    whyItMatters:
      "Screen readers announce the input control without explaining what value or information is requested.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<div role="textbox" contenteditable="true"></div>`,
    goodExample: `<div role="textbox" contenteditable="true" aria-label="Comment text"></div>`,
    whyFixWorks:
      "aria-label or aria-labelledby assigns a direct accessible name to custom ARIA input widgets.",
    howToVerify: [
      "Inspect Accessible Name panel to verify the computed name string.",
      "Verify speech recognition can target the field by name.",
    ],
    inspector: "accname",
    resources: [
      {
        title:
          "Deque University: ARIA input fields must have an accessible name",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-input-field-name",
      },
      {
        title: "W3C WAI: WAI-ARIA 1.2 textbox role",
        url: "https://www.w3.org/TR/wai-aria-1.2/#textbox",
      },
    ],
  },
  {
    ruleId: "aria-toggle-field-name",
    whatIsHappening:
      "An ARIA toggle element (such as role='checkbox', role='switch', or role='radio') does not have an accessible name.",
    whyItMatters:
      "Users hear that a checkbox or switch exists, but have no way of knowing what option they are turning on or off.",
    whoIsAffected: ["screen-reader", "voice-control"],
    badExample: `<div role="switch" aria-checked="false"></div>`,
    goodExample: `<div role="switch" aria-checked="false" aria-label="Enable notifications"></div>`,
    whyFixWorks:
      "aria-label provides the required accessible name for custom switch and toggle controls.",
    howToVerify: [
      "Open the Accessible Name inspector on the toggle node.",
      "Check Announcement tab for simulated screen reader output.",
    ],
    inspector: "accname",
    resources: [
      {
        title:
          "Deque University: ARIA toggle fields must have an accessible name",
        url: "https://dequeuniversity.com/rules/axe/4.4/aria-toggle-field-name",
      },
      {
        title: "W3C WAI: ARIA Authoring Practices - Switch Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/",
      },
    ],
  },
];

const KNOWLEDGE_MAP = new Map<string, RuleKnowledge>(
  RULE_KNOWLEDGE.map((k) => [k.ruleId, k])
);

export function getRuleKnowledge(ruleId: string): RuleKnowledge | undefined {
  return KNOWLEDGE_MAP.get(ruleId);
}

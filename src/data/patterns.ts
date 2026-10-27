import type { PatternItem } from "@/types/pattern";

export const PATTERNS: readonly PatternItem[] = [
  {
    slug: "button-vs-div",
    title: "Button vs. Div",
    summary:
      "A styled <div> with an onclick handler versus a native HTML <button> element.",
    wcagCriteria: ["4.1.2", "2.1.1", "2.4.7"],
    badCode: `<div class="fake-btn" onclick="saveDocument()">
  Save Snippet
</div>`,
    goodCode: `<button type="button" class="btn" onclick="saveDocument()">
  Save Snippet
</button>`,
    badExplanation: {
      whatBreaks:
        "The element cannot receive keyboard focus with the Tab key, does not trigger on Enter or Space, and is announced to assistive technology as generic static text.",
      forWhom:
        "Keyboard-only navigators, switch device users, and screen reader users cannot discover, focus, or activate this action.",
      technicalReason:
        "HTML <div> elements have a generic role with no keyboard event synthesis or default tabindex. While a mouse fires click, keyboard focus and standard Space/Enter keyboard activation are absent.",
    },
    goodExplanation: {
      howItFixes:
        "Native <button> has implicit role='button', is keyboard-focusable by default in tab order, supports Space and Enter keys out of the box, and exposes its accessible name clearly to the accessibility tree.",
      keyAttributes: [
        "type='button' prevents accidental form submission",
        "Implicit role='button'",
        "Native keyboard focusability (tabindex 0)",
        "Synthetic click dispatched on Space and Enter",
      ],
    },
  },
  {
    slug: "link-vs-button",
    title: "Link vs. Button",
    summary:
      "Using an anchor tag with href='#' for an in-page action versus a native button.",
    wcagCriteria: ["4.1.2", "2.1.1"],
    badCode: `<a href="#" onclick="deleteProject(); return false;">
  Delete Project
</a>`,
    goodCode: `<button type="button" class="btn-danger" onclick="deleteProject()">
  Delete Project
</button>`,
    badExplanation: {
      whatBreaks:
        "The link announces as 'link, Delete Project', misleading users who expect a URL navigation. Links do not activate on the Space key, and href='#' alters the URL hash or scrolls to the top when JavaScript fails.",
      forWhom:
        "Screen reader users navigating via 'Links list' shortcuts and keyboard users who naturally press Space to trigger actions.",
      technicalReason:
        "Links (role='link') communicate navigation to a new document or URI, activated only with Enter. Buttons (role='button') communicate state modification or in-page actions, activated with both Space and Enter.",
    },
    goodExplanation: {
      howItFixes:
        "Using a button accurately communicates that an action will occur rather than navigation, enables standard keyboard interactions, and avoids unwanted URL hash mutations.",
      keyAttributes: [
        "role='button' matches the user's mental model",
        "Space and Enter key activation supported",
        "No href='#' hash navigation or scroll reset",
      ],
    },
  },
  {
    slug: "form-field-error",
    title: "Form Field with Error",
    summary:
      "An unassociated error message with placeholder-only labeling versus programmatic association.",
    wcagCriteria: ["1.3.1", "3.3.1", "3.3.2", "4.1.2"],
    badCode: `<div class="field">
  <input type="email" placeholder="Work email" />
  <span class="error-text">Please enter a valid company email.</span>
</div>`,
    goodCode: `<div class="field">
  <label for="work-email">Work Email</label>
  <input
    id="work-email"
    type="email"
    aria-describedby="work-email-error"
    aria-invalid="true"
    required
  />
  <p id="work-email-error" class="error-msg" role="alert">
    Please enter a valid company email.
  </p>
</div>`,
    badExplanation: {
      whatBreaks:
        "Placeholder text disappears upon typing and has low contrast. When validation fails, screen readers moving to the input have no programmatic link to the error message underneath.",
      forWhom:
        "Blind screen reader users, users with low vision, and people with cognitive fatigue who cannot determine why the submission was rejected.",
      technicalReason:
        "Without <label for> or aria-describedby, the error text is an unlinked sibling element. The screen reader only reads 'edit text, blank' with no indication that an error occurred or what the fix is.",
    },
    goodExplanation: {
      howItFixes:
        "A persistent <label> provides an immutable accessible name. aria-describedby connects the input to the exact error explanation, and aria-invalid='true' alerts the user immediately upon focusing the field.",
      keyAttributes: [
        "<label for='...'> guarantees an accessible name",
        "aria-invalid='true' flags the erroneous state",
        "aria-describedby announces the error text when field is focused",
        "role='alert' announces the error dynamically when injected",
      ],
    },
  },
  {
    slug: "modal-dialog",
    title: "Modal Dialog",
    summary:
      "A floating <div> overlay with no ARIA semantics versus an accessible dialog container with title reference.",
    wcagCriteria: ["1.3.1", "2.1.2", "4.1.2"],
    badCode: `<div class="overlay">
  <div class="popup">
    <div class="popup-title">Confirm Deletion</div>
    <p>Are you sure you want to permanently delete this branch?</p>
    <div class="actions">
      <div class="btn" onclick="closePopup()">Cancel</div>
      <div class="btn danger" onclick="confirmDelete()">Delete</div>
    </div>
  </div>
</div>`,
    goodCode: `<div class="backdrop" aria-hidden="true"></div>
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-heading"
  aria-describedby="dialog-desc"
  class="modal"
>
  <h2 id="dialog-heading">Confirm Deletion</h2>
  <p id="dialog-desc">
    Are you sure you want to permanently delete this branch?
  </p>
  <div class="actions">
    <button type="button" class="btn-secondary" onclick="closeModal()">
      Cancel
    </button>
    <button type="button" class="btn-danger" onclick="confirmDelete()">
      Delete
    </button>
  </div>
</div>`,
    badExplanation: {
      whatBreaks:
        "Assistive technology users outside the popup are not informed that a modal has opened, keyboard focus can escape behind the overlay into the inactive page, and the dialog has no accessible name.",
      forWhom:
        "Screen reader users who lose context and keyboard navigators whose focus gets trapped or lost in background content.",
      technicalReason:
        "A <div> has no modal landmark or dialog role. Without aria-modal='true' and aria-labelledby, screen readers treat the popup as continuous in-page content rather than a contained modal context.",
    },
    goodExplanation: {
      howItFixes:
        "role='dialog' establishes the container role. aria-modal='true' tells assistive technologies to isolate focus within the dialog, and aria-labelledby provides immediate context by referencing the heading.",
      keyAttributes: [
        "role='dialog' identifies the modal boundary",
        "aria-modal='true' signals background content is inert",
        "aria-labelledby links the dialog's accessible name to the heading",
        "aria-describedby gives the supporting explanation",
      ],
    },
  },
  {
    slug: "tabs-widget",
    title: "Tabs Widget",
    summary:
      "A list of styled anchor tags versus the standardized WAI-ARIA tablist/tab/tabpanel pattern.",
    wcagCriteria: ["1.3.1", "2.1.1", "4.1.2"],
    badCode: `<ul class="tab-strip">
  <li class="active"><a href="#tab1">Overview</a></li>
  <li><a href="#tab2">Permissions</a></li>
  <li><a href="#tab3">Audit Log</a></li>
</ul>
<div id="tab1" class="tab-content">Overview details here...</div>`,
    goodCode: `<div role="tablist" aria-label="Project Settings">
  <button
    role="tab"
    id="tab-overview"
    aria-selected="true"
    aria-controls="panel-overview"
    tabindex="0"
  >
    Overview
  </button>
  <button
    role="tab"
    id="tab-permissions"
    aria-selected="false"
    aria-controls="panel-permissions"
    tabindex="-1"
  >
    Permissions
  </button>
  <button
    role="tab"
    id="tab-audit"
    aria-selected="false"
    aria-controls="panel-audit"
    tabindex="-1"
  >
    Audit Log
  </button>
</div>

<div
  role="tabpanel"
  id="panel-overview"
  aria-labelledby="tab-overview"
  tabindex="0"
>
  Overview details here...
</div>`,
    badExplanation: {
      whatBreaks:
        "Screen readers announce 'list with 3 items, link, Overview', giving no indication that clicking toggles panels without navigation. Arrow key navigation between tabs is missing.",
      forWhom:
        "Anyone relying on standard keyboard conventions (Arrow Left/Right to cycle tabs, Tab to enter the active panel) and screen reader users expecting tab state feedback.",
      technicalReason:
        "WAI-ARIA defines a roving tabindex pattern for tabs: only the active tab is in the primary tab sequence (tabindex=0); inactive tabs have tabindex=-1 and receive focus via Left/Right arrows.",
    },
    goodExplanation: {
      howItFixes:
        "role='tablist', role='tab', and role='tabpanel' create a cohesive component structure. aria-selected reflects active state, aria-controls points to the controlled panel, and aria-labelledby links back to the tab header.",
      keyAttributes: [
        "role='tablist' with aria-label groups the tabs",
        "role='tab' with aria-selected indicates selection state",
        "aria-controls binds each tab to its corresponding tabpanel",
        "role='tabpanel' with tabindex='0' allows panel scrolling via keyboard",
      ],
    },
  },
];

export const PATTERNS_BY_SLUG = new Map<string, PatternItem>(
  PATTERNS.map((pattern) => [pattern.slug, pattern])
);

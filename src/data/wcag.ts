import type { WcagCriterion } from "@/types/wcag";

export const WCAG_CRITERIA: readonly WcagCriterion[] = [
  {
    id: "1.1.1",
    name: "Non-text Content",
    level: "A",
    principle: "Perceivable",
    summary:
      "All non-text content presented to the user has a text alternative that serves the equivalent purpose.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#non-text-content",
  },
  {
    id: "1.3.1",
    name: "Info and Relationships",
    level: "A",
    principle: "Perceivable",
    summary:
      "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
  },
  {
    id: "1.4.3",
    name: "Contrast (Minimum)",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Visual presentation of text and images of text has a contrast ratio of at least 4.5:1 (3:1 for large text).",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum",
  },
  {
    id: "1.4.6",
    name: "Contrast (Enhanced)",
    level: "AAA",
    principle: "Perceivable",
    summary:
      "Visual presentation of text and images of text has a contrast ratio of at least 7:1 (4.5:1 for large text).",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#contrast-enhanced",
  },
  {
    id: "1.4.11",
    name: "Non-text Contrast",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Visual presentation of user interface components and graphical objects has a contrast ratio of at least 3:1 against adjacent colors.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#non-text-contrast",
  },
  {
    id: "2.1.1",
    name: "Keyboard",
    level: "A",
    principle: "Operable",
    summary:
      "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#keyboard",
  },
  {
    id: "2.1.2",
    name: "No Keyboard Trap",
    level: "A",
    principle: "Operable",
    summary:
      "If keyboard focus can be moved to a component, focus can be moved away from that component using only a keyboard interface.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#no-keyboard-trap",
  },
  {
    id: "2.4.3",
    name: "Focus Order",
    level: "A",
    principle: "Operable",
    summary:
      "If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#focus-order",
  },
  {
    id: "2.4.7",
    name: "Focus Visible",
    level: "AA",
    principle: "Operable",
    summary:
      "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#focus-visible",
  },
  {
    id: "2.4.11",
    name: "Focus Not Obscured (Minimum)",
    level: "AA",
    principle: "Operable",
    summary:
      "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#focus-not-obscured-minimum",
  },
  {
    id: "2.5.3",
    name: "Label in Name",
    level: "A",
    principle: "Operable",
    summary:
      "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#label-in-name",
  },
  {
    id: "2.5.8",
    name: "Target Size (Minimum)",
    level: "AA",
    principle: "Operable",
    summary:
      "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except where an inline target or user-agent default applies.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum",
  },
  {
    id: "3.3.1",
    name: "Error Identification",
    level: "A",
    principle: "Understandable",
    summary:
      "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#error-identification",
  },
  {
    id: "3.3.2",
    name: "Labels or Instructions",
    level: "A",
    principle: "Understandable",
    summary:
      "Labels or instructions are provided when content requires user input.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#labels-or-instructions",
  },
  {
    id: "4.1.2",
    name: "Name, Role, Value",
    level: "A",
    principle: "Robust",
    summary:
      "For all user interface components, the name and role can be programmatically determined, states and properties can be set, and notifications of changes are available to user agents.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
  },
  {
    id: "4.1.3",
    name: "Status Messages",
    level: "AA",
    principle: "Robust",
    summary:
      "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user without receiving focus.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#status-messages",
  },
];

export const WCAG_CRITERIA_BY_ID = new Map<string, WcagCriterion>(
  WCAG_CRITERIA.map((criterion) => [criterion.id, criterion])
);

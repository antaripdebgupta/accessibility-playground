import type { WcagCriterion } from "@/types/wcag";

export const WCAG_CRITERIA: readonly WcagCriterion[] = [
  // Principle 1: Perceivable
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
    id: "1.2.1",
    name: "Audio-only and Video-only (Prerecorded)",
    level: "A",
    principle: "Perceivable",
    summary:
      "Alternatives for prerecorded audio-only and video-only media are provided.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#audio-only-and-video-only-prerecorded",
  },
  {
    id: "1.2.2",
    name: "Captions (Prerecorded)",
    level: "A",
    principle: "Perceivable",
    summary:
      "Captions are provided for all prerecorded audio content in synchronized media.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#captions-prerecorded",
  },
  {
    id: "1.2.3",
    name: "Audio Description or Media Alternative (Prerecorded)",
    level: "A",
    principle: "Perceivable",
    summary:
      "An alternative for time-based media or audio description is provided for prerecorded video.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#audio-description-or-media-alternative-prerecorded",
  },
  {
    id: "1.2.4",
    name: "Captions (Live)",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Captions are provided for all live audio content in synchronized media.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#captions-live",
  },
  {
    id: "1.2.5",
    name: "Audio Description (Prerecorded)",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Audio description is provided for all prerecorded video content in synchronized media.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#audio-description-prerecorded",
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
    id: "1.3.2",
    name: "Meaningful Sequence",
    level: "A",
    principle: "Perceivable",
    summary:
      "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#meaningful-sequence",
  },
  {
    id: "1.3.3",
    name: "Sensory Characteristics",
    level: "A",
    principle: "Perceivable",
    summary:
      "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#sensory-characteristics",
  },
  {
    id: "1.3.4",
    name: "Orientation",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Content does not restrict its view and operation to a single display orientation, unless a specific orientation is essential.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#orientation",
  },
  {
    id: "1.3.5",
    name: "Identify Input Purpose",
    level: "AA",
    principle: "Perceivable",
    summary:
      "The purpose of each input field collecting personal information can be programmatically determined.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#identify-input-purpose",
  },
  {
    id: "1.4.1",
    name: "Use of Color",
    level: "A",
    principle: "Perceivable",
    summary:
      "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#use-of-color",
  },
  {
    id: "1.4.2",
    name: "Audio Control",
    level: "A",
    principle: "Perceivable",
    summary:
      "If audio plays automatically for more than 3 seconds, a mechanism is available to pause or stop it, or to control volume independently.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#audio-control",
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
    id: "1.4.4",
    name: "Resize Text",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#resize-text",
  },
  {
    id: "1.4.5",
    name: "Images of Text",
    level: "AA",
    principle: "Perceivable",
    summary:
      "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#images-of-text",
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
    id: "1.4.10",
    name: "Reflow",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#reflow",
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
    id: "1.4.12",
    name: "Text Spacing",
    level: "AA",
    principle: "Perceivable",
    summary:
      "No loss of content or functionality occurs when users override line height, paragraph spacing, letter spacing, or word spacing.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#text-spacing",
  },
  {
    id: "1.4.13",
    name: "Content on Hover or Focus",
    level: "AA",
    principle: "Perceivable",
    summary:
      "Where pointer hover or keyboard focus triggers additional content to become visible, that content is dismissible, hoverable, and persistent.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#content-on-hover-or-focus",
  },

  // Principle 2: Operable
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
    id: "2.1.4",
    name: "Character Key Shortcuts",
    level: "A",
    principle: "Operable",
    summary:
      "If a keyboard shortcut is implemented using only letter, punctuation, number, or symbol characters, it can be turned off, remapped, or active only on focus.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#character-key-shortcuts",
  },
  {
    id: "2.2.1",
    name: "Timing Adjustable",
    level: "A",
    principle: "Operable",
    summary:
      "Users are given enough time to read and use content, with mechanisms to turn off, adjust, or extend time limits.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#timing-adjustable",
  },
  {
    id: "2.2.2",
    name: "Pause, Stop, Hide",
    level: "A",
    principle: "Operable",
    summary:
      "For moving, blinking, scrolling, or auto-updating information, users can pause, stop, or hide it.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#pause-stop-hide",
  },
  {
    id: "2.3.1",
    name: "Three Flashes or Below Threshold",
    level: "A",
    principle: "Operable",
    summary:
      "Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below thresholds.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#three-flashes-or-below-threshold",
  },
  {
    id: "2.4.1",
    name: "Bypass Blocks",
    level: "A",
    principle: "Operable",
    summary:
      "A mechanism is available to bypass blocks of content that are repeated on multiple web pages.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#bypass-blocks",
  },
  {
    id: "2.4.2",
    name: "Page Titled",
    level: "A",
    principle: "Operable",
    summary: "Web pages have titles that describe topic or purpose.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#page-titled",
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
    id: "2.4.4",
    name: "Link Purpose (In Context)",
    level: "A",
    principle: "Operable",
    summary:
      "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#link-purpose-in-context",
  },
  {
    id: "2.4.5",
    name: "Multiple Ways",
    level: "AA",
    principle: "Operable",
    summary:
      "More than one way is available to locate a web page within a set of web pages except where the page is the result of, or a step in, a process.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#multiple-ways",
  },
  {
    id: "2.4.6",
    name: "Headings and Labels",
    level: "AA",
    principle: "Operable",
    summary: "Headings and labels describe topic or purpose.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#headings-and-labels",
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
    id: "2.5.1",
    name: "Pointer Gestures",
    level: "A",
    principle: "Operable",
    summary:
      "All functionality that uses multipoint or path-based gestures can be operated with a single pointer without a path-based gesture, unless essential.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#pointer-gestures",
  },
  {
    id: "2.5.2",
    name: "Pointer Cancellation",
    level: "A",
    principle: "Operable",
    summary:
      "For functionality that can be operated using a single pointer, at least one of up-event, abort/undo, or up-reversal is true.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#pointer-cancellation",
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
    id: "2.5.4",
    name: "Motion Actuation",
    level: "A",
    principle: "Operable",
    summary:
      "Functionality that can be operated by device motion can also be operated by user interface components, and responding to motion can be disabled.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#motion-actuation",
  },
  {
    id: "2.5.7",
    name: "Dragging Movements",
    level: "AA",
    principle: "Operable",
    summary:
      "All functionality that uses a dragging movement can be achieved by a single pointer without dragging, unless dragging is essential.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#dragging-movements",
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

  // Principle 3: Understandable
  {
    id: "3.1.1",
    name: "Language of Page",
    level: "A",
    principle: "Understandable",
    summary:
      "The default human language of each web page can be programmatically determined.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#language-of-page",
  },
  {
    id: "3.1.2",
    name: "Language of Parts",
    level: "AA",
    principle: "Understandable",
    summary:
      "The human language of each passage or phrase in the content can be programmatically determined, except for proper names, technical terms, and idioms.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#language-of-parts",
  },
  {
    id: "3.2.1",
    name: "On Focus",
    level: "A",
    principle: "Understandable",
    summary:
      "When any user interface component receives focus, it does not initiate a change of context.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#on-focus",
  },
  {
    id: "3.2.2",
    name: "On Input",
    level: "A",
    principle: "Understandable",
    summary:
      "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#on-input",
  },
  {
    id: "3.2.3",
    name: "Consistent Navigation",
    level: "AA",
    principle: "Understandable",
    summary:
      "Navigational mechanisms that are repeated on multiple web pages occur in the same relative order each time they are presented.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#consistent-navigation",
  },
  {
    id: "3.2.4",
    name: "Consistent Identification",
    level: "AA",
    principle: "Understandable",
    summary:
      "Components that have the same functionality within a set of web pages are identified consistently.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#consistent-identification",
  },
  {
    id: "3.2.6",
    name: "Consistent Help",
    level: "A",
    principle: "Understandable",
    summary:
      "If a web page provides access to help, it is in a consistent location across the set of pages.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#consistent-help",
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
    id: "3.3.3",
    name: "Error Suggestion",
    level: "AA",
    principle: "Understandable",
    summary:
      "If an input error is automatically detected and suggestions for correction are known, the suggestions are provided to the user.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#error-suggestion",
  },
  {
    id: "3.3.4",
    name: "Error Prevention (Legal, Financial, Data)",
    level: "AA",
    principle: "Understandable",
    summary:
      "For web pages that cause legal commitments or financial transactions, submissions are reversible, checked, or confirmed.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#error-prevention-legal-financial-data",
  },
  {
    id: "3.3.7",
    name: "Redundant Entry",
    level: "A",
    principle: "Understandable",
    summary:
      "Information previously entered by or provided to the user that is required to be entered again is either auto-populated or available for selection.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#redundant-entry",
  },
  {
    id: "3.3.8",
    name: "Accessible Authentication (Minimum)",
    level: "AA",
    principle: "Understandable",
    summary:
      "A cognitive function test (such as remembering a password or solving a puzzle) is not required for any step in an authentication process unless an alternative or assistance is provided.",
    url: "https://www.w3.org/WAI/WCAG22/quickref/#accessible-authentication-minimum",
  },

  // Principle 4: Robust
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

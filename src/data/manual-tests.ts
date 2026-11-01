/**
 * Manual testing checklists and guidance data.
 * Focuses on human evaluation that automated scanners cannot verify.
 */

export type ManualTestCategory = "keyboard" | "screen-reader" | "visual";

export type ManualTestStatus = "not-tested" | "passed" | "failed" | "not-applicable";

export interface ManualTestItem {
  readonly id: string;
  readonly category: ManualTestCategory;
  readonly title: string;
  readonly steps: readonly string[];
  readonly expectedResult: string;
  readonly linkedSc: {
    readonly id: string;
    readonly name: string;
    readonly level: "A" | "AA" | "AAA";
    readonly url: string;
  };
  readonly whatAutomationCantTellYou: string;
}

export interface ManualTestRecord {
  readonly testId: string;
  readonly status: ManualTestStatus;
  readonly note?: string;
  readonly updatedAt: string;
}

export const MANUAL_TESTS: readonly ManualTestItem[] = [
  // ─── KEYBOARD TESTS ──────────────────────────────────────────────────────────
  {
    id: "kb-tab-navigation",
    category: "keyboard",
    title: "Tab and Shift+Tab Navigation",
    steps: [
      "Click into the document before the first interactive element.",
      "Press Tab repeatedly to navigate forward through all interactive controls.",
      "Press Shift+Tab repeatedly to navigate backward.",
    ],
    expectedResult:
      "All interactive controls (links, buttons, form inputs, dialogs) can be reached in a logical and expected order. No non-interactive text receives focus.",
    linkedSc: {
      id: "2.1.1",
      name: "Keyboard",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
    },
    whatAutomationCantTellYou:
      "Scanners can check if an element is technically focusable, but cannot know if the tab order makes logical human sense for completing a workflow.",
  },
  {
    id: "kb-action-activation",
    category: "keyboard",
    title: "Enter and Space Key Activation",
    steps: [
      "Tab to each button and press Enter or Space to activate it.",
      "Tab to each link and press Enter to follow it.",
      "Tab to custom widgets (accordions, disclosure toggles) and test Space/Enter.",
    ],
    expectedResult:
      "Standard buttons respond to both Space and Enter. Links activate on Enter. Custom widgets behave predictably according to WAI-ARIA Authoring Practices.",
    linkedSc: {
      id: "2.1.1",
      name: "Keyboard",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
    },
    whatAutomationCantTellYou:
      "Automated tools only inspect attribute markup; they cannot trigger runtime click or keydown handlers to confirm actions actually fire.",
  },
  {
    id: "kb-escape-dismissal",
    category: "keyboard",
    title: "Escape Key Dismissal",
    steps: [
      "Open any modal dialog, dropdown menu, popover, or tooltip.",
      "Press the Escape (Esc) key without clicking anywhere else.",
    ],
    expectedResult:
      "The overlay closes immediately upon pressing Escape, and keyboard focus returns to the triggering button or trigger control.",
    linkedSc: {
      id: "1.4.13",
      name: "Content on Hover or Focus",
      level: "AA",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html",
    },
    whatAutomationCantTellYou:
      "Overlay dismissal on Esc requires active runtime event handling that static scanners cannot test.",
  },
  {
    id: "kb-arrow-navigation",
    category: "keyboard",
    title: "Composite Widget Arrow Navigation",
    steps: [
      "Focus composite components (tablists, radio groups, menu bars, listboxes).",
      "Use Left/Right or Up/Down arrow keys to move between items.",
      "Confirm roving tabindex or aria-activedescendant properly tracks selection.",
    ],
    expectedResult:
      "Arrow keys navigate items inside the composite widget. Pressing Tab moves out of the entire widget to the next control.",
    linkedSc: {
      id: "2.1.1",
      name: "Keyboard",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
    },
    whatAutomationCantTellYou:
      "Whether internal arrow key navigation matches W3C APG keyboard patterns cannot be verified by DOM inspection alone.",
  },
  {
    id: "kb-focus-visible",
    category: "keyboard",
    title: "Visible Focus Indicator",
    steps: [
      "Tab through all interactive controls on the page.",
      "Observe the outline or visual indicator around each focused element.",
    ],
    expectedResult:
      "Every focused element displays a prominent, high-contrast visual indicator (ring, border, or background change) that clearly distinguishes it from unfocused elements.",
    linkedSc: {
      id: "2.4.7",
      name: "Focus Visible",
      level: "AA",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
    },
    whatAutomationCantTellYou:
      "Scanners only detect explicit 'outline: none' or 'outline: 0'. They cannot verify whether a custom focus ring is visually noticeable against the background.",
  },
  {
    id: "kb-focus-restoration",
    category: "keyboard",
    title: "Focus Restoration on Close",
    steps: [
      "Activate a button that opens a dialog or slideout panel.",
      "Close the dialog (using Close button or Escape key).",
      "Check where focus lands after the dialog disappears.",
    ],
    expectedResult:
      "Keyboard focus returns to the original button that opened the dialog, rather than dropping back to the start of the <body>.",
    linkedSc: {
      id: "2.4.3",
      name: "Focus Order",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
    },
    whatAutomationCantTellYou:
      "Focus restoration is purely runtime state management that scanners cannot observe.",
  },
  {
    id: "kb-no-keyboard-trap",
    category: "keyboard",
    title: "No Keyboard Trap",
    steps: [
      "Tab into every section, widget, iframe, and form.",
      "Ensure you can tab out in both directions without using a mouse.",
    ],
    expectedResult:
      "You can always move focus away using standard keyboard keys (Tab, Shift+Tab, or Esc). If a custom key is required, instructions are provided.",
    linkedSc: {
      id: "2.1.2",
      name: "No Keyboard Trap",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html",
    },
    whatAutomationCantTellYou:
      "Scanners cannot simulate continuous keyboard navigation or detect when a script intercepts and swallows keydown events.",
  },

  // ─── SCREEN READER TESTS ─────────────────────────────────────────────────────
  {
    id: "sr-nvda-announcement",
    category: "screen-reader",
    title: "NVDA Announcement (Windows)",
    steps: [
      "Start NVDA (Ctrl+Alt+N).",
      "Use NVDA's Browse Mode (Up/Down arrow keys) to read through content linearly.",
      "Use Single-Letter Navigation: H for Headings, B for Buttons, K for Links, F for Forms.",
    ],
    expectedResult:
      "NVDA accurately announces heading levels, button accessible names and roles, and link destinations. No cryptic markup is spoken.",
    linkedSc: {
      id: "4.1.2",
      name: "Name, Role, Value",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
    },
    whatAutomationCantTellYou:
      "Screen readers differ in pronunciation, punctuation handling, and how they handle dynamic content updates versus static attributes.",
  },
  {
    id: "sr-voiceover-macos",
    category: "screen-reader",
    title: "VoiceOver Announcement (macOS / iOS)",
    steps: [
      "Enable VoiceOver (Cmd+F5 on Mac, or triple-click side button on iOS).",
      "Navigate using VO keys (Control+Option+Left/Right Arrow) or rotor (VO+U).",
      "Listen to interactive element names, traits, and descriptions.",
    ],
    expectedResult:
      "VoiceOver reads the element name followed by its trait (e.g. 'Submit, button'). State changes (expanded/collapsed, selected) are spoken immediately.",
    linkedSc: {
      id: "4.1.2",
      name: "Name, Role, Value",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
    },
    whatAutomationCantTellYou:
      "VoiceOver rotor extraction depends on platform accessibility APIs that can differ from browser DOM attribute parsing.",
  },
  {
    id: "sr-talkback-android",
    category: "screen-reader",
    title: "TalkBack Gesture & Reading (Android)",
    steps: [
      "Enable TalkBack in Android Accessibility Settings.",
      "Swipe right to advance through elements sequentially.",
      "Double tap to activate selected controls.",
    ],
    expectedResult:
      "All controls are selectable with touch exploration and swipe gestures, with clear auditory feedback on element purpose and state.",
    linkedSc: {
      id: "4.1.2",
      name: "Name, Role, Value",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
    },
    whatAutomationCantTellYou:
      "Touch target accessibility and mobile screen reader gesture interaction require real mobile device or emulator testing.",
  },

  // ─── VISUAL TESTS ────────────────────────────────────────────────────────────
  {
    id: "vis-zoom-reflow",
    category: "visual",
    title: "200% & 400% Zoom and Reflow",
    steps: [
      "In browser settings, zoom the viewport to 200%, then to 400% (or resize preview to 320px).",
      "Inspect the layout for text truncation, overlapping blocks, or horizontal scrolling.",
    ],
    expectedResult:
      "Content reflows into a single column at 400% (or 320px width). No two-dimensional scrolling is required to read text or operate controls.",
    linkedSc: {
      id: "1.4.10",
      name: "Reflow",
      level: "AA",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
    },
    whatAutomationCantTellYou:
      "Automated CSS checkers cannot tell if text wraps properly or gets clipped behind 'overflow: hidden' when container dimensions scale.",
  },
  {
    id: "vis-text-spacing",
    category: "visual",
    title: "Text Spacing Adaptation",
    steps: [
      "Apply the standard WCAG text spacing bookmarklet or styles:",
      "Line height: 1.5 times font size; paragraph spacing: 2 times font size; letter spacing: 0.12 times font size; word spacing: 0.16 times font size.",
      "Check that text containers adapt without truncating words.",
    ],
    expectedResult:
      "No content or functionality is lost or cut off when text spacing is expanded.",
    linkedSc: {
      id: "1.4.12",
      name: "Text Spacing",
      level: "AA",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html",
    },
    whatAutomationCantTellYou:
      "Fixed heights and rigid container clamps can cause text overlap under customized user stylesheets.",
  },
  {
    id: "vis-forced-colors",
    category: "visual",
    title: "Windows High Contrast / Forced Colors Mode",
    steps: [
      "Enable High Contrast / Contrast Themes in Windows (or toggle Forced Colors simulator in the toolbar).",
      "Verify that icons, form borders, buttons, and state indicators remain visible.",
    ],
    expectedResult:
      "All essential borders, icons, and focus rings remain distinct using system palette colors (Canvas, CanvasText, Highlight, ButtonText).",
    linkedSc: {
      id: "1.4.1",
      name: "Use of Color",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
    },
    whatAutomationCantTellYou:
      "CSS background images and box-shadows are stripped in Forced Colors mode. Only visual inspection reveals missing visual boundaries.",
  },
  {
    id: "vis-reduced-motion",
    category: "visual",
    title: "Reduced Motion Preference",
    steps: [
      "Turn on 'prefers-reduced-motion: reduce' in system settings (or toggle in workbench preview).",
      "Interact with carousel, animated transitions, page reveals, and modal popups.",
    ],
    expectedResult:
      "Large-scale movements and looping animations cease or convert to gentle opacity fades. Essential information is not lost.",
    linkedSc: {
      id: "2.3.3",
      name: "Animation from Interactions",
      level: "AAA",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html",
    },
    whatAutomationCantTellYou:
      "Static checkers cannot verify whether animation duration or motion vestibular impact is neutralized when the user requests reduced motion.",
  },
  {
    id: "vis-colour-only",
    category: "visual",
    title: "Information Not Conveyed by Color Alone",
    steps: [
      "View the page in grayscale (monochrome display filter).",
      "Check error messages, active states, charts, and inline text links.",
    ],
    expectedResult:
      "Links have underlines or non-color cues. Errors include icons or text labels. States are identifiable without distinguishing hues.",
    linkedSc: {
      id: "1.4.1",
      name: "Use of Color",
      level: "A",
      url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
    },
    whatAutomationCantTellYou:
      "Scanners can check contrast ratio between two hex values, but cannot understand if red vs green is the sole mechanism denoting pass/fail.",
  },
];

import { encodeSnippet } from "@/lib/snippet-share";

export interface LearnTopicLink {
  readonly title: string;
  readonly url: string;
  readonly source: "W3C WAI" | "WAI-ARIA APG" | "MDN";
}

export interface LearnTopicExample {
  readonly html: string;
  readonly css?: string;
  readonly description: string;
}

export interface LearnTopic {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly plainExplanation: string;
  readonly technicalExplanation: string;
  readonly whyItMatters: string;
  readonly wcagCriteria: readonly string[];
  readonly badExample: LearnTopicExample;
  readonly goodExample: LearnTopicExample;
  readonly commonMistakes: readonly string[];
  readonly browserBehaviour: string;
  readonly manualTest: readonly string[];
  readonly links: readonly LearnTopicLink[];
  readonly relatedRuleIds: readonly string[];
  readonly challengeId?: string;
}

export const LEARN_TOPICS: readonly LearnTopic[] = [
  {
    slug: "semantic-html",
    title: "Semantic HTML",
    summary:
      "Using the native HTML tags that reflect the structure and meaning of your content rather than generic containers.",
    plainExplanation:
      "Just as a book uses headings, paragraphs, and chapters to organize information, websites use semantic tags so everyone — and every browser or assistive device — understands what each piece of text does.",
    technicalExplanation:
      "Standard HTML tags like <main>, <nav>, <article>, <button>, and <header> come with built-in accessibility semantics (roles, states, and keyboard event handling) populated automatically in the browser's Accessibility Tree without requiring custom JavaScript or ARIA.",
    whyItMatters:
      "Screen readers rely on landmarks to let users jump directly to navigation or main content. Keyboard users rely on native interactive elements for focusability and default keystroke activation (Enter/Space).",
    wcagCriteria: ["1.3.1", "4.1.2"],
    badExample: {
      html: `<div class="nav-bar">
  <div class="nav-link" onclick="location.href='/home'">Home</div>
  <div class="nav-link" onclick="location.href='/docs'">Docs</div>
</div>
<div class="content-body">
  <div class="hero-title">Welcome to the Platform</div>
  <div class="hero-desc">Discover our comprehensive suite of accessibility tools.</div>
</div>`,
      css: `.nav-bar { display: flex; gap: 12px; padding: 12px; background: #f3f4f6; }
.nav-link { cursor: pointer; color: #2563eb; font-weight: 500; }
.hero-title { font-size: 1.5rem; font-weight: bold; margin: 16px 0 8px; }`,
      description:
        "Uses generic <div> tags with click handlers. Lacks landmark navigation, keyboard accessibility, and heading structure.",
    },
    goodExample: {
      html: `<header>
  <nav aria-label="Main navigation">
    <ul class="nav-list">
      <li><a href="/home">Home</a></li>
      <li><a href="/docs">Docs</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1>Welcome to the Platform</h1>
  <p>Discover our comprehensive suite of accessibility tools.</p>
</main>`,
      css: `.nav-list { display: flex; gap: 12px; list-style: none; padding: 12px; margin: 0; background: #f3f4f6; }
.nav-list a { color: #2563eb; text-decoration: none; font-weight: 500; }
.nav-list a:hover { text-decoration: underline; }
h1 { font-size: 1.5rem; margin: 16px 0 8px; }`,
      description:
        "Employs <header>, <nav>, <main>, <h1>, and <a> elements providing clear landmarks and standard keyboard operability.",
    },
    commonMistakes: [
      "Replacing <button> or <a> with a <div> or <span> styled to look clickable",
      "Using multiple <h1> tags per page or skipping heading levels (e.g. <h1> directly to <h3>)",
      "Nesting interactive elements inside other interactive elements (e.g. <button> inside <a>)",
    ],
    browserBehaviour:
      "Browsers map native tags directly to accessibility API objects (AXNode, AccessibleObject) with appropriate roles, states, and default keyboard focus management without additional script overhead.",
    manualTest: [
      "Press Tab — verify all links and buttons receive visible focus indicators.",
      "In a screen reader (VoiceOver/NVDA), open the landmarks menu — ensure navigation and main regions are listed.",
      "Check the heading hierarchy with the 'H' key in your screen reader.",
    ],
    links: [
      {
        title: "MDN: Semantic HTML",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html",
        source: "MDN",
      },
      {
        title: "W3C WAI: Page Structure Concepts",
        url: "https://www.w3.org/WAI/tutorials/page-structure/",
        source: "W3C WAI",
      },
    ],
    relatedRuleIds: ["click-on-non-interactive", "heading-order"],
  },
  {
    slug: "accessible-names",
    title: "Accessible Names and Labels",
    summary:
      "Ensuring every interactive control and important visual element has an unambiguous programmatic text label.",
    plainExplanation:
      "When someone cannot see an icon or button, their screen reader announces its accessible name. If that name is missing or empty, the device can only say 'button', giving no clue as to what clicking it will do.",
    technicalExplanation:
      "The Accessible Name and Description Computation (AccName) algorithm evaluates an element's text through aria-labelledby, aria-label, native label elements (<label for>), text content, and placeholder/title attributes in a strict priority order.",
    whyItMatters:
      "Icon-only buttons, form fields without labels, and unlabelled links block speech recognition users (who say 'click Close') and screen reader users from discovering or triggering controls.",
    wcagCriteria: ["4.1.2", "2.5.3", "3.3.2"],
    badExample: {
      html: `<button type="button" class="btn-icon">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
</button>`,
      css: `.btn-icon { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid #ccc; border-radius: 4px; background: transparent; cursor: pointer; }`,
      description:
        "The button contains only an inline SVG. To a screen reader, this announces as 'button' with zero name context.",
    },
    goodExample: {
      html: `<button type="button" class="btn-icon" aria-label="Close dialog">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
</button>`,
      css: `.btn-icon { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid #ccc; border-radius: 4px; background: transparent; cursor: pointer; }`,
      description:
        "Provides aria-label='Close dialog' on the interactive button and hides the decorative SVG paths with aria-hidden='true'.",
    },
    commonMistakes: [
      "Leaving aria-label empty (aria-label=\"\") which removes any text fallback",
      "Using generic names like 'Click here', 'More', or 'Edit' when multiple exist on the page",
      "Relying on title attributes, which do not work on touch devices and are inconsistently announced",
    ],
    browserBehaviour:
      "The browser computes a single accessible name string exposed through the platform AX API. aria-labelledby overrides aria-label, which overrides native content.",
    manualTest: [
      "Navigate to the button using VoiceOver (Control+Option+Right) or NVDA (Down Arrow).",
      "Verify the spoken label clearly states the action (e.g. 'Close dialog, button').",
      "Test with voice control software by speaking the command 'Click Close dialog'.",
    ],
    links: [
      {
        title: "W3C: Accessible Name and Description Computation 1.2",
        url: "https://www.w3.org/TR/accname-1.2/",
        source: "W3C WAI",
      },
      {
        title: "MDN: Using aria-label",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label",
        source: "MDN",
      },
    ],
    relatedRuleIds: ["empty-interactive-name", "input-no-label"],
    challengeId: "empty-button",
  },
  {
    slug: "aria",
    title: "ARIA Usage and Roles",
    summary:
      "Adding Accessible Rich Internet Applications attributes when native HTML elements cannot convey dynamic roles or states.",
    plainExplanation:
      "The first rule of ARIA is: do not use ARIA if a native HTML element will do. When building custom components like tabs or treeviews, ARIA communicates their roles and states to assistive technologies.",
    technicalExplanation:
      "WAI-ARIA provides roles, states (like aria-expanded, aria-selected), and properties (like aria-controls) that map to platform accessibility APIs. ARIA changes accessibility tree metadata but does NOT change browser behavior, keystrokes, or visual rendering.",
    whyItMatters:
      "Using ARIA incorrectly (e.g. invalid roles or contradictory states) corrupts the accessibility tree, confusing or completely blocking screen reader users.",
    wcagCriteria: ["4.1.2"],
    badExample: {
      html: `<div role="button" aria-pressed="not-sure" aria-expanded="yes">
  Toggle Details
</div>`,
      css: `div[role="button"] { padding: 8px 16px; background: #e5e7eb; border-radius: 4px; cursor: pointer; display: inline-block; }`,
      description:
        "Uses invalid values ('not-sure' and 'yes' instead of booleans) and lacks tabindex='0' to allow keyboard focus.",
    },
    goodExample: {
      html: `<button type="button" aria-expanded="false" aria-controls="details-panel" id="toggle-btn">
  Toggle Details
</button>
<div id="details-panel" hidden>
  Additional details content here.
</div>`,
      css: `button { padding: 8px 16px; background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; }`,
      description:
        "Uses a native <button> with valid boolean aria-expanded and connects to the controlled content via aria-controls.",
    },
    commonMistakes: [
      "Writing role=\"button\" on a <div> without implementing Enter and Space keyboard event listeners",
      "Supplying invalid attribute values (e.g. aria-expanded=\"yes\" instead of \"true\"/\"false\")",
      "Using aria-hidden=\"true\" on elements that contain focusable child controls",
    ],
    browserBehaviour:
      "ARIA roles override the element's default role in the accessibility tree, but browsers do not synthesize keyboard handling or focusability.",
    manualTest: [
      "Inspect the element in Chrome DevTools Accessibility pane to verify computed role and states.",
      "Check that state changes (e.g. aria-expanded changing from false to true) update live announcements.",
      "Verify no ARIA warnings appear in the automated console scan.",
    ],
    links: [
      {
        title: "W3C: WAI-ARIA Authoring Practices Guide (APG)",
        url: "https://www.w3.org/WAI/ARIA/apg/",
        source: "WAI-ARIA APG",
      },
      {
        title: "MDN: ARIA Basics",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics",
        source: "MDN",
      },
    ],
    relatedRuleIds: ["invalid-aria", "aria-broken-reference", "aria-hidden-focusable"],
  },
  {
    slug: "keyboard",
    title: "Keyboard Navigation",
    summary:
      "Ensuring all interactive features can be discovered, navigated, and activated using only the keyboard.",
    plainExplanation:
      "Millions of computer users navigate websites entirely without a mouse — including people with motor disabilities, power users, and screen reader users. Every action possible with a mouse must also be possible with the keyboard.",
    technicalExplanation:
      "Interactive components must reside in the natural sequential tab navigation order (tabindex='0' or native interactive controls) and respond to expected keystrokes: Tab/Shift+Tab for focus, Enter and Space for buttons/links, and Arrow keys for composite widgets like radio groups and tabs.",
    whyItMatters:
      "If a modal dialog, dropdown menu, or form submit button cannot be triggered via keystrokes, keyboard-only users are trapped or completely unable to complete tasks.",
    wcagCriteria: ["2.1.1", "2.1.2"],
    badExample: {
      html: `<div class="btn" onclick="alert('Submitted!')">
  Submit Application
</div>`,
      css: `.btn { padding: 10px 20px; background: #2563eb; color: #fff; display: inline-block; border-radius: 6px; cursor: pointer; }`,
      description:
        "The <div> is invisible to keyboard navigation. Pressing Tab skips past it entirely, and Enter/Space do nothing.",
    },
    goodExample: {
      html: `<button type="button" class="btn" onclick="alert('Submitted!')">
  Submit Application
</button>`,
      css: `.btn { padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9375rem; }
.btn:focus-visible { outline: 2px solid #1e40af; outline-offset: 2px; }`,
      description:
        "Uses native <button> which is natively focusable with Tab, responds to Enter and Space, and styles focus-visible.",
    },
    commonMistakes: [
      "Using positive tabindex values (tabindex=\"1\", tabindex=\"2\") which break the natural document reading order",
      "Keyboard traps in modal dialogs where focus cannot escape back to the trigger button",
      "Listening only to mouseup/mousedown rather than click and keydown handlers",
    ],
    browserBehaviour:
      "Native interactive tags are automatically indexed into the document tab order. Browsers dispatch synthetic 'click' events on <button> elements when Enter or Space is pressed.",
    manualTest: [
      "Unplug or set aside your mouse entirely.",
      "Tab through the entire page from top to bottom.",
      "Activate every link and button using Enter or Space.",
      "Verify you never get trapped in any widget or component.",
    ],
    links: [
      {
        title: "W3C WAI: Keyboard Compatibility Guidelines",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
        source: "W3C WAI",
      },
      {
        title: "WAI-ARIA APG: Keyboard Navigation Patterns",
        url: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/",
        source: "WAI-ARIA APG",
      },
    ],
    relatedRuleIds: ["click-on-non-interactive", "positive-tabindex"],
    challengeId: "tabs-keyboard",
  },
  {
    slug: "focus",
    title: "Focus Management and Indicators",
    summary:
      "Providing clear visual focus rings and programmatically managing focus during view changes or dialog openings.",
    plainExplanation:
      "A focus ring is like a blinking cursor for the entire screen. Sighted keyboard navigators must be able to see at all times which button or link is currently selected.",
    technicalExplanation:
      "CSS outlines (styled via :focus-visible) must maintain at least a 3:1 contrast ratio against adjacent colors and meet WCAG 2.2 focus appearance minimum area requirements. Never remove focus outlines (outline: none) without providing an equally prominent replacement.",
    whyItMatters:
      "Stripping focus rings leaves sighted keyboard users completely blind to their current position on the page.",
    wcagCriteria: ["2.4.7", "2.4.11"],
    badExample: {
      html: `<button class="bad-btn">Start Trial</button>`,
      css: `.bad-btn {
  background: #2563eb; color: #fff; padding: 8px 16px;
  border: none; border-radius: 4px; outline: none;
}
.bad-btn:focus { outline: none; }`,
      description:
        "Explicitly destroys focus outlines with outline: none without providing an alternative focus indicator.",
    },
    goodExample: {
      html: `<button class="good-btn">Start Trial</button>`,
      css: `.good-btn {
  background: #2563eb; color: #fff; padding: 8px 16px;
  border: none; border-radius: 4px;
}
.good-btn:focus-visible {
  outline: 3px solid #1e3a8a;
  outline-offset: 2px;
}`,
      description:
        "Uses :focus-visible with a high-contrast outline and offset, appearing only when navigated by keyboard.",
    },
    commonMistakes: [
      "Using `* { outline: none; }` in CSS resets",
      "Using a subtle focus indicator with less than 3:1 contrast against the background",
      "Failing to return focus to the trigger button when closing a modal dialog",
    ],
    browserBehaviour:
      ":focus-visible matches when the user interacts via keyboard (Tab key) while preventing intrusive focus rings during mouse clicks.",
    manualTest: [
      "Tab through every button, input, and link.",
      "Check that the focus ring is unmistakably visible against all background colors.",
      "Open a modal, close it, and verify focus returns to the button that opened it.",
    ],
    links: [
      {
        title: "MDN: :focus-visible pseudo-class",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible",
        source: "MDN",
      },
      {
        title: "W3C WAI: Focus Visible Guidelines",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
        source: "W3C WAI",
      },
    ],
    relatedRuleIds: ["outline-removed"],
  },
  {
    slug: "forms",
    title: "Accessible Forms and Inputs",
    summary:
      "Explicitly pairing form controls with descriptive labels, input formatting hints, and clear error notifications.",
    plainExplanation:
      "Forms are where critical transactions happen: signing up, paying bills, searching, and submitting data. Users must understand what information is required and receive clear explanations when errors occur.",
    technicalExplanation:
      "Every <input>, <select>, and <textarea> must have an explicit accessible name, typically via <label for='field-id'>. Avoid relying on the placeholder attribute alone, as it disappears when typing begins and has insufficient contrast.",
    whyItMatters:
      "Without persistent labels, people with cognitive difficulties lose track of what field they are editing, and screen readers cannot announce the purpose of the control.",
    wcagCriteria: ["1.3.1", "3.3.2", "4.1.2"],
    badExample: {
      html: `<form>
  <input type="text" placeholder="Full name">
  <input type="email" placeholder="Email address">
  <button type="submit">Send</button>
</form>`,
      css: `input { display: block; margin-bottom: 8px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }`,
      description:
        "Relies exclusively on placeholder attributes. No <label> elements exist to announce names or maintain context.",
    },
    goodExample: {
      html: `<form>
  <div class="field">
    <label for="user-name">Full name <span aria-hidden="true">*</span></label>
    <input id="user-name" type="text" required aria-required="true">
  </div>
  <div class="field">
    <label for="user-email">Email address <span aria-hidden="true">*</span></label>
    <input id="user-email" type="email" required aria-required="true">
  </div>
  <button type="submit">Send</button>
</form>`,
      css: `.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
label { font-size: 0.875rem; font-weight: 600; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }`,
      description:
        "Pairs each field with an explicit <label for> matching the element's id, keeping labels visible permanently.",
    },
    commonMistakes: [
      "Using placeholder as the only label for input fields",
      "Mismatched for attribute on <label> and id attribute on <input>",
      "Displaying error messages in red text without text descriptions or aria-errormessage connections",
    ],
    browserBehaviour:
      "Clicking a <label> with a valid for attribute automatically moves focus and dispatches click events to the associated input control.",
    manualTest: [
      "Click the text of each label — verify the matching input receives focus.",
      "Tab into the input with a screen reader running; confirm the label text is announced before the field type.",
    ],
    links: [
      {
        title: "W3C WAI: Form Tutorials",
        url: "https://www.w3.org/WAI/tutorials/forms/",
        source: "W3C WAI",
      },
      {
        title: "MDN: How to structure a web form",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/How_to_structure_a_web_form",
        source: "MDN",
      },
    ],
    relatedRuleIds: ["input-placeholder-only", "input-no-label"],
    challengeId: "form-labels",
  },
  {
    slug: "contrast",
    title: "Colour Contrast and Visual Perception",
    summary:
      "Guaranteeing sufficient contrast ratios between text and background colors, and avoiding colour as the sole indicator of state.",
    plainExplanation:
      "Reading low-contrast text is exhausting for everyone and completely impossible for people with low vision, aging eyes, or when viewing a screen in bright sunlight.",
    technicalExplanation:
      "WCAG 2.2 Level AA requires a minimum contrast ratio of 4.5:1 for normal text (< 18pt or < 14pt bold) and 3:1 for large text. Non-text UI components and focus rings require 3:1 against adjacent background colors.",
    whyItMatters:
      "Over 2 billion people worldwide live with visual impairments or color blindness. Sufficient contrast ensures legible content across all lighting conditions and vision capabilities.",
    wcagCriteria: ["1.4.3", "1.4.1", "1.4.11"],
    badExample: {
      html: `<div class="card">
  <span class="status">Active</span>
  <p class="body">Your subscription will renew on the 15th.</p>
</div>`,
      css: `.card { background: #fdfdfd; padding: 16px; border: 1px solid #eee; }
.status { color: #86efac; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
.body { color: #9ca3af; font-size: 0.875rem; }`,
      description:
        "Light green text (#86efac) on light green background (#f0fdf4) has a 1.4:1 contrast ratio — unreadable for many users.",
    },
    goodExample: {
      html: `<div class="card">
  <span class="status">✓ Active</span>
  <p class="body">Your subscription will renew on the 15th.</p>
</div>`,
      css: `.card { background: #ffffff; padding: 16px; border: 1px solid #e5e7eb; }
.status { color: #166534; background: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.body { color: #374151; font-size: 0.875rem; }`,
      description:
        "Dark green text (#166534) on light green background yields a robust 6.8:1 contrast ratio, plus an icon avoids colour-alone reliance.",
    },
    commonMistakes: [
      "Using light gray text (#9ca3af or #cbd5e1) on white backgrounds for secondary text",
      "Indicating required fields or error states purely with red borders or red text",
      "Forgetting to verify contrast over variable gradient or image backgrounds",
    ],
    browserBehaviour:
      "Browsers render colors as specified in CSS. Windows High Contrast Mode (forced-colors) overrides author colors to guarantee high contrast.",
    manualTest: [
      "Use our built-in Contrast Checker or browser color picker to calculate contrast ratios.",
      "Switch on grayscale mode in your OS to test if statuses are distinguishable without colour.",
    ],
    links: [
      {
        title: "W3C WAI: Understanding Contrast (Minimum)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
        source: "W3C WAI",
      },
      {
        title: "MDN: Color contrast accessibility",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_Colors_and_Luminance",
        source: "MDN",
      },
    ],
    relatedRuleIds: ["color-contrast"],
    challengeId: "color-contrast",
  },
  {
    slug: "images",
    title: "Images and Alternative Text",
    summary:
      "Supplying descriptive text alternatives for informative images while marking purely decorative visuals as presentational.",
    plainExplanation:
      "When a screen reader reaches an image without alt text, it reads the raw filename (like 'IMG_98234_final.jpg'). Describing the image allows blind users to experience the content just as sighted readers do.",
    technicalExplanation:
      "Every <img> requires an alt attribute. Informative images must describe the content and purpose. Decorative images must use alt=\"\" or role=\"presentation\" to be skipped by the accessibility tree.",
    whyItMatters:
      "Alternative text is essential for screen reader users and users with poor network connections where images fail to download.",
    wcagCriteria: ["1.1.1"],
    badExample: {
      html: `<img src="/images/chart-q3-growth.png">`,
      css: `img { max-width: 100%; height: auto; }`,
      description:
        "Lacks alt attribute. Screen readers announce the full file URL path, leaving users without knowledge of the chart's data.",
    },
    goodExample: {
      html: `<figure>
  <img src="/images/chart-q3-growth.png" alt="Bar chart showing Q3 revenue growth of 24% compared to Q2 across enterprise and retail channels.">
  <figcaption>Figure 1: Quarterly revenue trajectory across sales channels.</figcaption>
</figure>`,
      css: `figure { margin: 0; } img { max-width: 100%; height: auto; } figcaption { font-size: 0.8125rem; color: #4b5563; margin-top: 6px; }`,
      description:
        "Provides rich, concise alt text describing the key finding of the chart, complemented by a <figcaption>.",
    },
    commonMistakes: [
      "Prefixing alt text with 'Image of...' or 'Graphic of...' (screen readers already announce 'graphic')",
      "Omitted alt attribute entirely, causing the browser to read the src URL string",
      "Stuffing alt text with search engine keywords instead of describing visual content",
    ],
    browserBehaviour:
      "When alt is omitted, browsers fall back to file names or image heuristics. When alt=\"\" is present, the image is treated as decorative and excluded from the accessibility tree.",
    manualTest: [
      "Inspect the Accessibility Tree in DevTools: ensure decorative images do not appear.",
      "Check that informative images convey the essential takeaway in their announced name.",
    ],
    links: [
      {
        title: "W3C WAI: Images Tutorial",
        url: "https://www.w3.org/WAI/tutorials/images/",
        source: "W3C WAI",
      },
      {
        title: "W3C: An alt Decision Tree",
        url: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
        source: "W3C WAI",
      },
    ],
    relatedRuleIds: ["img-missing-alt"],
    challengeId: "image-alt",
  },
  {
    slug: "tables",
    title: "Data Tables and Headers",
    summary:
      "Structuring tabular information with <th> headers and scope attributes so data cells maintain relationship context.",
    plainExplanation:
      "When looking at a spreadsheet or table, your eyes can easily glance up to see what column a number belongs to. Screen reader users need explicit table headers so the device can announce 'Price: $45' as they navigate cell by cell.",
    technicalExplanation:
      "Use <table>, <caption>, <thead>, <tbody>, and <th scope='col|row'> elements. Never use tables for visual page layouts.",
    whyItMatters:
      "Without header associations, screen reader users hear endless grids of numbers and names with no context regarding what category each datum represents.",
    wcagCriteria: ["1.3.1"],
    badExample: {
      html: `<table>
  <tr>
    <td>Product</td>
    <td>Quantity</td>
    <td>Price</td>
  </tr>
  <tr>
    <td>Running Shoes</td>
    <td>2</td>
    <td>$120</td>
  </tr>
</table>`,
      css: `table { border-collapse: collapse; width: 100%; } td { padding: 8px; border: 1px solid #ddd; }`,
      description:
        "The header row is composed of plain <td> cells. Screen readers cannot associate row data with header titles.",
    },
    goodExample: {
      html: `<table>
  <caption>Quarterly Order Summary</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Quantity</th>
      <th scope="col">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Running Shoes</th>
      <td>2</td>
      <td>$120</td>
    </tr>
  </tbody>
</table>`,
      css: `table { border-collapse: collapse; width: 100%; font-size: 0.9375rem; }
caption { text-align: left; font-weight: bold; margin-bottom: 8px; }
th, td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
th { background: #f9fafb; font-weight: 600; }`,
      description:
        "Includes a <caption>, distinct <thead> and <tbody>, and <th scope='col|row'> tags establishing programmatic relationships.",
    },
    commonMistakes: [
      "Using <div> or CSS grid to format tabular data without supplying table/row/cell ARIA roles",
      "Missing scope='col' or scope='row' on ambiguous multi-level table headers",
      "Omitting <caption> which provides the summary description of the dataset",
    ],
    browserBehaviour:
      "Browsers expose table grid semantics (row count, column count, coordinates, headers) allowing screen readers to offer 2D table navigation commands (Control+Alt+Arrows).",
    manualTest: [
      "Navigate inside the table using screen reader table shortcuts (Ctrl+Alt+Arrows in NVDA).",
      "Ensure the corresponding column and row headers are announced whenever you move to a new cell.",
    ],
    links: [
      {
        title: "W3C WAI: Tables Tutorial",
        url: "https://www.w3.org/WAI/tutorials/tables/",
        source: "W3C WAI",
      },
      {
        title: "MDN: HTML table basics",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics",
        source: "MDN",
      },
    ],
    relatedRuleIds: [],
  },
  {
    slug: "dialogs",
    title: "Modal Dialogs and Overlays",
    summary:
      "Creating accessible modal windows that trap focus within their bounds, trap screen reader navigation, and close gracefully.",
    plainExplanation:
      "When a pop-up confirmation or modal appears, keyboard focus must move inside it immediately. You shouldn't be able to Tab back to the page behind it until you dismiss the dialog, and pressing Escape should always close it.",
    technicalExplanation:
      "HTML5 <dialog> with .showModal() provides native modal behavior: backdrop styling, focus trapping, Escape key cancellation, and aria-modal isolation.",
    whyItMatters:
      "Inaccessible custom modals allow keyboard focus to wander into hidden background elements, confusing and trapping users.",
    wcagCriteria: ["2.1.2", "2.4.3", "4.1.2"],
    badExample: {
      html: `<div class="custom-modal" id="modal">
  <div class="modal-box">
    <h3>Delete account</h3>
    <p>This action cannot be undone.</p>
    <button onclick="document.getElementById('modal').style.display='none'">Cancel</button>
  </div>
</div>`,
      css: `.custom-modal { display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
.modal-box { background: white; padding: 24px; border-radius: 8px; max-width: 400px; }`,
      description:
        "A <div> overlay with no role='dialog', no aria-modal, no focus trap, and no Escape key event listener.",
    },
    goodExample: {
      html: `<button type="button" onclick="document.getElementById('confirm-dialog').showModal()">Delete account</button>

<dialog id="confirm-dialog" aria-labelledby="dialog-title" class="accessible-dialog">
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p>This action is permanent and cannot be undone.</p>
  <div class="actions">
    <button type="button" onclick="document.getElementById('confirm-dialog').close()">Cancel</button>
    <button type="button" class="btn-danger" onclick="document.getElementById('confirm-dialog').close()">Delete</button>
  </div>
</dialog>`,
      css: `.accessible-dialog { border: none; border-radius: 8px; padding: 24px; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.accessible-dialog::backdrop { background: rgba(0,0,0,0.5); }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-danger { background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 4px; }`,
      description:
        "Utilizes native <dialog> with showModal(), establishing natural focus containment, backdrop, and Escape handling.",
    },
    commonMistakes: [
      "Forgetting to set aria-modal=\"true\" on custom role=\"dialog\" containers",
      "Lacking an accessible label (via aria-labelledby or aria-label)",
      "Failing to restore focus to the opening trigger button upon closing",
    ],
    browserBehaviour:
      "Native <dialog>.showModal() places the element in the top layer, marks background nodes as inert, and handles Escape keystrokes automatically.",
    manualTest: [
      "Open the dialog — verify focus moves to the first interactive element or dialog body.",
      "Press Tab repeatedly — confirm focus stays trapped inside the dialog.",
      "Press Escape — confirm the dialog closes and focus returns to the opener button.",
    ],
    links: [
      {
        title: "MDN: The Dialog element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog",
        source: "MDN",
      },
      {
        title: "WAI-ARIA APG: Dialog (Modal) Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
        source: "WAI-ARIA APG",
      },
    ],
    relatedRuleIds: ["dialog-no-name"],
    challengeId: "modal-dialog",
  },
  {
    slug: "navigation",
    title: "Navigation and Skip Links",
    summary:
      "Providing landmark regions and skip navigation mechanisms so keyboard and screen reader users can bypass repetitive navigation.",
    plainExplanation:
      "Imagine having to read through every navigation link at the top of a website every single time you click a page. A 'Skip to Content' link allows keyboard users to jump straight to the article or main form with one press of Enter.",
    technicalExplanation:
      "Include a skip link as the first focusable element inside <body> linking to #main-content. Structure the page with landmarks (<header>, <nav>, <main>, <footer>).",
    whyItMatters:
      "Saves keyboard and screen reader users dozens of tedious keystrokes on every single page load.",
    wcagCriteria: ["2.4.1", "1.3.1"],
    badExample: {
      html: `<div class="header">
  <div class="links">
    <a href="/home">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/pricing">Pricing</a>
    <a href="/contact">Contact</a>
  </div>
</div>
<div class="content">
  <h1>Page Title</h1>
  <p>Main content begins here.</p>
</div>`,
      css: `.header { padding: 12px; background: #eee; } .links a { margin-right: 12px; }`,
      description:
        "No skip link exists, and the layout uses <div> tags rather than HTML5 landmark elements.",
    },
    goodExample: {
      html: `<a href="#main-content" class="skip-link">Skip to main content</a>
<header>
  <nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/pricing">Pricing</a>
    <a href="/contact">Contact</a>
  </nav>
</header>
<main id="main-content" tabindex="-1">
  <h1>Page Title</h1>
  <p>Main content begins here.</p>
</main>`,
      css: `.skip-link {
  position: absolute; top: -100px; left: 16px;
  background: #1d4ed8; color: white; padding: 8px 16px;
  border-radius: 0 0 4px 4px; font-weight: 600; text-decoration: none; z-index: 100;
}
.skip-link:focus { top: 0; }
header { padding: 12px; background: #f3f4f6; }
nav a { margin-right: 12px; color: #2563eb; }`,
      description:
        "Provides a skip link that slides into view upon Tab focus, jumping focus directly to the <main> landmark.",
    },
    commonMistakes: [
      "Targeting an ID that does not exist in the DOM (e.g. href='#main' when the container has no id)",
      "Hiding the skip link using display:none or visibility:hidden, preventing keyboard users from focusing it",
      "Omitting tabindex='-1' on non-interactive main containers in older browsers",
    ],
    browserBehaviour:
      "Navigating to an in-page hash fragment (#id) updates the scroll position and sets sequential focus navigation starting point to that element.",
    manualTest: [
      "Load the page and press Tab once.",
      "Verify the skip link becomes visibly prominent on screen.",
      "Press Enter — ensure the next Tab key press moves focus to the first link inside the main content area.",
    ],
    links: [
      {
        title: "W3C WAI: Bypass Blocks",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html",
        source: "W3C WAI",
      },
      {
        title: "WebAIM: Skip Navigation Links",
        url: "https://webaim.org/techniques/skipnav/",
        source: "MDN",
      },
    ],
    relatedRuleIds: [],
    challengeId: "skip-link",
  },
  {
    slug: "dynamic-content",
    title: "Dynamic Content and Live Regions",
    summary:
      "Announcing asynchronous updates, toasts, and status messages to assistive technologies using ARIA live regions.",
    plainExplanation:
      "When a search finishes or an item is added to a shopping cart, sighted users see a banner pop up. Sighted users can see the change, but screen reader users won't know anything happened unless an ARIA live region announces it.",
    technicalExplanation:
      "Use role='status' (equivalent to aria-live='polite' and aria-atomic='true') or role='alert' for immediate interruptions. The live region container must exist in the DOM before the content is inserted.",
    whyItMatters:
      "Ensures blind and low-vision users receive feedback about background actions without disrupting their active task.",
    wcagCriteria: ["4.1.3"],
    badExample: {
      html: `<button onclick="saveChanges()">Save</button>
<div id="msg-box"></div>

<script>
function saveChanges() {
  document.getElementById('msg-box').innerHTML = '<span class="success">Changes saved successfully!</span>';
}
</script>`,
      css: `.success { color: #15803d; font-weight: 500; margin-top: 8px; display: block; }`,
      description:
        "Updates the DOM dynamically without an aria-live attribute. Screen readers remain silent.",
    },
    goodExample: {
      html: `<button type="button" onclick="saveChanges()">Save</button>
<div id="status-container" role="status" aria-live="polite" class="status-box"></div>

<script>
function saveChanges() {
  document.getElementById('status-container').textContent = 'Changes saved successfully!';
}
</script>`,
      css: `.status-box { font-size: 0.875rem; color: #15803d; min-height: 24px; margin-top: 8px; }`,
      description:
        "The live region container exists in the DOM at load time with role='status'. Modifying its text prompts a polite announcement.",
    },
    commonMistakes: [
      "Injecting a new container with aria-live at the exact same moment as the message text",
      "Overusing aria-live=\"assertive\", which interrupts the user mid-sentence",
      "Placing constantly fluctuating counters into live regions, causing endless speech spam",
    ],
    browserBehaviour:
      "Browsers monitor DOM mutations within registered live regions and queue speech events through the operating system accessibility daemon.",
    manualTest: [
      "Trigger the action with a screen reader active (VoiceOver or NVDA).",
      "Confirm that the notification is spoken without requiring you to move your focus cursor.",
    ],
    links: [
      {
        title: "W3C: Status Messages (4.1.3)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html",
        source: "W3C WAI",
      },
      {
        title: "MDN: ARIA live regions",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions",
        source: "MDN",
      },
    ],
    relatedRuleIds: [],
    challengeId: "live-status",
  },
  {
    slug: "screen-readers",
    title: "Screen Reader Semantics",
    summary:
      "Understanding how assistive technologies interpret DOM elements, states, headings, and lists to build spoken virtual buffers.",
    plainExplanation:
      "Screen readers do not read pixel layouts; they read the Accessibility Tree. Providing accurate roles, list elements (<ul>, <ol>), and semantic containers allows users to skim pages efficiently.",
    technicalExplanation:
      "Screen readers like VoiceOver, NVDA, and JAWS construct virtual reading buffers from accessibility APIs. They offer shortcut keys (H for heading, L for list, F for form field, K for link) to navigate rapidly through structured markup.",
    whyItMatters:
      "Without clean structural semantics, screen reader users are forced to read every word sequentially from the top of the page, destroying productivity.",
    wcagCriteria: ["1.3.1", "4.1.2"],
    badExample: {
      html: `<div class="heading">Features List</div>
<div class="list-item">• Automated testing</div>
<div class="list-item">• Real-world challenges</div>
<div class="list-item">• Live playground</div>`,
      css: `.heading { font-weight: bold; margin-bottom: 8px; } .list-item { margin-left: 12px; }`,
      description:
        "Uses fake bullet points and <div> tags. Screen readers cannot announce 'List of 3 items' or jump between items.",
    },
    goodExample: {
      html: `<h2>Features List</h2>
<ul>
  <li>Automated testing</li>
  <li>Real-world challenges</li>
  <li>Live playground</li>
</ul>`,
      css: `h2 { font-size: 1.125rem; margin-bottom: 8px; } ul { padding-left: 20px; margin: 0; }`,
      description:
        "Native <h2> and <ul>/<li> elements inform assistive technologies of the list length and enable item-by-item navigation.",
    },
    commonMistakes: [
      "Using CSS list-style: none without preserving list semantics on WebKit browsers where needed",
      "Using presentation tables to lay out sequential text content",
      "Failing to announce dynamic updates or status changes",
    ],
    browserBehaviour:
      "Browsers expose accessibility nodes with role='list' and role='listitem', calculating setsize (total count) and posinset (current index).",
    manualTest: [
      "Turn on VoiceOver (Cmd+F5 on macOS) or NVDA (Insert+N on Windows).",
      "Press the 'L' key to jump between lists and confirm item counts are spoken correctly.",
    ],
    links: [
      {
        title: "W3C WAI: Screen Reader User Experience",
        url: "https://www.w3.org/WAI/people-use-web/user-stories/",
        source: "W3C WAI",
      },
      {
        title: "MDN: Screen readers overview",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Accessibility/What_is_accessibility",
        source: "MDN",
      },
    ],
    relatedRuleIds: ["heading-order"],
  },
  {
    slug: "reflow",
    title: "Responsive Reflow and Zoom",
    summary:
      "Designing responsive layouts that scale gracefully up to 400% zoom without horizontal scrolling or clipping.",
    plainExplanation:
      "People with low vision often zoom their web browser to 200%, 300%, or 400%. The layout should wrap into a single vertical column, just like a mobile website, rather than forcing the user to scroll horizontally to read sentences.",
    technicalExplanation:
      "WCAG 2.2 Criterion 1.4.10 (Reflow) requires that content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions on a 320px equivalent viewport (e.g. 1280px screen zoomed to 400%). Avoid fixed-pixel widths.",
    whyItMatters:
      "Having to scroll left and right for every single line of text induces severe cognitive fatigue and makes reading virtually impossible.",
    wcagCriteria: ["1.4.10", "1.4.4"],
    badExample: {
      html: `<div class="fixed-container">
  <h2>Fixed Width Article</h2>
  <p>This layout uses a rigid width of 800px. At high zoom, it forces horizontal scrolling.</p>
</div>`,
      css: `.fixed-container { width: 800px; padding: 20px; border: 1px solid #ccc; }`,
      description:
        "Hardcoded width: 800px forces horizontal scrolling on smaller screens or high browser zoom levels.",
    },
    goodExample: {
      html: `<div class="responsive-container">
  <h2>Responsive Article</h2>
  <p>This layout uses max-width and percentage units, reflowing smoothly across any zoom level.</p>
</div>`,
      css: `.responsive-container { max-width: 800px; width: 100%; padding: 1.25rem; box-sizing: border-box; }`,
      description:
        "Uses max-width: 800px and width: 100%, reflowing down to 320px viewports without horizontal scrolling.",
    },
    commonMistakes: [
      "Using `overflow: hidden` on text containers which truncates enlarged text",
      "Setting fixed pixel heights on elements containing text",
      "Disabling pinch-to-zoom using `<meta name=\"viewport\" content=\"user-scalable=no\">`",
    ],
    browserBehaviour:
      "Zooming in browsers multiplies CSS pixel values by the zoom factor. At 400% zoom on a 1280px display, the effective CSS viewport width becomes 320px.",
    manualTest: [
      "Press Cmd/Ctrl + Plus until browser zoom reaches 400%.",
      "Ensure no horizontal scrollbar appears at the bottom of the window.",
      "Check that all buttons, menus, and text remain visible and unclipped.",
    ],
    links: [
      {
        title: "W3C WAI: Understanding Reflow (1.4.10)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
        source: "W3C WAI",
      },
      {
        title: "MDN: Responsive design building blocks",
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design",
        source: "MDN",
      },
    ],
    relatedRuleIds: [],
  },
  {
    slug: "motion",
    title: "Animation and Reduced Motion",
    summary:
      "Respecting operating system preferences for reduced motion to prevent triggering vestibular disorders, vertigo, and dizziness.",
    plainExplanation:
      "Fast spinning animations, parallax scrolling, and sudden zoom effects can trigger intense nausea, dizziness, or migraines for people with vestibular balance disorders.",
    technicalExplanation:
      "Use the CSS media query `@media (prefers-reduced-motion: reduce)` to tone down, slow, or remove purely decorative animations, transitions, and auto-playing video.",
    whyItMatters:
      "Websites should never cause physical illness. Respecting user motion preferences protects users from vestibular distress.",
    wcagCriteria: ["2.2.2", "2.3.1"],
    badExample: {
      html: `<div class="spin-box">Processing transaction...</div>`,
      css: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spin-box { animation: spin 1s infinite linear; padding: 20px; background: #3b82f6; color: white; }`,
      description:
        "Runs an infinite fast spin animation without checking prefers-reduced-motion, causing discomfort for sensitive users.",
    },
    goodExample: {
      html: `<div class="safe-spinner">Processing transaction...</div>`,
      css: `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.safe-spinner { animation: pulse 2s infinite ease-in-out; padding: 20px; background: #3b82f6; color: white; }
@media (prefers-reduced-motion: reduce) {
  .safe-spinner { animation: none; }
}`,
      description:
        "Uses gentle opacity transitions and completely disables animation when prefers-reduced-motion: reduce is requested.",
    },
    commonMistakes: [
      "Ignoring prefers-reduced-motion on smooth-scrolling behavior (`html { scroll-behavior: smooth; }`)",
      "Using flashing content (> 3 flashes per second), which risks triggering epileptic seizures",
      "Parallax scroll animations that continuously move large visual areas at different speeds",
    ],
    browserBehaviour:
      "The browser queries the OS-level accessibility setting (e.g. 'Reduce motion' in macOS or Windows) and applies the matching CSS media query block.",
    manualTest: [
      "Enable 'Reduce motion' in your operating system settings or Chrome DevTools Rendering panel.",
      "Navigate through the site: verify that all disruptive animations and transitions cease.",
    ],
    links: [
      {
        title: "MDN: prefers-reduced-motion",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
        source: "MDN",
      },
      {
        title: "W3C WAI: Animation from Interactions (2.3.3)",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html",
        source: "W3C WAI",
      },
    ],
    relatedRuleIds: [],
  },
];

export function getLearnTopicBySlug(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.slug === slug);
}

export function getLearnTopicForRuleId(ruleId: string): LearnTopic | undefined {
  return LEARN_TOPICS.find(
    (t) => t.relatedRuleIds.includes(ruleId) || t.challengeId === ruleId
  );
}

export function getPlaygroundUrlForExample(example: LearnTopicExample): string {
  const encoded = encodeSnippet(example.html, example.css ?? "");
  return `/playground?s=${encoded}`;
}

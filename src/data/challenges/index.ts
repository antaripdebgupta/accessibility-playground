import type { Challenge, ChallengeContent, ChallengeMetadata } from "./types";

export type { Challenge, ChallengeMetadata };

export const CHALLENGES: readonly ChallengeMetadata[] = [
  {
    id: "image-alt",
    title: "Image Alt Text",
    difficulty: "beginner",
    summary:
      "A product card uses images without alternative text. Screen readers announce the filename instead of the content.",
    objectives: [
      "Add descriptive alt text to the product image",
      "Mark the decorative divider image as presentational",
    ],
    hintsCount: 3,
  },
  {
    id: "empty-button",
    title: "Icon Button Accessible Name",
    difficulty: "beginner",
    summary:
      "A navigation toolbar has buttons containing only SVG icons. Screen readers announce 'button' with no hint of what it does.",
    objectives: [
      "Provide an accessible name for the search icon button",
      "Provide an accessible name for the close icon button",
      'Ensure SVGs are marked as aria-hidden="true"',
    ],
    hintsCount: 3,
  },
  {
    id: "form-labels",
    title: "Accessible Form Inputs",
    difficulty: "beginner",
    summary:
      "A newsletter signup form relies on placeholder text instead of proper labels. Placeholders disappear when typing and low contrast makes them hard to read.",
    objectives: [
      "Associate visible <label> elements with each input using 'for' and 'id'",
      "Add a visually hidden label for the consent checkbox",
      "Do not rely solely on placeholder text for instructions",
    ],
    hintsCount: 3,
  },
  {
    id: "heading-order",
    title: "Logical Heading Structure",
    difficulty: "intermediate",
    summary:
      "A blog post skips heading levels (h1 → h4 → h2), breaking screen reader navigation. Users cannot build a mental outline of the page.",
    objectives: [
      "Fix skipped heading levels so headings descend sequentially",
      "Ensure there is exactly one <h1> representing the page title",
      "Group related sub-sections under appropriate heading levels",
    ],
    hintsCount: 3,
  },
  {
    id: "color-contrast",
    title: "Sufficient Color Contrast",
    difficulty: "intermediate",
    summary:
      "A pricing table uses low-contrast text (#94a3b8 on #f8fafc) that fails WCAG AA 4.5:1 ratio. Users with low vision cannot read the feature list or pricing details.",
    objectives: [
      "Increase text contrast on the feature list to meet at least 4.5:1",
      "Fix the disabled-looking 'Popular' badge so it is legible",
      "Ensure button text meets minimum 4.5:1 contrast against its background",
    ],
    hintsCount: 3,
  },
  {
    id: "modal-dialog",
    title: "Accessible Modal Dialog",
    difficulty: "advanced",
    summary:
      "A confirmation dialog lacks proper ARIA attributes, does not trap focus, and screen readers cannot tell it is a modal. Closing it leaves keyboard focus lost.",
    objectives: [
      'Add role="dialog" and aria-modal="true" to the modal container',
      "Connect the dialog to its title via aria-labelledby",
      "Provide an accessible name for the close button",
      "Add a description connection via aria-describedby",
    ],
    hintsCount: 3,
  },
  {
    id: "tabs-keyboard",
    title: "Keyboard-Navigable Tabs",
    difficulty: "advanced",
    summary:
      "A tab component uses <div> elements with click handlers. Keyboard users cannot navigate between tabs with Arrow keys, and screen readers cannot tell which tab is selected.",
    objectives: [
      'Use role="tablist", role="tab", and role="tabpanel"',
      'Set aria-selected="true" on the active tab and "false" on inactive tabs',
      "Connect tabs to their panels using aria-controls and aria-labelledby",
      'Ensure only the active tab has tabindex="0"; inactive tabs have tabindex="-1"',
    ],
    hintsCount: 4,
  },
  {
    id: "accordion",
    title: "Accessible FAQ Accordion",
    difficulty: "intermediate",
    summary:
      "A FAQ section uses clickable divs that do not announce their expanded/collapsed state to screen readers and cannot be toggled with Space or Enter.",
    objectives: [
      "Use native <button> elements for accordion triggers",
      "Add aria-expanded to communicate open/closed state",
      "Connect each button to its content panel via aria-controls",
      "Place accordion buttons inside heading elements (e.g. <h3>)",
    ],
    hintsCount: 3,
  },
  {
    id: "live-status",
    title: "Live Region Status Announcements",
    difficulty: "intermediate",
    summary:
      "A file upload widget shows progress visually but never announces updates or completion to screen readers. Blind users have no idea if the upload succeeded.",
    objectives: [
      'Add role="status" or aria-live="polite" to the status container',
      'Use aria-atomic="true" so the full message is announced',
      'Ensure error messages use role="alert" or aria-live="assertive"',
    ],
    hintsCount: 3,
  },
  {
    id: "skip-link",
    title: "Skip Navigation Link",
    difficulty: "beginner",
    summary:
      "A page has a large header with 20 navigation links before the main content. Keyboard-only users must press Tab 20 times on every page load to reach the article.",
    objectives: [
      "Add a skip link as the first focusable element on the page",
      "Make the skip link visually hidden until focused (sr-only + focus:not-sr-only)",
      'Ensure the link targets the <main> element via href="#main-content"',
      'Ensure the <main> element can receive programmatic focus (tabindex="-1")',
    ],
    hintsCount: 3,
  },
];

/**
 * Static map of content loaders. Bundlers can split each challenge into its
 * own lazy chunk without dynamic template string imports.
 */
const CHALLENGE_LOADERS: Record<
  string,
  () => Promise<{ default: ChallengeContent }>
> = {
  "image-alt": () => import("./content/image-alt"),
  "empty-button": () => import("./content/empty-button"),
  "form-labels": () => import("./content/form-labels"),
  "heading-order": () => import("./content/heading-order"),
  "color-contrast": () => import("./content/color-contrast"),
  "modal-dialog": () => import("./content/modal-dialog"),
  "tabs-keyboard": () => import("./content/tabs-keyboard"),
  accordion: () => import("./content/accordion"),
  "live-status": () => import("./content/live-status"),
  "skip-link": () => import("./content/skip-link"),
};

export function getChallengeMetadata(
  id: string
): ChallengeMetadata | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export type LoadChallengeResult =
  | { ok: true; challenge: Challenge }
  | { ok: false; reason: "unknown-id" | "load-failed" };

/**
 * Loads a challenge content module on-demand and merges it with metadata.
 * Returns a typed LoadChallengeResult indicating success or failure reason.
 */
export async function loadChallenge(id: string): Promise<LoadChallengeResult> {
  const meta = getChallengeMetadata(id);
  const loader = CHALLENGE_LOADERS[id];
  if (!meta || !loader) {
    return { ok: false, reason: "unknown-id" };
  }

  try {
    const mod = await loader();
    return {
      ok: true,
      challenge: {
        ...meta,
        ...mod.default,
      },
    };
  } catch {
    return { ok: false, reason: "load-failed" };
  }
}

/**
 * Loads all challenges. Useful for test suites and offline static verification.
 * Used in tests/baseline-snapshots.test.ts and tests/challenges.test.ts.
 */
export async function loadAllChallenges(): Promise<Challenge[]> {
  const results = await Promise.all(
    CHALLENGES.map((meta) => loadChallenge(meta.id))
  );
  return results
    .filter((r): r is { ok: true; challenge: Challenge } => r.ok)
    .map((r) => r.challenge);
}

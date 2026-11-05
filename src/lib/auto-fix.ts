import type { A11yNode, AxeFinding } from "@/types/a11y";
import { setAttributeInSource, removeAttributeFromSource } from "./mutate-html";

const AUTO_FIXABLE_RULE_IDS = [
  "positive-tabindex",
  "aria-hidden-focusable",
  "img-missing-alt",
] as const;

export type AutoFixableRuleId = (typeof AUTO_FIXABLE_RULE_IDS)[number];

export function isAutoFixable(ruleId: string): ruleId is AutoFixableRuleId {
  return (AUTO_FIXABLE_RULE_IDS as readonly string[]).includes(ruleId);
}

export type ImgAltFixMode = "informative" | "decorative" | "use-caption";

export interface FixPreviewOptions {
  mode?: ImgAltFixMode;
  hasVisibleCaption?: boolean;
}

export interface FixPreviewResult {
  beforeTag: string;
  afterTag: string;
  note?: string;
}

export interface ApplyAutoFixOptions {
  mode?: ImgAltFixMode;
}

export interface AutoFixResult {
  html: string;
  caretOffset?: number;
}

export function computeFixPreview(
  finding: AxeFinding,
  optionsOrHasCaption: boolean | FixPreviewOptions = false
): FixPreviewResult | null {
  if (!isAutoFixable(finding.id)) return null;

  const hasVisibleCaption =
    typeof optionsOrHasCaption === "boolean"
      ? optionsOrHasCaption
      : Boolean(optionsOrHasCaption.hasVisibleCaption);

  const mode: ImgAltFixMode =
    typeof optionsOrHasCaption === "object" && optionsOrHasCaption.mode
      ? optionsOrHasCaption.mode
      : hasVisibleCaption
        ? "use-caption"
        : "informative";

  const htmlSnippet = finding.nodes[0]?.html ?? "";
  const match = htmlSnippet.match(
    /^<[a-zA-Z][a-zA-Z0-9-]*((?:\s+[^<>"']*(?:"[^"]*"|'[^']*')*)*?)\s*(\/?)>/
  );
  const beforeTag = match ? match[0] : htmlSnippet;

  let afterTag = beforeTag;
  let note: string | undefined;

  switch (finding.id) {
    case "positive-tabindex":
      afterTag = beforeTag.replace(
        /\btabindex\s*=\s*(?:"[^"]*"|'[^']*'|\d+)/i,
        'tabindex="0"'
      );
      break;

    case "aria-hidden-focusable":
      afterTag = beforeTag.replace(
        /\s+aria-hidden\s*=\s*(?:"[^"]*"|'[^']*'|\w+)/i,
        ""
      );
      break;

    case "img-missing-alt": {
      // Never write TODO into user code.
      // Both decorative and informative options insert alt=""
      const altValue = 'alt=""';
      if (/\s*\/>$/.test(beforeTag)) {
        afterTag = beforeTag.replace(/\s*\/>$/, ` ${altValue} />`);
      } else {
        afterTag = beforeTag.replace(/\s*>$/, ` ${altValue}>`);
      }

      if (mode === "informative") {
        note = "Describe what the image shows and why it's there.";
      } else if (mode === "use-caption") {
        note =
          "Nearby caption describes this image; empty alt prevents double announcement.";
      } else {
        note = "Marks image as decorative for assistive technologies.";
      }
      break;
    }
  }

  return { beforeTag, afterTag, ...(note ? { note } : {}) };
}

export function applyAutoFixToHtml(
  html: string,
  finding: AxeFinding,
  node: A11yNode,
  options?: ApplyAutoFixOptions
): AutoFixResult {
  if (!isAutoFixable(finding.id)) return { html };

  switch (finding.id) {
    case "positive-tabindex":
      return { html: setAttributeInSource(html, node, "tabindex", "0") };

    case "aria-hidden-focusable":
      return { html: removeAttributeFromSource(html, node, "aria-hidden") };

    case "img-missing-alt": {
      const mode = options?.mode ?? "informative";
      const fixedHtml = setAttributeInSource(html, node, "alt", "");

      if (mode === "informative") {
        // Place caret inside quotes: right after alt="
        const tagStart = node.sourceRange ? node.sourceRange[0] : 0;
        const altIndex = fixedHtml.indexOf('alt="', tagStart);
        const caretOffset =
          altIndex !== -1 ? altIndex + 'alt="'.length : undefined;
        return { html: fixedHtml, caretOffset };
      }

      return { html: fixedHtml };
    }
  }
}

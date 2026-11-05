import type { NameCalculationStep } from "@/types/a11y";

export interface AccessibleNameComputation {
  name: string;
  source: string;
  steps: NameCalculationStep[];
  hasAccessibleName: boolean;
}

function normalizeWhitespace(val: string): string {
  return val.replace(/\s+/g, " ").trim();
}

const ALLOWS_NAME_FROM_CONTENT = new Set([
  "button",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "p",
  "li",
  "summary",
  "label",
  "th",
  "td",
  "dt",
  "dd",
  "b",
  "strong",
  "em",
  "i",
]);

export function computeAccessibleName(
  element: Element,
  documentRef?: Document
): AccessibleNameComputation {
  const steps: NameCalculationStep[] = [];
  const doc = documentRef ?? element.ownerDocument;
  const tagName = element.tagName.toLowerCase();

  // 1. Hidden check
  const isAriaHidden = element.getAttribute("aria-hidden") === "true";
  steps.push({
    step: "1. Hidden Check",
    description:
      "Evaluates if aria-hidden='true' hides the node from assistive technology.",
    applied: isAriaHidden,
    value: isAriaHidden ? "(Hidden via aria-hidden)" : undefined,
  });

  if (isAriaHidden) {
    return {
      name: "",
      source: "hidden",
      steps,
      hasAccessibleName: false,
    };
  }

  // 2. aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const idList = labelledBy.trim().split(/\s+/);
    const resolvedTexts: string[] = [];
    for (const id of idList) {
      const referenced = doc?.getElementById(id);
      if (referenced && referenced.textContent) {
        const text = normalizeWhitespace(referenced.textContent);
        if (text) resolvedTexts.push(text);
      }
    }
    const resolvedName = normalizeWhitespace(resolvedTexts.join(" "));
    const applied = resolvedName.length > 0;
    steps.push({
      step: "2. aria-labelledby",
      description:
        "References another element's ID to compute the primary accessible name.",
      applied,
      value: applied ? resolvedName : undefined,
    });
    if (applied) {
      return {
        name: resolvedName,
        source: "aria-labelledby",
        steps,
        hasAccessibleName: true,
      };
    }
  } else {
    steps.push({
      step: "2. aria-labelledby",
      description:
        "References another element's ID to compute the primary accessible name.",
      applied: false,
    });
  }

  // 3. aria-label
  const rawAriaLabel = element.getAttribute("aria-label");
  const ariaLabel = rawAriaLabel ? normalizeWhitespace(rawAriaLabel) : "";
  if (ariaLabel.length > 0) {
    steps.push({
      step: "3. aria-label",
      description:
        "Direct accessible name override using aria-label attribute.",
      applied: true,
      value: ariaLabel,
    });
    return {
      name: ariaLabel,
      source: "aria-label",
      steps,
      hasAccessibleName: true,
    };
  }
  steps.push({
    step: "3. aria-label",
    description: "Direct accessible name override using aria-label attribute.",
    applied: false,
  });

  // 4. Native markup label
  let nativeLabel: string | null = null;
  let nativeSource = "";

  if (["input", "textarea", "select"].includes(tagName)) {
    const elementId = element.getAttribute("id");
    if (elementId && doc) {
      const labelEl = doc.querySelector(`label[for="${elementId}"]`);
      if (labelEl && labelEl.textContent) {
        const text = normalizeWhitespace(labelEl.textContent);
        if (text) {
          nativeLabel = text;
          nativeSource = "<label for>";
        }
      }
    }
    if (!nativeLabel) {
      const parentLabel = element.closest("label");
      if (parentLabel && parentLabel.textContent) {
        const text = normalizeWhitespace(parentLabel.textContent);
        if (text) {
          nativeLabel = text;
          nativeSource = "enclosing <label>";
        }
      }
    }
  } else if (tagName === "img" || tagName === "area") {
    const alt = element.getAttribute("alt");
    if (alt !== null) {
      nativeLabel = normalizeWhitespace(alt);
      nativeSource = "alt attribute";
    }
  } else if (tagName === "svg") {
    const titleEl = element.querySelector("title");
    if (titleEl && titleEl.textContent) {
      const text = normalizeWhitespace(titleEl.textContent);
      if (text) {
        nativeLabel = text;
        nativeSource = "<title> element";
      }
    }
  }

  if (nativeLabel !== null && nativeLabel.length > 0) {
    steps.push({
      step: "4. Native Markup Label",
      description: `Derives name from HTML semantic tags (${nativeSource}).`,
      applied: true,
      value: nativeLabel,
    });
    return {
      name: nativeLabel,
      source: nativeSource,
      steps,
      hasAccessibleName: true,
    };
  }
  steps.push({
    step: "4. Native Markup Label",
    description:
      "Derives name from HTML semantic tags (<label>, alt, or <title>).",
    applied: false,
  });

  // 5. Subtree text content
  const role = element.getAttribute("role");
  const allowsContent =
    ALLOWS_NAME_FROM_CONTENT.has(tagName) ||
    (role &&
      ["button", "link", "tab", "menuitem", "checkbox", "radio"].includes(
        role
      ));

  if (allowsContent && element.textContent) {
    const textContent = normalizeWhitespace(element.textContent);
    if (textContent.length > 0) {
      steps.push({
        step: "5. Subtree Text Content",
        description:
          "Extracts accumulated text from element and its descendant nodes.",
        applied: true,
        value: textContent,
      });
      return {
        name: textContent,
        source: "subtree text",
        steps,
        hasAccessibleName: true,
      };
    }
  }
  steps.push({
    step: "5. Subtree Text Content",
    description:
      "Extracts accumulated text from element and its descendant nodes.",
    applied: false,
  });

  // 6. Placeholder attribute
  const rawPlaceholder = element.getAttribute("placeholder");
  const placeholder = rawPlaceholder ? normalizeWhitespace(rawPlaceholder) : "";
  if (placeholder.length > 0) {
    steps.push({
      step: "6. Placeholder Attribute",
      description:
        "Fallback name from placeholder (low contrast, disappears upon input).",
      applied: true,
      value: placeholder,
    });
    return {
      name: placeholder,
      source: "placeholder (fallback)",
      steps,
      hasAccessibleName: true,
    };
  }
  steps.push({
    step: "6. Placeholder Attribute",
    description:
      "Fallback name from placeholder (low contrast, disappears upon input).",
    applied: false,
  });

  // 7. Title attribute
  const rawTitle = element.getAttribute("title");
  const title = rawTitle ? normalizeWhitespace(rawTitle) : "";
  if (title.length > 0) {
    steps.push({
      step: "7. Title Attribute",
      description:
        "Lowest-priority advisory fallback name from HTML title attribute.",
      applied: true,
      value: title,
    });
    return {
      name: title,
      source: "title (fallback)",
      steps,
      hasAccessibleName: true,
    };
  }
  steps.push({
    step: "7. Title Attribute",
    description:
      "Lowest-priority advisory fallback name from HTML title attribute.",
    applied: false,
  });

  // 8. Empty state
  steps.push({
    step: "8. No Accessible Name",
    description:
      "None of the standard accessible name computation steps yielded text.",
    applied: true,
    value: "— No accessible name —",
  });

  return {
    name: "",
    source: "none",
    steps,
    hasAccessibleName: false,
  };
}

import type { NameCalculationStep } from "@/types/a11y";

export interface AccessibleNameComputation {
  name: string;
  source: string;
  steps: NameCalculationStep[];
  hasAccessibleName: boolean;
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
      if (referenced) {
        const text = referenced.textContent?.trim();
        if (text) resolvedTexts.push(text);
      }
    }
    const resolvedName = resolvedTexts.join(" ").trim();
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
  const ariaLabel = element.getAttribute("aria-label")?.trim();
  if (ariaLabel && ariaLabel.length > 0) {
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
      if (labelEl && labelEl.textContent?.trim()) {
        nativeLabel = labelEl.textContent.trim();
        nativeSource = "<label for>";
      }
    }
    if (!nativeLabel) {
      const parentLabel = element.closest("label");
      if (parentLabel && parentLabel.textContent?.trim()) {
        nativeLabel = parentLabel.textContent.trim();
        nativeSource = "enclosing <label>";
      }
    }
  } else if (tagName === "img" || tagName === "area") {
    const alt = element.getAttribute("alt");
    if (alt !== null) {
      nativeLabel = alt.trim();
      nativeSource = "alt attribute";
    }
  } else if (tagName === "svg") {
    const titleEl = element.querySelector("title");
    if (titleEl && titleEl.textContent?.trim()) {
      nativeLabel = titleEl.textContent.trim();
      nativeSource = "<title> element";
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

  if (allowsContent) {
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0) {
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
  const placeholder = element.getAttribute("placeholder")?.trim();
  if (placeholder && placeholder.length > 0) {
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
  const title = element.getAttribute("title")?.trim();
  if (title && title.length > 0) {
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

import type { AriaAttributeValidity } from "@/types/a11y";

export function getImplicitRole(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute("type")?.toLowerCase();

  switch (tag) {
    case "button":
      return "button";
    case "a":
    case "area":
      return element.hasAttribute("href") ? "link" : "generic";
    case "input":
      if (
        type === "button" ||
        type === "image" ||
        type === "reset" ||
        type === "submit"
      ) {
        return "button";
      }
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "search") return "searchbox";
      return "textbox";
    case "textarea":
      return "textbox";
    case "select":
      return element.hasAttribute("multiple") ||
        Number(element.getAttribute("size")) > 1
        ? "listbox"
        : "combobox";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    case "ul":
    case "ol":
      return "list";
    case "li":
      return "listitem";
    case "nav":
      return "navigation";
    case "main":
      return "main";
    case "header":
      return "banner";
    case "footer":
      return "contentinfo";
    case "aside":
      return "complementary";
    case "form":
      return element.hasAttribute("aria-label") ||
        element.hasAttribute("aria-labelledby")
        ? "form"
        : "generic";
    case "section":
      return element.hasAttribute("aria-label") ||
        element.hasAttribute("aria-labelledby")
        ? "region"
        : "generic";
    case "article":
      return "article";
    case "dialog":
      return "dialog";
    case "table":
      return "table";
    case "tr":
      return "row";
    case "th":
      return "columnheader";
    case "td":
      return "cell";
    case "img":
      return element.getAttribute("alt") === "" ? "presentation" : "img";
    default:
      return "generic";
  }
}

export function getComputedRole(element: Element): {
  implicitRole: string;
  explicitRole?: string;
  computedRole: string;
} {
  const implicitRole = getImplicitRole(element);
  const explicitRole = element.getAttribute("role")?.trim();
  const computedRole =
    explicitRole && explicitRole.length > 0 ? explicitRole : implicitRole;
  return {
    implicitRole,
    explicitRole: explicitRole || undefined,
    computedRole,
  };
}

const GLOBAL_ARIA_ATTRIBUTES = new Set([
  "aria-atomic",
  "aria-busy",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-description",
  "aria-details",
  "aria-disabled",
  "aria-dropeffect",
  "aria-flowto",
  "aria-grabbed",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-live",
  "aria-owns",
  "aria-relevant",
  "aria-roledescription",
]);

const ROLE_ALLOWED_ARIA: Record<string, string[]> = {
  button: ["aria-expanded", "aria-pressed"],
  checkbox: ["aria-checked", "aria-required", "aria-readonly"],
  combobox: [
    "aria-autocomplete",
    "aria-expanded",
    "aria-required",
    "aria-activedescendant",
  ],
  dialog: ["aria-modal"],
  alertdialog: ["aria-modal"],
  heading: ["aria-level"],
  link: ["aria-expanded"],
  progressbar: [
    "aria-valuenow",
    "aria-valuemin",
    "aria-valuemax",
    "aria-valuetext",
  ],
  slider: [
    "aria-valuenow",
    "aria-valuemin",
    "aria-valuemax",
    "aria-valuetext",
    "aria-orientation",
  ],
  spinbutton: [
    "aria-valuenow",
    "aria-valuemin",
    "aria-valuemax",
    "aria-valuetext",
    "aria-required",
    "aria-readonly",
  ],
  tab: ["aria-selected", "aria-controls", "aria-expanded"],
  tablist: ["aria-orientation", "aria-multiselectable"],
  tabpanel: ["aria-labelledby"],
  textbox: [
    "aria-activedescendant",
    "aria-autocomplete",
    "aria-multiline",
    "aria-placeholder",
    "aria-readonly",
    "aria-required",
  ],
};

export function validateAriaAttribute(
  attribute: string,
  value: string,
  role: string
): AriaAttributeValidity {
  const attr = attribute.toLowerCase();

  if (!attr.startsWith("aria-")) {
    return {
      attribute,
      value,
      status: "unknown",
      explanation: "Attribute is not a recognized WAI-ARIA attribute.",
    };
  }

  const isGlobal = GLOBAL_ARIA_ATTRIBUTES.has(attr);
  const roleAllowed = ROLE_ALLOWED_ARIA[role] ?? [];
  const isAllowedOnRole = isGlobal || roleAllowed.includes(attr);

  if (!isAllowedOnRole) {
    return {
      attribute,
      value,
      status: "not-allowed",
      explanation: `${attr} is not supported on elements with role='${role}'. Assistive technology will ignore it.`,
    };
  }

  // Value validation
  if (
    [
      "aria-hidden",
      "aria-expanded",
      "aria-disabled",
      "aria-selected",
      "aria-busy",
      "aria-modal",
      "aria-required",
    ].includes(attr)
  ) {
    if (value !== "true" && value !== "false") {
      return {
        attribute,
        value,
        status: "invalid-value",
        explanation: `${attr} requires a boolean value ('true' or 'false'). Got '${value}'.`,
      };
    }
  }

  if (attr === "aria-checked" || attr === "aria-pressed") {
    if (value !== "true" && value !== "false" && value !== "mixed") {
      return {
        attribute,
        value,
        status: "invalid-value",
        explanation: `${attr} requires 'true', 'false', or 'mixed'. Got '${value}'.`,
      };
    }
  }

  if (attr === "aria-invalid") {
    if (
      value !== "true" &&
      value !== "false" &&
      value !== "grammar" &&
      value !== "spelling"
    ) {
      return {
        attribute,
        value,
        status: "invalid-value",
        explanation: `${attr} requires 'true', 'false', 'grammar', or 'spelling'. Got '${value}'.`,
      };
    }
  }

  if (attr === "aria-live") {
    if (value !== "off" && value !== "polite" && value !== "assertive") {
      return {
        attribute,
        value,
        status: "invalid-value",
        explanation: `${attr} requires 'off', 'polite', or 'assertive'. Got '${value}'.`,
      };
    }
  }

  return {
    attribute,
    value,
    status: "valid",
    explanation: `${attr}='${value}' is valid and supported on role='${role}'.`,
  };
}

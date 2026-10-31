import type { AriaAttributeValidity } from "@/types/a11y";

function getImplicitRole(element: Element): string {
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

export function getAllowedAriaAttributes(role: string): string[] {
  const roleAllowed = ROLE_ALLOWED_ARIA[role] ?? [];
  const combined = Array.from(
    new Set([...Array.from(GLOBAL_ARIA_ATTRIBUTES), ...roleAllowed])
  );
  return combined.sort();
}

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

export const ROLES: readonly { name: string; description: string }[] = [
  {
    name: "alert",
    description: "Message with important, time-sensitive information",
  },
  { name: "alertdialog", description: "Dialog with an alert message" },
  { name: "application", description: "Structure with its own keyboard model" },
  { name: "article", description: "Self-contained composition in a document" },
  { name: "banner", description: "Prime heading or internal title of a page" },
  { name: "button", description: "Input that triggers an action or script" },
  {
    name: "checkbox",
    description: "Checkable input with true/false/mixed states",
  },
  {
    name: "combobox",
    description: "Composite widget of single-line textbox and popup",
  },
  { name: "dialog", description: "Application window or modal dialog" },
  { name: "feed", description: "Scrollable list of articles" },
  { name: "form", description: "Landmark group of form-associated elements" },
  { name: "grid", description: "Interactive widget containing tabular items" },
  { name: "heading", description: "Heading for a section of the page" },
  {
    name: "link",
    description: "Interactive reference to an internal or external resource",
  },
  {
    name: "listbox",
    description: "Widget that allows selecting one or more items",
  },
  { name: "main", description: "Main content of the document" },
  { name: "menu", description: "Widget that offers a list of choices" },
  {
    name: "menubar",
    description: "Menu that usually remains visible and horizontal",
  },
  {
    name: "menuitem",
    description: "Option in a set of choices contained by a menu",
  },
  { name: "navigation", description: "Landmark containing navigational links" },
  {
    name: "progressbar",
    description: "Element that displays progress status for long tasks",
  },
  { name: "radio", description: "Checkable input in a group of radio buttons" },
  { name: "radiogroup", description: "Group of radio buttons" },
  { name: "region", description: "Generic landmark section of a document" },
  {
    name: "search",
    description: "Landmark for searching the document or site",
  },
  {
    name: "slider",
    description: "Input where the user selects a value from a given range",
  },
  {
    name: "spinbutton",
    description: "Form of range that expects an input from a range of values",
  },
  {
    name: "status",
    description:
      "Container for advisory information not important enough for alert",
  },
  {
    name: "switch",
    description: "Type of checkbox that represents on/off values",
  },
  {
    name: "tab",
    description:
      "Grouping label providing a mechanism for selecting a tabpanel",
  },
  { name: "tablist", description: "List of tab elements" },
  {
    name: "tabpanel",
    description: "Container for the resources associated with a tab",
  },
  {
    name: "textbox",
    description: "Input that allows the input of free-form text",
  },
  {
    name: "timer",
    description: "Numerical counter which indicates an amount of elapsed time",
  },
  {
    name: "toolbar",
    description: "Collection of commonly used function buttons or controls",
  },
  {
    name: "tooltip",
    description: "Contextual popup displaying a description for an element",
  },
];

export const ARIA_ENUMS: Record<string, readonly string[]> = {
  "aria-hidden": ["true", "false"],
  "aria-expanded": ["true", "false"],
  "aria-disabled": ["true", "false"],
  "aria-selected": ["true", "false"],
  "aria-busy": ["true", "false"],
  "aria-modal": ["true", "false"],
  "aria-required": ["true", "false"],
  "aria-checked": ["true", "false", "mixed"],
  "aria-pressed": ["true", "false", "mixed"],
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-live": ["off", "polite", "assertive"],
  "aria-current": ["page", "step", "location", "date", "time", "true", "false"],
  "aria-autocomplete": ["none", "inline", "list", "both"],
  "aria-orientation": ["horizontal", "vertical"],
  "aria-haspopup": [
    "false",
    "true",
    "menu",
    "listbox",
    "tree",
    "grid",
    "dialog",
  ],
  "aria-sort": ["none", "ascending", "descending", "other"],
};

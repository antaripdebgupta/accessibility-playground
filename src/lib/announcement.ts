import type { A11yNode } from "@/types/a11y";

export interface AnnouncementPart {
  type: "name" | "role" | "state";
  label: string;
  value: string;
}

export interface AnnouncementResult {
  text: string;
  parts: AnnouncementPart[];
}

const STATE_PHRASES: Array<{
  match: (attrs: Record<string, string>) => boolean;
  phrase: (attrs: Record<string, string>) => string;
  attribute: string;
}> = [
  {
    match: (a) => a["aria-checked"] === "true",
    phrase: () => "checked",
    attribute: "aria-checked=true",
  },
  {
    match: (a) => a["aria-checked"] === "false",
    phrase: () => "not checked",
    attribute: "aria-checked=false",
  },
  {
    match: (a) => a["aria-checked"] === "mixed",
    phrase: () => "partially checked",
    attribute: "aria-checked=mixed",
  },
  {
    match: (a) => a["aria-expanded"] === "true",
    phrase: () => "expanded",
    attribute: "aria-expanded=true",
  },
  {
    match: (a) => a["aria-expanded"] === "false",
    phrase: () => "collapsed",
    attribute: "aria-expanded=false",
  },
  {
    match: (a) => a["aria-selected"] === "true",
    phrase: () => "selected",
    attribute: "aria-selected=true",
  },
  {
    match: (a) => a["aria-pressed"] === "true",
    phrase: () => "pressed",
    attribute: "aria-pressed=true",
  },
  {
    match: (a) => a["aria-disabled"] === "true" || "disabled" in a,
    phrase: () => "dimmed",
    attribute: "disabled / aria-disabled",
  },
  {
    match: (a) => a["aria-invalid"] === "true",
    phrase: () => "invalid entry",
    attribute: "aria-invalid=true",
  },
  {
    match: (a) => a["aria-required"] === "true" || "required" in a,
    phrase: () => "required",
    attribute: "required / aria-required",
  },
  {
    match: (a) => a["aria-current"] === "page",
    phrase: () => "current page",
    attribute: "aria-current=page",
  },
];

export function computeAnnouncement(node: A11yNode): string {
  const parts: string[] = [];
  if (node.hasAccessibleName && node.accessibleName.trim()) {
    parts.push(node.accessibleName.trim());
  }
  parts.push(node.role);

  const allAttrs = { ...node.attributes, ...node.ariaAttributes };
  for (const { match, phrase } of STATE_PHRASES) {
    if (match(allAttrs)) parts.push(phrase(allAttrs));
  }

  return parts.join(", ");
}

export function computeAnnouncementDetails(node: A11yNode): AnnouncementResult {
  const parts: AnnouncementPart[] = [];
  if (node.hasAccessibleName && node.accessibleName.trim()) {
    parts.push({
      type: "name",
      label: "Accessible Name",
      value: node.accessibleName.trim(),
    });
  }
  parts.push({
    type: "role",
    label: "Role",
    value: node.role,
  });

  const allAttrs = { ...node.attributes, ...node.ariaAttributes };
  for (const { match, phrase, attribute } of STATE_PHRASES) {
    if (match(allAttrs)) {
      parts.push({
        type: "state",
        label: `State (${attribute})`,
        value: phrase(allAttrs),
      });
    }
  }

  return {
    text: parts.map((p) => p.value).join(", "),
    parts,
  };
}

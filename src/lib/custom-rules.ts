import type { A11yNode, AxeFinding, AxeImpactLevel } from "@/types/a11y";
import { validateAriaAttribute } from "./aria-explorer";

const NATURAL_FORM_CONTROLS = new Set(["input", "textarea", "select"]);
const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "tab",
  "checkbox",
  "radio",
  "switch",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "combobox",
  "searchbox",
  "spinbutton",
  "slider",
]);

function isNaturalFocusable(node: A11yNode): boolean {
  const tag = node.tagName.toLowerCase();
  const attrs = node.attributes || {};
  if (attrs["disabled"] !== undefined) return false;
  if (tag === "button" || tag === "select" || tag === "textarea") return true;
  if (tag === "input" && attrs["type"] !== "hidden") return true;
  if (tag === "a" && attrs["href"] !== undefined) return true;
  if (tag === "summary") return true;
  return false;
}

function isFocusable(node: A11yNode): boolean {
  const attrs = node.attributes || {};
  if (attrs["disabled"] !== undefined) return false;
  if (attrs["hidden"] !== undefined || attrs["inert"] !== undefined)
    return false;
  if (attrs["aria-hidden"] === "true") return false;

  const rawTab = attrs["tabindex"];
  if (rawTab !== undefined && rawTab !== null && rawTab.trim() !== "") {
    const parsed = parseInt(rawTab.trim(), 10);
    return !isNaN(parsed) && parsed >= 0;
  }
  return isNaturalFocusable(node);
}

function hasFocusableDescendant(node: A11yNode): boolean {
  for (const child of node.children) {
    if (isFocusable(child) || hasFocusableDescendant(child)) {
      return true;
    }
  }
  return false;
}

function flattenTree(root: A11yNode): A11yNode[] {
  const list: A11yNode[] = [];
  function traverse(n: A11yNode) {
    if (n.tagName !== "fragment") {
      list.push(n);
    }
    for (const child of n.children) {
      traverse(child);
    }
  }
  traverse(root);
  return list;
}

function getNodeSnippet(node: A11yNode): string {
  const attrs = node.attributes || {};
  const attrStrings = Object.entries(attrs)
    .filter(([k]) => k !== "data-a11y-id")
    .map(([k, v]) => `${k}="${v}"`);
  const attrPart = attrStrings.length > 0 ? ` ${attrStrings.join(" ")}` : "";
  return `<${node.tagName}${attrPart}>`;
}

function makeFinding(params: {
  id: string;
  impact: AxeImpactLevel;
  help: string;
  description: string;
  helpUrl: string;
  wcag: string[];
  fix: string;
  node: A11yNode;
  failureSummary?: string;
}): AxeFinding {
  return {
    id: params.id,
    impact: params.impact,
    help: params.help,
    description: params.description,
    helpUrl: params.helpUrl,
    wcag: params.wcag,
    source: "playground",
    type: "violation",
    fix: params.fix,
    nodes: [
      {
        html: getNodeSnippet(params.node),
        target: [`[data-a11y-id="${params.node.id}"]`],
        targetId: params.node.id,
        failureSummary: params.failureSummary || params.description,
      },
    ],
  };
}

export function runCustomRules(
  root: A11yNode | null,
  css = ""
): readonly AxeFinding[] {
  if (!root) return [];

  const findings: AxeFinding[] = [];
  const nodes = flattenTree(root);

  // ID index for duplicate-id and broken-reference checks
  const idMap = new Map<string, A11yNode[]>();
  for (const n of nodes) {
    const rawId = n.attributes["id"]?.trim();
    if (rawId) {
      const existing = idMap.get(rawId) || [];
      existing.push(n);
      idMap.set(rawId, existing);
    }
  }

  // Heading order tracking
  const headings: Array<{ level: number; node: A11yNode }> = [];

  // Tablist containment tracking
  function isInsideTablist(target: A11yNode): boolean {
    function search(current: A11yNode): boolean {
      if (
        current.role === "tablist" ||
        current.attributes["role"] === "tablist"
      ) {
        return true;
      }
      return false;
    }
    // Check ancestors by path search
    function findPath(
      current: A11yNode,
      targetId: string,
      path: A11yNode[]
    ): boolean {
      if (current.id === targetId) return true;
      for (const child of current.children) {
        path.push(child);
        if (findPath(child, targetId, path)) return true;
        path.pop();
      }
      return false;
    }
    const path: A11yNode[] = [root!];
    if (findPath(root!, target.id, path)) {
      return path.some(
        (ancestor) => ancestor.id !== target.id && search(ancestor)
      );
    }
    return false;
  }

  for (const node of nodes) {
    const tag = node.tagName.toLowerCase();
    const attrs = node.attributes || {};
    const ariaAttrs = node.ariaAttributes || {};
    const isAriaHidden =
      attrs["aria-hidden"] === "true" || ariaAttrs["aria-hidden"] === "true";

    // 1. click-on-non-interactive (critical)
    const hasClick =
      attrs["onclick"] !== undefined ||
      attrs["onmousedown"] !== undefined ||
      attrs["onmouseup"] !== undefined ||
      attrs["onkeydown"] !== undefined ||
      node.inlineHandlers.some((h) =>
        ["onclick", "onmousedown", "onmouseup", "onkeydown"].includes(h)
      );

    const nonInteractiveTags = new Set([
      "div",
      "span",
      "li",
      "p",
      "td",
      "th",
      "tr",
      "article",
      "section",
      "header",
      "footer",
      "b",
      "i",
      "strong",
      "em",
    ]);

    if (
      hasClick &&
      nonInteractiveTags.has(tag) &&
      (!node.explicitRole || !INTERACTIVE_ROLES.has(node.explicitRole))
    ) {
      findings.push(
        makeFinding({
          id: "click-on-non-interactive",
          impact: "critical",
          help: "Click handler attached to non-interactive element",
          description: `Element <${tag}> has a click or keyboard handler but lacks an interactive semantic tag or role. Screen readers and keyboard users cannot interact with it as a control.`,
          helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
          wcag: ["4.1.2", "2.1.1"],
          fix: 'Replace with a native <button type="button"> or <a> element, or add role="button" with tabindex="0" and keyboard listeners for Enter/Space.',
          node,
        })
      );
    }

    // 2. interactive-role-not-focusable (critical)
    if (
      INTERACTIVE_ROLES.has(node.role) &&
      !isNaturalFocusable(node) &&
      !isAriaHidden
    ) {
      const rawTab = attrs["tabindex"];
      const hasTab = rawTab !== undefined && parseInt(rawTab, 10) >= 0;
      if (!hasTab) {
        findings.push(
          makeFinding({
            id: "interactive-role-not-focusable",
            impact: "critical",
            help: "Interactive role is not focusable by keyboard",
            description: `Element <${tag}> declares role="${node.role}" but does not have tabindex="0" or native keyboard focusability. Keyboard users cannot reach this control.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#keyboard",
            wcag: ["2.1.1", "4.1.2"],
            fix: 'Add tabindex="0" to include this element in the tab sequence, or use a native interactive HTML element like <button>.',
            node,
          })
        );
      }
    }

    // 3. link-as-button (serious)
    if (tag === "a") {
      const href = attrs["href"]?.trim();
      const hasJsHref =
        href === "#" ||
        (href !== undefined && href.toLowerCase().startsWith("javascript:"));
      const isButtonLike = hasJsHref || (hasClick && (!href || href === ""));
      if (isButtonLike) {
        findings.push(
          makeFinding({
            id: "link-as-button",
            impact: "serious",
            help: "Anchor element used as button",
            description: `Element <a href="${href || ""}"> behaves like an action button rather than a true navigation link. Links that perform actions instead of navigating confuse screen reader users.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Use a <button type="button"> for script-driven actions. If this is a real link, provide a valid URL in href.',
            node,
          })
        );
      }
    }

    // 4. input-placeholder-only (critical)
    if (NATURAL_FORM_CONTROLS.has(tag) && attrs["type"] !== "hidden") {
      const hasPlaceholder = Boolean(attrs["placeholder"]?.trim());
      const hasTitle = Boolean(attrs["title"]?.trim());
      const hasLabelFor =
        node.accessibleNameSource === "<label for>" ||
        node.accessibleNameSource === "label[for]";
      const hasAriaLabel = Boolean(attrs["aria-label"]?.trim());
      const hasAriaLabelledby = Boolean(attrs["aria-labelledby"]?.trim());

      const onlyPlaceholderOrTitle =
        (hasPlaceholder || hasTitle) &&
        !hasLabelFor &&
        !hasAriaLabel &&
        !hasAriaLabelledby &&
        (node.accessibleNameSource === "placeholder" ||
          node.accessibleNameSource === "title" ||
          !node.hasAccessibleName);

      if (onlyPlaceholderOrTitle) {
        findings.push(
          makeFinding({
            id: "input-placeholder-only",
            impact: "critical",
            help: "Form input labeled only by placeholder or title",
            description: `Form control <${tag}> relies solely on placeholder="${attrs["placeholder"] || ""}" or title for its accessible name. Placeholders disappear upon user input and lack required contrast.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
            wcag: ["1.3.1", "4.1.2", "3.3.2"],
            fix: 'Add a persistent <label for="input-id"> element or aria-label attribute. Do not rely on placeholder as the sole label.',
            node,
          })
        );
      }
    }

    // 5. input-no-label (critical)
    if (
      NATURAL_FORM_CONTROLS.has(tag) &&
      attrs["type"] !== "hidden" &&
      attrs["type"] !== "submit" &&
      attrs["type"] !== "button"
    ) {
      if (!node.hasAccessibleName || !node.accessibleName.trim()) {
        findings.push(
          makeFinding({
            id: "input-no-label",
            impact: "critical",
            help: "Form control has no accessible name",
            description: `Form control <${tag}> lacks any label. Assistive technology users will hear only the input type without knowing its purpose.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#labels-or-instructions",
            wcag: ["1.3.1", "3.3.2", "4.1.2"],
            fix: 'Add an associated <label for="..."> or an aria-label/aria-labelledby attribute.',
            node,
          })
        );
      }
    }

    // 6. img-missing-alt (critical)
    if (tag === "img" && attrs["alt"] === undefined) {
      findings.push(
        makeFinding({
          id: "img-missing-alt",
          impact: "critical",
          help: "Image is missing alt attribute",
          description: `Element <img src="${attrs["src"] || ""}"> has no alt attribute. Screen readers will read the file name or skip the image unpredictably.`,
          helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#non-text-content",
          wcag: ["1.1.1"],
          fix: 'Add alt="descriptive text" explaining the visual image, or alt="" if the image is decorative.',
          node,
        })
      );
    }

    // 7. empty-interactive-name (critical)
    const isInteractive =
      tag === "button" ||
      (tag === "a" && attrs["href"] !== undefined) ||
      node.role === "button" ||
      node.role === "link" ||
      node.role === "tab";

    if (isInteractive && !isAriaHidden) {
      if (!node.hasAccessibleName || !node.accessibleName.trim()) {
        findings.push(
          makeFinding({
            id: "empty-interactive-name",
            impact: "critical",
            help: "Interactive element has no accessible name",
            description: `Interactive <${tag} role="${node.role}"> has no text content, aria-label, or aria-labelledby. Users cannot tell what activating this control will do.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Provide text content inside the control or add aria-label="Action description".',
            node,
          })
        );
      }
    }

    // 8. positive-tabindex (serious)
    const rawTab = attrs["tabindex"];
    if (rawTab !== undefined && rawTab !== null && rawTab.trim() !== "") {
      const parsed = parseInt(rawTab.trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        findings.push(
          makeFinding({
            id: "positive-tabindex",
            impact: "serious",
            help: "Positive tabindex attribute disrupts natural tab order",
            description: `Element <${tag} tabindex="${parsed}"> has a positive tabindex. Positive values take precedence over natural document flow, causing unpredictable focus jumps.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#focus-order",
            wcag: ["2.4.3"],
            fix: 'Change to tabindex="0" to respect DOM order, or remove tabindex if the element is natively focusable.',
            node,
          })
        );
      }
    }

    // 9. aria-hidden-focusable (serious)
    if (isAriaHidden) {
      const selfFocusable = isFocusable(node);
      const childFocusable = hasFocusableDescendant(node);
      if (selfFocusable || childFocusable) {
        findings.push(
          makeFinding({
            id: "aria-hidden-focusable",
            impact: "serious",
            help: "aria-hidden element is or contains focusable element",
            description: `Element <${tag} aria-hidden="true"> contains or is a focusable element. Screen readers ignore aria-hidden content, but keyboard users can still tab into it, creating invisible focus traps.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Remove aria-hidden="true" or make the element non-focusable using tabindex="-1" or disabled.',
            node,
          })
        );
      }
    }

    // 10. heading-order (moderate)
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag.slice(1), 10);
      headings.push({ level, node });
    }

    // 11. dialog-no-name (serious)
    if (
      node.role === "dialog" ||
      node.role === "alertdialog" ||
      tag === "dialog"
    ) {
      const hasName =
        node.hasAccessibleName && node.accessibleName.trim().length > 0;
      const isModal =
        attrs["aria-modal"] === "true" || attrs["modal"] !== undefined;

      if (!hasName || !isModal) {
        const issues: string[] = [];
        if (!hasName)
          issues.push(
            "lacks an accessible name (use aria-labelledby or aria-label)"
          );
        if (!isModal) issues.push('missing aria-modal="true"');

        findings.push(
          makeFinding({
            id: "dialog-no-name",
            impact: "serious",
            help: "Dialog is missing accessible name or aria-modal",
            description: `Dialog <${tag} role="${node.role}"> ${issues.join(" and ")}.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: 'Add aria-labelledby pointing to the dialog header title and add aria-modal="true".',
            node,
          })
        );
      }
    }

    // 12. tab-pattern-incomplete (serious)
    if (node.role === "tab" || attrs["role"] === "tab") {
      const hasSelected =
        attrs["aria-selected"] !== undefined ||
        ariaAttrs["aria-selected"] !== undefined;
      const hasControls =
        attrs["aria-controls"] !== undefined ||
        ariaAttrs["aria-controls"] !== undefined;
      const inTablist = isInsideTablist(node);

      if (!hasSelected || !hasControls || !inTablist) {
        const missing: string[] = [];
        if (!hasSelected) missing.push("aria-selected");
        if (!hasControls) missing.push("aria-controls");
        if (!inTablist) missing.push("enclosing role='tablist'");

        findings.push(
          makeFinding({
            id: "tab-pattern-incomplete",
            impact: "serious",
            help: "Incomplete WAI-ARIA tab pattern",
            description: `Element <${tag} role="tab"> is missing required ARIA tab attributes or container: ${missing.join(", ")}.`,
            helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
            wcag: ["4.1.2"],
            fix: 'Ensure tabs are contained in a role="tablist", and declare aria-selected="true|false" and aria-controls="panel-id".',
            node,
          })
        );
      }
    }

    if (node.role === "tabpanel" || attrs["role"] === "tabpanel") {
      const hasLabel =
        attrs["aria-labelledby"] !== undefined ||
        ariaAttrs["aria-labelledby"] !== undefined ||
        node.hasAccessibleName;
      if (!hasLabel) {
        findings.push(
          makeFinding({
            id: "tab-pattern-incomplete",
            impact: "serious",
            help: "Tabpanel missing accessible label",
            description: `Element <${tag} role="tabpanel"> lacks aria-labelledby pointing to its corresponding tab.`,
            helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
            wcag: ["4.1.2"],
            fix: 'Add aria-labelledby="tab-id" linking this tabpanel to its controlling tab.',
            node,
          })
        );
      }
    }

    // 13. duplicate-id and broken reference checks (serious)
    // Reference check
    const referenceAttributes = [
      "for",
      "aria-labelledby",
      "aria-describedby",
      "aria-controls",
    ];
    for (const refAttr of referenceAttributes) {
      const val = attrs[refAttr];
      if (val) {
        const targetIds = val.split(/\s+/).filter(Boolean);
        for (const tId of targetIds) {
          if (!idMap.has(tId)) {
            findings.push(
              makeFinding({
                id: "duplicate-id",
                impact: "serious",
                help: `Broken ${refAttr} ID reference`,
                description: `Element <${tag}> references id="${tId}" via ${refAttr}, but no element with id="${tId}" exists in the document.`,
                helpUrl:
                  "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
                wcag: ["1.3.1", "4.1.2"],
                fix: `Create an element with id="${tId}" or update the ${refAttr} attribute to reference an existing element.`,
                node,
              })
            );
          }
        }
      }
    }

    // 14. invalid-aria (serious)
    for (const [attrName, attrValue] of Object.entries(ariaAttrs)) {
      const validity = validateAriaAttribute(attrName, attrValue, node.role);
      if (
        validity.status === "not-allowed" ||
        validity.status === "invalid-value"
      ) {
        findings.push(
          makeFinding({
            id: "invalid-aria",
            impact: "serious",
            help: `Invalid ARIA: ${attrName}`,
            description: validity.explanation,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#name-role-value",
            wcag: ["4.1.2"],
            fix: `Use valid WAI-ARIA attributes and value types compatible with role="${node.role}".`,
            node,
          })
        );
      }
    }
  }

  // Check duplicate IDs
  for (const [idValue, idNodes] of idMap.entries()) {
    if (idNodes.length > 1) {
      for (const node of idNodes) {
        findings.push(
          makeFinding({
            id: "duplicate-id",
            impact: "serious",
            help: `Duplicate id="${idValue}" attribute`,
            description: `The id="${idValue}" is used on multiple elements in this document. IDs must be unique to avoid broken form labels and ARIA references.`,
            helpUrl:
              "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
            wcag: ["1.3.1", "4.1.2"],
            fix: `Ensure every element has a unique id attribute value across the document.`,
            node,
          })
        );
      }
    }
  }

  // Heading order check (moderate)
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1]!;
    const curr = headings[i]!;
    if (curr.level > prev.level + 1) {
      findings.push(
        makeFinding({
          id: "heading-order",
          impact: "moderate",
          help: "Skipped heading level in document structure",
          description: `Heading <h${curr.level}> follows <h${prev.level}>, skipping level <h${prev.level + 1}>. Screen reader users rely on consistent heading hierarchy for document navigation.`,
          helpUrl:
            "https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships",
          wcag: ["1.3.1"],
          fix: `Change <h${curr.level}> to <h${prev.level + 1}>, and adjust font sizes with CSS instead of choosing heading tags for appearance.`,
          node: curr.node,
        })
      );
    }
  }

  // 15. outline-removed (serious)
  if (css) {
    const hasOutlineNone = /outline\s*:\s*(none|0\b)/i.test(css);
    const hasFocusVisibleReplacement =
      /:focus(-visible)?\s*\{[^}]*(outline|box-shadow)\s*:\s*(?!none|0\b)[^;]+;/i.test(
        css
      );

    if (hasOutlineNone && !hasFocusVisibleReplacement) {
      const focusableNode = nodes.find(isFocusable) || nodes[0];
      if (focusableNode) {
        findings.push(
          makeFinding({
            id: "outline-removed",
            impact: "serious",
            help: "Focus outline removed without replacement style",
            description: `CSS removes default focus outlines (outline: none or 0) without defining a visible replacement :focus-visible style. Keyboard users will not be able to see which element is focused.`,
            helpUrl: "https://www.w3.org/WAI/WCAG22/quickref/#focus-appearance",
            wcag: ["2.4.7", "2.4.11"],
            fix: "Provide a visible :focus-visible indicator (e.g. outline: 2px solid #1d4ed8; outline-offset: 2px;).",
            node: focusableNode,
          })
        );
      }
    }
  }

  return findings;
}

import type { A11yNode, FocusOrderElement, FocusFinding } from "@/types/a11y";

const NATURAL_FOCUSABLE_TAGS = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "summary",
]);

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

export interface ComputedFocusOrder {
  readonly sequence: readonly FocusOrderElement[];
  readonly allFocusable: readonly FocusOrderElement[];
  readonly findings: readonly FocusFinding[];
}

export function computeFocusOrder(root: A11yNode | null): ComputedFocusOrder {
  if (!root) {
    return { sequence: [], allFocusable: [], findings: [] };
  }

  const collected: Array<{
    node: A11yNode;
    tabIndex: number;
    isNatural: boolean;
    domIndex: number;
  }> = [];

  const findings: FocusFinding[] = [];
  let domCounter = 0;

  function walk(node: A11yNode, ancestorHiddenOrInert = false) {
    if (node.tagName !== "fragment") {
      domCounter += 1;
      const currentDomIndex = domCounter;

      const attrs = node.attributes || {};
      const ariaAttrs = node.ariaAttributes || {};

      const isAriaHidden =
        attrs["aria-hidden"] === "true" || ariaAttrs["aria-hidden"] === "true";
      const isHidden = attrs["hidden"] !== undefined;
      const isInert = attrs["inert"] !== undefined;
      const isDisabled = attrs["disabled"] !== undefined;

      const isEffectivelyHiddenOrInert =
        ancestorHiddenOrInert || isAriaHidden || isHidden || isInert;

      // An <a> is naturally focusable only if it has an href attribute
      const isAnchorWithHref =
        node.tagName === "a" && attrs["href"] !== undefined;
      const isNatural =
        (NATURAL_FOCUSABLE_TAGS.has(node.tagName) || isAnchorWithHref) &&
        !isDisabled;

      // Check tabindex from attributes
      const rawTabIndex = attrs["tabindex"];
      let parsedTabIndex: number | null = null;
      if (
        rawTabIndex !== undefined &&
        rawTabIndex !== null &&
        rawTabIndex.trim() !== ""
      ) {
        const parsed = parseInt(rawTabIndex.trim(), 10);
        if (!isNaN(parsed)) {
          parsedTabIndex = parsed;
        }
      }

      // If hidden/inert/disabled, element cannot receive focus
      let tabIndex: number | null = null;
      if (
        !isEffectivelyHiddenOrInert &&
        !isDisabled &&
        attrs["type"] !== "hidden"
      ) {
        if (parsedTabIndex !== null) {
          tabIndex = parsedTabIndex;
        } else if (isNatural) {
          tabIndex = 0;
        }
      }

      // Check for interactive role without keyboard accessibility
      if (
        INTERACTIVE_ROLES.has(node.role) &&
        !isNatural &&
        (tabIndex === null || tabIndex < 0) &&
        !isEffectivelyHiddenOrInert
      ) {
        findings.push({
          id: `unreachable-role-${node.id}`,
          title: `Role "${node.role}" is unreachable by keyboard`,
          impact: "critical",
          description: `Element <${node.tagName}> has role="${node.role}" but lacks tabindex="0" or native keyboard focusability. Keyboard users cannot activate it.`,
          targetId: node.id,
          htmlSnippet: `<${node.tagName} role="${node.role}">`,
        });
      }

      // Check for positive tabindex
      if (parsedTabIndex !== null && parsedTabIndex > 0) {
        findings.push({
          id: `positive-tabindex-${node.id}`,
          title: `Positive tabindex="${parsedTabIndex}" disrupts natural tab order`,
          impact: "serious",
          description: `Elements with positive tabindex navigate ahead of natural document order. This creates unpredictable jumps for keyboard users. Use tabindex="0" instead.`,
          targetId: node.id,
          htmlSnippet: `<${node.tagName} tabindex="${parsedTabIndex}">`,
        });
      }

      // If focusable, check for missing accessible name
      if (tabIndex !== null && !isEffectivelyHiddenOrInert) {
        if (!node.hasAccessibleName || !node.accessibleName.trim()) {
          findings.push({
            id: `unnamed-control-${node.id}`,
            title: `Focusable <${node.tagName}> has no accessible name`,
            impact: "critical",
            description: `Screen reader users landing on this control via keyboard will hear only its role without knowing what it does. Provide visible text, aria-label, or aria-labelledby.`,
            targetId: node.id,
            htmlSnippet: `<${node.tagName}>`,
          });
        }

        collected.push({
          node,
          tabIndex,
          isNatural,
          domIndex: currentDomIndex,
        });
      }

      for (const child of node.children) {
        walk(child, isEffectivelyHiddenOrInert);
      }
    } else {
      for (const child of node.children) {
        walk(child, ancestorHiddenOrInert);
      }
    }
  }

  walk(root);

  // Split into sequential navigation (tabIndex >= 0) and programmatic-only (tabIndex < 0)
  const sequential = collected.filter((item) => item.tabIndex >= 0);
  const positive = sequential.filter((item) => item.tabIndex > 0);
  const zero = sequential.filter((item) => item.tabIndex === 0);

  // Positive tabindexes are sorted ascending by tabIndex value, then by DOM order
  positive.sort((a, b) => {
    if (a.tabIndex !== b.tabIndex) {
      return a.tabIndex - b.tabIndex;
    }
    return a.domIndex - b.domIndex;
  });

  // Zero tabindexes are ordered strictly by DOM order
  zero.sort((a, b) => a.domIndex - b.domIndex);

  const finalSequenceList = [...positive, ...zero];

  const sequenceElements: FocusOrderElement[] = finalSequenceList.map(
    (item, index) => ({
      id: item.node.id,
      tagName: item.node.tagName,
      role: item.node.role,
      accessibleName: item.node.accessibleName,
      tabIndex: item.tabIndex,
      isNaturalFocusable: item.isNatural,
      orderIndex: index + 1,
      inTabSequence: true,
      htmlSnippet: `<${item.node.tagName}${
        item.node.role ? ` role="${item.node.role}"` : ""
      }${item.tabIndex !== 0 ? ` tabindex="${item.tabIndex}"` : ""}>`,
    })
  );

  const allElements: FocusOrderElement[] = collected.map((item) => {
    const seqIndex = finalSequenceList.findIndex(
      (s) => s.node.id === item.node.id
    );
    return {
      id: item.node.id,
      tagName: item.node.tagName,
      role: item.node.role,
      accessibleName: item.node.accessibleName,
      tabIndex: item.tabIndex,
      isNaturalFocusable: item.isNatural,
      orderIndex: seqIndex >= 0 ? seqIndex + 1 : -1,
      inTabSequence: item.tabIndex >= 0,
      htmlSnippet: `<${item.node.tagName}>`,
    };
  });

  return {
    sequence: sequenceElements,
    allFocusable: allElements,
    findings,
  };
}

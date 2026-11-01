import type { Rule } from "./types";
import { clickOnNonInteractiveRule } from "./click-on-non-interactive";
import { interactiveRoleNotFocusableRule } from "./interactive-role-not-focusable";
import { linkAsButtonRule } from "./link-as-button";
import { inputPlaceholderOnlyRule } from "./input-placeholder-only";
import { inputNoLabelRule } from "./input-no-label";
import { imgMissingAltRule } from "./img-missing-alt";
import { emptyInteractiveNameRule } from "./empty-interactive-name";
import { positiveTabindexRule } from "./positive-tabindex";
import { ariaHiddenFocusableRule } from "./aria-hidden-focusable";
import { headingOrderRule } from "./heading-order";
import { dialogNoNameRule } from "./dialog-no-name";
import { tabPatternIncompleteRule } from "./tab-pattern-incomplete";
import { duplicateIdRule } from "./duplicate-id";
import { ariaBrokenReferenceRule } from "./aria-broken-reference";
import { invalidAriaRule } from "./invalid-aria";
import { outlineRemovedRule } from "./outline-removed";

export * from "./types";
export * from "./make-finding";
export * from "./helpers";

export const RULES: readonly Rule[] = [
  clickOnNonInteractiveRule,
  interactiveRoleNotFocusableRule,
  linkAsButtonRule,
  inputPlaceholderOnlyRule,
  inputNoLabelRule,
  imgMissingAltRule,
  emptyInteractiveNameRule,
  positiveTabindexRule,
  ariaHiddenFocusableRule,
  headingOrderRule,
  dialogNoNameRule,
  tabPatternIncompleteRule,
  duplicateIdRule,
  ariaBrokenReferenceRule,
  invalidAriaRule,
  outlineRemovedRule,
];


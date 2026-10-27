export interface PatternBadExplanation {
  readonly whatBreaks: string;
  readonly forWhom: string;
  readonly technicalReason: string;
}

export interface PatternGoodExplanation {
  readonly howItFixes: string;
  readonly keyAttributes: readonly string[];
}

export interface PatternItem {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly wcagCriteria: readonly string[];
  readonly badCode: string;
  readonly goodCode: string;
  readonly badExplanation: PatternBadExplanation;
  readonly goodExplanation: PatternGoodExplanation;
}

export interface ChallengeMetadata {
  readonly id: string;
  readonly title: string;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly summary: string;
  readonly objectives: readonly string[];
  readonly hintsCount: number;
}

export interface ChallengeContent {
  readonly startHtml: string;
  readonly startCss?: string;
  readonly expected: readonly { ruleId: string; wcag: readonly string[] }[];
  readonly hints: readonly string[];
  readonly solutionHtml: string;
  readonly solutionCss?: string;
  readonly verify: {
    readonly ruleIdsMustBeAbsent: readonly string[];
  };
  readonly manualSteps: readonly string[];
}

export type Challenge = ChallengeMetadata & ChallengeContent;

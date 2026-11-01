import type { WcagLevel } from "./wcag";

export type AxeImpactLevel = "critical" | "serious" | "moderate" | "minor";

export interface A11yNode {
  readonly id: string;
  readonly tagName: string;
  readonly role: string;
  readonly implicitRole: string;
  readonly explicitRole?: string;
  readonly accessibleName: string;
  readonly accessibleNameSource: string;
  readonly ariaAttributes: Record<string, string>;
  readonly attributes: Record<string, string>;
  readonly hasInlineHandler: boolean;
  readonly inlineHandlers: readonly string[];
  readonly hasAccessibleName: boolean;
  readonly children: readonly A11yNode[];
  readonly sourceRange?: readonly [number, number];
}

export interface FocusOrderElement {
  readonly id: string;
  readonly tagName: string;
  readonly role: string;
  readonly accessibleName: string;
  readonly tabIndex: number;
  readonly isNaturalFocusable: boolean;
  readonly orderIndex: number;
  readonly inTabSequence: boolean;
  readonly htmlSnippet: string;
}

export interface FocusFinding {
  readonly id: string;
  readonly title: string;
  readonly impact: AxeImpactLevel;
  readonly description: string;
  readonly targetId?: string;
  readonly htmlSnippet?: string;
}

export interface FocusOrderPosition {
  readonly id: string;
  readonly tabIndex: number;
  readonly orderIndex?: number;
  readonly rect: {
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
  };
}

export interface NameCalculationStep {
  readonly step: string;
  readonly description: string;
  readonly applied: boolean;
  readonly value?: string;
}

export type AriaValidityStatus =
  "valid" | "invalid-value" | "not-allowed" | "unknown";

export interface AriaAttributeValidity {
  readonly attribute: string;
  readonly value: string;
  readonly status: AriaValidityStatus;
  readonly explanation: string;
}

export interface AxeFindingNode {
  readonly html: string;
  readonly target: readonly string[];
  readonly failureSummary?: string;
  readonly targetId?: string;
}

export type FindingStatus =
  | "violation" // automatically detected failure
  | "needs-review" // axe "incomplete" or low-confidence custom rule
  | "manual-required"; // cannot be automated, shown as a checklist hint

export type FindingConfidence = "high" | "medium" | "low";

export interface WcagRef {
  readonly id: string;
  readonly version: "2.0" | "2.1" | "2.2";
  readonly level: WcagLevel;
}

export interface Finding {
  readonly fingerprint: string; // stable: hash(ruleId + target node structural id + normalized html)
  readonly ruleId: string;
  readonly engine: "axe-core" | "playground";
  readonly status: FindingStatus;
  readonly confidence: FindingConfidence;
  readonly impact: AxeImpactLevel; // severity — NOT derived from WCAG level
  readonly wcag: readonly WcagRef[];
  readonly help: string;
  readonly description: string;
  readonly helpUrl: string;
  readonly nodes: readonly AxeFindingNode[];
  readonly fix?: string;
}

export interface AxeFinding {
  readonly id: string;
  readonly impact: AxeImpactLevel;
  readonly description: string;
  readonly help: string;
  readonly helpUrl: string;
  readonly wcag?: readonly string[];
  readonly source?: "axe-core" | "playground";
  readonly type?: "violation" | "incomplete";
  readonly fix?: string;
  readonly nodes: readonly AxeFindingNode[];
  readonly fingerprint?: string;
}

export interface AnalysisState {
  readonly ast: A11yNode | null;
  readonly selectedNodeId: string | null;
  readonly violations: readonly AxeFinding[];
  readonly isScanning: boolean;
  readonly scanError: string | null;
  readonly parseError: string | null;
}

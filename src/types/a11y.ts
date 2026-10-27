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
}

export interface AnalysisState {
  readonly ast: A11yNode | null;
  readonly selectedNodeId: string | null;
  readonly violations: readonly AxeFinding[];
  readonly isScanning: boolean;
  readonly scanError: string | null;
  readonly parseError: string | null;
}

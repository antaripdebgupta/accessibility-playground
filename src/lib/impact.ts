import type { BadgeVariant } from "@/components/ui/Badge";

export type ImpactLevel = "critical" | "serious" | "moderate" | "minor";

export interface ImpactMeta {
  readonly label: string;
  readonly variant: BadgeVariant;
  readonly weight: number;
}

export const IMPACT_META: Record<ImpactLevel, ImpactMeta> = {
  critical: { label: "Critical", variant: "critical", weight: 4 },
  serious: { label: "Serious", variant: "serious", weight: 3 },
  moderate: { label: "Moderate", variant: "moderate", weight: 2 },
  minor: { label: "Minor", variant: "minor", weight: 1 },
};

export function getImpactMeta(impact?: string | null): ImpactMeta {
  if (impact && impact in IMPACT_META) {
    return IMPACT_META[impact as ImpactLevel];
  }
  return { label: "Minor", variant: "minor", weight: 1 };
}

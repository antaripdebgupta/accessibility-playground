export type WcagLevel = "A" | "AA" | "AAA";

export type WcagPrinciple =
  "Perceivable" | "Operable" | "Understandable" | "Robust";

export interface WcagCriterion {
  readonly id: string;
  readonly name: string;
  readonly level: WcagLevel;
  readonly principle: WcagPrinciple;
  readonly summary: string;
  readonly url: string;
  readonly since: "2.0" | "2.1" | "2.2";
}

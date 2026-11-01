import { describe, it, expect } from "vitest";
import {
  calculateContrastRatio,
  evaluateContrast,
  formatContrastRatio,
  hexToRgb,
  suggestPassingColor,
} from "@/lib/contrast";

describe("Contrast Calculation (WCAG 2.2)", () => {
  it("calculates exact 21:1 for black on white", () => {
    const black = hexToRgb("#000000")!;
    const white = hexToRgb("#ffffff")!;
    const ratio = calculateContrastRatio(black, white);
    expect(ratio).toBeCloseTo(21.0, 1);
    expect(formatContrastRatio(ratio)).toBe("21.00");
  });

  it("calculates exact 1:1 for identical colors", () => {
    const white1 = hexToRgb("#ffffff")!;
    const white2 = hexToRgb("#ffffff")!;
    const ratio = calculateContrastRatio(white1, white2);
    expect(ratio).toBeCloseTo(1.0, 5);
    expect(formatContrastRatio(ratio)).toBe("1.00");
  });

  it("handles exactly 4.5:1 ratio correctly", () => {
    // #767676 on #ffffff is approx 4.54:1
    const res = evaluateContrast("#767676", "#ffffff");
    expect(res).not.toBeNull();
    expect(res!.ratio).toBeGreaterThanOrEqual(4.5);
    expect(res!.normalTextAA).toBe(true);
  });

  it("floors ratio for display instead of rounding up", () => {
    // 4.498 should display as 4.49, not 4.50
    expect(formatContrastRatio(4.498)).toBe("4.49");
    expect(formatContrastRatio(4.491)).toBe("4.49");
    expect(formatContrastRatio(4.501)).toBe("4.50");
  });

  it("correctly fails normalTextAA if raw ratio is 4.49x", () => {
    // Simulate a case where raw ratio is 4.496
    const fg = { r: 121, g: 121, b: 121 }; // approx 4.48:1 on white
    const bg = { r: 255, g: 255, b: 255 };
    const ratio = calculateContrastRatio(fg, bg);
    expect(ratio < 4.5).toBe(true);

    const evalResult = evaluateContrast("#797979", "#ffffff");
    expect(evalResult).not.toBeNull();
    expect(evalResult!.normalTextAA).toBe(false);
  });

  it("evaluates 3:1 threshold for large text and non-text", () => {
    // #949494 on #ffffff is approx 3.03:1
    const res = evaluateContrast("#949494", "#ffffff");
    expect(res).not.toBeNull();
    expect(res!.largeTextAA).toBe(true);
    expect(res!.nonTextAA).toBe(true);
    expect(res!.normalTextAA).toBe(false);
  });

  it("evaluates 7:1 threshold for normal text AAA", () => {
    // #595959 on #ffffff is approx 7.01:1
    const res = evaluateContrast("#595959", "#ffffff");
    expect(res).not.toBeNull();
    expect(res!.normalTextAAA).toBe(true);
  });

  it("suggests a passing color when normal text AA fails", () => {
    const suggested = suggestPassingColor("#a1a1aa", "#ffffff", 4.5);
    expect(suggested).not.toBeNull();
    const evalSuggested = evaluateContrast(suggested!, "#ffffff");
    expect(evalSuggested!.normalTextAA).toBe(true);
  });

  it("property test: for 200 random fg/bg pairs, suggested color ratio >= target when it passes", () => {
    // Deterministic pseudo-random generator
    let seed = 42;
    function pseudoRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    function randomHex() {
      const r = Math.floor(pseudoRandom() * 256)
        .toString(16)
        .padStart(2, "0");
      const g = Math.floor(pseudoRandom() * 256)
        .toString(16)
        .padStart(2, "0");
      const b = Math.floor(pseudoRandom() * 256)
        .toString(16)
        .padStart(2, "0");
      return `#${r}${g}${b}`;
    }

    const targets = [3.0, 4.5, 7.0];
    for (let i = 0; i < 200; i++) {
      const fg = randomHex();
      const bg = randomHex();
      const target = targets[i % targets.length]!;

      const suggested = suggestPassingColor(fg, bg, target);
      if (suggested) {
        const bgRgb = hexToRgb(bg)!;
        const suggestedRgb = hexToRgb(suggested)!;
        const ratio = calculateContrastRatio(suggestedRgb, bgRgb);
        expect(
          ratio,
          `Suggested ${suggested} against ${bg} must have ratio >= ${target}, got ${ratio}`
        ).toBeGreaterThanOrEqual(target);
      }
    }
  });
});


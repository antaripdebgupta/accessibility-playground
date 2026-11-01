export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  ratio: number;
  normalTextAA: boolean;
  normalTextAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  nonTextAA: boolean;
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  let cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    const r = cleaned.charAt(0);
    const g = cleaned.charAt(1);
    const b = cleaned.charAt(2);
    cleaned = `${r}${r}${g}${g}${b}${b}`;
  }
  return `#${cleaned.toUpperCase()}`;
}

export function hexToRgb(hex: string): RgbColor | null {
  if (!isValidHex(hex)) return null;
  const normalized = normalizeHex(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates relative luminance following WCAG 2.2 formula:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(rgb: RgbColor): number {
  const sRgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const linear = sRgb.map((val) => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  const r = linear[0] ?? 0;
  const g = linear[1] ?? 0;
  const b = linear[2] ?? 0;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors (range: 1.0 to 21.0)
 * Returns the exact raw ratio unrounded.
 */
export function calculateContrastRatio(
  fgRgb: RgbColor,
  bgRgb: RgbColor
): number {
  const lum1 = getRelativeLuminance(fgRgb);
  const lum2 = getRelativeLuminance(bgRgb);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Formats a contrast ratio for display by truncating (flooring) to 2 decimals.
 */
export function formatContrastRatio(ratio: number): string {
  const floored = Math.floor(ratio * 100) / 100;
  return floored.toFixed(2);
}

export function evaluateContrast(
  fgHex: string,
  bgHex: string
): ContrastResult | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;

  const ratio = calculateContrastRatio(fg, bg);
  return {
    ratio,
    normalTextAA: ratio >= 4.5,
    normalTextAAA: ratio >= 7.0,
    largeTextAA: ratio >= 3.0,
    largeTextAAA: ratio >= 4.5,
    nonTextAA: ratio >= 3.0,
  };
}

/**
 * Suggests the nearest passing foreground color meeting target ratio (default 4.5:1)
 */
export function suggestPassingColor(
  fgHex: string,
  bgHex: string,
  targetRatio = 4.5
): string | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;

  const currentRatio = calculateContrastRatio(fg, bg);
  if (currentRatio >= targetRatio) return fgHex;

  const blackContrast = calculateContrastRatio({ r: 0, g: 0, b: 0 }, bg);
  const whiteContrast = calculateContrastRatio({ r: 255, g: 255, b: 255 }, bg);

  if (Math.max(blackContrast, whiteContrast) < targetRatio) {
    return null;
  }

  function searchDirection(darken: boolean): string | null {
    let best: string | null = null;
    let low = 0;
    let high = 100;
    // fg is guaranteed non-null here (checked above), but TS can't narrow
    // across closure boundaries, so capture explicitly.
    const fgColor: RgbColor = fg!;
    const bgColor: RgbColor = bg!;

    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      const factor = mid / 100;
      const candidateRgb: RgbColor = darken
        ? {
            r: fgColor.r * (1 - factor),
            g: fgColor.g * (1 - factor),
            b: fgColor.b * (1 - factor),
          }
        : {
            r: fgColor.r + (255 - fgColor.r) * factor,
            g: fgColor.g + (255 - fgColor.g) * factor,
            b: fgColor.b + (255 - fgColor.b) * factor,
          };

      const candidateHex = rgbToHex(candidateRgb);
      const rounded = hexToRgb(candidateHex);
      const ratio = rounded ? calculateContrastRatio(rounded, bgColor) : 0;
      if (ratio >= targetRatio) {
        best = candidateHex;
        high = mid; // Try to stay closer to original color
      } else {
        low = mid;
      }
    }

    return best;
  }

  const preferDarken = blackContrast >= whiteContrast;
  const primaryResult = searchDirection(preferDarken);
  if (primaryResult) return primaryResult;

  const fallbackResult = searchDirection(!preferDarken);
  return fallbackResult;
}

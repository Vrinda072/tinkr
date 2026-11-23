export interface Hsv {
  /** Hue in degrees, [0, 360). */
  h: number;
  /** Saturation, [0, 1]. */
  s: number;
  /** Value (brightness), [0, 1]. */
  v: number;
}

/**
 * Inclusive HSV range. If hMin > hMax the hue range wraps through 0°
 * (needed for red, which sits on both sides of 0°).
 */
export interface HsvRange {
  hMin: number;
  hMax: number;
  sMin: number;
  sMax: number;
  vMin: number;
  vMax: number;
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;

  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hueInRange(h: number, hMin: number, hMax: number): boolean {
  return hMin <= hMax ? h >= hMin && h <= hMax : h >= hMin || h <= hMax;
}

export function inRange(c: Hsv, r: HsvRange): boolean {
  return (
    c.s >= r.sMin && c.s <= r.sMax && c.v >= r.vMin && c.v <= r.vMax && hueInRange(c.h, r.hMin, r.hMax)
  );
}

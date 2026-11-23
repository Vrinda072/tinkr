import type { Frame } from "../types";
import { rgbToHsv, type HsvRange } from "./hsv";

export type CalibrationResult =
  | { ok: true; range: HsvRange; sample: { h: number; s: number; v: number } }
  | { ok: false; reason: string };

const MIN_SATURATION = 0.2;
const MIN_VALUE = 0.15;

/**
 * Samples a square patch around (cx, cy) in frame pixels and returns an HSV range
 * that matches that colour with some tolerance for lighting changes.
 * Rejects greys/whites/blacks: hue is meaningless for unsaturated colours.
 */
export function calibrateFromPatch(frame: Frame, cx: number, cy: number, radius = 3): CalibrationResult {
  const hues: number[] = [];
  let sSum = 0;
  let vSum = 0;

  for (let y = Math.max(0, cy - radius); y <= Math.min(frame.height - 1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(frame.width - 1, cx + radius); x++) {
      const i = (y * frame.width + x) * 4;
      const c = rgbToHsv(frame.data[i]!, frame.data[i + 1]!, frame.data[i + 2]!);
      hues.push(c.h);
      sSum += c.s;
      vSum += c.v;
    }
  }
  if (hues.length === 0) return { ok: false, reason: "click was outside the frame" };

  const s = sSum / hues.length;
  const v = vSum / hues.length;
  if (s < MIN_SATURATION) return { ok: false, reason: "that colour is too grey to track; try a more vivid object" };
  if (v < MIN_VALUE) return { ok: false, reason: "that spot is too dark; add light or pick a brighter object" };

  // Circular mean and spread of hue (hue wraps at 360°).
  const rad = Math.PI / 180;
  let sx = 0;
  let sy = 0;
  for (const h of hues) {
    sx += Math.cos(h * rad);
    sy += Math.sin(h * rad);
  }
  const mean = (Math.atan2(sy, sx) / rad + 360) % 360;
  const spread = Math.max(...hues.map((h) => angularDistance(h, mean)));
  const halfWidth = Math.min(40, Math.max(14, spread * 1.5));

  return {
    ok: true,
    sample: { h: mean, s, v },
    range: {
      hMin: (mean - halfWidth + 360) % 360,
      hMax: (mean + halfWidth) % 360,
      sMin: Math.max(MIN_SATURATION, s * 0.55),
      sMax: 1,
      vMin: Math.max(MIN_VALUE, v * 0.45),
      vMax: 1,
    },
  };
}

function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

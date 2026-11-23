import type { BBox, Frame, ObjectId } from "../types";
import { inRange, rgbToHsv, type Hsv, type HsvRange } from "./hsv";

export interface Detection {
  /** Centroid, normalised. */
  x: number;
  y: number;
  bbox: BBox;
  /** Fraction of the frame covered by the blob. */
  area: number;
}

/**
 * Finds the largest connected blob for each calibrated colour.
 * HSV is computed once per pixel and shared across colours.
 * Blobs smaller than `minArea` (fraction of frame) are ignored as noise.
 */
export function detectAll(
  frame: Frame,
  ranges: Record<ObjectId, HsvRange>,
  minArea = 0.002,
): Record<ObjectId, Detection | null> {
  const n = frame.width * frame.height;
  const hsv: Hsv[] = new Array(n);
  for (let p = 0; p < n; p++) {
    const i = p * 4;
    hsv[p] = rgbToHsv(frame.data[i]!, frame.data[i + 1]!, frame.data[i + 2]!);
  }

  const out: Record<ObjectId, Detection | null> = {};
  const mask = new Uint8Array(n);
  for (const [id, range] of Object.entries(ranges)) {
    for (let p = 0; p < n; p++) mask[p] = inRange(hsv[p]!, range) ? 1 : 0;
    out[id] = largestBlob(mask, frame.width, frame.height, minArea);
  }
  return out;
}

/** 4-connected component labelling with an explicit stack (no recursion limits). */
export function largestBlob(mask: Uint8Array, width: number, height: number, minArea: number): Detection | null {
  const n = width * height;
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let best: { count: number; sx: number; sy: number; x0: number; y0: number; x1: number; y1: number } | null = null;

  for (let start = 0; start < n; start++) {
    if (!mask[start] || seen[start]) continue;

    let top = 0;
    stack[top++] = start;
    seen[start] = 1;
    let count = 0;
    let sx = 0;
    let sy = 0;
    let x0 = width;
    let y0 = height;
    let x1 = 0;
    let y1 = 0;

    while (top > 0) {
      const p = stack[--top]!;
      const x = p % width;
      const y = (p - x) / width;
      count++;
      sx += x;
      sy += y;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;

      if (x > 0) top = push(p - 1, mask, seen, stack, top);
      if (x < width - 1) top = push(p + 1, mask, seen, stack, top);
      if (y > 0) top = push(p - width, mask, seen, stack, top);
      if (y < height - 1) top = push(p + width, mask, seen, stack, top);
    }

    if (!best || count > best.count) best = { count, sx, sy, x0, y0, x1, y1 };
  }

  if (!best || best.count / n < minArea) return null;
  return {
    // +0.5 so a pixel's centre, not its corner, is used.
    x: (best.sx / best.count + 0.5) / width,
    y: (best.sy / best.count + 0.5) / height,
    bbox: {
      x: best.x0 / width,
      y: best.y0 / height,
      w: (best.x1 - best.x0 + 1) / width,
      h: (best.y1 - best.y0 + 1) / height,
    },
    area: best.count / n,
  };
}

function push(q: number, mask: Uint8Array, seen: Uint8Array, stack: Int32Array, top: number): number {
  if (mask[q] && !seen[q]) {
    seen[q] = 1;
    stack[top++] = q;
  }
  return top;
}

import type { Frame, TrackedObject, WorldState } from "../types";

/** Test helpers for building synthetic frames and worlds. Not exported from the package. */

export type Rgb = [number, number, number];

export const RED: Rgb = [220, 40, 40];
export const BLUE: Rgb = [40, 70, 220];
export const GREEN: Rgb = [40, 180, 70];
export const PAPER: Rgb = [235, 232, 225];

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: Rgb;
}

export function makeFrame(width: number, height: number, rects: PixelRect[], bg: Rgb = PAPER): Frame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let p = 0; p < width * height; p++) setPixel(data, p, bg);
  for (const r of rects) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (x >= 0 && y >= 0 && x < width && y < height) setPixel(data, y * width + x, r.color);
      }
    }
  }
  return { data, width, height };
}

function setPixel(data: Uint8ClampedArray, p: number, [r, g, b]: Rgb): void {
  data[p * 4] = r;
  data[p * 4 + 1] = g;
  data[p * 4 + 2] = b;
  data[p * 4 + 3] = 255;
}

export function obj(id: string, x: number, y: number, visible = true): TrackedObject {
  return { id, x, y, bbox: { x, y, w: 0.05, h: 0.05 }, area: 0.0025, visible, lastSeen: 0, quality: 1 };
}

export function world(objects: TrackedObject[], opts: Partial<WorldState> = {}): WorldState {
  return {
    t: 0,
    aspect: 1,
    cameraOk: true,
    zones: {},
    objects: Object.fromEntries(objects.map((o) => [o.id, o])),
    ...opts,
  };
}

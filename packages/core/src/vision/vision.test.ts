import { describe, expect, it } from "vitest";
import { BLUE, GREEN, makeFrame, PAPER, RED } from "../testing/frames";
import { detectAll } from "./blobs";
import { calibrateFromPatch } from "./calibrate";
import { inRange, rgbToHsv, type HsvRange } from "./hsv";

describe("rgbToHsv", () => {
  it("converts primaries", () => {
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv(0, 255, 0).h).toBeCloseTo(120);
    expect(rgbToHsv(0, 0, 255).h).toBeCloseTo(240);
    expect(rgbToHsv(128, 128, 128).s).toBe(0);
  });
});

describe("inRange", () => {
  it("handles hue ranges that wrap through 0°", () => {
    const red: HsvRange = { hMin: 340, hMax: 20, sMin: 0.3, sMax: 1, vMin: 0.2, vMax: 1 };
    expect(inRange({ h: 355, s: 0.8, v: 0.8 }, red)).toBe(true);
    expect(inRange({ h: 5, s: 0.8, v: 0.8 }, red)).toBe(true);
    expect(inRange({ h: 180, s: 0.8, v: 0.8 }, red)).toBe(false);
  });
});

describe("calibrateFromPatch", () => {
  it("learns a range that matches the clicked colour and not the paper", () => {
    const f = makeFrame(40, 30, [{ x: 10, y: 10, w: 10, h: 10, color: RED }]);
    const r = calibrateFromPatch(f, 15, 15);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(inRange(rgbToHsv(...RED), r.range)).toBe(true);
    expect(inRange(rgbToHsv(...PAPER), r.range)).toBe(false);
    expect(inRange(rgbToHsv(...BLUE), r.range)).toBe(false);
  });

  it("still matches the colour under dimmer light", () => {
    const f = makeFrame(40, 30, [{ x: 10, y: 10, w: 10, h: 10, color: BLUE }]);
    const r = calibrateFromPatch(f, 15, 15);
    if (!r.ok) throw new Error(r.reason);
    const dim = BLUE.map((c) => Math.round(c * 0.7)) as [number, number, number];
    expect(inRange(rgbToHsv(...dim), r.range)).toBe(true);
  });

  it("refuses to calibrate on grey paper", () => {
    const f = makeFrame(40, 30, []);
    const r = calibrateFromPatch(f, 15, 15);
    expect(r).toMatchObject({ ok: false });
  });
});

describe("detectAll", () => {
  const ranges = (() => {
    const f = makeFrame(60, 40, [
      { x: 0, y: 0, w: 8, h: 8, color: RED },
      { x: 20, y: 0, w: 8, h: 8, color: BLUE },
      { x: 40, y: 0, w: 8, h: 8, color: GREEN },
    ]);
    const get = (x: number) => {
      const r = calibrateFromPatch(f, x, 4);
      if (!r.ok) throw new Error(r.reason);
      return r.range;
    };
    return { red: get(4), blue: get(24), green: get(44) };
  })();

  it("finds each object's centroid and bbox in normalised coordinates", () => {
    const f = makeFrame(100, 50, [
      { x: 10, y: 10, w: 10, h: 10, color: RED },
      { x: 70, y: 30, w: 10, h: 10, color: BLUE },
    ]);
    const d = detectAll(f, ranges);
    expect(d.red!.x).toBeCloseTo(0.15);
    expect(d.red!.y).toBeCloseTo(0.3);
    expect(d.red!.bbox).toEqual({ x: 0.1, y: 0.2, w: 0.1, h: 0.2 });
    expect(d.blue!.x).toBeCloseTo(0.75);
    expect(d.green).toBeNull();
  });

  it("picks the largest blob and ignores specks below minArea", () => {
    const f = makeFrame(100, 100, [
      { x: 5, y: 5, w: 2, h: 2, color: RED }, // speck
      { x: 50, y: 50, w: 12, h: 12, color: RED },
      { x: 80, y: 5, w: 6, h: 6, color: RED },
    ]);
    const d = detectAll(f, ranges, 0.002);
    expect(d.red!.x).toBeCloseTo(0.56);
    expect(d.red!.area).toBeCloseTo(0.0144);

    const onlySpeck = makeFrame(100, 100, [{ x: 5, y: 5, w: 2, h: 2, color: RED }]);
    expect(detectAll(onlySpeck, ranges, 0.002).red).toBeNull();
  });
});

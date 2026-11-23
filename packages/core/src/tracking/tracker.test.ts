import { describe, expect, it } from "vitest";
import type { Detection } from "../vision/blobs";
import { areaStability, Tracker } from "./tracker";

const det = (x: number, y: number, area = 0.01): Detection => ({ x, y, area, bbox: { x: x - 0.05, y: y - 0.05, w: 0.1, h: 0.1 } });

describe("Tracker", () => {
  it("reports calibrated but never-seen objects as not visible", () => {
    const t = new Tracker();
    const out = t.update({ red: null }, 0);
    expect(out.red).toMatchObject({ visible: false, lastSeen: -1, quality: 0 });
  });

  it("snaps to the first detection, then smooths", () => {
    const t = new Tracker({ alpha: 0.5 });
    expect(t.update({ red: det(0.2, 0.2) }, 0).red!.x).toBeCloseTo(0.2);
    expect(t.update({ red: det(0.4, 0.2) }, 33).red!.x).toBeCloseTo(0.3);
  });

  it("holds position through a short occlusion with fading quality", () => {
    const t = new Tracker({ graceMs: 500, warmupFrames: 1 });
    t.update({ red: det(0.5, 0.5) }, 0);
    const occluded = t.update({ red: null }, 250).red!;
    expect(occluded).toMatchObject({ visible: true, x: 0.5, lastSeen: 0 });
    expect(occluded.quality).toBeCloseTo(0.5);
  });

  it("marks an object invisible after the grace period", () => {
    const t = new Tracker({ graceMs: 500 });
    t.update({ red: det(0.5, 0.5) }, 0);
    t.update({ red: null }, 300);
    expect(t.update({ red: null }, 501).red).toMatchObject({ visible: false, quality: 0, lastSeen: 0 });
  });

  it("snaps (doesn't smooth) when a lost object reappears somewhere else", () => {
    const t = new Tracker({ graceMs: 100, alpha: 0.5 });
    t.update({ red: det(0.1, 0.1) }, 0);
    t.update({ red: null }, 200);
    expect(t.update({ red: det(0.9, 0.9) }, 233).red!.x).toBeCloseTo(0.9);
  });

  it("ramps quality up over the warm-up frames", () => {
    const t = new Tracker({ warmupFrames: 4 });
    const q = [0, 33, 66, 99].map((ms) => t.update({ red: det(0.5, 0.5) }, ms).red!.quality);
    expect(q).toEqual([0.25, 0.5, 0.75, 1]);
  });

  it("forgets objects that are no longer calibrated and everything on reset", () => {
    const t = new Tracker();
    t.update({ red: det(0.5, 0.5), blue: det(0.1, 0.1) }, 0);
    expect(Object.keys(t.update({ red: det(0.5, 0.5) }, 33))).toEqual(["red"]);
    t.reset();
    expect(t.update({ red: null }, 66).red!.visible).toBe(false);
  });
});

describe("areaStability", () => {
  it("is 1 for a steady area and drops for a jumpy one", () => {
    expect(areaStability([0.01, 0.01, 0.01])).toBe(1);
    expect(areaStability([0.01, 0.03, 0.005, 0.04])).toBeLessThan(0.3);
  });
});

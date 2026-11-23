import { describe, expect, it } from "vitest";
import { TinkrEngine } from "./engine";
import { buildRuleSchema } from "./rules/schema";
import { BLUE, makeFrame, RED } from "./testing/frames";
import { calibrateFromPatch } from "./vision/calibrate";

const W = 160;
const H = 120;

/** Red at a fixed spot, blue at a given x. Each block is 16×16 px. */
const scene = (blueX: number | null) =>
  makeFrame(W, H, [
    { x: 40, y: 52, w: 16, h: 16, color: RED },
    ...(blueX === null ? [] : [{ x: blueX, y: 52, w: 16, h: 16, color: BLUE }]),
  ]);

function setup() {
  const calib = scene(120);
  const red = calibrateFromPatch(calib, 48, 60);
  const blue = calibrateFromPatch(calib, 128, 60);
  if (!red.ok || !blue.ok) throw new Error("calibration failed");

  const engine = new TinkrEngine({ holdMs: 300, graceMs: 500 });
  engine.setCalibration({ red: red.range, blue: blue.range });
  engine.setRule("r1", { type: "NEAR", subject: "red", target: "blue", threshold: 0.25 });
  return engine;
}

describe("TinkrEngine end to end", () => {
  it("goes NOT_SATISFIED → SATISFIED as the blue block is moved next to red", () => {
    const e = setup();
    let t = 0;
    const run = (blueX: number | null, frames: number) => {
      let last;
      for (let i = 0; i < frames; i++) last = e.step(scene(blueX), (t += 33));
      return last!;
    };

    expect(run(120, 3).results.r1!.status).toBe("NOT_SATISFIED");
    // Smoothing (alpha 0.5) takes 4 frames to bring blue inside the threshold.
    // Raw is then satisfied, but not committed until it holds for 300 ms.
    const justMoved = run(64, 4).results.r1!;
    expect(justMoved.raw.status).toBe("SATISFIED");
    expect(justMoved.status).toBe("NOT_SATISFIED");
    expect(run(64, 12).results.r1!.status).toBe("SATISFIED");

    expect(e.log.forRule("r1").map((ev) => ev.to)).toEqual(["NOT_SATISFIED", "SATISFIED"]);
  });

  it("stays put through a brief occlusion and goes UNCERTAIN after a long one", () => {
    const e = setup();
    let t = 0;
    for (let i = 0; i < 15; i++) e.step(scene(64), (t += 33));
    for (let i = 0; i < 6; i++) e.step(scene(null), (t += 33)); // ~200 ms hand over the block
    expect(e.step(scene(64), (t += 33)).results.r1!.status).toBe("SATISFIED");

    let last;
    for (let i = 0; i < 40; i++) last = e.step(scene(null), (t += 33));
    expect(last!.results.r1!.status).toBe("UNCERTAIN");
    expect(last!.results.r1!.raw.reason).toBe("can't see blue");
  });

  it("never reports SATISFIED while the camera is disconnected", () => {
    const e = setup();
    let t = 0;
    for (let i = 0; i < 15; i++) e.step(scene(64), (t += 33));
    let last;
    for (let i = 0; i < 20; i++) last = e.step(null, (t += 33));
    expect(last!.world.cameraOk).toBe(false);
    expect(last!.results.r1!.status).toBe("UNCERTAIN");
    expect(last!.results.r1!.raw.reason).toBe("camera unavailable");
  });
});

describe("buildRuleSchema", () => {
  const schema = buildRuleSchema(["red", "blue"]);

  it("accepts a valid NEAR rule", () => {
    expect(schema.safeParse({ type: "NEAR", subject: "red", target: "blue", threshold: 0.15 }).success).toBe(true);
  });

  it.each([
    ["unknown object", { type: "NEAR", subject: "red", target: "purple", threshold: 0.15 }],
    ["same subject and target", { type: "NEAR", subject: "red", target: "red", threshold: 0.15 }],
    ["unsupported rule type", { type: "ABOVE", subject: "red", target: "blue", threshold: 0.15 }],
    ["non-positive threshold", { type: "NEAR", subject: "red", target: "blue", threshold: 0 }],
    ["extra fields", { type: "NEAR", subject: "red", target: "blue", threshold: 0.1, note: "x" }],
  ])("rejects %s", (_, rule) => {
    expect(schema.safeParse(rule).success).toBe(false);
  });
});

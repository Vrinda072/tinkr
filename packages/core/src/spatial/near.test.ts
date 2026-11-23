import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { obj, world } from "../testing/frames";
import { distance, evaluateNear } from "./near";

const rule = { type: "NEAR" as const, subject: "red", target: "blue", threshold: 0.15 };

describe("evaluateNear", () => {
  it("is SATISFIED when objects are within the threshold", () => {
    const r = evaluateNear(rule, world([obj("red", 0.5, 0.5), obj("blue", 0.6, 0.5)]));
    expect(r.status).toBe("SATISFIED");
  });

  it("is NOT_SATISFIED when objects are too far apart", () => {
    const r = evaluateNear(rule, world([obj("red", 0.1, 0.1), obj("blue", 0.9, 0.9)]));
    expect(r.status).toBe("NOT_SATISFIED");
    expect(r.reason).toContain("red is");
  });

  it("is UNCERTAIN when an object is not visible, never a false result", () => {
    const r = evaluateNear(rule, world([obj("red", 0.5, 0.5), obj("blue", 0.5, 0.5, false)]));
    expect(r).toEqual({ status: "UNCERTAIN", reason: "can't see blue" });
  });

  it("is UNCERTAIN when an object is missing from the world entirely", () => {
    expect(evaluateNear(rule, world([obj("red", 0.5, 0.5)])).status).toBe("UNCERTAIN");
  });

  it("is UNCERTAIN when the camera is down, even if last positions were near", () => {
    const w = world([obj("red", 0.5, 0.5), obj("blue", 0.5, 0.5)], { cameraOk: false });
    expect(evaluateNear(rule, w)).toEqual({ status: "UNCERTAIN", reason: "camera unavailable" });
  });

  it("measures horizontal distance in true proportions on wide frames", () => {
    // 0.1 of a 16:9 frame's width is 0.178 frame-heights: not near at threshold 0.15.
    const w = world([obj("red", 0.5, 0.5), obj("blue", 0.6, 0.5)], { aspect: 16 / 9 });
    expect(evaluateNear(rule, w).status).toBe("NOT_SATISFIED");
  });
});

describe("distance (properties)", () => {
  const point = fc.record({ x: fc.double({ min: 0, max: 1, noNaN: true }), y: fc.double({ min: 0, max: 1, noNaN: true }) });
  const aspect = fc.double({ min: 0.5, max: 2.5, noNaN: true });

  it("is symmetric", () => {
    fc.assert(fc.property(point, point, aspect, (a, b, k) => distance(a, b, k) === distance(b, a, k)));
  });

  it("is zero only for identical points and never negative", () => {
    fc.assert(
      fc.property(point, point, aspect, (a, b, k) => {
        const d = distance(a, b, k);
        return d >= 0 && (d === 0) === (a.x === b.x && a.y === b.y);
      }),
    );
  });

  it("NEAR status is symmetric in subject and target", () => {
    fc.assert(
      fc.property(point, point, fc.double({ min: 0.01, max: 1, noNaN: true }), (a, b, threshold) => {
        const w = world([obj("red", a.x, a.y), obj("blue", b.x, b.y)]);
        const ab = evaluateNear({ type: "NEAR", subject: "red", target: "blue", threshold }, w).status;
        const ba = evaluateNear({ type: "NEAR", subject: "blue", target: "red", threshold }, w).status;
        return ab === ba;
      }),
    );
  });
});

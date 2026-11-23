import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Status } from "../types";
import { EventLog, TransitionDetector } from "./eventLog";

describe("TransitionDetector", () => {
  it("commits the first status immediately", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 300);
    expect(d.update("r", "NOT_SATISFIED", 0)).toBe("NOT_SATISFIED");
    expect(log.all()).toEqual([{ t: 0, ruleId: "r", from: null, to: "NOT_SATISFIED" }]);
  });

  it("only commits a change after it holds for holdMs", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 300);
    d.update("r", "NOT_SATISFIED", 0);
    expect(d.update("r", "SATISFIED", 100)).toBe("NOT_SATISFIED");
    expect(d.update("r", "SATISFIED", 399)).toBe("NOT_SATISFIED");
    expect(d.update("r", "SATISFIED", 400)).toBe("SATISFIED");
    expect(log.forRule("r").map((e) => e.to)).toEqual(["NOT_SATISFIED", "SATISFIED"]);
    expect(log.all()[1]).toMatchObject({ t: 400, from: "NOT_SATISFIED" });
  });

  it("ignores flicker shorter than holdMs (no repeated events)", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 300);
    d.update("r", "NOT_SATISFIED", 0);
    for (let t = 33; t < 3000; t += 33) d.update("r", t % 66 === 0 ? "SATISFIED" : "NOT_SATISFIED", t);
    expect(log.all()).toHaveLength(1);
  });

  it("restarts the hold timer when the pending status changes", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 300);
    d.update("r", "NOT_SATISFIED", 0);
    d.update("r", "SATISFIED", 100);
    d.update("r", "UNCERTAIN", 250);
    expect(d.update("r", "UNCERTAIN", 500)).toBe("NOT_SATISFIED");
    expect(d.update("r", "UNCERTAIN", 550)).toBe("UNCERTAIN");
  });

  it("commits on the same frame when holdMs is 0 (used for composite rules)", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 0);
    d.update("r", "NOT_SATISFIED", 0);
    expect(d.update("r", "SATISFIED", 33)).toBe("SATISFIED");
    expect(log.all()[1]).toMatchObject({ t: 33, from: "NOT_SATISFIED", to: "SATISFIED" });
  });

  it("tracks rules independently", () => {
    const log = new EventLog();
    const d = new TransitionDetector(log, 300);
    d.update("a", "SATISFIED", 0);
    d.update("b", "NOT_SATISFIED", 0);
    d.update("a", "NOT_SATISFIED", 10);
    d.update("a", "NOT_SATISFIED", 400);
    expect(log.forRule("a")).toHaveLength(2);
    expect(log.forRule("b")).toHaveLength(1);
  });

  it("never logs two consecutive events with the same status for a rule (property)", () => {
    const status = fc.constantFrom<Status>("SATISFIED", "NOT_SATISFIED", "UNCERTAIN");
    fc.assert(
      fc.property(fc.array(fc.tuple(status, fc.integer({ min: 0, max: 200 })), { maxLength: 200 }), (steps) => {
        const log = new EventLog();
        const d = new TransitionDetector(log, 300);
        let t = 0;
        for (const [s, dt] of steps) d.update("r", s, (t += dt));
        const ev = log.forRule("r");
        return ev.every((e, i) => i === 0 || (e.from === ev[i - 1]!.to && e.to !== e.from));
      }),
    );
  });
});

describe("EventLog", () => {
  it("rejects events that go back in time", () => {
    const log = new EventLog();
    log.append({ t: 10, ruleId: "r", from: null, to: "SATISFIED" });
    expect(() => log.append({ t: 5, ruleId: "r", from: "SATISFIED", to: "UNCERTAIN" })).toThrow(/append-only/);
  });

  it("returns the latest n events", () => {
    const log = new EventLog();
    for (let t = 0; t < 30; t++) log.append({ t, ruleId: "r", from: null, to: "SATISFIED" });
    expect(log.latest(20)).toHaveLength(20);
    expect(log.latest(20)[0]!.t).toBe(10);
  });
});

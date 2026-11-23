import { EventLog, TransitionDetector } from "./events/eventLog";
import { evaluate } from "./rules/evaluate";
import type { Rule } from "./rules/schema";
import { Tracker, type TrackerOptions } from "./tracking/tracker";
import type { Evaluation, Frame, ObjectId, Status, WorldState, Zone } from "./types";
import { detectAll } from "./vision/blobs";
import type { HsvRange } from "./vision/hsv";

export interface EngineOptions extends TrackerOptions {
  /** How long (ms) a new status must persist before it is committed. */
  holdMs?: number;
  /** Minimum blob size, as a fraction of the frame. */
  minArea?: number;
}

export interface RuleResult {
  /** This frame's raw evaluation. */
  raw: Evaluation;
  /** Debounced status: what the UI should show. */
  status: Status;
}

export interface StepResult {
  world: WorldState;
  results: Record<string, RuleResult>;
}

/**
 * The whole pipeline for one frame: detect → track → evaluate → debounce → log.
 * Apps own the camera and the render loop; they call `step` with each frame.
 */
export class TinkrEngine {
  readonly log = new EventLog();
  private readonly tracker: Tracker;
  private readonly transitions: TransitionDetector;
  private readonly minArea: number;
  private calibration: Record<ObjectId, HsvRange> = {};
  private rules = new Map<string, Rule>();
  private zones: Record<string, Zone> = {};

  constructor(opts: EngineOptions = {}) {
    this.tracker = new Tracker(opts);
    this.transitions = new TransitionDetector(this.log, opts.holdMs ?? 300);
    this.minArea = opts.minArea ?? 0.002;
  }

  setCalibration(calibration: Record<ObjectId, HsvRange>): void {
    this.calibration = { ...calibration };
  }

  setRule(id: string, rule: Rule): void {
    this.rules.set(id, rule);
    this.transitions.forget(id);
  }

  removeRule(id: string): void {
    this.rules.delete(id);
    this.transitions.forget(id);
  }

  setZones(zones: Zone[]): void {
    this.zones = Object.fromEntries(zones.map((z) => [z.id, z]));
  }

  /** Pass `null` when there is no frame (camera missing or disconnected). */
  step(frame: Frame | null, t: number): StepResult {
    let world: WorldState;
    if (frame) {
      const detections = detectAll(frame, this.calibration, this.minArea);
      world = {
        t,
        aspect: frame.width / frame.height,
        cameraOk: true,
        objects: this.tracker.update(detections, t),
        zones: this.zones,
      };
    } else {
      this.tracker.reset();
      world = { t, aspect: 1, cameraOk: false, objects: {}, zones: this.zones };
    }

    const results: Record<string, RuleResult> = {};
    for (const [id, rule] of this.rules) {
      const raw = evaluate(rule, world);
      results[id] = { raw, status: this.transitions.update(id, raw.status, t) };
    }
    return { world, results };
  }
}

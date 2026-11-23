import type { ObjectId, TrackedObject } from "../types";
import type { Detection } from "../vision/blobs";

export interface TrackerOptions {
  /** EMA weight of the newest position, 0..1. Higher = more responsive, less smooth. */
  alpha?: number;
  /** How long (ms) a lost object keeps its last position before becoming invisible. */
  graceMs?: number;
  /** Frames of history used for the area-stability part of quality. */
  historySize?: number;
  /** Frames an object must be seen before it reaches full quality. */
  warmupFrames?: number;
}

interface Internal {
  obj: TrackedObject;
  areas: number[];
  framesSeen: number;
}

/**
 * Turns per-frame detections into stable, smoothed objects.
 * In M1 each colour is one object, so identity = colour label.
 */
export class Tracker {
  private readonly alpha: number;
  private readonly graceMs: number;
  private readonly historySize: number;
  private readonly warmupFrames: number;
  private readonly state = new Map<ObjectId, Internal>();

  constructor(opts: TrackerOptions = {}) {
    this.alpha = opts.alpha ?? 0.5;
    this.graceMs = opts.graceMs ?? 500;
    this.historySize = opts.historySize ?? 10;
    this.warmupFrames = opts.warmupFrames ?? 5;
  }

  update(detections: Record<ObjectId, Detection | null>, t: number): Record<ObjectId, TrackedObject> {
    const out: Record<ObjectId, TrackedObject> = {};
    for (const [id, det] of Object.entries(detections)) {
      out[id] = det ? this.seen(id, det, t) : this.missed(id, t);
    }
    // Objects no longer calibrated are dropped.
    for (const id of [...this.state.keys()]) if (!(id in detections)) this.state.delete(id);
    return out;
  }

  /** Forget everything, e.g. after the camera disconnects. */
  reset(): void {
    this.state.clear();
  }

  private seen(id: ObjectId, det: Detection, t: number): TrackedObject {
    const prev = this.state.get(id);
    const wasTracked = prev !== undefined && prev.obj.visible;
    const a = this.alpha;
    const mix = (old: number, cur: number) => (wasTracked ? old + a * (cur - old) : cur);

    const areas = [...(prev?.areas ?? []), det.area].slice(-this.historySize);
    const framesSeen = (prev && wasTracked ? prev.framesSeen : 0) + 1;

    const obj: TrackedObject = {
      id,
      x: mix(prev?.obj.x ?? det.x, det.x),
      y: mix(prev?.obj.y ?? det.y, det.y),
      bbox: {
        x: mix(prev?.obj.bbox.x ?? det.bbox.x, det.bbox.x),
        y: mix(prev?.obj.bbox.y ?? det.bbox.y, det.bbox.y),
        w: mix(prev?.obj.bbox.w ?? det.bbox.w, det.bbox.w),
        h: mix(prev?.obj.bbox.h ?? det.bbox.h, det.bbox.h),
      },
      area: det.area,
      visible: true,
      lastSeen: t,
      quality: Math.min(1, framesSeen / this.warmupFrames) * areaStability(areas),
    };
    this.state.set(id, { obj, areas, framesSeen });
    return obj;
  }

  private missed(id: ObjectId, t: number): TrackedObject {
    const prev = this.state.get(id);
    if (!prev || prev.obj.lastSeen < 0) {
      const obj = hidden(id, -1);
      this.state.set(id, { obj, areas: [], framesSeen: 0 });
      return obj;
    }

    const gone = t - prev.obj.lastSeen;
    if (gone <= this.graceMs && prev.obj.visible) {
      // Briefly occluded: hold the last position, fade quality toward 0 over the grace period.
      const fade = 1 - gone / this.graceMs;
      const lastQuality = prev.areas.length ? Math.min(1, prev.framesSeen / this.warmupFrames) * areaStability(prev.areas) : 0;
      const obj = { ...prev.obj, quality: lastQuality * fade };
      this.state.set(id, { ...prev, obj });
      return obj;
    }

    const obj = { ...hidden(id, prev.obj.lastSeen), x: prev.obj.x, y: prev.obj.y, bbox: prev.obj.bbox };
    this.state.set(id, { obj, areas: [], framesSeen: 0 });
    return obj;
  }
}

function hidden(id: ObjectId, lastSeen: number): TrackedObject {
  return { id, x: 0, y: 0, bbox: { x: 0, y: 0, w: 0, h: 0 }, area: 0, visible: false, lastSeen, quality: 0 };
}

/** 1 when the blob area is steady, toward 0 as its coefficient of variation grows. */
export function areaStability(areas: number[]): number {
  if (areas.length < 2) return 1;
  const mean = areas.reduce((s, a) => s + a, 0) / areas.length;
  if (mean === 0) return 0;
  const variance = areas.reduce((s, a) => s + (a - mean) ** 2, 0) / areas.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, 1 - cv * 2);
}

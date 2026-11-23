/** Identifier of a tracked object. In M1 this is the calibrated colour label, e.g. "red". */
export type ObjectId = string;

export type Status = "SATISFIED" | "NOT_SATISFIED" | "UNCERTAIN";

/** Normalised rectangle: x/y/w/h in [0,1] of frame width/height, origin top-left. */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TrackedObject {
  id: ObjectId;
  /** Smoothed centroid, normalised to [0,1]. */
  x: number;
  y: number;
  bbox: BBox;
  /** Blob area as a fraction of the frame. */
  area: number;
  visible: boolean;
  /** Timestamp (ms) of the last frame this object was actually detected in. -1 if never. */
  lastSeen: number;
  /**
   * 0..1, derived only from measurable signals: how many frames it has been tracked,
   * how stable its area is, and how long since it was last detected. Not a model confidence.
   */
  quality: number;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WorldState {
  /** Timestamp (ms) of this observation. */
  t: number;
  /** Frame width / height. Used so distances are measured in true proportions. */
  aspect: number;
  /** False when the camera is missing or disconnected. Evaluators must not report success then. */
  cameraOk: boolean;
  objects: Record<ObjectId, TrackedObject>;
  zones: Record<string, Zone>;
}

export interface Evaluation {
  status: Status;
  /** Short, human-readable explanation, e.g. "red is 0.21 from blue (needs ≤ 0.15)". */
  reason: string;
}

/** An RGBA pixel buffer. Structurally compatible with the DOM's ImageData. */
export interface Frame {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

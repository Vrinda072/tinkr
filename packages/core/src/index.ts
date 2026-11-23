export type * from "./types";

export { TinkrEngine, type EngineOptions, type RuleResult, type StepResult } from "./engine";

export { rgbToHsv, inRange, type Hsv, type HsvRange } from "./vision/hsv";
export { calibrateFromPatch, type CalibrationResult } from "./vision/calibrate";
export { detectAll, type Detection } from "./vision/blobs";
export { Tracker, type TrackerOptions } from "./tracking/tracker";

export { distance, evaluateNear } from "./spatial/near";
export { evaluate } from "./rules/evaluate";
export { buildRuleSchema, type Rule, type NearRule } from "./rules/schema";

export { EventLog, TransitionDetector, type RuleEvent } from "./events/eventLog";

export { startCamera, FrameGrabber, type CameraHandle, type CameraError } from "./camera/camera";

import type { ObjectId, WorldState } from "../types";

/**
 * Returns a reason string if any of the given objects can't be trusted right now,
 * or null if all are visible. Every evaluator calls this first so that missing
 * information always produces UNCERTAIN, never a false SATISFIED or NOT_SATISFIED.
 */
export function visibilityProblem(world: WorldState, ids: ObjectId[]): string | null {
  if (!world.cameraOk) return "camera unavailable";
  const missing = ids.filter((id) => !world.objects[id]?.visible);
  if (missing.length === 0) return null;
  return `can't see ${missing.join(" and ")}`;
}

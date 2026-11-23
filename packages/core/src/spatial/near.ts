import type { NearRule } from "../rules/schema";
import type { Evaluation, TrackedObject, WorldState } from "../types";
import { visibilityProblem } from "./visibility";

/**
 * Distance between two centroids, in units of frame height.
 * x is scaled by the aspect ratio so a 16:9 frame doesn't stretch horizontal distances.
 */
export function distance(
  a: Pick<TrackedObject, "x" | "y">,
  b: Pick<TrackedObject, "x" | "y">,
  aspect: number,
): number {
  return Math.hypot((a.x - b.x) * aspect, a.y - b.y);
}

export function evaluateNear(rule: NearRule, world: WorldState): Evaluation {
  const problem = visibilityProblem(world, [rule.subject, rule.target]);
  if (problem) return { status: "UNCERTAIN", reason: problem };

  const s = world.objects[rule.subject]!;
  const t = world.objects[rule.target]!;
  const d = distance(s, t, world.aspect);
  const shown = `${rule.subject} is ${d.toFixed(2)} from ${rule.target} (needs ≤ ${rule.threshold.toFixed(2)})`;
  return d <= rule.threshold
    ? { status: "SATISFIED", reason: shown }
    : { status: "NOT_SATISFIED", reason: shown };
}

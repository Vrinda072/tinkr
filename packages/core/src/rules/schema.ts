import { z } from "zod";
import type { ObjectId } from "../types";

/**
 * Builds the rule schema for the objects that are actually calibrated right now.
 * Object references are closed enums, so an LLM (later) or a saved level can't
 * reference an object Tinkr doesn't know about.
 */
export function buildRuleSchema(objectIds: readonly ObjectId[]) {
  if (objectIds.length === 0) {
    throw new Error("buildRuleSchema needs at least one calibrated object");
  }
  const id = z.enum(objectIds as [string, ...string[]]);
  const near = z
    .object({
      type: z.literal("NEAR"),
      subject: id,
      target: id,
      threshold: z.number().gt(0).max(1.5),
    })
    .strict()
    .refine((r) => r.subject !== r.target, { message: "subject and target must differ" });

  // More rule types (BETWEEN, INSIDE, MOVED_TO, BEFORE, ALL) arrive in M2.
  return near;
}

export interface NearRule {
  type: "NEAR";
  subject: ObjectId;
  target: ObjectId;
  /** Maximum centroid distance, in units of frame height. */
  threshold: number;
}

export type Rule = NearRule;

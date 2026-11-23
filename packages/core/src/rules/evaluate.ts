import { evaluateNear } from "../spatial/near";
import type { Evaluation, WorldState } from "../types";
import type { Rule } from "./schema";

/** Deterministic, pure evaluation of a rule against one observation. */
export function evaluate(rule: Rule, world: WorldState): Evaluation {
  switch (rule.type) {
    case "NEAR":
      return evaluateNear(rule, world);
  }
}

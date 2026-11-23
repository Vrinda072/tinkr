import type { Status } from "../types";

export interface RuleEvent {
  /** Timestamp (ms) the new status was committed. */
  t: number;
  ruleId: string;
  /** null for the first status a rule ever reports. */
  from: Status | null;
  to: Status;
}

/** Append-only history of committed rule transitions. Temporal rules (M2) read only this. */
export class EventLog {
  private readonly events: RuleEvent[] = [];

  append(event: RuleEvent): void {
    const last = this.events[this.events.length - 1];
    if (last && event.t < last.t) {
      throw new Error(`EventLog is append-only: event at ${event.t} is earlier than ${last.t}`);
    }
    this.events.push(Object.freeze({ ...event }));
  }

  all(): readonly RuleEvent[] {
    return this.events;
  }

  forRule(ruleId: string): RuleEvent[] {
    return this.events.filter((e) => e.ruleId === ruleId);
  }

  latest(n: number): RuleEvent[] {
    return this.events.slice(-n);
  }
}

/**
 * Turns noisy per-frame statuses into committed transitions.
 * A new status must persist for `holdMs` before it is committed and logged,
 * so flicker at a threshold boundary never produces repeated events.
 */
export class TransitionDetector {
  private readonly committed = new Map<string, Status>();
  private readonly pending = new Map<string, { status: Status; since: number }>();

  constructor(
    private readonly log: EventLog,
    private readonly holdMs = 300,
  ) {}

  /** Feed the raw status for a rule at time t. Returns the committed (debounced) status. */
  update(ruleId: string, raw: Status, t: number): Status {
    const current = this.committed.get(ruleId);

    if (current === undefined) {
      this.commit(ruleId, null, raw, t);
      return raw;
    }
    if (raw === current) {
      this.pending.delete(ruleId);
      return current;
    }

    let p = this.pending.get(ruleId);
    if (!p || p.status !== raw) {
      p = { status: raw, since: t };
      this.pending.set(ruleId, p);
    }
    // Checked in the same call so holdMs = 0 commits immediately instead of one frame late.
    if (t - p.since >= this.holdMs) {
      this.commit(ruleId, current, raw, t);
      return raw;
    }
    return current;
  }

  committedStatus(ruleId: string): Status | undefined {
    return this.committed.get(ruleId);
  }

  /** Forget a rule, e.g. when it is removed or edited. */
  forget(ruleId: string): void {
    this.committed.delete(ruleId);
    this.pending.delete(ruleId);
  }

  private commit(ruleId: string, from: Status | null, to: Status, t: number): void {
    this.committed.set(ruleId, to);
    this.pending.delete(ruleId);
    this.log.append({ t, ruleId, from, to });
  }
}

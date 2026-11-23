import type { HsvRange } from "@tinkr/core";

export const LABELS = [
  { id: "red", swatch: "#e5484d" },
  { id: "blue", swatch: "#3e63dd" },
  { id: "green", swatch: "#30a46c" },
  { id: "yellow", swatch: "#f5c400" },
] as const;

export type LabelId = (typeof LABELS)[number]["id"];

export const swatchFor = (id: string) => LABELS.find((l) => l.id === id)?.swatch ?? "#888";

const KEY = "tinkr.calibration.v1";

/** Calibration survives reloads when storage works, and is simply not saved when it doesn't. */
export function loadCalibration(): Record<string, HsvRange> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, HsvRange>) : {};
  } catch {
    return {};
  }
}

export function saveCalibration(c: Record<string, HsvRange>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable (private mode etc.): calibration lasts for this session only */
  }
}

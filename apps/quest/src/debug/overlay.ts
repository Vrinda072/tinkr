import type { NearRule, Status, StepResult } from "@tinkr/core";
import { swatchFor } from "./labels";

export const STATUS_COLOR: Record<Status, string> = {
  SATISFIED: "#2f9e6a",
  NOT_SATISFIED: "#9a8aa8",
  UNCERTAIN: "#e0a100",
};

/** Draws tracked objects and the active NEAR rule on top of the video. */
export function drawOverlay(
  canvas: HTMLCanvasElement,
  step: StepResult | null,
  rule: NearRule | null,
  status: Status | null,
): void {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!step) return;

  const objects = step.world.objects;

  // Rule: a dashed circle of the NEAR threshold around the target and a line to the subject.
  if (rule && status) {
    const s = objects[rule.subject];
    const t = objects[rule.target];
    const color = STATUS_COLOR[status];
    if (t?.visible) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Threshold is in frame-height units, so radius scales with display height.
      ctx.arc(t.x * w, t.y * h, rule.threshold * h, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (s?.visible && t?.visible) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x * w, s.y * h);
      ctx.lineTo(t.x * w, t.y * h);
      ctx.stroke();
      ctx.restore();
    }
  }

  for (const o of Object.values(objects)) {
    if (!o.visible) continue;
    const color = swatchFor(o.id);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * o.quality;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const r = 10;
    roundRect(ctx, o.bbox.x * w, o.bbox.y * h, o.bbox.w * w, o.bbox.h * h, r);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(o.x * w, o.y * h, 4, 0, Math.PI * 2);
    ctx.fill();

    const label = `${o.id} · q ${o.quality.toFixed(2)}`;
    ctx.font = "600 12px ui-rounded, system-ui, sans-serif";
    const tw = ctx.measureText(label).width + 12;
    const lx = o.bbox.x * w;
    const ly = Math.max(0, o.bbox.y * h - 22);
    ctx.fillStyle = "rgba(52,38,63,0.85)";
    roundRect(ctx, lx, ly, tw, 18, 9);
    ctx.fill();
    ctx.fillStyle = "#fff9f0";
    ctx.fillText(label, lx + 6, ly + 13);
    ctx.restore();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

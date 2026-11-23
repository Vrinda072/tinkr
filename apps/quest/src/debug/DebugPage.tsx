import {
  buildRuleSchema,
  calibrateFromPatch,
  FrameGrabber,
  startCamera,
  TinkrEngine,
  type CameraError,
  type CameraHandle,
  type Frame,
  type HsvRange,
  type NearRule,
  type RuleEvent,
  type StepResult,
} from "@tinkr/core";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { LABELS, loadCalibration, saveCalibration, swatchFor, type LabelId } from "./labels";
import { drawOverlay, STATUS_COLOR } from "./overlay";

type CamState = "starting" | "live" | "disconnected" | CameraError;

const CAMERA_MESSAGES: Record<Exclude<CamState, "live">, string> = {
  starting: "Waking up the camera…",
  denied: "Tinkr needs camera access to see your objects. Allow it in the browser's address bar, then retry.",
  "not-found": "No camera found. Plug one in, then retry.",
  "in-use": "The camera is busy in another app. Close it there, then retry.",
  unsupported: "This browser can't use the camera. Try a recent Chrome, Edge or Safari.",
  unknown: "The camera couldn't start.",
  disconnected: "The camera disconnected. Rules are paused as uncertain until it's back.",
};

const RULE_ID = "debug";
const FRAME_INTERVAL_MS = 66; // ~15 fps processing
const LABEL_IDS = LABELS.map((l) => l.id);

export function DebugPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const engine = useMemo(() => new TinkrEngine({ holdMs: 300, graceMs: 500 }), []);
  const lastFrame = useRef<Frame | null>(null);

  const [cam, setCam] = useState<CamState>("starting");
  const [retry, setRetry] = useState(0);
  const [calibration, setCalibration] = useState<Record<string, HsvRange>>(loadCalibration);
  const [activeLabel, setActiveLabel] = useState<LabelId>("red");
  const [ruleDraft, setRuleDraft] = useState<NearRule>({ type: "NEAR", subject: "red", target: "blue", threshold: 0.2 });
  const [step, setStep] = useState<StepResult | null>(null);
  const [events, setEvents] = useState<RuleEvent[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const startedAt = useRef(performance.now());

  const parsed = useMemo(() => buildRuleSchema(LABEL_IDS).safeParse(ruleDraft), [ruleDraft]);
  const rule = parsed.success ? (parsed.data as NearRule) : null;

  // Camera lifecycle.
  useEffect(() => {
    const video = videoRef.current!;
    let handle: CameraHandle | null = null;
    let cancelled = false;
    setCam("starting");
    startCamera(video, () => setCam("disconnected"))
      .then((h) => {
        if (cancelled) return h.stop();
        handle = h;
        setCam("live");
      })
      .catch((e: { kind?: CameraError }) => !cancelled && setCam(e.kind ?? "unknown"));
    return () => {
      cancelled = true;
      handle?.stop();
    };
  }, [retry]);

  // Keep the engine in sync with UI state.
  useEffect(() => {
    engine.setCalibration(calibration);
    saveCalibration(calibration);
  }, [engine, calibration]);

  useEffect(() => {
    if (rule) engine.setRule(RULE_ID, rule);
    else engine.removeRule(RULE_ID);
  }, [engine, rule]);

  // Processing loop: grab → engine.step → draw. React state is updated at the same ~15 fps.
  useEffect(() => {
    const grabber = new FrameGrabber(160);
    let raf = 0;
    let last = 0;
    let frames = 0;
    let fpsWindow = performance.now();
    let lastEventCount = -1;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_INTERVAL_MS) return;
      last = now;

      const video = videoRef.current;
      const frame = cam === "live" && video ? grabber.grab(video) : null;
      if (cam === "live" && !frame) return; // video not ready yet
      lastFrame.current = frame;

      const result = engine.step(frame, now);
      setStep(result);
      if (overlayRef.current) {
        drawOverlay(overlayRef.current, result, rule, rule ? (result.results[RULE_ID]?.status ?? null) : null);
      }
      if (engine.log.all().length !== lastEventCount) {
        lastEventCount = engine.log.all().length;
        setEvents(engine.log.latest(20).reverse());
      }

      frames++;
      if (now - fpsWindow >= 1000) {
        setFps(Math.round((frames * 1000) / (now - fpsWindow)));
        frames = 0;
        fpsWindow = now;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, cam, rule]);

  function onVideoClick(e: MouseEvent<HTMLDivElement>) {
    const frame = lastFrame.current;
    if (!frame) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = Math.round(((e.clientX - rect.left) / rect.width) * frame.width);
    const fy = Math.round(((e.clientY - rect.top) / rect.height) * frame.height);
    const result = calibrateFromPatch(frame, fx, fy);
    if (!result.ok) {
      setNotice(`Couldn't learn ${activeLabel}: ${result.reason}.`);
      return;
    }
    setCalibration((c) => ({ ...c, [activeLabel]: result.range }));
    setNotice(`Learned ${activeLabel} (hue ${Math.round(result.sample.h)}°).`);
    // Move on to the next uncalibrated label to make setup quick.
    const next = LABELS.find((l) => l.id !== activeLabel && !calibration[l.id]);
    if (next) setActiveLabel(next.id);
  }

  const ruleResult = step?.results[RULE_ID];
  const status = ruleResult?.status;

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>Tinkr engine debug</h1>
          <p className="muted">Milestone 1: camera → tracking → NEAR rule → event log</p>
        </div>
        <div className="stats">
          <span className={`dot ${cam === "live" ? "on" : ""}`} /> {cam === "live" ? `${fps} fps` : cam}
        </div>
      </header>

      <main className="grid">
        <section className="stage-card">
          <div className="stage" onClick={onVideoClick} role="button" aria-label={`Click an object to calibrate ${activeLabel}`}>
            <video ref={videoRef} className="video" />
            <canvas ref={overlayRef} className="overlay" />
            {cam !== "live" && (
              <div className="stage-message">
                <p>{CAMERA_MESSAGES[cam]}</p>
                {cam !== "starting" && (
                  <button className="btn" onClick={(e) => (e.stopPropagation(), setRetry((r) => r + 1))}>
                    Retry camera
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="hint">
            Pick a colour, then click that object in the video to teach Tinkr what it looks like.
          </p>
          {notice && <p className="notice">{notice}</p>}
        </section>

        <aside className="side">
          <div className="card">
            <h2>1 · Calibrate</h2>
            <div className="labels">
              {LABELS.map((l) => {
                const o = step?.world.objects[l.id];
                return (
                  <button
                    key={l.id}
                    className={`label ${activeLabel === l.id ? "active" : ""}`}
                    onClick={() => setActiveLabel(l.id)}
                  >
                    <span className="swatch" style={{ background: l.swatch }} />
                    <span className="label-name">{l.id}</span>
                    <span className="muted small">
                      {!calibration[l.id] ? "not set" : o?.visible ? `seen · q ${o.quality.toFixed(2)}` : "not seen"}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="btn ghost" onClick={() => setCalibration({})}>
              Reset calibration
            </button>
          </div>

          <div className="card">
            <h2>2 · Rule</h2>
            <div className="rule-row">
              <Select value={ruleDraft.subject} onChange={(subject) => setRuleDraft((r) => ({ ...r, subject }))} />
              <span className="muted">near</span>
              <Select value={ruleDraft.target} onChange={(target) => setRuleDraft((r) => ({ ...r, target }))} />
            </div>
            <label className="slider">
              <span>
                Threshold <b>{ruleDraft.threshold.toFixed(2)}</b> <span className="muted small">× frame height</span>
              </span>
              <input
                type="range"
                min={0.05}
                max={0.6}
                step={0.01}
                value={ruleDraft.threshold}
                onChange={(e) => setRuleDraft((r) => ({ ...r, threshold: Number(e.target.value) }))}
              />
            </label>
            {!parsed.success && <p className="error">{parsed.error.issues[0]?.message}</p>}
            {status && (
              <div className="status" style={{ borderColor: STATUS_COLOR[status] }}>
                <span className="status-pill" style={{ background: STATUS_COLOR[status] }}>
                  {status.replace("_", " ").toLowerCase()}
                </span>
                <span className="small">{ruleResult.raw.reason}</span>
              </div>
            )}
            <pre className="json">{JSON.stringify(ruleDraft, null, 2)}</pre>
          </div>

          <div className="card">
            <h2>3 · Events</h2>
            {events.length === 0 ? (
              <p className="muted small">No transitions yet. Move a block.</p>
            ) : (
              <ol className="events">
                {events.map((e, i) => (
                  <li key={`${e.t}-${i}`}>
                    <span className="muted mono">{((e.t - startedAt.current) / 1000).toFixed(1)}s</span>
                    <span>{e.from ? e.from.toLowerCase().replace("_", " ") : "start"}</span>
                    <span className="muted">→</span>
                    <b style={{ color: STATUS_COLOR[e.to] }}>{e.to.toLowerCase().replace("_", " ")}</b>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className="select">
      <span className="swatch" style={{ background: swatchFor(value) }} />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {LABELS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.id}
          </option>
        ))}
      </select>
    </span>
  );
}

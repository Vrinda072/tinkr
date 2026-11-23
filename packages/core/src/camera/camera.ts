import type { Frame } from "../types";

/** The only DOM-touching module in core. Everything else is pure. */

export type CameraError = "denied" | "not-found" | "in-use" | "unsupported" | "unknown";

export interface CameraHandle {
  stop(): void;
}

export async function startCamera(
  video: HTMLVideoElement,
  onEnded: () => void,
  size = { width: 640, height: 480 },
): Promise<CameraHandle> {
  if (!navigator.mediaDevices?.getUserMedia) throw cameraError("unsupported");

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: size.width }, height: { ideal: size.height } },
      audio: false,
    });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") throw cameraError("denied");
    if (name === "NotFoundError" || name === "OverconstrainedError") throw cameraError("not-found");
    if (name === "NotReadableError") throw cameraError("in-use");
    throw cameraError("unknown");
  }

  for (const track of stream.getVideoTracks()) track.addEventListener("ended", onEnded);
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  return {
    stop() {
      for (const track of stream.getTracks()) track.stop();
      video.srcObject = null;
    },
  };
}

function cameraError(kind: CameraError): Error & { kind: CameraError } {
  return Object.assign(new Error(`camera: ${kind}`), { kind });
}

/** Grabs downscaled frames from a playing video for processing. */
export class FrameGrabber {
  private readonly canvas = document.createElement("canvas");
  private readonly ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;

  constructor(private readonly targetWidth = 160) {}

  grab(video: HTMLVideoElement): Frame | null {
    if (video.readyState < 2 || video.videoWidth === 0) return null;
    const w = this.targetWidth;
    const h = Math.round((video.videoHeight / video.videoWidth) * w);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ctx.drawImage(video, 0, 0, w, h);
    return this.ctx.getImageData(0, 0, w, h);
  }
}

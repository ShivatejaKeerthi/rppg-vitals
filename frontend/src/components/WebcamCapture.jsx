import { useEffect, useRef, useState } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const FOREHEAD_HEIGHT_RATIO = 0.35;

export function WebcamCapture({ onSample, active }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animRef = useRef(null);
  const fpsTrackerRef = useRef({ last: 0, deltas: [] });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function init() {
      setStatus("loading");
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        detectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("running");
      } catch (e) {
        console.error("WebcamCapture init failed:", e);
        setStatus("error");
      }
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      videoRef.current && (videoRef.current.srcObject = null);
      detectorRef.current?.close();
      detectorRef.current = null;
      setStatus("idle");
    };
  }, [active]);

  useEffect(() => {
    if (status !== "running") return;

    function processFrame(timestamp) {
      animRef.current = requestAnimationFrame(processFrame);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      // Track fps
      const tracker = fpsTrackerRef.current;
      if (tracker.last) {
        tracker.deltas = tracker.deltas.slice(-29);
        tracker.deltas.push((timestamp - tracker.last) / 1000);
      }
      tracker.last = timestamp;
      const fps =
        tracker.deltas.length > 0
          ? Math.round(1 / (tracker.deltas.reduce((a, b) => a + b) / tracker.deltas.length))
          : 30;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0);

      const result = detectorRef.current?.detectForVideo(video, timestamp);
      if (!result?.detections?.length) return;

      const bb = result.detections[0].boundingBox;
      const x = Math.max(0, Math.floor(bb.originX));
      const y = Math.max(0, Math.floor(bb.originY));
      const w = Math.floor(bb.width);
      const fh = Math.floor(bb.height * FOREHEAD_HEIGHT_RATIO);

      if (w <= 0 || fh <= 0) return;

      // Draw overlays
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22c55e";
      ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);
      ctx.strokeStyle = "#86efac";
      ctx.strokeRect(x, y, w, fh);

      // Extract avg green from forehead ROI
      const pixels = ctx.getImageData(x, y, w, fh).data;
      let green = 0;
      const count = pixels.length / 4;
      for (let i = 1; i < pixels.length; i += 4) green += pixels[i];

      onSample(green / count, fps);
    }

    animRef.current = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [status, onSample]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 h-full w-full">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {status === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          Press Start to activate camera
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            Loading face detector…
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400 text-sm text-center p-4">
          Camera or model error. Allow camera access and try again.
        </div>
      )}
    </div>
  );
}

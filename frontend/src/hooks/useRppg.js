import { useState, useRef, useCallback } from "react";
import { API_BASE as API } from "../config";

const BUFFER_SIZE = 600; // 20s at 30fps — needed for breathing rate FFT resolution
const CALL_INTERVAL_MS = 2000;
const SAVE_INTERVAL_MS = 10000;
const MIN_CONFIDENCE = 0.3;

export function useRppg() {
  const [bpm, setBpm] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [quality, setQuality] = useState("poor");
  const [anomalies, setAnomalies] = useState([]);
  const [brpm, setBrpm] = useState(null);
  const [breathingConfidence, setBreathingConfidence] = useState(0);
  const [hrvRmssd, setHrvRmssd] = useState(null);
  const [stressLevel, setStressLevel] = useState("unknown");
  const [stressScore, setStressScore] = useState(0);
  const [signalBuffer, setSignalBuffer] = useState([]);
  const [sessions, setSessions] = useState([]);

  const bufferRef = useRef([]);
  const lastCallRef = useRef(0);
  const lastSaveRef = useRef(0);

  const addSample = useCallback((greenValue, fps) => {
    const next = bufferRef.current.slice(-(BUFFER_SIZE - 1));
    next.push(greenValue);
    bufferRef.current = next;
    setSignalBuffer([...next]);

    const now = Date.now();
    if (now - lastCallRef.current < CALL_INTERVAL_MS) return;
    if (bufferRef.current.length < Math.round(fps * 2)) return;

    lastCallRef.current = now;

    fetch(`${API}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ green_signal: bufferRef.current, fps }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.bpm != null) setBpm(data.bpm);
        const conf = data.confidence ?? 0;
        setConfidence(conf);
        setQuality(data.quality ?? "poor");
        setAnomalies(data.anomalies ?? []);
        if (data.brpm != null) setBrpm(data.brpm);
        setBreathingConfidence(data.breathing_confidence ?? 0);
        if (data.hrv_rmssd != null) setHrvRmssd(data.hrv_rmssd);
        setStressLevel(data.stress_level ?? "unknown");
        setStressScore(data.stress_score ?? 0);

        // Auto-save session snapshot every 10s if signal is good
        if (
          data.bpm != null &&
          conf >= MIN_CONFIDENCE &&
          now - lastSaveRef.current >= SAVE_INTERVAL_MS
        ) {
          lastSaveRef.current = now;
          fetch(`${API}/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bpm: data.bpm, confidence: conf }),
          })
            .then((r) => r.json())
            .then((session) => setSessions((prev) => [...prev, session]))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const reset = useCallback(() => {
    bufferRef.current = [];
    setSignalBuffer([]);
    setBpm(null);
    setConfidence(0);
    setQuality("poor");
    setAnomalies([]);
    setBrpm(null);
    setBreathingConfidence(0);
    setHrvRmssd(null);
    setStressLevel("unknown");
    setStressScore(0);
    lastCallRef.current = 0;
    lastSaveRef.current = 0;
  }, []);

  const clearSessions = useCallback(() => {
    fetch(`${API}/sessions`, { method: "DELETE" }).catch(() => {});
    setSessions([]);
  }, []);

  const exportCsv = useCallback(() => {
    if (sessions.length === 0) return;
    const header = "timestamp,bpm,confidence\n";
    const rows = sessions
      .map((s) => `${s.timestamp},${s.bpm},${s.confidence}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rppg_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  return { bpm, confidence, quality, anomalies, brpm, breathingConfidence, hrvRmssd, stressLevel, stressScore, signalBuffer, sessions, addSample, reset, clearSessions, exportCsv };
}

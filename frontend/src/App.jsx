import { useState, useEffect } from "react";
import { WebcamCapture } from "./components/WebcamCapture";
import { BpmDisplay } from "./components/BpmDisplay";
import { BrpmDisplay } from "./components/BrpmDisplay";
import { HrvDisplay } from "./components/HrvDisplay";
import { SignalChart } from "./components/SignalChart";
import { SessionHistory } from "./components/SessionHistory";
import { useRppg } from "./hooks/useRppg";
import { API_BASE } from "./config";

export default function App() {
  const [active, setActive] = useState(false);
  const {
    bpm, confidence, quality, anomalies,
    brpm, breathingConfidence,
    hrvRmssd, stressLevel, stressScore,
    signalBuffer, sessions, addSample, reset, clearSessions, exportCsv,
  } = useRppg();

  // Keep Render backend warm — ping /health every 10 minutes
  useEffect(() => {
    const ping = () => fetch(`${API_BASE}/health`).catch(() => {});
    ping();
    const id = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  function toggle() {
    if (active) reset();
    setActive((v) => !v);
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(ellipse at 15% 15%, rgba(16,185,129,0.08) 0%, transparent 45%)," +
          "radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.06) 0%, transparent 45%)," +
          "#05080f",
      }}
    >
      <div className="p-3 flex flex-col gap-3">

        {/* Header */}
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex-none flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-400">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight leading-none text-white truncate">
                Wise<span className="text-emerald-400">Vitals</span>
              </h1>
              <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">Camera-based vitals · no wearable needed</p>
            </div>
          </div>

          <button
            onClick={toggle}
            className="flex-none px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200"
            style={
              active
                ? { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }
                : { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" }
            }
          >
            {active ? "⏹ Stop" : "▶ Start"}
          </button>
        </header>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-3">

          {/* Left half — camera; sticky on desktop so it stays in view while right side scrolls */}
          <div className="lg:w-1/2 lg:flex-none lg:sticky lg:top-3">
            <div
              className="rounded-2xl overflow-hidden glass glow-border"
              style={{ aspectRatio: "4/3" }}
            >
              <WebcamCapture onSample={addSample} active={active} />
            </div>
          </div>

          {/* Right half — 2×2 grid on desktop; session history spans full row at bottom */}
          <div className="flex flex-col gap-3 lg:flex-1 lg:grid lg:grid-cols-2 lg:content-start">
            <BpmDisplay bpm={bpm} confidence={confidence} quality={quality} anomalies={anomalies} />
            <BrpmDisplay brpm={brpm} breathingConfidence={breathingConfidence} />
            <HrvDisplay hrvRmssd={hrvRmssd} stressLevel={stressLevel} stressScore={stressScore} />
            <SignalChart signalBuffer={signalBuffer} />
            {/* Session history — full-width row on desktop, normal on mobile */}
            <div className="lg:col-span-2">
              <SessionHistory sessions={sessions} onClear={clearSessions} onExport={exportCsv} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

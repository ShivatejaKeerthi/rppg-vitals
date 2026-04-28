const QUALITY_STYLES = {
  excellent: { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)", label: "Excellent" },
  good:      { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)", label: "Good" },
  fair:      { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)", label: "Fair" },
  poor:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",  label: "Poor" },
};

const ANOMALY_MESSAGES = {
  bpm_out_of_range: "BPM outside normal range (40–180).",
  signal_clipping:  "Camera exposure too high or low — adjust lighting.",
  flat_signal:      "Signal flat — keep your face clearly visible.",
  low_snr:          "Low SNR — try staying still.",
};

function HeartIcon({ bpm }) {
  const duration = bpm ? `${(60 / bpm).toFixed(2)}s` : null;
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-emerald-400 flex-none"
      style={duration ? { animation: `heartbeat ${duration} ease-in-out infinite` } : {}}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function BpmDisplay({ bpm, confidence, quality, anomalies }) {
  const pct = Math.round(confidence * 100);
  const qs = QUALITY_STYLES[quality] ?? QUALITY_STYLES.poor;

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">

      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <HeartIcon bpm={bpm} />
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400 truncate">Heart Rate</span>
        </div>
        <span
          className="flex-none text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: qs.color, background: qs.bg, border: `1px solid ${qs.border}` }}
        >
          {qs.label}
        </span>
      </div>

      {/* BPM number */}
      <div className="flex items-end gap-2 leading-none">
        <span
          className={`text-6xl font-extrabold tabular-nums transition-all duration-500${bpm ? " glow-green" : ""}`}
          style={{ color: bpm ? "#10b981" : "#374151" }}
        >
          {bpm ?? "--"}
        </span>
        <span className="text-gray-500 text-sm mb-1.5 font-medium">BPM</span>
      </div>

      {/* Quality bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Signal quality</span>
          <span style={{ color: qs.color }}>{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${qs.color}99, ${qs.color})` }}
          />
        </div>
      </div>

      {/* Anomaly alerts */}
      {anomalies.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {anomalies.map((code) => (
            <div
              key={code}
              className="flex items-start gap-2 text-xs rounded-xl px-3 py-2"
              style={{
                color: "#fcd34d",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              <span className="mt-px flex-none">⚠</span>
              <span>{ANOMALY_MESSAGES[code] ?? code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const QUALITY_STYLES = {
  good: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.3)",  label: "Good" },
  fair: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", label: "Fair" },
  poor: { color: "#6b7280", bg: "rgba(107,114,128,0.1)",border: "rgba(107,114,128,0.3)",label: "Waiting…" },
};

function breathingQuality(confidence) {
  if (confidence >= 0.5) return "good";
  if (confidence >= 0.25) return "fair";
  return "poor";
}

function LungIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v10" />
      <path d="M7 8C4 8 2 10 2 13c0 3.5 2 6 5 6h2V8H7z" />
      <path d="M17 8c3 0 5 2 5 5 0 3.5-2 6-5 6h-2V8h2z" />
    </svg>
  );
}

export function BrpmDisplay({ brpm, breathingConfidence }) {
  const q = breathingQuality(breathingConfidence);
  const qs = QUALITY_STYLES[q];
  const pct = Math.round(breathingConfidence * 100);
  const normal = brpm != null && brpm >= 12 && brpm <= 20;

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <LungIcon />
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Breathing Rate</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: qs.color, background: qs.bg, border: `1px solid ${qs.border}` }}
        >
          {qs.label}
        </span>
      </div>

      {/* BrPM number */}
      <div className="flex items-end gap-2 leading-none">
        <span
          className="text-6xl font-extrabold tabular-nums transition-all duration-500"
          style={{
            color: brpm ? (normal ? "#06b6d4" : "#f59e0b") : "#374151",
            textShadow: brpm
              ? `0 0 20px ${normal ? "rgba(6,182,212,0.6)" : "rgba(245,158,11,0.6)"}, 0 0 40px ${normal ? "rgba(6,182,212,0.3)" : "rgba(245,158,11,0.3)"}`
              : "none",
          }}
        >
          {brpm ?? "--"}
        </span>
        <div className="flex flex-col mb-1.5 gap-0.5">
          <span className="text-gray-500 text-sm font-medium leading-none">BrPM</span>
          {brpm != null && !normal && (
            <span className="text-xs" style={{ color: "#f59e0b" }}>
              {brpm < 12 ? "Low" : "High"}
            </span>
          )}
        </div>
      </div>

      {/* Quality bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Signal quality{brpm == null ? " (needs ~10s)" : ""}</span>
          <span style={{ color: qs.color }}>{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${qs.color}99, ${qs.color})` }}
          />
        </div>
      </div>

    </div>
  );
}

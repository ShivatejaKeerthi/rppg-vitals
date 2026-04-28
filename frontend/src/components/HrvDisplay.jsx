const STRESS_STYLES = {
  relaxed:     { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  label: "Relaxed"     },
  normal:      { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)",   label: "Normal"      },
  elevated:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  label: "Elevated"    },
  "high stress":{ color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)",   label: "High Stress" },
  unknown:     { color: "#4b5563", bg: "rgba(75,85,99,0.1)",    border: "rgba(75,85,99,0.3)",    label: "Waiting…"    },
};

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5" />
      <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
      <path d="M8 16v4" /><path d="M16 16v4" /><path d="M8 20h8" />
    </svg>
  );
}

// Stress gauge — gradient bar with a needle marker
function StressGauge({ score }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Stress index{score === 0 ? " (needs ~20s)" : ""}</span>
        <span style={{ color: score < 0.4 ? "#10b981" : score < 0.7 ? "#f59e0b" : "#ef4444" }}>
          {pct}%
        </span>
      </div>
      <div className="relative w-full h-1.5 rounded-full overflow-hidden">
        {/* Gradient track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(90deg, #10b981, #06b6d4, #f59e0b, #ef4444)" }}
        />
        {/* Mask to dim unscored portion */}
        <div
          className="absolute top-0 right-0 h-full rounded-r-full transition-all duration-700"
          style={{ width: `${100 - pct}%`, background: "rgba(5,8,15,0.75)" }}
        />
        {/* Needle */}
        <div
          className="absolute top-0 w-0.5 h-full bg-white rounded-full transition-all duration-700"
          style={{ left: `calc(${pct}% - 1px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>Calm</span>
        <span>Stressed</span>
      </div>
    </div>
  );
}

export function HrvDisplay({ hrvRmssd, stressLevel, stressScore }) {
  const ss = STRESS_STYLES[stressLevel] ?? STRESS_STYLES.unknown;

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BrainIcon />
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">HRV · Stress</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}
        >
          {ss.label}
        </span>
      </div>

      {/* RMSSD value */}
      <div className="flex items-end gap-2 leading-none">
        <span
          className="text-6xl font-extrabold tabular-nums transition-all duration-500"
          style={{
            color: hrvRmssd ? ss.color : "#374151",
            textShadow: hrvRmssd
              ? `0 0 20px ${ss.color}99, 0 0 40px ${ss.color}44`
              : "none",
          }}
        >
          {hrvRmssd ?? "--"}
        </span>
        <div className="flex flex-col mb-1.5 gap-0.5">
          <span className="text-gray-500 text-sm font-medium leading-none">ms</span>
          <span className="text-gray-600 text-xs leading-none">RMSSD</span>
        </div>
      </div>

      {/* Stress gauge */}
      <StressGauge score={stressScore} />

    </div>
  );
}

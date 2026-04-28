export function SessionHistory({ sessions, onClear, onExport }) {
  if (sessions.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 text-center text-gray-600 text-xs h-full flex items-center justify-center">
        Session readings auto-save every 10s<br />when signal quality is ≥ 30%.
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div
        className="flex-none flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
          History ({sessions.length})
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={onExport}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#34d399",
            }}
          >
            CSV
          </button>
          <button
            onClick={onClear}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0" style={{ background: "rgba(5,8,15,0.8)" }}>
            <tr className="text-gray-600 uppercase">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-right">BPM</th>
              <th className="px-3 py-2 text-right">Quality</th>
            </tr>
          </thead>
          <tbody>
            {[...sessions].reverse().map((s) => {
              const time = new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const pct = Math.round(s.confidence * 100);
              const color = s.confidence > 0.6 ? "#10b981" : s.confidence > 0.3 ? "#f59e0b" : "#ef4444";
              return (
                <tr
                  key={s.id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-3 py-2 text-gray-600">{s.id}</td>
                  <td className="px-3 py-2 text-gray-400">{time}</td>
                  <td className="px-3 py-2 text-right font-bold text-white">{s.bpm}</td>
                  <td className="px-3 py-2 text-right font-medium" style={{ color }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

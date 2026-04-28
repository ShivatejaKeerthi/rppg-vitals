import { useBreathing, TECHNIQUES } from "../hooks/useBreathing";

const PHASE_STYLE = {
  "expand":     { ring: "#60a5fa", glow: "rgba(96,165,250,0.35)",  inner: "rgba(96,165,250,0.08)",  text: "#93c5fd" },
  "hold-big":   { ring: "#818cf8", glow: "rgba(129,140,248,0.35)", inner: "rgba(129,140,248,0.08)", text: "#a5b4fc" },
  "contract":   { ring: "#10b981", glow: "rgba(16,185,129,0.35)",  inner: "rgba(16,185,129,0.08)",  text: "#6ee7b7" },
  "hold-small": { ring: "#4b5563", glow: "rgba(75,85,99,0.2)",     inner: "rgba(75,85,99,0.05)",    text: "#9ca3af" },
};

export function BreathingExercise() {
  const {
    active, technique, phase, circleScale, secondsLeft, cycles,
    start, stop, changeTechnique, techName, techDescription,
  } = useBreathing();

  const style = PHASE_STYLE[phase.type];

  return (
    <div className="h-full flex flex-col items-center justify-between py-4 px-6 select-none">

      {/* Technique selector */}
      <div className="flex gap-2">
        {Object.entries(TECHNIQUES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => changeTechnique(key)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
            style={
              technique === key
                ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f9fafb" }
                : { background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#6b7280" }
            }
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs text-center max-w-sm px-4">
        {techDescription}
      </p>

      {/* Animated circle */}
      <div className="flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            border: `1px solid ${style.ring}22`,
            transition: "border-color 1.5s ease",
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 240,
            height: 240,
            border: `1px solid ${style.ring}44`,
            transition: "border-color 1.5s ease",
          }}
        />
        {/* Main breathing circle */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${circleScale})`,
            transition: "transform 0.1s linear",
            background: style.inner,
            border: `2px solid ${style.ring}`,
            boxShadow: `0 0 40px ${style.glow}, 0 0 80px ${style.glow}44, inset 0 0 30px ${style.inner}`,
          }}
        >
          <span
            className="text-3xl font-bold tabular-nums leading-none"
            style={{ color: style.text }}
          >
            {secondsLeft}
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: style.text }}
          >
            {phase.label}
          </span>
        </div>
      </div>

      {/* Phase timeline */}
      <div className="flex gap-3 items-center">
        {TECHNIQUES[technique].phases.map((p, i) => {
          const isCurrent = active && p === phase;
          const ps = PHASE_STYLE[p.type];
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: isCurrent ? 32 : 8,
                  height: 8,
                  background: isCurrent ? ps.ring : "rgba(255,255,255,0.1)",
                }}
              />
              <span className="text-gray-600 text-xs">{p.duration}s</span>
            </div>
          );
        })}
      </div>

      {/* Cycle counter */}
      <div className="text-center">
        <span className="text-gray-500 text-xs uppercase tracking-widest">Cycles completed</span>
        <div className="text-3xl font-bold text-white mt-0.5">{cycles}</div>
      </div>

      {/* Start / Stop */}
      <button
        onClick={active ? stop : start}
        className="px-10 py-3 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200"
        style={
          active
            ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }
            : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#f9fafb" }
        }
      >
        {active ? "⏹ Stop" : "▶ Begin"}
      </button>

    </div>
  );
}

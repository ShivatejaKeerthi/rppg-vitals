import { useState, useEffect, useRef, useCallback } from "react";

export const TECHNIQUES = {
  box: {
    name: "Box Breathing",
    description: "Equal inhale, hold, exhale, hold — used by Navy SEALs for stress control.",
    phases: [
      { label: "Inhale",  duration: 4, type: "expand" },
      { label: "Hold",    duration: 4, type: "hold-big" },
      { label: "Exhale",  duration: 4, type: "contract" },
      { label: "Hold",    duration: 4, type: "hold-small" },
    ],
  },
  calm: {
    name: "Calm Breathing",
    description: "Longer exhale activates the parasympathetic nervous system — reduces anxiety fast.",
    phases: [
      { label: "Inhale", duration: 4, type: "expand" },
      { label: "Exhale", duration: 6, type: "contract" },
    ],
  },
  "478": {
    name: "4-7-8 Technique",
    description: "Extended hold and exhale — effective for sleep onset and acute stress.",
    phases: [
      { label: "Inhale", duration: 4, type: "expand" },
      { label: "Hold",   duration: 7, type: "hold-big" },
      { label: "Exhale", duration: 8, type: "contract" },
    ],
  },
};

export function useBreathing() {
  const [active, setActive] = useState(false);
  const [technique, setTechnique] = useState("box");
  const [displayState, setDisplayState] = useState({ phaseIdx: 0, progress: 0, cycles: 0 });

  const internalRef = useRef({ phaseIdx: 0, elapsed: 0, cycles: 0 });
  const techniqueRef = useRef(technique);
  const lastTickRef = useRef(null);

  useEffect(() => { techniqueRef.current = technique; }, [technique]);

  useEffect(() => {
    if (!active) return;

    internalRef.current = { phaseIdx: 0, elapsed: 0, cycles: 0 };
    lastTickRef.current = Date.now();
    setDisplayState({ phaseIdx: 0, progress: 0, cycles: 0 });

    const id = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      const tech = TECHNIQUES[techniqueRef.current];
      const s = internalRef.current;
      s.elapsed += dt;

      const phase = tech.phases[s.phaseIdx];
      const duration = phase.duration * 1000;

      if (s.elapsed >= duration) {
        s.elapsed -= duration;
        const next = (s.phaseIdx + 1) % tech.phases.length;
        if (next === 0) s.cycles += 1;
        s.phaseIdx = next;

        const newDuration = tech.phases[s.phaseIdx].duration * 1000;
        setDisplayState({
          phaseIdx: s.phaseIdx,
          progress: Math.min(s.elapsed / newDuration, 1),
          cycles: s.cycles,
        });
      } else {
        setDisplayState((prev) => ({
          ...prev,
          phaseIdx: s.phaseIdx,
          progress: s.elapsed / duration,
        }));
      }
    }, 50);

    return () => clearInterval(id);
  }, [active]);

  const start = useCallback(() => {
    internalRef.current = { phaseIdx: 0, elapsed: 0, cycles: 0 };
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    setDisplayState({ phaseIdx: 0, progress: 0, cycles: 0 });
  }, []);

  const changeTechnique = useCallback((t) => {
    setTechnique(t);
    techniqueRef.current = t;
    internalRef.current = { phaseIdx: 0, elapsed: 0, cycles: 0 };
    setDisplayState({ phaseIdx: 0, progress: 0, cycles: 0 });
  }, []);

  const tech = TECHNIQUES[technique];
  const phase = tech.phases[displayState.phaseIdx];

  let circleScale;
  switch (phase.type) {
    case "expand":     circleScale = 0.55 + 0.45 * displayState.progress; break;
    case "hold-big":   circleScale = 1.0; break;
    case "contract":   circleScale = 1.0 - 0.45 * displayState.progress; break;
    case "hold-small": circleScale = 0.55; break;
    default:           circleScale = 0.55;
  }

  const secondsLeft = Math.ceil(phase.duration * (1 - displayState.progress));

  return {
    active, technique, phase, circleScale, secondsLeft,
    cycles: displayState.cycles,
    start, stop, changeTechnique,
    techName: tech.name,
    techDescription: tech.description,
  };
}

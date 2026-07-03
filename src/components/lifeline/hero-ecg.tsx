import { useEffect, useRef, useState } from "react";

/**
 * Cinematic ECG heartbeat background for the landing hero.
 * - Continuously animates a glowing medical-blue trace across the section.
 * - Loops seamlessly every ~5s (adjustable via CSS var --ecg-duration).
 * - Accelerates for one cycle when `accelerate` toggles true.
 * - Respects prefers-reduced-motion: renders a static faint line instead.
 */
export function HeroEcg({ accelerate = false }: { accelerate?: boolean }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [len, setLen] = useState(1600);
  const [reduced, setReduced] = useState(false);
  const [duration, setDuration] = useState(5);

  useEffect(() => {
    if (pathRef.current) {
      try { setLen(Math.ceil(pathRef.current.getTotalLength())); } catch { /* noop */ }
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // One accelerated cycle on hover, then ease back to normal.
  useEffect(() => {
    if (!accelerate) return;
    setDuration(1.6);
    const t = window.setTimeout(() => setDuration(5), 1700);
    return () => window.clearTimeout(t);
  }, [accelerate]);

  // A wide, mostly flat baseline with two crisp QRS complexes so the loop
  // stays subtle and unmistakably medical.
  const d =
    "M -40 100 " +
    "L 180 100 L 210 100 L 224 92 L 232 108 L 244 60 L 256 140 L 268 88 L 280 104 L 300 100 " +
    "L 520 100 L 560 100 L 574 92 L 582 108 L 594 60 L 606 140 L 618 88 L 630 104 L 650 100 " +
    "L 900 100 L 1000 100";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-full overflow-hidden"
    >
      <svg
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="h-16 w-full opacity-70 md:h-20"
      >
        <defs>
          <filter id="ecg-bloom" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="ecg-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1565C0" stopOpacity="0" />
            <stop offset="12%" stopColor="#1565C0" stopOpacity="0.95" />
            <stop offset="88%" stopColor="#1565C0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1565C0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Faint static baseline (always visible) */}
        <path d={d} fill="none" stroke="url(#ecg-fade)" strokeOpacity="0.18" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />

        {/* Animated glowing trace */}
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="url(#ecg-fade)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecg-bloom)"
          vectorEffect="non-scaling-stroke"
          style={
            reduced
              ? undefined
              : {
                  strokeDasharray: `${len}`,
                  ["--ecg-total" as string]: `${len}`,
                  animation: `lifeline-hero-ecg ${duration}s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
                  transition: "stroke-dashoffset 0.2s linear",
                }
          }
        />
      </svg>
    </div>
  );
}
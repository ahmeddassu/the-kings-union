"use client";

import { useEffect, useRef, useState } from "react";

// A number that counts up from 0 when it scrolls into view, e.g. votes cast.
// The real number is in the page from the start (for search engines, people
// without JavaScript and screen readers, which only ever hear the final
// number), and it doesn't move at all for people who turn off motion.
export default function CountUp({ value, suffix = "", className = "", duration = 1600 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    const target = Number(value) || 0;
    if (!el || target <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    setShown(0); // ready at 0, so it counts up rather than jumping back when it comes into view
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const step = Number.isInteger(target) ? 1 : 10; // keeps one decimal place, e.g. 50.4%
        const t0 = performance.now();
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / duration);
          setShown(k < 1 ? Math.round(target * (1 - Math.pow(1 - k, 3)) * step) / step : target); // eases out as it arrives
          if (k < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);
  const final = `${Number(value).toLocaleString("en-GB")}${suffix}`;
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span aria-hidden="true">{`${Number(shown).toLocaleString("en-GB")}${suffix}`}</span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

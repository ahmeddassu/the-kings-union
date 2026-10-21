"use client";

import { useEffect, useRef, useState } from "react";

// A number that counts up when it scrolls into view. Shows the final number
// straight away without JavaScript, and for people who turn off motion.
export default function CountUp({ value, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1400);
        setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown.toLocaleString("en-GB")}
    </span>
  );
}

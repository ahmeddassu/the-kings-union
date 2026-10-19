"use client";

import { useEffect, useState } from "react";

// "Starts in 1 day, 4 hours". Ticks every 30 seconds; shows "Happening now" during
// the event and disappears afterwards. `start` and `end` are ISO timestamps.
function describe(start, end, now) {
  const ms = new Date(start).getTime() - now;
  if (ms <= 0) return now < new Date(end).getTime() ? "Happening now" : null;
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (days >= 1) return `Starts in ${plural(days, "day")}${hours ? `, ${plural(hours, "hour")}` : ""}`;
  if (hours >= 1) return `Starts in ${plural(hours, "hour")}${m ? `, ${m} min` : ""}`;
  return `Starts in ${plural(Math.max(1, m), "minute")}`;
}

export default function Countdown({ start, end, initialNow, className = "" }) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const text = describe(start, end, now);
  if (!text) return null;
  return (
    <span className={`tabular-nums ${className}`} suppressHydrationWarning>
      {text}
    </span>
  );
}

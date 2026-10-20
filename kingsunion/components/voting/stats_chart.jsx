"use client";

import { useState } from "react";

const GOLD = "#b38d22"; // checked for contrast on the dark admin background

const label = (iso, opts) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
};

// Visitors per day: one gold column per day, hover or tap for the numbers.
export default function DailyChart({ daily }) {
  const [tip, setTip] = useState(null);
  const max = Math.max(...daily.map((d) => d.visitors), 1);
  const step = max > 500 ? 200 : max > 200 ? 100 : max > 80 ? 25 : max > 20 ? 10 : 5;
  const topVal = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: topVal / step + 1 }, (_, i) => i * step);
  const H = 200;

  const show = (e, d) => {
    const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ x: r.left - box.left + r.width / 2, y: r.bottom - box.top - (d.visitors / topVal) * H, d });
  };

  return (
    <div data-chart className="relative">
      <div className="flex gap-3">
        <div className="relative w-8 shrink-0 text-right text-xs tabular-nums text-white/50" style={{ height: H }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0" style={{ bottom: `${(t / topVal) * 100}%`, transform: "translateY(50%)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: H }}>
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 h-px bg-white/10" style={{ bottom: `${(t / topVal) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {daily.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onPointerMove={(e) => show(e, d)}
                  onPointerLeave={() => setTip(null)}
                  onFocus={(e) => show(e, d)}
                  onBlur={() => setTip(null)}
                  aria-label={`${label(d.day, { weekday: "long", day: "numeric", month: "long" })}: ${d.visitors} visitors, ${d.views} page views`}
                  className="group flex h-full flex-1 items-end justify-center outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <span
                    className="block w-full max-w-6 rounded-t transition-[filter] group-hover:brightness-125"
                    style={{ height: `${(d.visitors / topVal) * 100}%`, minHeight: d.visitors ? 2 : 0, background: GOLD }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-[2px] text-[10px] sm:text-xs text-white/50" aria-hidden="true">
            {daily.map((d, i) => (
              <span key={d.day} className="flex-1 text-center">
                {(daily.length - 1 - i) % Math.ceil(daily.length / 8) === 0 ? label(d.day, { day: "numeric", month: "short" }) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      {tip && (
        <div
          role="status"
          className="pointer-events-none absolute z-20 w-max -translate-x-1/2 -translate-y-full rounded-md border border-[#d4af37]/50 bg-[#1c0000] px-3 py-2 text-sm shadow-xl"
          style={{ left: tip.x, top: tip.y - 8 }}
        >
          <p className="font-bold">{tip.d.visitors} visitors</p>
          <p className="text-white/70">{tip.d.visits ? `${tip.d.visits} visits · ` : ""}{tip.d.views} page views</p>
          <p className="text-white/50">{label(tip.d.day, { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>
      )}
    </div>
  );
}

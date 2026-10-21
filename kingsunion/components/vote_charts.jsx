"use client";

import { useState } from "react";

// Colours checked for contrast and colour-blind separation on the dark surface.
export const AYE = "#b38d22";
export const NO = "#4a8ad2";

const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
};
const longDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

function Tip({ tip }) {
  if (!tip) return null;
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 w-max max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-md border border-[#d4af37]/50 bg-[#1c0000] px-3 py-2 text-sm shadow-xl"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      {tip.lines.map((l, i) => (
        <p key={i} className={i === 0 ? "font-bold text-white" : "text-white/70"}>
          {l}
        </p>
      ))}
    </div>
  );
}

// Every division: one row per debate, Ayes from the left, Noes from the right,
// with a hairline at 50%.
export function Divisions({ rows }) {
  const [tip, setTip] = useState(null);
  const show = (e, d) => {
    const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setTip({
      x: r.left - box.left + r.width / 2,
      y: r.top - box.top,
      lines: [`${d.proposition} Ayes · ${d.opposition} Noes`, `${d.total} votes · ${d.carried ? "Carried" : "Defeated"} by ${d.margin}`],
    });
  };
  return (
    <div data-chart className="relative">
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: AYE }} />Ayes (for)</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: NO }} />Noes (against)</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-px bg-white/60" />Half the House</span>
      </div>
      <ul className="divide-y divide-[#d4af37]/20">
        {rows.map((d) => (
          <li key={d.title + d.date} className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
              {d.href ? (
                <a href={d.href} className="font-bold leading-snug hover:text-[#d4af37] transition-colors">{d.title}</a>
              ) : (
                <span className="font-bold leading-snug">{d.title}</span>
              )}
              <span className="shrink-0 text-sm text-white/55">{longDate(d.date)}</span>
            </div>
            <div
              tabIndex={0}
              onPointerMove={(e) => show(e, d)}
              onPointerLeave={() => setTip(null)}
              onFocus={(e) => show(e, d)}
              onBlur={() => setTip(null)}
              role="img"
              aria-label={`${d.title}: ${d.proposition} Ayes, ${d.opposition} Noes. ${d.carried ? "Carried" : "Defeated"}.`}
              className="group relative mt-3 flex h-6 gap-[2px] outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <div className="h-full rounded-l transition-[filter] group-hover:brightness-110" style={{ width: `${d.ayePct}%`, background: AYE, minWidth: d.proposition ? 4 : 0 }} />
              <div className="h-full flex-1 rounded-r transition-[filter] group-hover:brightness-110" style={{ background: NO, display: d.opposition ? "block" : "none" }} />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-[-4px] left-1/2 w-px bg-white/70" />
            </div>
            <div className="mt-1.5 flex justify-between text-sm tabular-nums">
              <span className="text-white/85">Ayes {d.proposition} <span className="text-white/50">· {d.ayePct}%</span></span>
              <span className={`text-xs uppercase tracking-widest ${d.carried ? "text-[#d4af37]" : "text-white/60"}`}>{d.carried ? "Carried" : "Defeated"}</span>
              <span className="text-white/85">Noes {d.opposition} <span className="text-white/50">· {d.noPct}%</span></span>
            </div>
          </li>
        ))}
      </ul>
      <Tip tip={tip} />
    </div>
  );
}

// Votes cast at each debate, oldest to newest.
export function Turnout({ points }) {
  const [tip, setTip] = useState(null);
  const [active, setActive] = useState(null);
  const max = Math.max(...points.map((p) => p.total), 1);
  const step = max > 120 ? 50 : max > 60 ? 25 : 10;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const H = 220;

  const show = (e, p, i) => {
    const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setActive(i);
    setTip({ x: r.left - box.left + r.width / 2, y: r.bottom - box.top - (p.total / top) * H, lines: [`${p.total} votes`, p.title, longDate(p.date)] });
  };

  return (
    <div data-chart className="relative">
      <div className="flex gap-3">
        {/* y axis */}
        <div className="relative shrink-0 w-8 text-right text-xs tabular-nums text-white/50" style={{ height: H }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="relative" style={{ height: H }}>
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 h-px bg-white/10" style={{ bottom: `${(t / top) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end justify-around gap-[2px]">
              {points.map((p, i) => (
                <button
                  key={p.title + p.date}
                  type="button"
                  onPointerMove={(e) => show(e, p, i)}
                  onPointerLeave={() => { setTip(null); setActive(null); }}
                  onFocus={(e) => show(e, p, i)}
                  onBlur={() => { setTip(null); setActive(null); }}
                  onClick={() => p.href && (window.location.href = p.href)}
                  aria-label={`${p.title}, ${longDate(p.date)}: ${p.total} votes`}
                  className="flex h-full flex-1 max-w-12 items-end justify-center outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <span
                    className="block w-full max-w-6 rounded-t transition-[filter]"
                    style={{ height: `${(p.total / top) * 100}%`, background: AYE, filter: active === i ? "brightness(1.25)" : "none" }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-around gap-[2px] text-[10px] sm:text-xs text-white/50">
            {points.map((p, i) => (
              <span key={p.title + p.date} className="flex-1 max-w-12 text-center leading-tight">
                {points.length > 10 && i % 2 ? "" : shortDate(p.date)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Tip tip={tip} />
    </div>
  );
}

// Carried vs defeated by topic.
export function Topics({ rows }) {
  const [tip, setTip] = useState(null);
  const max = Math.max(...rows.map((r) => r.total), 1);
  const show = (e, r, which) => {
    const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    const n = which === "carried" ? r.carried : r.defeated;
    setTip({ x: b.left - box.left + b.width / 2, y: b.top - box.top, lines: [`${n} ${which}`, `${r.label} · ${r.total} motions`] });
  };
  return (
    <div data-chart className="relative">
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: AYE }} />Carried</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: NO }} />Defeated</span>
      </div>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr] items-center gap-3">
            <span className="text-sm sm:text-base">{r.label}</span>
            <div className="flex items-center gap-3">
              <div className="flex h-5 gap-[2px]" style={{ width: `${(r.total / max) * 85}%` }}>
                {r.carried > 0 && (
                  <span
                    tabIndex={0}
                    onPointerMove={(e) => show(e, r, "carried")}
                    onPointerLeave={() => setTip(null)}
                    onFocus={(e) => show(e, r, "carried")}
                    onBlur={() => setTip(null)}
                    role="img"
                    aria-label={`${r.label}: ${r.carried} carried`}
                    className={`block h-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 hover:brightness-110 rounded-l ${r.defeated ? "" : "rounded-r"}`}
                    style={{ flex: r.carried, background: AYE }}
                  />
                )}
                {r.defeated > 0 && (
                  <span
                    tabIndex={0}
                    onPointerMove={(e) => show(e, r, "defeated")}
                    onPointerLeave={() => setTip(null)}
                    onFocus={(e) => show(e, r, "defeated")}
                    onBlur={() => setTip(null)}
                    role="img"
                    aria-label={`${r.label}: ${r.defeated} defeated`}
                    className={`block h-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 hover:brightness-110 rounded-r ${r.carried ? "" : "rounded-l"}`}
                    style={{ flex: r.defeated, background: NO }}
                  />
                )}
              </div>
              <span className="shrink-0 text-sm tabular-nums text-white/70">
                {r.carried}–{r.defeated}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Tip tip={tip} />
    </div>
  );
}

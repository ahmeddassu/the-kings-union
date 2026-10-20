"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TAGS, tagFor } from "@/lib/calendar_tags";

// The Term Card calendar: a month grid, colour-coded by tag. Clicking an entry
// opens a side panel with its details. A "List" toggle shows the plain term card
// (passed in as `list`) for anyone who prefers it.

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEW_KEY = "ku-termcard-view";

const parse = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const iso = (dt) => dt.toISOString().slice(0, 10);
const fmt = (isoDate, opts) => parse(isoDate).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
const monthKey = (isoDate) => isoDate.slice(0, 7);
const addMonths = (key, n) => {
  const [y, m] = key.split("-").map(Number);
  return iso(new Date(Date.UTC(y, m - 1 + n, 1))).slice(0, 7);
};

function daysOf(item) {
  if (!item.endDate || item.endDate <= item.date) return [item.date];
  const out = [];
  for (let d = parse(item.date); iso(d) <= item.endDate && out.length < 62; d = new Date(d.getTime() + 864e5)) out.push(iso(d));
  return out;
}

function timeText(item) {
  if (item.allDay) return "All day";
  return item.endTime ? `${item.time}–${item.endTime}` : item.time;
}

function dateText(item) {
  const long = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  if (item.endDate && item.endDate > item.date) return `${fmt(item.date, { day: "numeric", month: "long" })} to ${fmt(item.endDate, long)}`;
  return fmt(item.date, long);
}

const isDebate = (item) => item.type === "Debate";
const displayTitle = (item) => (isDebate(item) ? `“${item.title}”` : item.title);

function Dot({ tag, className = "h-2.5 w-2.5" }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${className}`} style={{ background: tagFor(tag).colour }} />;
}

function TagChip({ tag }) {
  return (
    <span className="inline-flex items-center gap-2 border border-white/25 px-2.5 py-1 text-xs uppercase tracking-widest text-white/85">
      <Dot tag={tag} />
      {tagFor(tag).label}
    </span>
  );
}

function SpeakerColumn({ side, names }) {
  if (!names?.length) return null;
  return (
    <div className="border-t border-[#d4af37]/60 pt-3">
      <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-2">{side}</p>
      <ul className="space-y-1">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

const panelBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-[#d4af37] px-3 py-2 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors";

function Panel({ item, onClose, today }) {
  const closeRef = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const upcoming = (item.endDate || item.date) >= today;
  const hasSpeakers = item.proposition?.length > 0 || item.opposition?.length > 0;

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-panel-title"
        className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto overscroll-contain border-l border-[#d4af37] bg-[#2a0101] text-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none sm:w-[30vw] sm:min-w-[380px] sm:max-w-[560px] ${shown ? "translate-x-0" : "translate-x-full"}`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Banner */}
        <div className="relative shrink-0">
          {item.image ? (
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={item.image} alt="" className={`h-full w-full object-cover ${item.imageBlur ? "scale-110 blur-xl" : ""}`} />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#2a0101] via-[#2a0101]/20 to-transparent" />
            </div>
          ) : (
            <div aria-hidden="true" className="h-16" style={{ background: `linear-gradient(90deg, ${tagFor(item.tag).colour}55, transparent)` }} />
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1c0000]/80 text-xl text-white hover:bg-[#d4af37] hover:text-[#3d0202] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-5 sm:px-6 pb-8 pt-4">
          <div>
            <TagChip tag={item.tag} />
            <h2 id="cal-panel-title" className="title mt-3 text-2xl sm:text-3xl font-bold leading-tight text-balance">
              {displayTitle(item)}
            </h2>
          </div>

          <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2 text-base">
            <dt className="text-xs uppercase tracking-widest text-white/50 pt-1">Date</dt>
            <dd>{dateText(item)}</dd>
            <dt className="text-xs uppercase tracking-widest text-white/50 pt-1">Time</dt>
            <dd className="tabular-nums">{timeText(item)}</dd>
            {item.venue && (
              <>
                <dt className="text-xs uppercase tracking-widest text-white/50 pt-1">Venue</dt>
                <dd>{item.venue}</dd>
              </>
            )}
          </dl>

          {item.result && (
            <div className="border-y border-[#d4af37]/60 py-3 flex items-center justify-between">
              <span className="font-bold">Result</span>
              <span className="text-right">
                <span className="block font-bold tabular-nums text-[#d4af37]">
                  Ayes {item.result.proposition} · Noes {item.result.opposition}
                </span>
                <span className="block text-xs uppercase tracking-widest text-white/60">
                  {item.result.proposition > item.result.opposition ? "Motion carried" : "Motion defeated"}
                </span>
              </span>
            </div>
          )}

          {(item.description || item.note) && (
            <div className="space-y-3 text-base leading-relaxed text-white/85">
              {item.description && <p>{item.description}</p>}
              {item.note && <p className="border-l-2 border-[#d4af37] pl-3 text-white/75">{item.note}</p>}
            </div>
          )}

          {item.chathamHouse ? (
            <p className="text-sm text-white/70">Held under the Chatham House Rule, so speakers are not named.</p>
          ) : (
            hasSpeakers && (
              <div className="grid grid-cols-2 gap-4">
                <SpeakerColumn side="Proposition" names={item.proposition} />
                <SpeakerColumn side="Opposition" names={item.opposition} />
              </div>
            )
          )}

          <div className="flex flex-wrap gap-2">
            {item.href && (
              <a href={item.href} className="inline-flex min-h-11 items-center justify-center bg-[#d4af37] px-4 py-2 text-sm font-bold text-[#3d0202] hover:bg-white transition-colors">
                {item.source === "termcard" ? (isDebate(item) ? "Full debate page →" : "Event page →") : "More details →"}
              </a>
            )}
            {item.ticketsUrl && upcoming && (
              <a href={item.ticketsUrl} target="_blank" rel="noopener noreferrer" className={panelBtn}>
                Get tickets ↗
              </a>
            )}
          </div>

          {upcoming && (
            <div className="mt-auto border-t border-white/15 pt-5">
              <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Add to your calendar</p>
              <p className="text-sm text-white/55 mb-3">It updates by itself if the time or venue changes.</p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
                <a href={item.links.google} target="_blank" rel="noopener noreferrer" className={panelBtn}>Google Calendar</a>
                <a href={item.links.ics} className={panelBtn}>Apple Calendar</a>
                <a href={item.links.outlook} target="_blank" rel="noopener noreferrer" className={panelBtn}>Outlook</a>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function TermCalendar({ items, today, startMonth, list }) {
  const [view, setView] = useState("calendar");
  const [month, setMonth] = useState(startMonth);
  const [openId, setOpenId] = useState(null);
  const lastTrigger = useRef(null);

  // Remember the preferred view; ?view=list links straight to the list.
  useEffect(() => {
    // Read after the first render so the server and browser markup match.
    const t = setTimeout(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(VIEW_KEY);
    } catch {}
    const fromUrl = new URLSearchParams(window.location.search).get("view");
    const v = fromUrl === "list" || fromUrl === "calendar" ? fromUrl : saved;
    if (v === "list" || v === "calendar") setView(v);
    // #event-<id> in the address opens that entry.
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const hit = items.find((i) => i.id === hash);
    if (hit) {
      setView("calendar");
      setMonth(monthKey(hit.date));
      setOpenId(hit.id);
    }
    }, 0);
    return () => clearTimeout(t);
  }, [items]);

  const choose = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const open = (item, e) => {
    lastTrigger.current = e?.currentTarget || null;
    setOpenId(item.id);
    try {
      history.replaceState(null, "", `#${item.id}`);
    } catch {}
  };
  const close = useCallback(() => {
    setOpenId(null);
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {}
    lastTrigger.current?.focus?.();
  }, []);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const it of items) for (const d of daysOf(it)) map.set(d, [...(map.get(d) || []), it]);
    return map;
  }, [items]);

  // Weeks of the month, Monday first.
  const weeks = useMemo(() => {
    const first = parse(`${month}-01`);
    const lead = (first.getUTCDay() + 6) % 7;
    const start = new Date(first.getTime() - lead * 864e5);
    const out = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) row.push(iso(new Date(start.getTime() + (w * 7 + d) * 864e5)));
      if (w >= 4 && row.every((x) => monthKey(x) !== month)) break;
      out.push(row);
    }
    return out;
  }, [month]);

  const monthItems = items.filter((it) => daysOf(it).some((d) => monthKey(d) === month));
  const usedTags = TAGS.filter((t) => items.some((i) => i.tag === t.key));
  const openItem = items.find((i) => i.id === openId);
  const monthLabel = fmt(`${month}-01`, { month: "long", year: "numeric" });

  const seg = (active) =>
    `min-h-11 px-4 text-sm font-bold transition-colors ${active ? "bg-[#d4af37] text-[#3d0202]" : "text-white hover:bg-white/10"}`;

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-center">
        <div role="group" aria-label="How to show the term card" className="inline-flex border border-[#d4af37]">
          <button type="button" aria-pressed={view === "calendar"} onClick={() => choose("calendar")} className={seg(view === "calendar")}>
            Calendar
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => choose("list")} className={seg(view === "list")}>
            List
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-8">{list}</div>
      ) : (
        <div className="mx-auto mt-8 max-w-6xl">
          {/* Month bar */}
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month" className="inline-flex h-11 w-11 items-center justify-center border border-[#d4af37]/60 text-lg hover:bg-white/10">
              ‹
            </button>
            <div className="text-center">
              <h2 className="title text-2xl sm:text-3xl font-bold" aria-live="polite">{monthLabel}</h2>
              {monthKey(today) !== month && (
                <button type="button" onClick={() => setMonth(monthKey(today))} className="mt-1 text-sm text-[#d4af37] underline underline-offset-4 hover:text-white">
                  Back to this month
                </button>
              )}
            </div>
            <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month" className="inline-flex h-11 w-11 items-center justify-center border border-[#d4af37]/60 text-lg hover:bg-white/10">
              ›
            </button>
          </div>

          {/* Key */}
          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/80" aria-label="Colour key">
            {usedTags.map((t) => (
              <li key={t.key} className="inline-flex items-center gap-2">
                <Dot tag={t.key} />
                {t.label}
              </li>
            ))}
          </ul>

          {/* Grid */}
          <div className="mt-5 overflow-hidden rounded-lg border border-[#d4af37]/50 bg-[#2a0101]">
            <div className="grid grid-cols-7 border-b border-[#d4af37]/40 text-center text-xs uppercase tracking-widest text-white/55" aria-hidden="true">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">
                  <span className="sm:hidden">{d[0]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {weeks.flat().map((day, i) => {
                const inMonth = monthKey(day) === month;
                const list = byDay.get(day) || [];
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={`relative min-h-[3.75rem] sm:min-h-[7.5rem] border-[#d4af37]/20 p-1 sm:p-1.5 ${i % 7 ? "border-l" : ""} ${i >= 7 ? "border-t" : ""} ${inMonth ? "" : "bg-black/20"}`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums ${
                        isToday ? "bg-[#d4af37] font-bold text-[#3d0202]" : inMonth ? "text-white/85" : "text-white/30"
                      }`}
                    >
                      <span className="sr-only">{fmt(day, { weekday: "long", day: "numeric", month: "long" })}</span>
                      <span aria-hidden="true">{Number(day.slice(8))}</span>
                    </span>

                    {/* Phone: coloured dots; the list below the grid carries the titles */}
                    {list.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                        {list.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            onClick={(e) => open(it, e)}
                            aria-label={`${tagFor(it.tag).label}: ${it.title}, ${timeText(it)}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                          >
                            <Dot tag={it.tag} className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Larger screens: labelled entries */}
                    {list.length > 0 && (
                      <ul className="mt-1 hidden space-y-1 sm:block">
                        {list.map((it) => (
                          <li key={it.id}>
                            <button
                              type="button"
                              onClick={(e) => open(it, e)}
                              className={`group flex w-full items-start gap-1.5 rounded px-1.5 py-1 text-left text-xs leading-snug transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${inMonth ? "" : "opacity-60"}`}
                              style={{ boxShadow: `inset 3px 0 0 ${tagFor(it.tag).colour}`, background: `${tagFor(it.tag).colour}22` }}
                            >
                              <span className="min-w-0">
                                <span className="block tabular-nums text-white/60">{it.allDay ? "All day" : it.time}</span>
                                <span className="block font-bold text-white line-clamp-2 group-hover:text-[#f1d785]">{it.title}</span>
                                <span className="sr-only">, {tagFor(it.tag).label}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* This month as a list (always shown on phones; a handy summary everywhere) */}
          <section aria-labelledby="month-list" className="mt-8">
            <h3 id="month-list" className="text-xs uppercase tracking-widest text-[#d4af37]">
              In {fmt(`${month}-01`, { month: "long" })}
            </h3>
            {monthItems.length === 0 ? (
              <p className="mt-3 text-white/60">Nothing on this month.</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {monthItems.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={(e) => open(it, e)}
                      className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-3 py-3 text-left hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37]"
                    >
                      <span className="text-sm leading-tight text-white/70">
                        <span className="block">{fmt(it.date, { weekday: "short", day: "numeric" })}</span>
                        <span className="block tabular-nums text-white/50">{it.allDay ? "All day" : it.time}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/55">
                          <Dot tag={it.tag} />
                          {tagFor(it.tag).label}
                        </span>
                        <span className="block text-base sm:text-lg leading-snug group-hover:text-[#d4af37]">{displayTitle(it)}</span>
                      </span>
                      <span aria-hidden="true" className="pr-1 text-[#d4af37] opacity-60 group-hover:opacity-100">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {openItem && <Panel item={openItem} onClose={close} today={today} />}
    </div>
  );
}

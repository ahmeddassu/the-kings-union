"use client";

// The committee calendar: month and list views, adding and editing entries,
// and a private link to subscribe from a phone's calendar.
import { useEffect, useMemo, useState } from "react";

const sans = "[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]";
const input = "h-10 w-full rounded-sm border border-white/25 bg-[#1f0101] px-2 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none [color-scheme:dark]";
const btn = "inline-flex h-10 items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap";
const primary = `${btn} bg-[#d4af37] text-[#2a0101] hover:bg-white`;
const ghost = `${btn} border border-white/25 text-white hover:bg-white/10`;
const lab = "block text-xs font-semibold uppercase tracking-wider text-white/60";

const KINDS = { meeting: "Meeting", booking: "Room or kit booking", deadline: "Deadline", social: "Social", other: "Other" };
const STYLE = {
  meeting: "bg-[#d4af37] text-[#2a0101]",
  booking: "bg-[#c9daf4] text-[#0f2547]",
  deadline: "bg-[#f3c4c4] text-[#4a0606]",
  social: "bg-[#c7e6c2] text-[#123d12]",
  other: "bg-white/80 text-[#2a0101]",
  task: "border border-[#f3c4c4]/70 text-[#f3c4c4]",
  event: "border border-white/50 text-white",
};
const LEGEND = [["meeting", "Meeting"], ["booking", "Booking"], ["deadline", "Deadline"], ["social", "Social"], ["task", "Task due"], ["event", "Debate or event"]];

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const dayLabel = (s, opts = { weekday: "long", day: "numeric", month: "long" }) => new Date(`${s}T12:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
const timeLabel = (e) => (e.time ? `${e.time}${e.endTime ? `–${e.endTime}` : ""}` : "All day");

const plain = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const firstLast = (s) => {
  const w = plain(s).split(" ").filter(Boolean);
  return w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : w[0] || "";
};
const sameName = (a, b) => Boolean(plain(a)) && (plain(a) === plain(b) || firstLast(a) === firstLast(b));
const named = (list, names) => String(list || "").split(",").some((n) => names.some((m) => sameName(n, m)));

// Monday-first weeks covering a month.
function monthGrid(month) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const start = new Date(first);
  start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7));
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push(iso(d));
  }
  return days[35].slice(0, 7) === month ? days : days.slice(0, 35);
}
const shiftMonth = (month, by) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

function Editor({ item, date, departments, teamNames, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({
    title: item?.title || "", kind: item?.kind || "meeting", date: item?.date || date || today(), time: item?.time ?? "18:00", endTime: item?.endTime ?? "19:00",
    location: item?.location || "", notes: item?.notes || "", depts: item?.depts || [], attendees: item?.attendees || [],
  });
  const [find, setFind] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const flip = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));
  const allDay = !f.time;
  const people = teamNames.filter((n) => !find || plain(n).includes(plain(find)));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await onSave({ ...(item?.id ? { id: item.id } : {}), ...f, endTime: f.time ? f.endTime : "" });
    setBusy(false);
    if (err) setError(err);
  };
  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 rounded-sm border border-[#d4af37]/60 bg-[#2a0101] p-4 lg:grid-cols-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={lab}>Title</span>
          <input value={f.title} onChange={set("title")} required maxLength={160} placeholder="e.g. Committee meeting" className={`${input} mt-1`} autoFocus />
        </label>
        <label>
          <span className={lab}>Type</span>
          <select value={f.kind} onChange={set("kind")} className={`${input} mt-1`}>
            {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k} className="bg-white text-black">{v}</option>)}
          </select>
        </label>
        <label>
          <span className={lab}>Date</span>
          <input type="date" value={f.date} onChange={set("date")} required className={`${input} mt-1`} />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={allDay} onChange={(e) => setF((x) => ({ ...x, time: e.target.checked ? "" : "18:00", endTime: e.target.checked ? "" : "19:00" }))} className="h-4 w-4 accent-[#d4af37]" />
          All day
        </label>
        {!allDay && (
          <>
            <label>
              <span className={lab}>Starts</span>
              <input type="time" value={f.time} onChange={set("time")} className={`${input} mt-1`} />
            </label>
            <label>
              <span className={lab}>Ends</span>
              <input type="time" value={f.endTime} onChange={set("endTime")} className={`${input} mt-1`} />
            </label>
          </>
        )}
        <label className="sm:col-span-2">
          <span className={lab}>Where</span>
          <input value={f.location} onChange={set("location")} maxLength={160} placeholder="Room, building or link" className={`${input} mt-1`} />
        </label>
        <label className="sm:col-span-2">
          <span className={lab}>Notes</span>
          <textarea value={f.notes} onChange={set("notes")} rows={3} maxLength={2000} placeholder="Agenda, what to bring…" className={`${input} mt-1 h-auto py-2`} />
        </label>
      </div>
      <div className="grid content-start gap-3">
        <fieldset>
          <legend className={lab}>Departments (leave blank for everyone)</legend>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {departments.map((d) => (
              <label key={d} className="flex min-h-8 items-center gap-2 text-sm">
                <input type="checkbox" checked={f.depts.includes(d)} onChange={() => flip("depts", d)} className="h-4 w-4 accent-[#d4af37]" />
                {d}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={lab}>Invite ({f.attendees.length}) · they’ll get a notification</legend>
          {f.attendees.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {f.attendees.map((n) => (
                <button key={n} type="button" onClick={() => flip("attendees", n)} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-white/15 px-2 text-xs hover:bg-white/25">
                  {n} <span aria-hidden="true">×</span><span className="sr-only">(remove)</span>
                </button>
              ))}
            </div>
          )}
          <label className="mt-2 block">
            <span className="sr-only">Find someone to invite</span>
            <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find someone…" className={input} />
          </label>
          <div className="mt-1 max-h-44 overflow-y-auto rounded-sm border border-white/10 px-2 py-1">
            {people.map((n) => (
              <label key={n} className="flex min-h-8 items-center gap-2 text-sm">
                <input type="checkbox" checked={f.attendees.includes(n)} onChange={() => flip("attendees", n)} className="h-4 w-4 accent-[#d4af37]" />
                {n}
              </label>
            ))}
            {!people.length && <p className="py-2 text-sm text-white/60">No one matches.</p>}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
        <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : item ? "Save changes" : "Add to calendar"}</button>
        <button type="button" onClick={onCancel} className={ghost}>Cancel</button>
        {error && <span role="alert" className="text-sm text-[#f3c4c4]">{error}</span>}
        {item && onDelete && (
          <span className="ml-auto">
            {confirm ? (
              <span className="flex items-center gap-2 text-sm">
                Delete{f.attendees.length ? " and tell those invited" : ""}?
                <button type="button" onClick={onDelete} className={`${btn} bg-[#f3c4c4] text-[#4a0606]`}>Delete</button>
                <button type="button" onClick={() => setConfirm(false)} className={ghost}>Keep</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirm(true)} className={`${btn} text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>Delete</button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}

function Details({ e, base, canChange, onEdit, onClose }) {
  return (
    <div className="mt-4 rounded-sm border border-white/20 bg-[#2a0101] p-4" role="region" aria-label={e.title}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${STYLE[e.kind] || STYLE.other}`}>
            {e.source === "task" ? "Task due" : e.source === "event" ? "Debate or event" : KINDS[e.kind]}
          </span>
          <p className="mt-2 text-lg font-bold leading-snug">{e.title}</p>
          <p className="text-sm text-white/80">{dayLabel(e.date)} · {timeLabel(e)}{e.location ? ` · ${e.location}` : ""}</p>
        </div>
        <div className="flex gap-2">
          {canChange && <button type="button" onClick={onEdit} className={primary}>Edit</button>}
          {e.source === "task" && <a href={`${base}/dashboard?task=${e.id}`} className={primary}>Open task</a>}
          {e.source === "event" && <a href={`/events/${e.id}`} className={ghost}>Event page</a>}
          <button type="button" onClick={onClose} className={ghost}>Close</button>
        </div>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {e.source === "task" && (
          <>
            <div><dt className={lab}>Owner</dt><dd>{e.owner || "Unassigned"}</dd></div>
            <div><dt className={lab}>Supervisor</dt><dd>{e.supervisor || "—"}</dd></div>
          </>
        )}
        {e.source === "committee" && (
          <>
            <div><dt className={lab}>For</dt><dd>{e.depts?.length ? e.depts.join(", ") : "Everyone"}</dd></div>
            <div><dt className={lab}>Invited</dt><dd>{e.attendees?.length ? e.attendees.join(", ") : "No one specifically"}</dd></div>
            {e.notes && <div className="sm:col-span-2"><dt className={lab}>Notes</dt><dd className="whitespace-pre-wrap">{e.notes}</dd></div>}
            <div className="sm:col-span-2 text-xs text-white/60">Added by {e.createdBy}{e.updatedBy && e.updatedBy !== e.createdBy ? `, last changed by ${e.updatedBy}` : ""}</div>
          </>
        )}
      </dl>
    </div>
  );
}

export default function CommitteeCalendar({ base, initial, departments, teamNames, me, exec, canSubscribe }) {
  const [entries, setEntries] = useState(initial);
  const [month, setMonth] = useState(today().slice(0, 7));
  const [view, setView] = useState("month");
  const [filter, setFilter] = useState("all");
  const [day, setDay] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null); // "new" or an entry
  const [link, setLink] = useState(null);
  const [message, setMessage] = useState("");

  // Phones start on the list; links from notifications open the entry.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("agenda");
    const id = new URLSearchParams(window.location.search).get("item");
    const e = id && initial.find((x) => x.key === `c-${id}`);
    if (e) {
      setMonth(e.date.slice(0, 7));
      setSelected(e.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mine = (e) =>
    e.source === "committee" ? e.createdById === me.id || (e.attendees || []).some((a) => me.names.some((n) => sameName(a, n))) || (e.depts || []).some((d) => me.depts.includes(d))
      : e.source === "task" ? named(e.owner, me.names) || named(e.supervisor, me.names)
        : true;
  const shown = useMemo(() => entries.filter((e) => (filter === "all" ? true : filter === "mine" ? mine(e) : e.source === "event" || (e.depts || []).includes(filter))), [entries, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const byDay = useMemo(() => {
    const m = new Map();
    for (const e of shown) m.set(e.date, [...(m.get(e.date) || []), e]);
    return m;
  }, [shown]);

  const call = async (body) => {
    const res = await fetch("/api/admin/committee-calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      window.location.href = base || "/";
      return {};
    }
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { error: data.error || "That didn’t work." };
  };
  const save = async (item) => {
    const data = await call({ action: "save", item });
    if (data.error) return data.error;
    const e = { key: `c-${data.item.id}`, source: "committee", ...data.item };
    setEntries((list) => [...list.filter((x) => x.key !== e.key), e].sort((a, b) => a.date.localeCompare(b.date) || String(a.time || "00:00").localeCompare(String(b.time || "00:00"))));
    setEditing(null);
    setSelected(e.key);
    setMonth(e.date.slice(0, 7));
    setMessage(item.id ? "Saved." : `Added${e.attendees.length ? ` and ${e.attendees.length} ${e.attendees.length === 1 ? "person" : "people"} notified` : ""}.`);
    return null;
  };
  const remove = async (e) => {
    const data = await call({ action: "delete", id: e.id });
    if (data.error) return setMessage(data.error);
    setEntries((list) => list.filter((x) => x.key !== e.key));
    setEditing(null);
    setSelected(null);
    setMessage("Deleted.");
  };
  const getLink = async (reset = false) => {
    const data = await call({ action: "link", reset });
    if (data.error) return setMessage(data.error);
    setLink(data.url);
    if (reset) setMessage("New link made. The old one no longer works, so subscribe again with this one.");
  };

  const sel = entries.find((e) => e.key === selected);
  const canChange = (e) => e?.source === "committee" && (exec || e.createdById === me.id);
  const days = monthGrid(month);
  const t = today();
  const agendaFrom = view === "agenda" ? (month === t.slice(0, 7) ? t : `${month}-01`) : null;
  const agenda = view === "agenda" ? [...byDay.entries()].filter(([d]) => d >= agendaFrom).sort(([a], [b]) => a.localeCompare(b)).slice(0, 45) : [];

  const Chip = ({ e }) => (
    <button type="button" onClick={(ev) => { ev.stopPropagation(); setSelected(e.key); setEditing(null); }}
      className={`block w-full truncate rounded-sm px-1.5 py-0.5 text-left text-[11px] font-semibold leading-tight ${STYLE[e.kind] || STYLE.other} ${selected === e.key ? "ring-2 ring-white" : ""}`}>
      {e.time ? `${e.time} ` : ""}{e.title}
    </button>
  );

  return (
    <div className={sans}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className={ghost} aria-label="Previous month">‹</button>
          <button type="button" onClick={() => setMonth(t.slice(0, 7))} className={ghost}>Today</button>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} className={ghost} aria-label="Next month">›</button>
        </div>
        <h2 className="min-w-[10rem] text-xl font-bold" aria-live="polite">{dayLabel(`${month}-01`, { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-1" role="group" aria-label="View">
          {[["month", "Month"], ["agenda", "List"]].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`${btn} ${view === v ? "bg-white text-[#2a0101]" : "border border-white/25 text-white/80"}`}>{l}</button>
          ))}
        </div>
        <label className="ml-auto">
          <span className="sr-only">Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${input} w-auto`}>
            <option value="all" className="bg-white text-black">Everything</option>
            <option value="mine" className="bg-white text-black">Just mine</option>
            {departments.map((d) => <option key={d} value={d} className="bg-white text-black">{d}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { setEditing("new"); setSelected(null); }} className={primary}>+ Add</button>
        {canSubscribe && <button type="button" onClick={() => (link ? setLink(null) : getLink())} aria-expanded={Boolean(link)} className={ghost}>Add to my phone</button>}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75" aria-label="Key">
        {LEGEND.map(([k, l]) => (
          <li key={k} className="flex items-center gap-1.5"><span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm ${STYLE[k]}`} />{l}</li>
        ))}
      </ul>

      {link && (
        <div className="mt-4 rounded-sm border border-[#d4af37]/60 bg-[#2a0101] p-4 text-sm">
          <p className="font-bold">Your private calendar link</p>
          <p className="mt-1 text-white/75">
            Subscribe to this in Google Calendar (Other calendars → From URL), Apple Calendar (File → New Calendar Subscription) or Outlook
            (Add calendar → Subscribe from web). It shows the committee calendar, every debate, and your own tasks, and updates by itself.
            Don’t share it: anyone with the link can see the calendar.
          </p>
          <p className="mt-2 break-all rounded-sm bg-[#1f0101] p-2 font-mono text-xs">{link}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(link); setMessage("Link copied."); } catch { setMessage("Copy the link above."); } }} className={primary}>Copy link</button>
            <a href={link.replace(/^https?:/, "webcal:")} className={ghost}>Open in calendar app</a>
            <button type="button" onClick={() => getLink(true)} className={ghost}>Make a new link</button>
          </div>
        </div>
      )}

      <p role="status" className="mt-3 min-h-5 text-sm text-white/80">{message}</p>

      {editing && (
        <Editor
          key={editing === "new" ? `new-${day}` : editing.key}
          item={editing === "new" ? null : editing}
          date={day}
          departments={departments}
          teamNames={teamNames}
          onSave={save}
          onCancel={() => setEditing(null)}
          onDelete={editing !== "new" ? () => remove(editing) : null}
        />
      )}
      {!editing && sel && <Details e={sel} base={base} canChange={canChange(sel)} onEdit={() => setEditing(sel)} onClose={() => setSelected(null)} />}

      {view === "month" ? (
        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[44rem] grid-cols-7 border-l border-t border-white/15">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} aria-hidden="true" className="border-b border-r border-white/15 bg-[#2a0101] px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white/60">{d}</div>
            ))}
            {days.map((d) => {
              const list = byDay.get(d) || [];
              const other = d.slice(0, 7) !== month;
              return (
                <div key={d} className={`min-h-[6.5rem] border-b border-r border-white/15 p-1 ${other ? "bg-black/20" : ""} ${day === d ? "bg-white/[0.06]" : ""}`}>
                  <button type="button" onClick={() => setDay(day === d ? null : d)} aria-label={`${dayLabel(d)}${list.length ? `, ${list.length} item${list.length === 1 ? "" : "s"}` : ""}`}
                    className={`mb-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-semibold ${d === t ? "bg-[#d4af37] text-[#2a0101]" : other ? "text-white/60" : "text-white/80 hover:bg-white/10"}`}>
                    {Number(d.slice(8))}
                  </button>
                  <div className="space-y-0.5">
                    {list.slice(0, 3).map((e) => <Chip key={e.key} e={e} />)}
                    {list.length > 3 && (
                      <button type="button" onClick={() => setDay(d)} className="text-[11px] text-white/70 hover:underline">+{list.length - 3} more</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {(view === "agenda" || day) && (
        <div className="mt-4 space-y-4">
          {(day ? [[day, byDay.get(day) || []]] : agenda).map(([d, list]) => (
            <section key={d} aria-label={dayLabel(d)}>
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-1">
                <h3 className={`text-sm font-bold ${d === t ? "text-[#d4af37]" : ""}`}>{d === t ? "Today · " : ""}{dayLabel(d)}</h3>
                {day && <button type="button" onClick={() => { setEditing("new"); setSelected(null); }} className="text-xs font-semibold text-[#d4af37] hover:underline">+ Add on this day</button>}
              </div>
              <ul>
                {list.map((e) => (
                  <li key={e.key}>
                    <button type="button" onClick={() => { setSelected(e.key); setEditing(null); }} className="flex w-full items-start gap-3 py-2 text-left hover:bg-white/[0.04]">
                      <span className="w-24 shrink-0 text-sm tabular-nums text-white/75">{timeLabel(e)}</span>
                      <span aria-hidden="true" className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-sm ${STYLE[e.kind] || STYLE.other}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug">{e.title}</span>
                        <span className="block text-xs text-white/65">
                          {[e.source === "task" ? `Task due · ${e.owner || "unassigned"}` : e.source === "event" ? "Debate or event" : KINDS[e.kind], e.location].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
                {!list.length && <li className="py-2 text-sm text-white/60">Nothing on this day.</li>}
              </ul>
            </section>
          ))}
          {view === "agenda" && !day && !agenda.length && <p className="text-sm text-white/70">Nothing coming up from here.</p>}
        </div>
      )}
    </div>
  );
}

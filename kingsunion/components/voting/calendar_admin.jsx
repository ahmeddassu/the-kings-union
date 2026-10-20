"use client";

import { useState } from "react";
import { TAGS, tagFor } from "@/lib/calendar_tags";
import { inboxRequest, smallBtn } from "@/components/voting/inbox_actions";

const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-2.5 text-base text-white placeholder:text-white/35 outline-none focus:border-white [color-scheme:dark]";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";
const select = "w-full mt-1 border border-[#d4af37]/70 bg-[#3d0202] px-3 py-2.5 text-base text-white";

const EMPTY = {
  title: "", tag: "other", date: "", endDate: "", allDay: false, time: "19:00", endTime: "",
  venue: "", description: "", eventSlug: "", url: "", image: "", ticketsUrl: "",
};

const niceDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

function Swatch({ tag, size = "h-3 w-3" }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${size}`} style={{ background: tagFor(tag).colour }} />;
}

export default function CalendarAdmin({ base, initial, events, photos }) {
  const [entries, setEntries] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // entry id
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const linked = events.find((e) => e.slug === form.eventSlug);
  const linkedTags = new Map(entries.filter((e) => e.eventSlug).map((e) => [e.eventSlug, e.tag]));

  function linkTo(slug) {
    const e = events.find((x) => x.slug === slug);
    setForm((f) =>
      e
        ? { ...f, eventSlug: slug, title: f.title || e.title, date: f.date || e.date, time: e.time || f.time, allDay: false, tag: f.tag === "other" ? e.tag : f.tag }
        : { ...f, eventSlug: "" }
    );
  }

  function startEdit(en) {
    setEditing(en.id);
    setForm({ ...EMPTY, ...en });
    setError("");
    setSaved("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startFromEvent(e) {
    setEditing(null);
    setForm({ ...EMPTY, eventSlug: e.slug, title: e.title, date: e.date, time: e.time || "19:00", tag: e.tag });
    setError("");
    setSaved("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
  }

  async function save(ev) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const data = await inboxRequest(editing ? `/api/admin/calendar/${editing}` : "/api/admin/calendar", editing ? "PUT" : "POST", form, base);
      if (!data) return;
      if (data.error) throw new Error(data.error);
      setEntries((list) =>
        [...list.filter((x) => x.id !== data.entry.id), data.entry].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      );
      setSaved(editing ? "Saved. The change is on the website now." : "Added. It’s on the website now.");
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(en) {
    if (!window.confirm(`Delete “${en.title}” from the calendar?`)) return;
    try {
      const data = await inboxRequest(`/api/admin/calendar/${en.id}`, "DELETE", null, base);
      if (data) setEntries((list) => list.filter((x) => x.id !== en.id));
      if (editing === en.id) reset();
    } catch (err) {
      setError(err.message);
    }
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const upcoming = entries.filter((e) => (e.endDate || e.date) >= today);
  const past = entries.filter((e) => (e.endDate || e.date) < today);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Form */}
      <form onSubmit={save} className="lg:col-span-7 flex flex-col gap-6 border border-[#d4af37]/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="title text-2xl font-bold">{editing ? "Edit entry" : "Add to the calendar"}</h2>
          {(editing || form.title) && (
            <button type="button" onClick={reset} className="text-sm text-white/70 underline underline-offset-4 hover:text-white min-h-11">
              {editing ? "Cancel editing" : "Clear form"}
            </button>
          )}
        </div>

        <div>
          <label htmlFor="cal-link" className={label}>Linked to a term card event</label>
          <select id="cal-link" value={form.eventSlug} onChange={(e) => linkTo(e.target.value)} className={select}>
            <option value="">Not linked: a new entry</option>
            {events.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.date} · {e.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-white/55">
            Link a debate to change its colour or add details. Its speakers, description and debate page come from the term card.
          </p>
        </div>

        <div>
          <label htmlFor="cal-title" className={label}>Title *</label>
          <input id="cal-title" required maxLength={160} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. AGM and committee elections" className={`${field} title text-lg`} />
        </div>

        <fieldset>
          <legend className={label}>Colour tag</legend>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TAGS.map((t) => (
              <label key={t.key} className={`flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-sm ${form.tag === t.key ? "border-white bg-white/10" : "border-[#d4af37]/40 hover:border-[#d4af37]"}`}>
                <input type="radio" name="tag" value={t.key} checked={form.tag === t.key} onChange={() => set("tag", t.key)} className="sr-only" />
                <Swatch tag={t.key} size="h-4 w-4" />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cal-date" className={label}>Date *</label>
            <input id="cal-date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="cal-end-date" className={label}>Ends on (if more than one day)</label>
            <input id="cal-end-date" type="date" min={form.date || undefined} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={field} />
          </div>
        </div>

        <label className="flex min-h-11 items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.allDay} onChange={(e) => set("allDay", e.target.checked)} className="h-5 w-5 accent-[#d4af37]" />
          All day (no time), e.g. a deadline
        </label>

        {!form.allDay && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="cal-time" className={label}>Starts *</label>
              <input id="cal-time" type="time" required value={form.time} onChange={(e) => set("time", e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor="cal-end-time" className={label}>Ends</label>
              <input id="cal-end-time" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={field} />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="cal-venue" className={label}>Venue</label>
          <input id="cal-venue" maxLength={160} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder={linked?.venue || "e.g. KIN427"} className={field} />
        </div>

        <div>
          <label htmlFor="cal-description" className={label}>{linked ? "Extra note (shown under the debate’s description)" : "Description"}</label>
          <textarea id="cal-description" rows={4} maxLength={3000} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full mt-2 border border-[#d4af37]/70 bg-transparent p-3 text-base text-white outline-none resize-y focus:border-white" />
        </div>

        {!linked && (
          <div>
            <label htmlFor="cal-url" className={label}>Link (where “More details” goes)</label>
            <input id="cal-url" maxLength={400} value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="/membership or https://…" className={field} />
          </div>
        )}

        <div>
          <label htmlFor="cal-image" className={label}>Banner image</label>
          <select id="cal-image" value={photos.includes(form.image) || !form.image ? form.image : "custom"} onChange={(e) => set("image", e.target.value === "custom" ? "https://" : e.target.value)} className={select}>
            <option value="">{linked ? "Use the debate’s own image" : "No image"}</option>
            {photos.map((p) => (
              <option key={p} value={p}>
                {p.replace("/gallery/", "").replace(/\.\w+$/, "").replace(/-/g, " ")}
              </option>
            ))}
            <option value="custom">Another image (paste a link)</option>
          </select>
          {form.image && !photos.includes(form.image) && (
            <input aria-label="Image link" maxLength={400} value={form.image} onChange={(e) => set("image", e.target.value)} className={`${field} mt-2`} />
          )}
        </div>

        <div>
          <label htmlFor="cal-tickets" className={label}>Tickets link</label>
          <input id="cal-tickets" maxLength={400} value={form.ticketsUrl} onChange={(e) => set("ticketsUrl", e.target.value)} placeholder="https://luma.com/…" className={field} />
        </div>

        {error && <p role="alert" className="text-[#f3c4c4]">{error}</p>}
        {saved && <p role="status" className="text-[#d4af37]">{saved}</p>}

        <button type="submit" disabled={busy} className="self-start min-h-12 bg-[#d4af37] px-8 text-base font-bold text-[#3d0202] hover:bg-white disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save changes" : "Add to calendar"}
        </button>
      </form>

      {/* Lists */}
      <div className="lg:col-span-5 space-y-10">
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Your entries</h2>
          {upcoming.length === 0 && past.length === 0 && <p className="mt-3 text-white/60">Nothing added yet.</p>}
          {[["Coming up", upcoming], ["Past", past]].map(([name, list]) =>
            list.length ? (
              <div key={name} className="mt-4">
                <p className="text-sm text-white/55 mb-2">{name}</p>
                <ul className="divide-y divide-[#d4af37]/20 border-y border-[#d4af37]/20">
                  {list.map((en) => (
                    <li key={en.id} className="py-3 flex items-start gap-3">
                      <Swatch tag={en.tag} size="mt-1.5 h-3 w-3" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold leading-snug">{en.title}</p>
                        <p className="text-sm text-white/60">
                          {tagFor(en.tag).label} · {niceDate(en.date)}
                          {en.endDate ? ` to ${niceDate(en.endDate)}` : ""}
                          {en.allDay ? " · all day" : ` · ${en.time}${en.endTime ? `–${en.endTime}` : ""}`}
                          {en.eventSlug ? " · linked to term card" : ""}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={() => startEdit(en)} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>Edit</button>
                          <button type="button" onClick={() => remove(en)} className={`${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>Delete</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">From the term card</h2>
          <p className="mt-1 text-sm text-white/55">These come from the term card spreadsheet automatically. Change one’s colour or add details here.</p>
          <ul className="mt-3 divide-y divide-[#d4af37]/20 border-y border-[#d4af37]/20">
            {events.map((e) => (
              <li key={e.slug} className="py-3 flex items-start gap-3">
                <Swatch tag={linkedTags.get(e.slug) || e.tag} size="mt-1.5 h-3 w-3" />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">{e.title}</p>
                  <p className="text-sm text-white/55">{niceDate(e.date)} · {e.time}</p>
                </div>
                {linkedTags.has(e.slug) ? (
                  <span className="shrink-0 self-center text-xs uppercase tracking-widest text-white/50">Customised</span>
                ) : (
                  <button type="button" onClick={() => startFromEvent(e)} className={`${smallBtn} shrink-0 border border-[#d4af37]/60 hover:bg-white/10`}>
                    Customise
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

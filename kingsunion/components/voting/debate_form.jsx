"use client";

import { useState } from "react";

const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";
const three = (list = []) => [0, 1, 2].map((i) => list[i] || "");

// Create or edit a debate. `termCard` (optional) lists upcoming debates from the
// term card so their details can be filled in with one click.
export default function DebateForm({ base, debate, termCard = [] }) {
  const editing = Boolean(debate);
  const [form, setForm] = useState({
    title: debate?.title || "",
    date: debate?.date || "",
    time: debate?.time || "19:00",
    venue: debate?.venue || "",
    proposition: three(debate?.proposition),
    opposition: three(debate?.opposition),
    hideResults: Boolean(debate?.hideResults),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSpeaker = (side, i, value) =>
    setForm((f) => ({ ...f, [side]: f[side].map((n, j) => (j === i ? value : n)) }));

  function fillFrom(slug) {
    const e = termCard.find((x) => x.slug === slug);
    if (!e) return;
    setForm((f) => ({
      ...f,
      title: e.title,
      date: e.date,
      time: e.time || f.time,
      venue: e.venue || "",
      proposition: three(e.proposition),
      opposition: three(e.opposition),
    }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editing ? `/api/admin/debates/${debate.id}` : "/api/admin/debates", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn’t save. Please try again.");
      window.location.href = `${base}/debates/${data.debate.id}`;
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-7 max-w-3xl">
      {!editing && termCard.length > 0 && (
        <div className="border border-[#d4af37]/60 p-4">
          <label htmlFor="fill" className={label}>
            Fill in from the term card
          </label>
          <select
            id="fill"
            defaultValue=""
            onChange={(e) => fillFrom(e.target.value)}
            className="mt-1 w-full border border-[#d4af37]/70 bg-[#3d0202] px-3 py-3 text-base text-white"
          >
            <option value="">Choose a debate…</option>
            {termCard.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.date} · {e.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className={label}>
          Motion *
        </label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="This House would…"
          className={`${field} title text-xl`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label htmlFor="date" className={label}>
            Date
          </label>
          <input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={`${field} [color-scheme:dark]`} />
        </div>
        <div>
          <label htmlFor="time" className={label}>
            Time
          </label>
          <input id="time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={`${field} [color-scheme:dark]`} />
        </div>
        <div>
          <label htmlFor="venue" className={label}>
            Venue
          </label>
          <input id="venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. KIN427" className={field} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {[
          ["proposition", "Proposition speakers"],
          ["opposition", "Opposition speakers"],
        ].map(([side, title]) => (
          <fieldset key={side}>
            <legend className={label}>{title}</legend>
            {form[side].map((n, i) => (
              <input
                key={i}
                aria-label={`${title} ${i + 1}`}
                value={n}
                onChange={(e) => setSpeaker(side, i, e.target.value)}
                placeholder={`Speaker ${i + 1}`}
                className={field}
              />
            ))}
          </fieldset>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.hideResults}
          onChange={(e) => set("hideResults", e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#d4af37]"
        />
        <span>
          <span className="font-bold">Keep the result secret until voting closes</span>
          <span className="block text-sm text-white/60">
            Voters and the big screen won’t see the numbers until you close voting or reveal them. You always can.
          </span>
        </span>
      </label>

      {error && (
        <p role="alert" className="text-[#f3c4c4]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="min-h-12 bg-[#d4af37] px-8 text-base font-bold text-[#3d0202] hover:bg-white disabled:opacity-60">
          {saving ? "Saving…" : editing ? "Save changes" : "Create debate"}
        </button>
        <a href={editing ? `${base}/debates/${debate.id}` : base || "/"} className="inline-flex min-h-12 items-center px-4 text-white/70 hover:text-white underline underline-offset-4">
          Cancel
        </a>
      </div>
    </form>
  );
}

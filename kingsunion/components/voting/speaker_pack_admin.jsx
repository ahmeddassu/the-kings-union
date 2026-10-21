"use client";

import { useState } from "react";
import { smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-12 px-5 text-base bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;

// Build the link to send a speaker, and edit the pack's text.
export default function SpeakerPackAdmin({ base, initial, debates, site }) {
  const [sections, setSections] = useState(initial.sections);
  const [debate, setDebate] = useState(debates[0]?.slug || "");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const link = `${site}/speaker-pack${debate ? `?debate=${encodeURIComponent(debate)}` : ""}`;
  const change = (i, key) => (e) => {
    setSections((list) => list.map((s, j) => (j === i ? { ...s, [key]: e.target.value } : s)));
    setDirty(true);
  };
  const move = (i, d) => {
    setSections((list) => {
      const next = [...list];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
    setDirty(true);
  };
  const remove = (i) => {
    if (!window.confirm(`Remove “${sections[i].title || "this section"}”?`)) return;
    setSections((list) => list.filter((_, j) => j !== i));
    setDirty(true);
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  }

  async function save() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/admin/speaker-pack", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sections }) });
      if (res.status === 401) return (window.location.href = base || "/");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
      setSections(data.pack.sections);
      setDirty(false);
      setNote("Saved. The speaker pack is updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="border border-[#d4af37]/60 p-5 sm:p-6">
        <h2 className="title text-2xl font-bold">Send a speaker their pack</h2>
        <label className="mt-5 block max-w-xl">
          <span className={label}>Their debate</span>
          <select value={debate} onChange={(e) => setDebate(e.target.value)} className={field}>
            {debates.map((d) => (
              <option key={d.slug} value={d.slug}>{d.label}</option>
            ))}
            <option value="">No particular debate (general pack)</option>
          </select>
        </label>
        <p className="mt-4 break-all border border-white/15 bg-[#2a0101] px-3 py-2 text-sm">{link}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={copy} className={primary}>{copied ? "Copied ✓" : "Copy link"}</button>
          <a href={link.replace(site, "")} target="_blank" rel="noopener" className={outline}>Preview ↗</a>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">What the pack says</h2>
        <p className="mt-1 text-sm text-white/55">Leave a blank line between paragraphs. Check it matches how you run debates (speech lengths, arrival time and so on).</p>
        <ol className="mt-4 space-y-4">
          {sections.map((s, i) => (
            <li key={i} className="border border-white/15 p-4 sm:p-5">
              <div className="flex flex-wrap items-end gap-3">
                <label className="block flex-1 min-w-[14rem]">
                  <span className={label}>Heading {i + 1}</span>
                  <input value={s.title} onChange={change(i, "title")} maxLength={80} className={field} />
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={outline} aria-label={`Move “${s.title}” up`}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className={outline} aria-label={`Move “${s.title}” down`}>↓</button>
                  <button type="button" onClick={() => remove(i)} className={`${smallBtn} text-white/60 underline underline-offset-4 hover:text-white`}>Remove</button>
                </div>
              </div>
              <label className="mt-3 block">
                <span className="sr-only">Text for {s.title}</span>
                <textarea value={s.body} onChange={change(i, "body")} rows={Math.min(10, Math.max(3, s.body.split("\n").length + 1))} maxLength={3000} className={field} />
              </label>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setSections((l) => [...l, { title: "", body: "" }]); setDirty(true); }} disabled={sections.length >= 15} className={outline}>
            + Add a section
          </button>
          <button type="button" onClick={save} disabled={busy || !dirty} className={primary}>{busy ? "Saving…" : "Save the pack"}</button>
          {dirty && <span className="text-sm text-[#d4af37]">Unsaved changes</span>}
        </div>
        {note && <p role="status" className="mt-4 border border-[#7fd1a8]/50 px-4 py-3 text-[#c9f0dc]">{note}</p>}
        {error && <p role="alert" className="mt-4 text-[#f3c4c4]">{error}</p>}
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { smallBtn } from "@/components/voting/inbox_actions";

const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const again = { yes: "Would come again", maybe: "Might come again", no: "Wouldn’t come again" };

function signIn(base) {
  window.location.href = base || "/";
}

function Bars({ dist, count }) {
  return (
    <div className="space-y-1" aria-hidden="true">
      {[5, 4, 3, 2, 1].map((s) => (
        <div key={s} className="flex items-center gap-2 text-xs text-white/70">
          <span className="w-3 tabular-nums">{s}</span>
          <span className="h-2.5 flex-1 bg-white/10">
            <span className="block h-full bg-[#d4af37]" style={{ width: `${count ? (dist[s - 1] / count) * 100 : 0}%` }} />
          </span>
          <span className="w-6 text-right tabular-nums">{dist[s - 1]}</span>
        </div>
      ))}
    </div>
  );
}

function Debate({ d, base, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(d.link);
      setNote("Link copied.");
    } catch {
      setNote(d.link);
    }
  };
  const remove = async () => {
    if (!window.confirm(`Delete all ${d.count} responses for “${d.title}”?`)) return;
    const res = await fetch(`/api/admin/feedback?debate=${encodeURIComponent(d.slug)}`, { method: "DELETE" });
    if (res.status === 401) return signIn(base);
    if (res.ok) onDeleted();
  };

  return (
    <li className="border border-[#d4af37]/50 bg-[#2a0101] p-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_14rem] gap-5 md:items-center">
        <div className="min-w-0">
          <p className="title text-xl font-bold leading-tight">“{d.title}”</p>
          <p className="mt-1 text-sm text-white/65">{d.when}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className={outline}>Copy feedback link</button>
            {d.comments.length > 0 && (
              <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={outline}>
                {open ? "Hide comments" : `Read ${d.comments.length} comment${d.comments.length === 1 ? "" : "s"}`}
              </button>
            )}
            {d.count > 0 && <button type="button" onClick={remove} className={danger}>Delete responses</button>}
          </div>
          {note && <p role="status" className="mt-2 break-all text-sm text-[#d4af37]">{note}</p>}
        </div>
        <div className="flex gap-6 md:justify-end">
          <p>
            <span className="title block text-4xl font-bold tabular-nums">{d.average ?? "–"}</span>
            <span className="text-xs uppercase tracking-widest text-white/60">out of 5</span>
          </p>
          <p>
            <span className="title block text-4xl font-bold tabular-nums">{d.count}</span>
            <span className="text-xs uppercase tracking-widest text-white/60">responses</span>
          </p>
          <p>
            <span className="title block text-4xl font-bold tabular-nums">{d.again === null ? "–" : `${d.again}%`}</span>
            <span className="text-xs uppercase tracking-widest text-white/60">would return</span>
          </p>
        </div>
        <Bars dist={d.dist} count={d.count} />
      </div>
      {open && (
        <ul className="mt-5 space-y-4 border-t border-[#d4af37]/30 pt-4">
          {d.comments.map((c) => (
            <li key={c.at} className="text-sm">
              <p className="text-xs uppercase tracking-widest text-[#d4af37]">
                Rated {c.rating}/5{c.again ? ` · ${again[c.again]}` : ""} ·{" "}
                {new Date(c.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}
              </p>
              {c.liked && <p className="mt-1"><strong>Worked well:</strong> {c.liked}</p>}
              {c.improve && <p className="mt-1"><strong>Could be better:</strong> {c.improve}</p>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FeedbackAdmin({ base, debates, initialOn, ready, listSize }) {
  const router = useRouter();
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !on }) });
      if (res.status === 401) return signIn(base);
      if (!res.ok) throw new Error("That didn’t work. Please try again.");
      setOn(!on);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="border border-[#d4af37]/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="title text-2xl font-bold">Morning-after email</h2>
            <p className="mt-2 text-white/75">
              The morning after each debate, everyone on the ticket-alerts list ({listSize}) gets a short email asking
              how it was, with a link to the form. Each debate is only asked about once, and every email has an
              unsubscribe link.
            </p>
          </div>
          <span className={`inline-flex min-h-9 items-center px-3 text-sm font-bold uppercase tracking-widest ${on ? "bg-[#7fd1a8]/20 text-[#c9f0dc]" : "bg-white/10 text-white/70"}`}>
            {on ? "On" : "Off"}
          </span>
        </div>
        {!ready && <p className="mt-3 text-[#f3c4c4]">Email isn’t set up yet, so no feedback emails will go out until it is.</p>}
        {error && <p role="alert" className="mt-3 text-[#f3c4c4]">{error}</p>}
        <button type="button" onClick={toggle} disabled={busy} className={`${outline} mt-5`}>
          {busy ? "Saving…" : on ? "Switch the email off" : "Switch the email on"}
        </button>
      </section>

      {debates.length ? (
        <ul className="space-y-4">
          {debates.map((d) => (
            <Debate key={d.slug} d={d} base={base} onDeleted={() => router.refresh()} />
          ))}
        </ul>
      ) : (
        <p className="text-white/70">Debates appear here once they’ve happened.</p>
      )}
    </div>
  );
}

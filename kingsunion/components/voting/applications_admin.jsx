"use client";

import { useState } from "react";
import { inboxRequest, when, smallBtn } from "@/components/voting/inbox_actions";

const TABS = [
  ["new", "New"],
  ["shortlisted", "Shortlisted"],
  ["declined", "Declined"],
];
const SIDES = { proposition: "Proposition", opposition: "Opposition", either: "Either side" };

export default function ApplicationsAdmin({ base, initial, debates }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState("new");
  const [debate, setDebate] = useState("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function run(id, fn) {
    setBusy(id);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const setStatus = (a, status) =>
    run(a.id, async () => {
      const data = await inboxRequest(`/api/admin/applications/${a.id}`, "PATCH", { status }, base);
      if (data?.application) setItems((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x)));
      else if (data) setItems((list) => list.filter((x) => x.id !== a.id));
    });

  const remove = (a) => {
    if (!window.confirm(`Delete ${a.name}’s application? This can’t be undone.`)) return;
    run(a.id, async () => {
      const data = await inboxRequest(`/api/admin/applications/${a.id}`, "DELETE", null, base);
      if (data) setItems((list) => list.filter((x) => x.id !== a.id));
    });
  };

  const matchesDebate = (a) => debate === "all" || (debate === "any" ? !a.debate : a.debate?.slug === debate);
  const shown = items.filter((a) => a.status === tab && matchesDebate(a));

  // Debates mentioned in applications, plus the upcoming ones.
  const options = new Map(debates.map((d) => [d.slug, d.title]));
  for (const a of items) if (a.debate) options.set(a.debate.slug, a.debate.title);

  const emails = shown.map((a) => a.email).join(", ");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" className="flex flex-wrap gap-2">
          {TABS.map(([key, name]) => {
            const n = items.filter((a) => a.status === key && matchesDebate(a)).length;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`${smallBtn} border ${tab === key ? "border-[#d4af37] bg-[#d4af37] text-[#3d0202]" : "border-[#d4af37]/60 text-white hover:bg-white/10"}`}
              >
                {name} ({n})
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-white/70">Debate</span>
          <select value={debate} onChange={(e) => setDebate(e.target.value)} className="min-h-11 max-w-[60vw] border border-[#d4af37]/70 bg-[#3d0202] px-3 text-sm text-white">
            <option value="all">All debates</option>
            <option value="any">“Any debate”</option>
            {[...options].map(([slug, title]) => (
              <option key={slug} value={slug}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[#f3c4c4]">
          {error}
        </p>
      )}

      {shown.length > 1 && (
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(emails).catch(() => window.prompt("Copy these emails:", emails))}
          className={`${smallBtn} mt-4 border border-[#d4af37]/60 hover:bg-white/10`}
        >
          Copy these {shown.length} email addresses
        </button>
      )}

      {shown.length === 0 ? (
        <p className="mt-8 border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">Nothing here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((a) => (
            <li key={a.id} className="border border-[#d4af37]/60 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="title text-2xl font-bold">{a.name}</p>
                <p className="text-sm text-white/60">{when(a.createdAt)}</p>
              </div>
              <p className="mt-1 text-white/80">
                {a.course} · {a.member === "yes" ? <span className="text-[#d4af37]">Member</span> : "Not a member yet"} ·{" "}
                <a href={`mailto:${a.email}`} className="underline underline-offset-4 hover:text-white">{a.email}</a>
              </p>
              <p className="mt-3 text-sm uppercase tracking-widest text-[#d4af37]">
                {a.debate ? a.debate.title : "Any debate"} · {SIDES[a.side] || "Either side"}
              </p>
              <p className="mt-2 whitespace-pre-line">{a.pitch}</p>
              {a.experience && (
                <p className="mt-3 whitespace-pre-line text-sm text-white/70">
                  <span className="text-white/50">Experience: </span>
                  {a.experience}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {a.status !== "shortlisted" && (
                  <button type="button" disabled={busy === a.id} onClick={() => setStatus(a, "shortlisted")} className={`${smallBtn} bg-[#d4af37] text-[#3d0202] hover:bg-white`}>
                    Shortlist
                  </button>
                )}
                {a.status !== "declined" && (
                  <button type="button" disabled={busy === a.id} onClick={() => setStatus(a, "declined")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
                    Decline
                  </button>
                )}
                {a.status !== "new" && (
                  <button type="button" disabled={busy === a.id} onClick={() => setStatus(a, "new")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
                    Move back to New
                  </button>
                )}
                <button type="button" disabled={busy === a.id} onClick={() => remove(a)} className={`${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

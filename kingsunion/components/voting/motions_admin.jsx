"use client";

import { useState } from "react";
import { inboxRequest, when, smallBtn } from "@/components/voting/inbox_actions";

const TABS = [
  ["new", "New"],
  ["featured", "On the website"],
  ["archived", "Archived"],
];

export default function MotionsAdmin({ base, initial }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState("new");
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

  const setStatus = (m, status) =>
    run(m.id, async () => {
      const data = await inboxRequest(`/api/admin/motions/${m.id}`, "PATCH", { status }, base);
      if (data?.motion) setItems((list) => list.map((x) => (x.id === m.id ? { ...x, status } : x)));
      else if (data) setItems((list) => list.filter((x) => x.id !== m.id));
    });

  const remove = (m) => {
    if (!window.confirm(`Delete “This House ${m.motion}”? This can’t be undone.`)) return;
    run(m.id, async () => {
      const data = await inboxRequest(`/api/admin/motions/${m.id}`, "DELETE", null, base);
      if (data) setItems((list) => list.filter((x) => x.id !== m.id));
    });
  };

  const shown = items
    .filter((m) => m.status === tab)
    .sort((a, b) => (tab === "featured" ? b.upvotes - a.upvotes : 0) || b.createdAt - a.createdAt);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map(([key, name]) => {
          const n = items.filter((m) => m.status === key).length;
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

      {tab === "featured" && (
        <p className="mt-4 text-sm text-white/60">
          These are on <a href="https://www.kingsunion.org.uk/motions" className="underline underline-offset-4">kingsunion.org.uk/motions</a>, where people can back them. Sorted by votes.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-[#f3c4c4]">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-8 border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">
          {tab === "new" ? "No new suggestions." : tab === "featured" ? "Nothing on the website yet. Put the best suggestions up from New." : "Nothing archived."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((m) => (
            <li key={m.id} className="border border-[#d4af37]/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="title text-xl sm:text-2xl font-bold leading-snug">
                  <span className="italic font-normal text-white/70">This House</span> {m.motion}
                </p>
                {m.status === "featured" && (
                  <span className="shrink-0 border border-[#d4af37] px-2.5 py-1 text-sm font-bold tabular-nums text-[#d4af37]">▲ {m.upvotes}</span>
                )}
              </div>
              {m.why && <p className="mt-3 whitespace-pre-line text-white/80">{m.why}</p>}
              <p className="mt-3 text-sm text-white/60">
                {when(m.createdAt)} · {m.name || "Anonymous"}
                {m.email && (
                  <>
                    {" "}
                    · <a href={`mailto:${m.email}`} className="underline underline-offset-4 hover:text-white">{m.email}</a>
                  </>
                )}
                {m.speak && <span className="ml-2 text-[#d4af37]">· Wants to speak</span>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.status !== "featured" && (
                  <button type="button" disabled={busy === m.id} onClick={() => setStatus(m, "featured")} className={`${smallBtn} bg-[#d4af37] text-[#3d0202] hover:bg-white`}>
                    Put on the website
                  </button>
                )}
                {m.status === "featured" && (
                  <button type="button" disabled={busy === m.id} onClick={() => setStatus(m, "new")} className={`${smallBtn} border border-[#d4af37] hover:bg-white/10`}>
                    Take off the website
                  </button>
                )}
                {m.status !== "archived" ? (
                  <button type="button" disabled={busy === m.id} onClick={() => setStatus(m, "archived")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
                    Archive
                  </button>
                ) : (
                  <button type="button" disabled={busy === m.id} onClick={() => setStatus(m, "new")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
                    Move back to New
                  </button>
                )}
                <button type="button" disabled={busy === m.id} onClick={() => remove(m)} className={`${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>
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

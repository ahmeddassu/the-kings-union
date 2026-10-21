"use client";

import { useState } from "react";
import { inboxRequest, when, smallBtn } from "@/components/voting/inbox_actions";

const BOXES = [
  ["union", "Messages to the Union"],
  ["kingsway", "Kingsway applications"],
];

export default function MessagesAdmin({ base, initial }) {
  const [items, setItems] = useState(initial); // { union: [...], kingsway: [...] }
  const [box, setBox] = useState(initial.union ? "union" : "kingsway");
  const [show, setShow] = useState("new");
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

  const update = (m, status) =>
    run(m.id, async () => {
      const data = await inboxRequest(`/api/admin/inbox/${box}/${m.id}`, "PATCH", { status }, base);
      if (data?.message) setItems((all) => ({ ...all, [box]: all[box].map((x) => (x.id === m.id ? { ...x, status } : x)) }));
    });

  const remove = (m) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can’t be undone.`)) return;
    run(m.id, async () => {
      const data = await inboxRequest(`/api/admin/inbox/${box}/${m.id}`, "DELETE", null, base);
      if (data) setItems((all) => ({ ...all, [box]: all[box].filter((x) => x.id !== m.id) }));
    });
  };

  const list = items[box].filter((m) => m.status === show);
  const tab = (active) =>
    `${smallBtn} border ${active ? "border-[#d4af37] bg-[#d4af37] text-[#3d0202]" : "border-[#d4af37]/60 text-white hover:bg-white/10"}`;

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {BOXES.filter(([key]) => items[key]).map(([key, name]) => (
          <button key={key} type="button" role="tab" aria-selected={box === key} onClick={() => setBox(key)} className={tab(box === key)}>
            {name} ({items[key].filter((m) => m.status === "new").length} new)
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2 text-sm">
        {[
          ["new", "New"],
          ["done", "Dealt with"],
        ].map(([key, name]) => (
          <button
            key={key}
            type="button"
            onClick={() => setShow(key)}
            className={`min-h-11 px-3 underline-offset-4 ${show === key ? "font-bold underline text-white" : "text-white/60 hover:text-white"}`}
          >
            {name} ({items[box].filter((m) => m.status === key).length})
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[#f3c4c4]">
          {error}
        </p>
      )}

      {list.length === 0 ? (
        <p className="mt-6 border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">Nothing here.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {list.map((m) => (
            <li key={m.id} className="border border-[#d4af37]/60 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="title text-xl sm:text-2xl font-bold">
                  {box === "union" ? m.subject || "Message" : `${m.kind} · ${m.name}`}
                </p>
                <p className="text-sm text-white/60">{when(m.createdAt)}</p>
              </div>
              <p className="mt-1 text-white/80">
                {m.name} ·{" "}
                <a href={`mailto:${m.email}`} className="underline underline-offset-4 hover:text-white">
                  {m.email}
                </a>
                {box === "kingsway" && (
                  <>
                    {" "}
                    · {m.course}
                    {m.knumber ? ` · ${m.knumber}` : ""}
                  </>
                )}
              </p>
              {box === "kingsway" && (
                <p className="mt-3 text-sm uppercase tracking-widest text-[#d4af37]">
                  {m.kind === "Debate" ? `Debate topic${m.partner ? ` · partner: ${m.partner}` : ""}` : "Op-ed topic"}
                </p>
              )}
              {box === "kingsway" && m.topic && <p className="mt-1">{m.topic}</p>}
              {m.message && <p className="mt-3 whitespace-pre-line">{m.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${box === "union" ? m.subject || "your message" : "your Kingsway application"}`)}`} className={`${smallBtn} bg-[#d4af37] text-[#3d0202] hover:bg-white`}>
                  Reply by email
                </a>
                {m.status === "new" ? (
                  <button type="button" disabled={busy === m.id} onClick={() => update(m, "done")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
                    Mark dealt with
                  </button>
                ) : (
                  <button type="button" disabled={busy === m.id} onClick={() => update(m, "new")} className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
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

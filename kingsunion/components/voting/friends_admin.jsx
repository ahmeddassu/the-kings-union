"use client";

import { useState } from "react";
import { smallBtn } from "@/components/voting/inbox_actions";

const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const primary = `${smallBtn} min-h-11 px-5 bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function signIn(base) {
  window.location.href = base || "/";
}

function download(list) {
  const rows = [["Name", "Email", "Connection", "Graduation year", "Interested in", "Joined"], ...list.map((f) => [f.name, f.email, f.connection, f.year, f.interests.join("; "), new Date(f.at).toISOString().slice(0, 10)])];
  const blob = new Blob(["﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "friends-of-the-union.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function FriendsAdmin({ base, initial }) {
  const [list, setList] = useState(initial);
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const query = q.trim().toLowerCase();
  const shown = query ? list.filter((f) => [f.name, f.email, f.connection, f.interests.join(" ")].join(" ").toLowerCase().includes(query)) : list;

  const remove = async (f) => {
    if (!window.confirm(`Remove ${f.name} (${f.email}) from Friends of the Union?`)) return;
    const res = await fetch(`/api/admin/friends?email=${encodeURIComponent(f.email)}`, { method: "DELETE" });
    if (res.status === 401) return signIn(base);
    if (res.ok) {
      setList((l) => l.filter((x) => x.email !== f.email));
      setNote(`${f.name} has been removed.`);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown.map((f) => f.email).join(", "));
      setNote(`Copied ${shown.length} email address${shown.length === 1 ? "" : "es"}.`);
    } catch {
      setNote("Couldn’t copy. Use “Download as CSV” instead.");
    }
  };

  if (!list.length) return <p className="text-white/70">No one has signed up yet. Share kingsunion.org.uk/friends with alumni and supporters.</p>;

  return (
    <>
      <p className="title text-3xl font-bold">{list.length} {list.length === 1 ? "friend" : "friends"}</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[14rem]" htmlFor="friends-q">
          <span className="block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5">Search</span>
          <input id="friends-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or interest" className={field} />
        </label>
        <button type="button" onClick={copy} className={primary}>Copy emails{query ? " shown" : ""}</button>
        <button type="button" onClick={() => download(shown)} className={outline}>Download as CSV</button>
      </div>
      <p role="status" className="mt-3 min-h-6 text-sm text-[#d4af37]">{note}</p>
      <ul className="mt-2">
        {shown.map((f) => (
          <li key={f.email} className="flex flex-wrap items-start justify-between gap-3 border-t border-[#d4af37]/30 py-4">
            <div className="min-w-0">
              <p className="font-bold">{f.name} <span className="font-normal text-white/60 break-all">{f.email}</span></p>
              <p className="text-sm text-white/75">
                {f.connection}{f.year ? `, ${f.year}` : ""} · joined {new Date(f.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
              </p>
              {f.interests.length > 0 && <p className="mt-1 text-sm text-white/65">Interested in: {f.interests.join(", ")}</p>}
            </div>
            <button type="button" onClick={() => remove(f)} className={danger}>Remove</button>
          </li>
        ))}
      </ul>
    </>
  );
}

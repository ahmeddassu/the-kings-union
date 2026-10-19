"use client";

import { useState } from "react";

// Motions the committee has put up for a vote of interest. One upvote each.
export default function MotionBoard({ motions, voted = [] }) {
  const [counts, setCounts] = useState(() => Object.fromEntries(motions.map((m) => [m.id, m.upvotes])));
  const [mine, setMine] = useState(() => new Set(voted));
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function upvote(id) {
    if (mine.has(id) || busy) return;
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/motions/${id}/upvote`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn’t save your vote. Please try again.");
      setCounts((c) => ({ ...c, [id]: data.upvotes }));
      setMine((s) => new Set(s).add(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const sorted = [...motions].sort((a, b) => counts[b.id] - counts[a.id]);

  return (
    <div>
      <ol className="divide-y divide-[#d4af37]/40 border-y border-[#d4af37]/40">
        {sorted.map((m) => {
          const done = mine.has(m.id);
          return (
            <li key={m.id} className="flex items-center gap-4 sm:gap-6 py-4">
              <button
                type="button"
                onClick={() => upvote(m.id)}
                disabled={done || busy === m.id}
                aria-pressed={done}
                aria-label={done ? `You backed this motion (${counts[m.id]})` : `Back this motion (${counts[m.id]})`}
                className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center border transition-colors ${
                  done ? "border-[#d4af37] bg-[#d4af37] text-[#3d0202]" : "border-[#d4af37]/70 text-white hover:bg-white/10"
                }`}
              >
                <span aria-hidden="true" className="text-sm leading-none">▲</span>
                <span className="mt-1 text-lg font-bold leading-none tabular-nums">{counts[m.id]}</span>
              </button>
              <p className="title text-lg sm:text-xl leading-snug">
                <span className="italic text-white/70">This House</span> {m.motion}
              </p>
            </li>
          );
        })}
      </ol>
      {error && (
        <p role="alert" className="mt-4 text-[#f3c4c4]">
          {error}
        </p>
      )}
    </div>
  );
}

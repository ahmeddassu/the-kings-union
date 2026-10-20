"use client";

import { useEffect, useState } from "react";
import usePoll from "@/components/voting/use_poll";

// "On the site now": people active in the last five minutes, refreshed every 15 seconds.
export default function LiveVisitors({ pageNames }) {
  const [live, setLive] = useState(null);
  const load = async () => {
    try {
      const res = await fetch("/api/admin/stats/live", { cache: "no-store" });
      if (res.ok) setLive(await res.json());
    } catch {
      // try again on the next poll
    }
  };
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, []);
  usePoll(load, 15000, true);

  return (
    <section className="mt-8 border border-[#d4af37]/60 p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="relative flex h-3 w-3" aria-hidden="true">
          {live?.count > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7fd1a8] opacity-60" />}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${live?.count > 0 ? "bg-[#7fd1a8]" : "bg-white/30"}`} />
        </span>
        <p className="text-lg">
          <strong className="title text-2xl tabular-nums">{live ? live.count : "…"}</strong>{" "}
          {live?.count === 1 ? "person" : "people"} on the site now
        </p>
        <span className="text-sm text-white/50">active in the last 5 minutes · updates every 15 seconds</span>
      </div>
      {live?.pages?.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {live.pages.map((p) => (
            <li key={p.key} className="border border-white/20 px-2.5 py-1">
              {pageNames[p.key] || p.key} <span className="tabular-nums text-white/55">· {p.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

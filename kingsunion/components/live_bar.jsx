"use client";

import { useEffect, useState } from "react";

// While voting is open in the chamber, a bar across the top of every page
// links straight to the vote. Checks every 30 seconds; shows nothing otherwise.
export default function LiveBar() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    let stopped = false;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped) setLive(data.live?.[0] || null);
      } catch {
        // offline or a blip: try again next time
      }
    };
    const first = setTimeout(check, 0);
    const timer = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      stopped = true;
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  if (!live) return null;
  const short = live.title.replace(/^this house (would|believes|has)\s+/i, "");
  const shortTitle = short.charAt(0).toUpperCase() + short.slice(1);

  return (
    <a
      href={live.link}
      className="group block bg-white text-[#3d0202] font-serif hover:bg-[#f6eccd] transition-colors duration-200"
    >
      <div className="px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-4 text-sm sm:text-base">
        <p className="min-w-0 flex items-center gap-3">
          <span className="relative inline-flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b3261e] opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#b3261e]" />
          </span>
          <span className="font-bold uppercase tracking-widest text-xs">Live now</span>
          <span className="truncate italic sm:hidden">{shortTitle}</span>
          <span className="truncate italic hidden sm:inline">The House is voting on “{live.title}”</span>
        </p>
        <span className="shrink-0 font-bold whitespace-nowrap">
          Vote now <span aria-hidden="true" className="inline-block group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </a>
  );
}

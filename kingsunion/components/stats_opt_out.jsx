"use client";

import { useEffect, useState } from "react";
import { OPT_OUT_KEY } from "@/lib/stats_optout";

// Lets anyone stop their visits being counted, in one click.
export default function StatsOptOut() {
  const [state, setState] = useState(null); // "counted" | "out" | "signal"

  useEffect(() => {
    const t = setTimeout(() => {
      if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return setState("signal");
      try {
        setState(localStorage.getItem(OPT_OUT_KEY) === "1" ? "out" : "counted");
      } catch {
        setState("counted");
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function toggle() {
    const next = state === "out" ? "counted" : "out";
    try {
      if (next === "out") localStorage.setItem(OPT_OUT_KEY, "1");
      else localStorage.removeItem(OPT_OUT_KEY);
      setState(next);
    } catch {
      setState("blocked");
    }
  }

  if (!state) return null;
  if (state === "signal")
    return (
      <p className="mt-6 border border-[#d4af37]/60 p-4 text-white/85" role="status">
        Your browser is sending a privacy signal (Do Not Track or Global Privacy Control), so your visits are not counted.
      </p>
    );
  if (state === "blocked")
    return (
      <p className="mt-6 border border-[#d4af37]/60 p-4 text-white/85" role="status">
        Your browser blocked saving your choice. Turning on “Do Not Track” or “Global Privacy Control” in your browser settings also stops your visits being counted.
      </p>
    );
  return (
    <div className="mt-6 border border-[#d4af37]/60 p-4 sm:p-5">
      <p className="text-white/85" role="status">
        {state === "out" ? "Your visits are not being counted on this browser." : "Your visits are currently counted (anonymously, as described above)."}
      </p>
      <button
        type="button"
        onClick={toggle}
        className="mt-4 inline-flex min-h-11 items-center border border-[#d4af37] px-5 text-base font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
      >
        {state === "out" ? "Count my visits again" : "Don’t count my visits"}
      </button>
      <p className="mt-3 text-sm text-white/55">This saves one small setting in this browser so we remember your choice. Do this on each browser or device you use.</p>
    </div>
  );
}

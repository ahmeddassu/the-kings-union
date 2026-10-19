"use client";

import { useEffect, useRef } from "react";

// Calls `fn` every `ms` while the page is visible and `active` is true.
export default function usePoll(fn, ms, active = true) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });

  useEffect(() => {
    if (!active) return;
    let timer;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === "visible") {
        try {
          await saved.current();
        } catch {
          // ignore a missed refresh; the next one will catch up
        }
      }
      timer = setTimeout(tick, ms);
    };
    timer = setTimeout(tick, ms);
    const onVisible = () => document.visibilityState === "visible" && saved.current();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ms, active]);
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Tells our own stats a page was viewed. No cookies; honours "Do Not Track".
export default function PageView() {
  const path = usePathname();
  useEffect(() => {
    if (!path || navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    const body = JSON.stringify({ path, referrer: document.referrer || "" });
    try {
      if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) {
        fetch("/api/hit", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
      }
    } catch {
      // never let stats break the page
    }
  }, [path]);
  return null;
}

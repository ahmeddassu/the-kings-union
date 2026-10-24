"use client";

// The bell in the admin header: what's new for you. Checks every minute.
import { useEffect, useRef, useState } from "react";
import usePoll from "@/components/voting/use_poll";

const sans = "[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]";
const ICON = { task: "●", review: "◆", improve: "▲", overdue: "!", done: "✓", inbox: "✉", calendar: "▦", info: "•" };
const TONE = { review: "text-[#c9daf4]", improve: "text-[#f2d48b]", overdue: "text-[#f3c4c4]", done: "text-[#c7e6c2]" };

function ago(ms) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d < 7 ? `${d} day${d === 1 ? "" : "s"} ago` : new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationBell({ base, initial }) {
  const [data, setData] = useState(initial || { notes: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const box = useRef(null);

  const load = async () => {
    const res = await fetch("/api/admin/notifications", { cache: "no-store" });
    if (res.ok) setData(await res.json());
  };
  usePoll(load, 60000);

  useEffect(() => {
    if (!open) return;
    const away = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && data.unread) {
      // Keep the "new" highlight while the panel is open, then mark read.
      setSeen(new Set(data.notes.filter((n) => n.unread).map((n) => n.id)));
      setData((d) => ({ ...d, unread: 0 }));
      fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read" }) }).catch(() => {});
    }
  };
  const clear = async () => {
    await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clear" }) }).catch(() => {});
    setData({ notes: [], unread: 0 });
  };

  return (
    <div ref={box} className={`relative ${sans}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="admin-notifications"
        className="relative inline-flex h-11 w-11 items-center justify-center text-white/80 hover:text-white"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        <span className="sr-only">Notifications{data.unread ? `, ${data.unread} new` : ""}</span>
        {data.unread > 0 && (
          <span aria-hidden="true" className="absolute right-0.5 top-0.5 min-w-5 rounded-full bg-[#d4af37] px-1 text-center text-[11px] font-bold leading-5 text-[#2a0101]">
            {data.unread > 9 ? "9+" : data.unread}
          </span>
        )}
      </button>
      {open && (
        <div id="admin-notifications" className="fixed inset-x-4 top-20 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem] border border-[#d4af37]/60 bg-[#2a0101] text-left shadow-xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <p className="text-sm font-bold">Notifications</p>
            {data.notes.length > 0 && (
              <button type="button" onClick={clear} className="min-h-8 text-xs text-white/70 hover:text-white hover:underline">Clear all</button>
            )}
          </div>
          {data.notes.length ? (
            <ul className="max-h-[70vh] overflow-y-auto">
              {data.notes.map((n) => {
                const fresh = seen.has(n.id) || n.unread;
                const inner = (
                  <>
                    <span aria-hidden="true" className={`mt-0.5 w-4 shrink-0 text-center text-sm ${TONE[n.kind] || "text-[#d4af37]"}`}>{ICON[n.kind] || "•"}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm leading-snug ${fresh ? "font-semibold text-white" : "text-white/80"}`}>{n.text}</span>
                      <span className="mt-0.5 block text-xs text-white/60">{ago(n.at)}{fresh ? " · New" : ""}</span>
                    </span>
                  </>
                );
                return (
                  <li key={n.id} className={`border-b border-white/5 ${fresh ? "bg-white/[0.06]" : ""}`}>
                    {n.href ? (
                      <a href={`${base}${n.href}`} className="flex gap-3 px-4 py-3 hover:bg-white/10">{inner}</a>
                    ) : (
                      <div className="flex gap-3 px-4 py-3">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-white/70">Nothing new. You’ll be told here when you’re given a task, a task needs reviewing, or something arrives for your team.</p>
          )}
        </div>
      )}
    </div>
  );
}

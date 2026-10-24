"use client";

// The admin section menu: a few groups, each a dropdown. A group with only one
// section the person can use is a plain link.
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function AdminNav({ base, groups, current }) {
  const [open, setOpen] = useState(null);
  const [shift, setShift] = useState(0);
  const nav = useRef(null);
  const menu = useRef(null);

  // Keep an open menu inside the screen (the bar wraps on phones).
  useLayoutEffect(() => {
    if (open === null || !menu.current) return setShift(0);
    const box = menu.current.getBoundingClientRect();
    const room = document.documentElement.clientWidth - 8;
    const start = box.left - shift;
    const end = start + box.width;
    setShift(end > room ? Math.max(8 - start, room - end) : start < 8 ? 8 - start : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onDown = (e) => nav.current && !nav.current.contains(e.target) && setOpen(null);
    const onKey = (e) => {
      if (e.key === "Escape") {
        const btn = nav.current?.querySelector(`[data-group="${open}"]`);
        setOpen(null);
        btn?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const href = (path) => `${base}${path}` || "/";
  const tab = (on) =>
    `inline-flex min-h-11 shrink-0 items-center gap-1 border-b-2 px-3 text-sm ${
      on ? "border-[#d4af37] text-white font-bold" : "border-transparent text-white/70 hover:text-white"
    }`;

  return (
    <nav ref={nav} aria-label="Admin sections" className="px-4 sm:px-6 md:px-8 flex flex-wrap gap-x-1">
      {groups.map((g) => {
        const here = g.items.some(([path]) => path === current);
        if (g.items.length === 1) {
          const [path, name] = g.items[0];
          return (
            <a key={g.label} href={href(path)} aria-current={here ? "page" : undefined} className={tab(here)}>
              {name}
            </a>
          );
        }
        const isOpen = open === g.label;
        const id = `admin-menu-${g.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        return (
          <div key={g.label} className="relative">
            <button
              type="button"
              data-group={g.label}
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : g.label)}
              className={tab(here)}
            >
              {g.label}
              <svg aria-hidden="true" viewBox="0 0 10 6" className={`h-2 w-2.5 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {isOpen && (
              <ul id={id} ref={menu} style={{ transform: shift ? `translateX(${shift}px)` : undefined }} className={`absolute left-0 top-full z-50 mt-px min-w-[13rem] max-w-[calc(100vw-2rem)] border border-[#d4af37]/60 bg-[#2a0101] py-1 shadow-xl shadow-black/40`}>
                {g.items.map(([path, name]) => (
                  <li key={path}>
                    <a
                      href={href(path)}
                      aria-current={path === current ? "page" : undefined}
                      className={`flex min-h-11 items-center px-4 text-sm hover:bg-white/10 ${path === current ? "font-bold text-[#d4af37]" : "text-white"}`}
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

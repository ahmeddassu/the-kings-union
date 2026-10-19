"use client";

import { useEffect, useRef, useState } from "react";

// Search box for the debate archive. It hides non-matching debates by writing a
// small CSS rule, so it combines with the topic/result/year filters (which work
// even without JavaScript).
const cssString = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export default function ArchiveSearch({ id }) {
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  // "Clear filters" resets the form; clear the search with it.
  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onReset = () => setQuery("");
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  const css = words
    .map((w) => `.arc-item:not([data-search*="${cssString(w)}" i]){display:none}`)
    .join("");

  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-widest mb-1 text-[#d4af37]">
        Search
      </label>
      <input
        ref={ref}
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        placeholder="A motion, speaker or word"
        autoComplete="off"
        className="w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white transition-colors"
      />
      {css && <style>{css}</style>}
    </div>
  );
}

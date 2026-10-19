"use client";

import { useState } from "react";

// The 5-digit code box on the voting home page.
export default function CodeEntry({ base, error }) {
  const [code, setCode] = useState("");
  const ready = /^\d{5}$/.test(code);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) window.location.href = `${base}/${code}`;
      }}
      className="w-full max-w-sm"
    >
      <label htmlFor="code" className="block text-xs uppercase tracking-widest mb-3 text-[#d4af37]">
        Debate code
      </label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{5}"
        maxLength={5}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
        placeholder="12345"
        aria-describedby={error ? "code-error" : undefined}
        className="title w-full border-2 border-[#d4af37] bg-transparent px-4 py-4 text-center text-5xl font-bold tracking-[0.3em] text-white placeholder:text-white/20 outline-none focus:border-white"
      />
      {error && (
        <p id="code-error" className="mt-3 text-base text-[#f3c4c4]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!ready}
        className="mt-5 w-full min-h-14 bg-[#d4af37] text-[#3d0202] text-lg font-bold transition-colors hover:bg-white disabled:opacity-40 disabled:hover:bg-[#d4af37]"
      >
        Go to vote →
      </button>
    </form>
  );
}

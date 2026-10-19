"use client";

import { useState } from "react";
import Results from "@/components/voting/results";
import usePoll from "@/components/voting/use_poll";

// Big-screen display for the chamber. Left 70%: motion, live result, speakers,
// over a faint crest. Right 30%: QR code and 5-digit code on white.
export default function ViewerClient({ base, initial, qrSvg, votingHost }) {
  const [debate, setDebate] = useState(initial.debate);
  const [counts, setCounts] = useState(initial.counts);

  usePoll(
    async () => {
      const res = await fetch(`/api/admin/debates/${debate.id}/live`, { cache: "no-store" });
      if (res.status === 401) return (window.location.href = base || "/");
      if (res.ok) {
        const data = await res.json();
        setDebate(data.debate);
        setCounts(data.counts);
      }
    },
    2000,
    true
  );

  const closed = debate.status === "closed";
  const hidden = debate.hideResults && !closed;

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[#3d0202] text-white font-serif">
      {/* Left 70% */}
      <section className="relative isolate flex w-[70%] flex-col overflow-hidden px-[4vw] py-[4vh]">
        <img
          src="/KUArmsFinal.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[85vh] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.06] [filter:brightness(0)_invert(1)]"
        />

        <div className="flex items-center justify-between gap-4">
          <p className="text-[1.6vw] uppercase tracking-[0.25em] text-[#d4af37]">The King’s Union · Live vote</p>
          <p className="text-[1.4vw] uppercase tracking-[0.2em] text-white/70">
            {closed ? "Voting closed" : debate.status === "open" ? "Voting open" : "Voting opens soon"}
          </p>
        </div>

        <h1 className="title mt-[3vh] text-[clamp(2rem,4.2vw,6rem)] font-bold leading-[1.05] text-balance">“{debate.title}”</h1>

        <div className="mt-auto pt-[4vh]">
          {hidden ? (
            <div className="border border-[#d4af37]/60 px-[3vw] py-[5vh] text-center">
              <p className="title text-[3vw] font-bold">The result is under wraps.</p>
              <p className="mt-2 text-[1.6vw] text-white/70">Revealed when voting closes.</p>
            </div>
          ) : (
            <Results counts={counts} closed={closed} size="xl" live={debate.status === "open"} />
          )}
        </div>

        {(debate.proposition.length > 0 || debate.opposition.length > 0) && (
          <div className="mt-[4vh] grid grid-cols-2 gap-[3vw] border-t border-[#d4af37]/50 pt-[3vh]">
            {[
              ["Proposition", debate.proposition],
              ["Opposition", debate.opposition],
            ].map(([side, list]) => (
              <div key={side}>
                <p className="text-[1.2vw] uppercase tracking-[0.2em] text-[#d4af37]">{side}</p>
                <p className="mt-1 text-[1.6vw] leading-snug">{list.join(" · ") || "–"}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Right 30% */}
      <aside className="flex w-[30%] flex-col items-center justify-center bg-white px-[2.5vw] py-[4vh] text-[#720000]">
        <p className="text-[1.5vw] font-bold uppercase tracking-[0.25em]">Scan to vote</p>
        <div className="mt-[3vh] w-full max-w-[24vw] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        <p className="mt-[4vh] text-[1.2vw] uppercase tracking-[0.25em] text-[#720000]/70">or enter code</p>
        <p className="title text-[6.5vw] font-bold leading-none tracking-[0.12em] tabular-nums">{debate.code}</p>
        <p className="mt-[2vh] text-[1.4vw]">{votingHost}</p>
      </aside>

      {/* Small controls, faint until hovered */}
      <div className="absolute right-[31%] bottom-3 flex gap-2 opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button type="button" onClick={fullscreen} className="border border-white/50 px-3 py-1.5 text-sm">
          Full screen
        </button>
        <a href={`${base}/debates/${debate.id}`} className="border border-white/50 px-3 py-1.5 text-sm">
          Back to admin
        </a>
      </div>
    </div>
  );
}

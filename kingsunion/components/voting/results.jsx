// Live result: Ayes vs Noes, with a bar. Used on the voting page, the admin
// page and the big-screen viewer. `size` is "md" or "xl".

export function verdictText(counts) {
  if (!counts || !counts.total) return "No votes cast";
  return counts.aye > counts.no ? "Motion carried" : "Motion defeated";
}

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

export default function Results({ counts, hidden = false, closed = false, size = "md", live = true }) {
  if (hidden) {
    return (
      <div className="border border-[#d4af37]/60 px-5 py-8 text-center">
        <p className="title text-2xl sm:text-3xl font-bold">The result is under wraps.</p>
        <p className="mt-2 text-white/70">It will be revealed when voting closes.</p>
      </div>
    );
  }

  const c = counts || { aye: 0, no: 0, total: 0 };
  const aye = pct(c.aye, c.total);
  const no = c.total ? 100 - aye : 0;
  const xl = size === "xl";
  const big = xl ? "text-[clamp(4rem,11vw,11rem)]" : "text-6xl sm:text-7xl";

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className={`${xl ? "text-xl md:text-2xl" : "text-sm"} uppercase tracking-widest text-[#d4af37]`}>Ayes</p>
          <p className={`title ${big} font-bold leading-none tabular-nums text-[#d4af37]`}>{c.aye}</p>
          <p className={`${xl ? "text-2xl" : "text-base"} text-white/70 tabular-nums`}>{c.total ? `${aye}%` : "–"}</p>
        </div>
        <div className="text-right">
          <p className={`${xl ? "text-xl md:text-2xl" : "text-sm"} uppercase tracking-widest text-white/80`}>Noes</p>
          <p className={`title ${big} font-bold leading-none tabular-nums`}>{c.no}</p>
          <p className={`${xl ? "text-2xl" : "text-base"} text-white/70 tabular-nums`}>{c.total ? `${no}%` : "–"}</p>
        </div>
      </div>

      <div
        className={`mt-5 flex ${xl ? "h-6" : "h-3"} overflow-hidden border border-[#d4af37]/70 bg-white/5`}
        role="img"
        aria-label={`Ayes ${c.aye}, Noes ${c.no}`}
      >
        <div className="bg-[#d4af37] transition-[width] duration-700 ease-out" style={{ width: `${aye}%` }} />
        <div className="bg-white/80 transition-[width] duration-700 ease-out" style={{ width: `${no}%` }} />
      </div>

      <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 ${xl ? "text-xl md:text-2xl" : "text-sm"}`}>
        <p className="text-white/70 tabular-nums">
          {c.total} {c.total === 1 ? "vote" : "votes"} cast
        </p>
        {closed ? (
          <p className="font-bold uppercase tracking-widest text-[#d4af37]">{verdictText(c)}</p>
        ) : (
          live && (
            <p className="inline-flex items-center gap-2 uppercase tracking-widest text-white/80">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d4af37] animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              Live
            </p>
          )
        )}
      </div>
    </div>
  );
}

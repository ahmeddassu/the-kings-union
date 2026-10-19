// Small header for the voting screens.
export default function VoteHeader({ home }) {
  return (
    <header className="px-4 sm:px-6 py-4 border-b border-[#d4af37]/60 flex items-center justify-between">
      <a href={home} className="inline-flex items-center gap-3 min-h-11">
        <img src="/crest-gold.png" alt="" className="h-9 w-auto" />
        <span className="title text-lg sm:text-xl font-bold">
          <em>the</em> King’s Union
        </span>
      </a>
      <span className="text-xs uppercase tracking-widest text-[#d4af37]">Live vote</span>
    </header>
  );
}

// A search bar on the homepage: searches debates, speakers, pages, the guide,
// the FAQ and Kingsway (see /search and lib/search.js). Works without JavaScript.
const QUICK = [
  ["Term Card", "/term-card"],
  ["Past debates", "/debates"],
  ["Speakers", "/speakers"],
  ["How to debate", "/guide"],
];

export default function SearchBand() {
  return (
    <section aria-labelledby="home-search" className="bg-[#2a0101] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 lg:items-center">
        <div className="lg:col-span-4">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-2">Search</p>
          <h2 id="home-search" className="title text-2xl sm:text-3xl font-bold leading-tight">
            Looking for something?
          </h2>
        </div>
        <div className="lg:col-span-8 min-w-0">
          <form action="/search" method="get" role="search" className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="home-q" className="sr-only">Search the King’s Union</label>
            <input
              id="home-q"
              name="q"
              type="search"
              placeholder="A debate, a speaker, a question…"
              className="flex-1 min-w-0 min-h-12 border border-[#d4af37] bg-transparent px-4 py-3 text-base sm:text-lg text-white placeholder:text-white/45 outline-none focus:border-white"
            />
            <button type="submit" className="min-h-12 bg-[#d4af37] px-8 text-base sm:text-lg font-bold text-[#3d0202] hover:bg-white transition-colors duration-200">
              Search
            </button>
          </form>
          <nav aria-label="Popular pages" className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="text-white/60">Popular:</span>
            {QUICK.map(([label, href]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center text-[#d4af37] underline-offset-4 hover:underline hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

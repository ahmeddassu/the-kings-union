// The top of the homepage: the chamber, with the Union's name over it.
// The "Next sitting" card (components/next_debate.jsx) overlaps its bottom edge.
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#140000] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          className="hero-photo h-full w-full object-cover object-[50%_35%]"
          src="/hero.jpg"
          alt="A King’s Union debate in the College Chapel"
          fetchPriority="high"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#140000] via-[#140000]/55 to-[#140000]/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#140000]/70 via-transparent to-transparent" />
      </div>

      <div className="flex min-h-[78svh] md:min-h-[86svh] max-h-[1000px] flex-col justify-end px-4 sm:px-6 md:px-8 pt-28 pb-40 sm:pb-44 md:pb-52">
        <p className="mb-5 font-serif text-xs sm:text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          Est. November 2025 · King’s College London
        </p>
        <h1 className="hero-title max-w-6xl text-[17vw] sm:text-[13vw] md:text-[10.5vw] xl:text-[9.5rem] font-bold">
          <em className="font-normal">the</em> King’s Union
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg sm:text-xl md:text-2xl italic leading-snug text-white/90">
          A chamber for public debate at King’s College London.
        </p>
      </div>
    </section>
  );
}

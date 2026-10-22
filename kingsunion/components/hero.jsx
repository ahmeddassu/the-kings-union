// The top of the homepage: the chamber, with the Union's name over it. The
// header sits see-through on top of it, and the "Next sitting" card
// (components/next_debate.jsx) overlaps its bottom edge.
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#140000] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          className="hero-photo warm h-full w-full object-cover object-[50%_35%]"
          src="/hero.jpg"
          alt="A King’s Union debate in the College Chapel"
          fetchPriority="high"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#140000] via-[#140000]/60 to-[#140000]/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#140000]/75 via-[#140000]/10 to-transparent" />
        {/* A soft candle-like glow behind the title */}
        <div aria-hidden="true" className="absolute -left-[10%] bottom-[8%] h-[60%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.16),transparent)]" />
      </div>

      <div className="flex min-h-[84svh] md:min-h-[92svh] max-h-[1100px] flex-col justify-end px-4 sm:px-6 md:px-8 pt-36 md:pt-48 pb-40 sm:pb-44 md:pb-52">
        <p className="enter-rise mb-5 font-serif text-xs sm:text-sm uppercase tracking-[0.35em] text-[#e6c766]">
          Est. November 2025 · King’s College London
        </p>
        <h1 className="enter-rise hero-title max-w-6xl text-[17vw] sm:text-[13vw] md:text-[10.5vw] xl:text-[9.5rem] font-bold" style={{ "--delay": "0.12s" }}>
          <em className="font-normal">the</em> King’s Union
        </h1>
        <span aria-hidden="true" className="enter-line mt-7 block h-px w-40 sm:w-64 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/0" />
        <p className="enter-rise mt-6 max-w-xl font-serif text-lg sm:text-xl md:text-2xl italic leading-snug text-white/90" style={{ "--delay": "0.35s" }}>
          A chamber for public debate at King’s College London.
        </p>
      </div>
    </section>
  );
}

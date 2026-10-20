import { getPastDebates, displayDate, verdict, hasCounts } from "@/lib/debates";
import { pastDebatesBackground as bg } from "@/lib/gallery";

export default async function PastDebates() {
  const recentDebates = (await getPastDebates()).slice(0, 3);

  return (
    <section className="relative isolate overflow-clip bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      {bg.src && (
        <>
          <img
            src={bg.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.14] grayscale"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#3d0202]/40 via-transparent to-[#3d0202]/70" />
          {bg.credit &&
            (bg.href ? (
              <a
                href={bg.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-1 right-3 z-10 py-1 text-right text-[11px] text-white/50 hover:text-white"
              >
                {bg.credit}
              </a>
            ) : (
              <p className="absolute bottom-2 right-3 z-10 text-right text-[11px] text-white/50">{bg.credit}</p>
            ))}
        </>
      )}
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">

        <a
          href="/debates"
          className="title inline-block py-2 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white hover:text-[#d4af37] mb-4 sm:mb-6 transition-colors duration-200"
        >
          Past Debates
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {recentDebates.map((debate) => (
            <article
              key={debate.title}
              className="border-t border-[#d4af37] pt-4 flex flex-col"
            >
              {debate.photo && (
                <img
                  src={debate.photo}
                  alt=""
                  className="w-full aspect-[3/2] object-cover mb-4"
                />
              )}

              {debate.href ? (
                <a
                  href={debate.href}
                  className="block py-1 text-base sm:text-lg font-bold leading-snug text-white hover:text-[#d4af37] transition-colors duration-200"
                >
                  {debate.title}
                </a>
              ) : (
                <span className="text-base sm:text-lg font-bold leading-snug text-white">
                  {debate.title}
                </span>
              )}

              <p className="text-xs sm:text-sm text-white/60 mt-1 mb-3">
                {displayDate(debate.date)}
              </p>

              {debate.description && (
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-5">
                  {debate.description}
                </p>
              )}

              <div className="mt-auto pt-3 border-t border-[#d4af37] flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white">
                  Result <span className="font-normal text-white/60">· {verdict(debate)}</span>
                </span>

                {hasCounts(debate) && (
                  <span className="font-bold tabular-nums text-[#d4af37]">
                    {debate.proposition}–{debate.opposition}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

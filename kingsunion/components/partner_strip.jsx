import { getSponsors } from "@/lib/sponsors";

// Slim "supported by" strip for the homepage. Full details live on /support#partners.
export default async function PartnerStrip() {
  const partners = await getSponsors();
  if (!partners.length) return null;
  const [lead, ...rest] = partners;
  return (
    <section aria-label="Our partners" className="border-y border-[#d4af37] bg-[#3d0202] text-white font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
        <p className="shrink-0 text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]">
          {lead.tier || "Supported by"}
        </p>

        <ul className="flex flex-wrap items-center gap-x-10 gap-y-4 flex-1">
          {[lead, ...rest].map((p, i) => (
            <li key={p.id || p.name}>
              <a
                href={p.href || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-11 hover:text-[#d4af37] transition-colors"
              >
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className={i === 0 ? "h-10 sm:h-12 w-auto" : "h-8 w-auto"} />
                ) : (
                  <span className={`title font-bold leading-none ${i === 0 ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl text-white/80"}`}>
                    {p.name}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/support#partners"
          className="shrink-0 inline-flex items-center min-h-11 text-base sm:text-sm font-bold text-[#d4af37] hover:text-white transition-colors"
        >
          Our partners →
        </a>
      </div>
    </section>
  );
}

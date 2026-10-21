import { getSponsors } from "@/lib/sponsors";

// "Our partners" band. The first partner is shown large as the principal partner.
export default async function Partners() {
  const partners = await getSponsors();
  if (!partners.length) return null;
  const [lead, ...rest] = partners;
  return (
    <section id="partners" className="scroll-mt-24 border-b border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Our partners</p>
        <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
          The organisations that make it possible.
        </h2>

        <a
          href={lead.href || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-10 block border border-[#d4af37] p-6 sm:p-10 hover:bg-[#d4af37]/10 transition-colors duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <div className="shrink-0">
              {lead.logo ? (
                <img src={lead.logo} alt={lead.name} className="h-16 sm:h-20 w-auto max-w-full" />
              ) : (
                <p className="title text-4xl sm:text-5xl md:text-6xl font-bold leading-none">{lead.name}</p>
              )}
            </div>
            <div className="md:border-l md:border-[#d4af37]/50 md:pl-12">
              <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-2">{lead.tier}</p>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">{lead.description}</p>
              <p className="mt-4 text-base font-bold text-[#d4af37] group-hover:text-white transition-colors">
                Visit {lead.name} →
              </p>
            </div>
          </div>
        </a>

        {rest.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((p) => (
              <li key={p.id || p.name}>
                <a
                  href={p.href || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-20 items-center border border-[#d4af37]/60 px-5 py-4 hover:bg-[#d4af37]/10 transition-colors"
                >
                  {p.logo ? <img src={p.logo} alt={p.name} className="h-10 w-auto" /> : <span className="title text-xl font-bold">{p.name}</span>}
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-sm sm:text-base text-white/60">
          Interested in partnering with the Union?{" "}
          <a href="#sponsorship" className="text-[#d4af37] hover:text-white underline underline-offset-4">Get in touch</a>.
        </p>
      </div>
    </section>
  );
}

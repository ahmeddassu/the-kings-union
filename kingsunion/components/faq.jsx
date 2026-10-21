import { faq } from "@/lib/faq";

// Frequently asked questions. Uses <details>, so it opens and closes without JavaScript.
export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-24 bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">First time?</p>
          <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Questions, answered.
          </h2>
        </div>

        <div className="lg:col-span-8 border-t border-[#d4af37]">
          {faq.map((f) => (
            <details key={f.q} className="group border-b border-[#d4af37]/60">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg sm:text-xl font-bold [&::-webkit-details-marker]:hidden hover:text-[#d4af37] transition-colors">
                {f.q}
                <span aria-hidden="true" className="shrink-0 text-2xl leading-none text-[#d4af37] transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <div className="pb-6 pr-10 text-base sm:text-lg leading-relaxed text-white/80">
                <p>{f.a}</p>
                {f.link && (
                  <a href={f.link.href} {...(f.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-3 inline-flex items-center min-h-11 font-bold text-[#d4af37] hover:text-white transition-colors">
                    {f.link.text} →
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}

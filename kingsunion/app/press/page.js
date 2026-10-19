import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { boilerplate, coverage, pressKit } from "@/lib/press";
import { MEDIA_CONTACT, UNION_EMAIL } from "@/lib/contact";
import { getPastDebates, displayDate, verdict } from "@/lib/debates";
import { socialLinks } from "@/lib/nav";
import { partners } from "@/lib/partners";

export const metadata = {
  title: "Press",
  description: "Press and media information for the King’s Union, the debating society at King’s College London.",
};

const eyebrow = "text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]";
const h2 = "title text-3xl sm:text-4xl font-bold tracking-tight leading-tight";
const link = "text-[#d4af37] hover:text-white underline underline-offset-4 [overflow-wrap:anywhere]";

export default async function PressPage() {
  const recent = (await getPastDebates()).slice(0, 4);
  const lead = partners[0];

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className={eyebrow}>Press and media</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              For journalists.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Everything you need to write about the King’s Union: who we are,
              recent results, images you can use and who to contact.
            </p>
          </div>
        </section>

        {/* Contact + boilerplate */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className={eyebrow}>Media contact</p>
              {MEDIA_CONTACT.email ? (
                <>
                  {MEDIA_CONTACT.name && <p className="text-xl font-bold">{MEDIA_CONTACT.name}</p>}
                  <a href={`mailto:${MEDIA_CONTACT.email}`} className={`mt-2 inline-flex min-h-11 items-center text-lg font-bold ${link}`}>
                    {MEDIA_CONTACT.email}
                  </a>
                </>
              ) : (
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  Details coming soon. In the meantime, email{" "}
                  <a href={`mailto:${UNION_EMAIL}?subject=Press%20enquiry`} className={link}>{UNION_EMAIL}</a>.
                </p>
              )}
              <p className="mt-6 text-sm sm:text-base text-white/60 leading-relaxed">
                To attend a debate as press, please get in touch in advance. Some
                debates are held under the Chatham House Rule: what is said may be
                reported, but not who said it.
              </p>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <p className={eyebrow}>About the Union</p>
              <blockquote className="border-l-2 border-[#d4af37] pl-5 sm:pl-6 text-lg sm:text-xl leading-relaxed text-white/90">
                {boilerplate}
              </blockquote>
              <p className="mt-3 text-sm text-white/50">Free to use in full or in part.</p>

              <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <div className="border-t border-[#d4af37]/60 pt-3">
                  <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Based at</dt>
                  <dd>King’s College London, Strand</dd>
                </div>
                <div className="border-t border-[#d4af37]/60 pt-3">
                  <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Format</dt>
                  <dd>Three speakers a side, floor questions and a vote</dd>
                </div>
                {lead && (
                  <div className="border-t border-[#d4af37]/60 pt-3">
                    <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">{lead.tier}</dt>
                    <dd>{lead.name}</dd>
                  </div>
                )}
                <div className="border-t border-[#d4af37]/60 pt-3">
                  <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Online</dt>
                  <dd className="flex flex-wrap gap-x-4">
                    {socialLinks.map((s) => (
                      <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${link}`}>
                        {s.label}
                      </a>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Recent results */}
        {recent.length > 0 && (
          <section className="border-b border-[#d4af37]">
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={eyebrow}>Recent results</p>
                  <h2 className={h2}>How the House voted.</h2>
                </div>
                <a href="/debates" className={`inline-flex min-h-11 items-center font-bold ${link}`}>Full archive →</a>
              </div>
              <ul className="mt-8 border-t border-[#d4af37]">
                {recent.map((d) => (
                  <li key={d.title} className="border-b border-[#d4af37]/60 py-5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 md:items-baseline">
                    <p className="md:col-span-2 text-sm text-white/60">{displayDate(d.date)}</p>
                    <a href={d.href || "/debates"} className="md:col-span-7 text-lg sm:text-xl font-bold leading-snug hover:text-[#d4af37] transition-colors">
                      “{d.title}”
                    </a>
                    <p className="md:col-span-3 md:text-right text-base">
                      <span className="font-bold text-[#d4af37]">{verdict(d)}</span>
                      <span className="text-white/70"> · {d.proposition}–{d.opposition}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Press kit */}
        <section id="press-kit" className="scroll-mt-24 border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <p className={eyebrow}>Press kit</p>
            <h2 className={h2}>Images you can use.</h2>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed">
              Free to use when writing about the Union. Please credit “The King’s Union”.
            </p>
            <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {pressKit.map((item) => (
                <li key={item.file}>
                  <a href={item.file} download className="group block">
                    <div className={`aspect-[3/2] overflow-hidden border border-[#d4af37]/60 ${item.file.endsWith(".png") ? "bg-[#f4ecd8] p-4 flex items-center justify-center" : ""}`}>
                      <img
                        src={item.file}
                        alt={item.label}
                        loading="lazy"
                        className={item.file.endsWith(".png") ? "h-full w-auto object-contain" : item.file === "/og.jpg" ? "h-full w-full object-contain bg-[#2a0101]" : "h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"}
                      />
                    </div>
                    <p className="mt-2 text-base font-bold group-hover:text-[#d4af37] transition-colors">{item.label} ↓</p>
                    <p className="text-xs sm:text-sm text-white/50">{item.note}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Coverage (hidden until there is some) */}
        {coverage.length > 0 && (
          <section className="border-b border-[#d4af37]">
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
              <p className={eyebrow}>In the press</p>
              <h2 className={h2}>Coverage.</h2>
              <ul className="mt-8 border-t border-[#d4af37]">
                {coverage.map((c) => (
                  <li key={c.href} className="border-b border-[#d4af37]/60 py-5">
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="group block">
                      <p className="text-xs uppercase tracking-widest text-[#d4af37]">
                        {c.outlet}{c.date ? ` · ${displayDate(c.date)}` : ""}
                      </p>
                      <p className="mt-1 text-lg sm:text-xl font-bold group-hover:text-[#d4af37] transition-colors">{c.title} →</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}

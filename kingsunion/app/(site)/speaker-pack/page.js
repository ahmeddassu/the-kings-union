import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AddToCalendar from "@/components/add_to_calendar";
import { getPack } from "@/lib/speaker_pack";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Speaker pack",
  description: "Everything our guest speakers need to know before the night.",
  robots: { index: false, follow: false },
};

const eyebrow = "text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]";

// For invited guest speakers. Not linked from the menus: the Events team sends
// the link, optionally for one debate (?debate=<slug>).
export default async function SpeakerPackPage({ searchParams }) {
  const q = (await searchParams) || {};
  const [pack, events] = await Promise.all([getPack(), getEvents().catch(() => [])]);
  const debate = typeof q.debate === "string" ? events.find((e) => e.slug === q.debate) : null;
  const when = debate ? [longDate(debate.date), debate.time].filter(Boolean).join(" · ") : "";
  const lineup = Boolean(debate && !debate.chathamHouse && (debate.proposition?.length || debate.opposition?.length));

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
            <p className={`${eyebrow} mb-6`}>Speaker pack</p>
            <h1 className="title text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95]">
              Welcome to
              <br />
              the Union.
            </h1>
            <p className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/80">
              Thank you for agreeing to speak. Here’s everything you need to know before the night.
            </p>
          </div>
        </section>

        {debate && (
          <section className="border-b border-[#d4af37] bg-[#2a0101]">
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                <p className={eyebrow}>You’re speaking on</p>
                <h2 className="title mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-balance">“{debate.title}”</h2>
                <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-white/50">When</dt>
                    <dd className="mt-1 text-lg">{when}</dd>
                  </div>
                  {debate.venue && (
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-white/50">Where</dt>
                      <dd className="mt-1 text-lg">
                        {debate.venue}
                        <span className="block text-base text-white/60">King’s College London, Strand, London WC2R 2LS</span>
                      </dd>
                    </div>
                  )}
                </dl>
                {debate.chathamHouse && (
                  <p className="mt-6 border-l-2 border-[#d4af37] pl-4 text-white/85">This debate is held under the Chatham House Rule, so speakers aren’t published.</p>
                )}
                <div className="mt-8">
                  <AddToCalendar event={debate} />
                </div>
              </div>
              {lineup && (
                <div className="lg:col-span-5 grid grid-cols-2 gap-6 content-start">
                  {[
                    ["Proposition", debate.proposition],
                    ["Opposition", debate.opposition],
                  ]
                    .filter(([, list]) => list?.length)
                    .map(([side, list]) => (
                      <div key={side}>
                        <p className={eyebrow}>{side}</p>
                        <ul className="mt-3 space-y-1.5 text-lg">
                          {list.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16">
          <ol className="max-w-3xl divide-y divide-[#d4af37]/30 border-y border-[#d4af37]/30">
            {pack.sections.map((s, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3.5rem_1fr] gap-x-4 py-8">
                <span className="title text-2xl sm:text-3xl font-bold text-[#d4af37] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="title text-2xl sm:text-3xl font-bold leading-tight">{s.title}</h2>
                  {s.body
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, j) => (
                      <p key={j} className="mt-3 text-base sm:text-lg leading-relaxed text-white/85 whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-3xl text-white/60">
            Want to know more about the Union first? See <a href="/about" className="text-[#d4af37] underline underline-offset-4 hover:text-white">About</a> and our{" "}
            <a href="/debates" className="text-[#d4af37] underline underline-offset-4 hover:text-white">past debates</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

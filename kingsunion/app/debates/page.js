import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MailingList from "@/components/mailing_list";
import ProposeMotion from "@/components/propose_motion";
import ArchiveFilters, { archiveAttrs } from "@/components/archive_filters";
import { getPastDebates, displayDate, verdict } from "@/lib/debates";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";

export const metadata = { title: "Debates" };

function pct(debate, side) {
  const total = debate.proposition + debate.opposition;
  return total ? Math.round((debate[side] / total) * 100) : 50;
}

function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}



export default async function DebatesPage() {
  const debates = await getPastDebates();
  const today = todayInLondon();
  const next = (await getEvents()).find((e) => e.type === "Debate" && e.date >= today);

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              The Archive
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Past
              <br />
              debates.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              A record of motions debated by the King’s Union, from the
              controversial to the constitutional.
            </p>
          </div>
        </section>

        <div className="archive">
        <ArchiveFilters debates={debates} />

        {/* Debate archive */}
        <section id="archive" className="scroll-mt-24">
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">

            <div className="flex items-end justify-between border-b border-[#d4af37] pb-4 mb-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Debate Archive
              </h2>

              <span className="text-xs sm:text-sm text-white/60">
                {debates.length} debates
              </span>
            </div>

            <div className="[counter-reset:arc]">
              {debates.map((debate, index) => (
                <article
                  key={debate.title}
                  {...archiveAttrs(debate)}
                  className="arc-item [counter-increment:arc] border-b border-[#d4af37] py-7 sm:py-9"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">

                    {/* Number */}
                    <div className="md:col-span-1">
                      <span className="text-xs text-[#d4af37]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Main information */}
                    <div className="md:col-span-7">
                      {debate.photo && (
                        <img
                          src={debate.photo}
                          alt=""
                          className="w-full max-w-md aspect-[3/2] object-cover mb-5"
                        />
                      )}

                      <a
                        href={debate.href || undefined}
                        className="inline-block py-1 text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white hover:text-[#d4af37] transition-colors duration-200"
                      >
                        {debate.title}
                      </a>

                      <p className="text-xs sm:text-sm text-white/60 mt-2 mb-4">
                        {displayDate(debate.date)}
                      </p>

                      {debate.description && (
                        <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-2xl">
                          {debate.description}
                        </p>
                      )}
                    </div>

                    {/* Result */}
                    <div className="md:col-span-4 md:flex md:justify-end md:items-center">
                      <div className="w-full md:w-56">

                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs uppercase tracking-wide text-[#d4af37]">
                            Result
                          </span>

                          <span className="text-xs text-white/60">
                            Motion {verdict(debate).toLowerCase()}
                          </span>
                        </div>

                        <div className="flex h-10 border border-[#d4af37]">
                          <div
                            className="bg-[#d4af37]"
                            style={{
                              width: `${pct(debate, "proposition")}%`,
                            }}
                          />

                          <div
                            className="bg-[#6b2929]"
                            style={{
                              width: `${pct(debate, "opposition")}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between mt-2 text-xs sm:text-sm">
                          <span>
                            <strong className="text-[#d4af37]">
                              {debate.proposition}
                            </strong>{" "}
                            Ayes
                          </span>

                          <span>
                            <strong className="text-white">
                              {debate.opposition}
                            </strong>{" "}
                            Noes
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                </article>
              ))}
              {/* How many debates the filters are showing (counted by CSS) */}
              <style>{`.arc-count::before{content:"Showing " counter(arc) " of ${debates.length} debates"}`}</style>
              <p className="arc-count pt-6 text-sm text-white/60">
                <a href="#find" className="ml-3 text-[#d4af37] hover:text-white underline underline-offset-4">Change filters</a>
              </p>
            </div>

          </div>
        </section>
        </div>

        {/* Bottom CTA */}
        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  Next debate
                </p>

                {next ? (
                  <>
                    <a
                      href={`/events/${next.slug}`}
                      className="block text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl text-balance hover:text-[#d4af37] transition-colors"
                    >
                      “{next.title}”
                    </a>
                    <p className="mt-4 text-sm sm:text-base text-white/70">
                      {longDate(next.date)}, {next.time}
                      {next.venue ? ` · ${next.venue}` : ""}
                    </p>
                  </>
                ) : (
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                    Come and hear
                    <br />
                    the argument.
                  </h2>
                )}
              </div>

              <a
                href="/term-card"
                className="inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
              >
                View Term Card →
              </a>

            </div>

          </div>
        </section>

        <ProposeMotion />
        <MailingList />
      </main>

      <Footer />
    </>
  );
}
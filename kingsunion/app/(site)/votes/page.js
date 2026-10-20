import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Divisions, Turnout, Topics } from "@/components/vote_charts";
import { getVoteStats } from "@/lib/vote_stats";
import { displayDate } from "@/lib/debates";

export const revalidate = 300;

export const metadata = {
  title: "How King’s Votes",
  description: "Every division of the King’s Union: results, the closest votes, the biggest Houses and how the Union votes by topic.",
};

const section = "border-t border-[#d4af37]";
const wrap = "px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20";
const eyebrow = "text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]";
const h2 = "title mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight";

function Tile({ label, value, note }) {
  return (
    <div className="border-t border-[#d4af37] pt-4">
      <p className="text-sm text-white/70">{label}</p>
      <p className="title mt-1 text-4xl sm:text-5xl font-bold">{value}</p>
      {note && <p className="mt-1 text-sm text-white/55">{note}</p>}
    </div>
  );
}

function Record({ label, debate, value, detail }) {
  if (!debate) return null;
  const title = debate.href ? (
    <a href={debate.href} className="hover:text-[#d4af37] transition-colors">{debate.title}</a>
  ) : (
    debate.title
  );
  return (
    <article className="flex flex-col border border-[#d4af37]/60 bg-[#2a0101] p-5 sm:p-6">
      <p className={eyebrow}>{label}</p>
      <p className="title mt-3 text-4xl sm:text-5xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-white/60">{detail}</p>
      <p className="mt-4 font-bold leading-snug">{title}</p>
      <p className="mt-auto pt-2 text-sm text-white/55">{displayDate(debate.date)}</p>
    </article>
  );
}

export default async function VotesPage() {
  const s = await getVoteStats();

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className={`${eyebrow} mb-6`}>The record</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              How King’s
              <br />
              votes.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Every debate ends with a division of the House. Here is every vote the Union has recorded: what
              carried, what fell, and how close it came.
            </p>

            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              <Tile label="Debates held" value={s.debates} />
              <Tile label="Votes cast" value={s.votes.toLocaleString("en-GB")} note={`across ${s.countedDebates} recorded divisions`} />
              <Tile label="Motions carried" value={`${s.carried} of ${s.decided}`} note={`${s.defeated} defeated`} />
              <Tile label="Average House" value={s.average} note="votes per debate" />
            </div>
          </div>
        </section>

        {/* Records */}
        <section>
          <div className={wrap}>
            <p className={eyebrow}>Records</p>
            <h2 className={h2}>For the history books.</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Record
                label="Closest division"
                debate={s.closest}
                value={s.closest ? `${s.closest.proposition}–${s.closest.opposition}` : ""}
                detail={s.closest ? (s.closest.margin === 0 ? "A tie: the motion falls" : `Decided by ${s.closest.margin} vote${s.closest.margin === 1 ? "" : "s"}`) : ""}
              />
              <Record
                label="Most decisive"
                debate={s.decisive}
                value={s.decisive ? `${Math.max(s.decisive.ayePct, s.decisive.noPct)}%` : ""}
                detail={s.decisive ? `${s.decisive.carried ? "for" : "against"} the motion, ${s.decisive.proposition}–${s.decisive.opposition}` : ""}
              />
              <Record
                label="Biggest House"
                debate={s.biggest}
                value={s.biggest ? s.biggest.total : ""}
                detail="votes cast"
              />
            </div>
          </div>
        </section>

        {/* Turnout */}
        {s.turnout.length > 1 && (
          <section className={section}>
            <div className={wrap}>
              <p className={eyebrow}>Turnout</p>
              <h2 className={h2}>Votes cast at each debate.</h2>
              <p className="mt-3 max-w-2xl text-white/70">Oldest on the left. Hover or tap a column for the motion.</p>
              <div className="mt-8 max-w-5xl">
                <Turnout points={s.turnout} />
              </div>
            </div>
          </section>
        )}

        {/* Topics */}
        {s.topics.length > 0 && (
          <section className={section}>
            <div className={wrap}>
              <p className={eyebrow}>By topic</p>
              <h2 className={h2}>What the House backs.</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Motions carried and defeated in each area. A motion can count towards more than one topic.
              </p>
              <div className="mt-8 max-w-4xl">
                <Topics rows={s.topics} />
              </div>
            </div>
          </section>
        )}

        {/* Every division */}
        <section className={section}>
          <div className={wrap}>
            <p className={eyebrow}>Every division</p>
            <h2 className={h2}>The full record.</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Newest first. The line marks half the House: a gold bar past it means the motion carried.
            </p>
            <div className="mt-8 max-w-4xl">
              <Divisions rows={s.divisions} />
            </div>

            <details className="mt-10 max-w-4xl">
              <summary className="cursor-pointer select-none text-white/80 underline underline-offset-4">See the results as a table</summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="text-white/60">
                    <tr className="border-b border-[#d4af37]/40">
                      <th className="py-2 pr-4 font-normal">Date</th>
                      <th className="py-2 pr-4 font-normal">Motion</th>
                      <th className="py-2 pr-4 font-normal text-right">Ayes</th>
                      <th className="py-2 pr-4 font-normal text-right">Noes</th>
                      <th className="py-2 font-normal">Result</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {s.divisions.map((d) => (
                      <tr key={d.title + d.date} className="border-b border-[#d4af37]/15">
                        <td className="py-2 pr-4 whitespace-nowrap text-white/70">{displayDate(d.date)}</td>
                        <td className="py-2 pr-4">{d.title}</td>
                        <td className="py-2 pr-4 text-right">{d.proposition}</td>
                        <td className="py-2 pr-4 text-right">{d.opposition}</td>
                        <td className="py-2">{d.carried ? "Carried" : "Defeated"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

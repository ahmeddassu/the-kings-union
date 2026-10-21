import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getRecords } from "@/lib/records";
import { displayDate } from "@/lib/debates";

export const revalidate = 300;

export const metadata = {
  title: "The Record Book",
  description: "The King’s Union’s records: the biggest House, the closest vote, the most decisive result, the longest run and more.",
  alternates: { canonical: "/records" },
};

const eyebrow = "text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]";
const h2 = "title mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight";
const wrap = "px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20";

function Title({ d }) {
  return d.href ? (
    <a href={d.href} className="hover:text-[#d4af37] transition-colors">{d.title}</a>
  ) : (
    d.title
  );
}

function Record({ label, value, detail, debate, children }) {
  return (
    <article className="flex flex-col border border-[#d4af37]/60 bg-[#2a0101] p-5 sm:p-6">
      <h3 className={eyebrow}>{label}</h3>
      <p className="title mt-3 text-4xl sm:text-5xl font-bold tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-sm text-white/70">{detail}</p>}
      {debate && (
        <>
          <p className="mt-4 font-bold leading-snug"><Title d={debate} /></p>
          <p className="mt-auto pt-2 text-sm text-white/65">{displayDate(debate.date)}</p>
        </>
      )}
      {children}
    </article>
  );
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default async function RecordsPage() {
  const r = await getRecords();
  const cards = [];

  if (r.biggest)
    cards.push(<Record key="biggest" label="Biggest House" value={r.biggest.total} detail="votes cast in one division" debate={r.biggest} />);
  if (r.door && (!r.biggest || r.door.slug !== r.biggest.slug || r.door.checkedIn !== r.biggest.total))
    cards.push(<Record key="door" label="Biggest crowd" value={r.door.checkedIn} detail="people checked in at the door" debate={r.door} />);
  if (r.closest)
    cards.push(
      <Record
        key="closest"
        label="Closest division"
        value={`${r.closest.proposition}–${r.closest.opposition}`}
        detail={r.closest.margin === 0 ? "A tie: the motion falls" : `Decided by ${plural(r.closest.margin, "vote")}`}
        debate={r.closest}
      />
    );
  if (r.decisive)
    cards.push(
      <Record
        key="decisive"
        label="Most decisive"
        value={`${Math.max(r.decisive.ayePct, r.decisive.noPct)}%`}
        detail={`${r.decisive.carried ? "for" : "against"} the motion, ${r.decisive.proposition}–${r.decisive.opposition}`}
        debate={r.decisive}
      />
    );
  if (r.mostFor)
    cards.push(<Record key="for" label="Most votes for a motion" value={r.mostFor.proposition} detail={`Ayes, ${r.mostFor.proposition}–${r.mostFor.opposition}`} debate={r.mostFor} />);
  if (r.mostAgainst)
    cards.push(<Record key="against" label="Most votes against" value={r.mostAgainst.opposition} detail={`Noes, ${r.mostAgainst.proposition}–${r.mostAgainst.opposition}`} debate={r.mostAgainst} />);
  if (r.streak) {
    const first = r.streak.debates[0];
    const last = r.streak.debates[r.streak.debates.length - 1];
    cards.push(
      <Record
        key="streak"
        label="Longest run"
        value={r.streak.debates.length}
        detail={`motions ${r.streak.verdict.toLowerCase()} in a row`}
      >
        <p className="mt-4 font-bold leading-snug">
          From <Title d={first} /> to <Title d={last} />
        </p>
        <p className="mt-auto pt-2 text-sm text-white/65">
          {displayDate(first.date)} to {displayDate(last.date)}
        </p>
      </Record>
    );
  }
  if (r.busiestTerm)
    cards.push(
      <Record
        key="term"
        label="Busiest term"
        value={r.busiestTerm.votes}
        detail={`votes cast across ${plural(r.busiestTerm.debates, "division")}`}
      >
        <p className="mt-4 font-bold">{r.busiestTerm.label}</p>
      </Record>
    );
  if (r.topTopic)
    cards.push(
      <Record key="topic" label="Most debated topic" value={r.topTopic.total} detail={`debates, ${r.topTopic.carried} carried and ${r.topTopic.defeated} defeated`}>
        <p className="mt-4 font-bold">{r.topTopic.label}</p>
      </Record>
    );
  if (r.first)
    cards.push(
      <Record
        key="first"
        label="First recorded division"
        value={`${r.first.proposition}–${r.first.opposition}`}
        detail={r.first.proposition > r.first.opposition ? "Carried" : "Defeated"}
        debate={r.first}
      />
    );

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className={`${eyebrow} mb-6`}>The record book</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Union
              <br />
              <em>records.</em>
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              The biggest nights, the closest calls and the longest runs, updated after every division.{" "}
              {r.totals.debates > 0 &&
                `${plural(r.totals.debates, "debate")} and ${r.totals.votes.toLocaleString("en-GB")} votes on record so far.`}
            </p>
          </div>
        </section>

        <section>
          <div className={wrap}>
            <p className={eyebrow}>Records</p>
            <h2 className={h2}>For the history books.</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">{cards}</div>
          </div>
        </section>

        {r.regulars.length > 0 && (
          <section className="border-t border-[#d4af37]">
            <div className={wrap}>
              <p className={eyebrow}>Speakers</p>
              <h2 className={h2}>Back for more.</h2>
              <p className="mt-3 max-w-2xl text-white/75">Speakers who have taken the floor more than once, and how often their side won.</p>
              <div className="mt-8 overflow-x-auto" tabIndex={0} role="region" aria-label="Speakers with the most appearances">
                <table className="w-full max-w-3xl min-w-[28rem] text-left">
                  <caption className="sr-only">Speakers with the most appearances</caption>
                  <thead className="text-xs uppercase tracking-widest text-[#d4af37]">
                    <tr>
                      <th scope="col" className="py-3 pr-4">Speaker</th>
                      <th scope="col" className="py-3 pr-4 text-right">Debates</th>
                      <th scope="col" className="py-3 text-right">On the winning side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.regulars.map((s) => (
                      <tr key={s.slug} className="border-t border-[#d4af37]/40">
                        <th scope="row" className="py-3 pr-4 font-bold">
                          <a href={`/speakers#${s.slug}`} className="hover:text-[#d4af37]">{s.name}</a>
                        </th>
                        <td className="py-3 pr-4 text-right tabular-nums">{s.appearances}</td>
                        <td className="py-3 text-right tabular-nums">{s.decided ? `${s.wins} of ${s.decided}` : "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {r.years.length > 0 && (
          <section className="border-t border-[#d4af37]">
            <div className={wrap}>
              <p className={eyebrow}>Year by year</p>
              <h2 className={h2}>Every year on record.</h2>
              <div className="mt-8 overflow-x-auto" tabIndex={0} role="region" aria-label="Debates and votes by academic year">
                <table className="w-full max-w-4xl min-w-[34rem] text-left">
                  <caption className="sr-only">Debates and votes by academic year</caption>
                  <thead className="text-xs uppercase tracking-widest text-[#d4af37]">
                    <tr>
                      <th scope="col" className="py-3 pr-4">Year</th>
                      <th scope="col" className="py-3 pr-4 text-right">Debates</th>
                      <th scope="col" className="py-3 pr-4 text-right">Carried</th>
                      <th scope="col" className="py-3 pr-4 text-right">Defeated</th>
                      <th scope="col" className="py-3 pr-4 text-right">Votes cast</th>
                      <th scope="col" className="py-3 text-right">Average House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.years.map((y) => (
                      <tr key={y.year} className="border-t border-[#d4af37]/40 tabular-nums">
                        <th scope="row" className="py-3 pr-4 font-bold">{y.year}</th>
                        <td className="py-3 pr-4 text-right">{y.debates}</td>
                        <td className="py-3 pr-4 text-right">{y.carried}</td>
                        <td className="py-3 pr-4 text-right">{y.defeated}</td>
                        <td className="py-3 pr-4 text-right">{y.votes.toLocaleString("en-GB")}</td>
                        <td className="py-3 text-right">{y.counted ? Math.round(y.votes / y.counted) : "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-white/65">
                Votes cast and the average House only include debates where both counts were recorded.
              </p>
            </div>
          </section>
        )}

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <h2 className="title text-3xl sm:text-4xl font-bold">Every vote, debate by debate.</h2>
            <a href="/votes" className="inline-flex min-h-12 items-center self-start bg-[#d4af37] px-6 font-bold text-[#3d0202] hover:bg-white">
              How King’s votes
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

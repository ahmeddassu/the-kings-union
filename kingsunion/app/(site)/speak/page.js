import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Stats from "@/components/stats";
import Speakers from "@/components/speakers";
import { getPastDebates, hasCounts } from "@/lib/debates";

export const metadata = {
  title: "Speak at the Union",
  description:
    "Invitations to speak at the King’s Union, the debating society at King’s College London.",
};

const format = [
  {
    title: "Three speakers a side",
    text: "Each debate has three speakers proposing the motion and three opposing it, usually a mix of guests and students.",
  },
  {
    title: "Points of information",
    text: "Members of the floor can rise to challenge a speaker mid-speech, and the audience puts questions to both sides before the vote.",
  },
  {
    title: "The House divides",
    text: "Every debate ends with a vote of the audience, announced from the chair as Ayes and Noes.",
  },
  {
    title: "Chatham House if you need it",
    text: "For sensitive motions we can hold the debate under the Chatham House Rule, so speakers are not named or quoted.",
  },
];

export default async function SpeakPage() {
  const recent = (await getPastDebates()).filter(hasCounts).slice(0, 4);
  const biggest = Math.max(...recent.map((d) => d.proposition + d.opposition));

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              For guest speakers
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Speak at
              <br />
              the Union.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              The King’s Union hosts debates on the questions of the day in the
              College Chapel and across King’s College London. We invite MPs,
              journalists, academics and campaigners to make their case to a
              full house of students, and to take questions from the floor.
            </p>
            {biggest > 0 && (
              <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
                Recent debates have seen as many as {biggest} votes cast.
              </p>
            )}
          </div>
        </section>

        <Stats />

        {/* Format */}
        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10">
              How a debate runs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {format.map((f) => (
                <div key={f.title} className="border-t border-[#d4af37] pt-4">
                  <h3 className="text-lg sm:text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-base sm:text-lg leading-relaxed text-white/75">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent motions */}
        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Recent motions</h2>
            <ul className="divide-y divide-[#d4af37]/40 border-y border-[#d4af37]/40">
              {recent.map((d) => (
                <li key={d.title} className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                  {d.href ? (
                    <a href={d.href} className="block py-1 text-lg sm:text-xl hover:text-[#d4af37] transition-colors duration-200">
                      “{d.title}”
                    </a>
                  ) : (
                    <span className="text-lg sm:text-xl">“{d.title}”</span>
                  )}
                  <span className="text-sm text-white/60 tabular-nums whitespace-nowrap">
                    Ayes {d.proposition} · Noes {d.opposition}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Speakers />

        {/* CTA */}
        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  Invitations
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none">
                  Take the floor.
                </h2>
                <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
                  Tell us which motion you’d like to speak on, or suggest one of
                  your own. We’ll come back to you with dates.
                </p>
              </div>
              <a
                href="/contact"
                className="inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
              >
                Get in touch →
              </a>
            </div>
            <div className="mt-12 border-t border-[#d4af37]/50 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-lg sm:text-xl">
                A King’s student? <span className="text-white/75">You can apply to speak in a debate too.</span>
              </p>
              <a href="/speak/apply" className="inline-flex min-h-11 items-center text-base font-bold text-[#d4af37] hover:text-white">
                Apply to speak →
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

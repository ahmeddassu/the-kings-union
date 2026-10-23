import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { pastDebates } from "@/lib/feedback";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "How was the debate?",
  description: "Tell the King’s Union what you thought of a debate. It’s anonymous and takes under a minute.",
  robots: { index: false },
};

const errors = {
  rating: "Please choose a rating from 1 to 5.",
  wait: "Too many responses from this connection. Please try again later.",
  send: "That didn’t send. Please try again.",
  debate: "Please choose the debate you came to.",
};
const label = "block text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-2";
const field = "w-full border border-[#d4af37] bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white";
const scale = [
  [1, "Poor"],
  [2, "Fair"],
  [3, "Good"],
  [4, "Very good"],
  [5, "Excellent"],
];

export default async function FeedbackPage({ searchParams }) {
  const { debate: wanted, sent, error } = (await searchParams) || {};
  const debates = (await pastDebates()).slice(0, 12);
  const debate = debates.find((d) => d.slug === wanted) || debates[0] || null;

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-14 sm:py-20">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-5">Feedback</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95]">
              {sent ? "Thank you." : "How was the debate?"}
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              {sent
                ? "Your feedback has been sent to the committee. We read every response."
                : "Tell us what you thought. It’s anonymous, it takes under a minute, and every response is read by the committee."}
            </p>
            {sent && (
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/term-card" className="inline-flex min-h-12 items-center bg-[#d4af37] px-6 font-bold text-[#3d0202] hover:bg-white">
                  See what’s next
                </a>
                <a href="/" className="inline-flex min-h-12 items-center border border-[#d4af37] px-6 font-bold hover:bg-white/10">
                  Back to the homepage
                </a>
              </div>
            )}
          </div>
        </section>

        {!sent && debate && (
          <section id="form" className="scroll-mt-24">
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 max-w-3xl">
              {debates.length > 1 && (
                <form action="/feedback" method="get" className="mb-10 flex flex-col sm:flex-row sm:items-end gap-3">
                  <label className="flex-1 min-w-0" htmlFor="pick">
                    <span className={label}>Which debate?</span>
                    <select id="pick" name="debate" defaultValue={debate.slug} className={`${field} bg-[#3d0202]`}>
                      {debates.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.title} · {longDate(d.date)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="min-h-12 border border-[#d4af37] px-5 font-bold hover:bg-white/10">
                    Choose
                  </button>
                </form>
              )}

              <p className="title text-2xl sm:text-3xl font-bold italic leading-tight">“{debate.title}”</p>
              <p className="mt-2 text-white/70">{longDate(debate.date)}</p>

              <form action="/api/feedback" method="post" className="mt-8 space-y-8">
                <input type="hidden" name="debate" value={debate.slug} />
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <input name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <fieldset>
                  <legend className={label}>Overall, how was it?</legend>
                  <div className="grid grid-cols-5 gap-2">
                    {scale.map(([n, word]) => (
                      <label key={n} className="cursor-pointer">
                        <input type="radio" name="rating" value={n} required className="peer sr-only" />
                        <span className="flex min-h-16 flex-col items-center justify-center border border-[#d4af37]/70 px-1 py-2 text-center transition-colors peer-checked:bg-[#d4af37] peer-checked:text-[#3d0202] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-white hover:bg-white/10">
                          <span className="title text-2xl font-bold">{n}</span>
                          <span className="text-xs sm:text-sm leading-tight">{word}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block" htmlFor="liked">
                  <span className={label}>What worked well? (optional)</span>
                  <textarea id="liked" name="liked" rows={3} maxLength={1500} className={field} />
                </label>

                <label className="block" htmlFor="improve">
                  <span className={label}>What could be better? (optional)</span>
                  <textarea id="improve" name="improve" rows={3} maxLength={1500} className={field} />
                </label>

                <fieldset>
                  <legend className={label}>Would you come again?</legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["yes", "Yes"],
                      ["maybe", "Maybe"],
                      ["no", "No"],
                    ].map(([v, t]) => (
                      <label key={v} className="cursor-pointer">
                        <input type="radio" name="again" value={v} className="peer sr-only" />
                        <span className="inline-flex min-h-12 min-w-24 items-center justify-center border border-[#d4af37]/70 px-5 transition-colors peer-checked:bg-[#d4af37] peer-checked:text-[#3d0202] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-white hover:bg-white/10">
                          {t}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {error && errors[error] && (
                  <p role="alert" className="text-[#f3c4c4]">
                    {errors[error]}
                  </p>
                )}

                <button type="submit" className="min-h-12 bg-[#d4af37] px-8 text-lg font-bold text-[#3d0202] hover:bg-white">
                  Send feedback
                </button>
                <p className="text-sm text-white/60">
                  We don’t ask for your name or email. Please don’t include personal details in your comments.
                </p>
              </form>
            </div>
          </section>
        )}

        {!sent && !debate && (
          <section>
            <div className="px-4 sm:px-6 md:px-8 py-12">
              <p className="text-white/80">Feedback opens once our first debate has happened.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

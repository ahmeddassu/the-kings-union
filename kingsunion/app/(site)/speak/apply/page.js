import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { upcomingDebates } from "@/lib/upcoming";
import { longDate } from "@/lib/events";
import { MEMBERSHIP_URL } from "@/lib/nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Apply to speak",
  description:
    "King’s students: apply to speak in a King’s Union debate, on the proposition or the opposition.",
};

const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white transition-colors";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";
const box =
  "w-full mt-2 border border-[#d4af37]/70 bg-transparent p-3 text-base text-white placeholder:text-white/35 outline-none resize-y focus:border-white";
const select = "w-full mt-1 border border-[#d4af37]/70 bg-[#3d0202] px-3 py-3 text-base text-white";

const messages = {
  missing: "Please fill in your name, email, course and a few lines on what you’d argue.",
  busy: "You’ve sent a few applications already. Please try again in an hour.",
  send: "Sorry, that didn’t go through. Please try again, or email the Union.",
};

const steps = [
  { title: "Apply", text: "Pick a debate and a side, or leave it open, and tell us what you’d argue." },
  { title: "We get in touch", text: "The committee reads every application and contacts shortlisted speakers by email." },
  { title: "Take the floor", text: "Speakers get the motion, the format and their opponents well before the night." },
];

export default async function ApplyPage({ searchParams }) {
  const { sent, error } = (await searchParams) || {};
  let debates = [];
  try {
    debates = await upcomingDebates();
  } catch {
    debates = [];
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">For King’s students</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Apply to
              <br />
              speak.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Every Union debate has student speakers alongside our guests. If you want to make the case for
              or against a motion in front of a full house, apply below. No experience needed: we care about
              the argument, not the CV.
            </p>
          </div>
        </section>

        <section>
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="border-t border-[#d4af37] pt-4">
                <p className="title text-3xl font-bold text-[#d4af37]">{i + 1}</p>
                <h2 className="mt-1 text-lg sm:text-xl font-bold">{s.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-white/75">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="apply" className="scroll-mt-24 border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">Your application.</h2>
              <p className="mt-4 max-w-md text-base text-white/75 leading-relaxed">
                Members get priority to speak.{" "}
                <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#d4af37]">
                  Join for £10
                </a>{" "}
                if you haven’t already. Want to speak but not sure which debate? Choose “Any debate”.
              </p>
            </div>

            {sent ? (
              <div role="status" className="lg:col-span-8 border border-[#d4af37] p-6 sm:p-8">
                <p className="title text-3xl sm:text-4xl font-bold">Application received.</p>
                <p className="mt-3 text-base sm:text-lg text-white/80">
                  Thank you. The committee will be in touch by email if you’re shortlisted.
                </p>
                <a href="/term-card" className="mt-6 inline-flex min-h-11 items-center font-bold text-[#d4af37] hover:text-white">
                  See the term card →
                </a>
              </div>
            ) : (
              <form action="/api/apply" method="post" className="lg:col-span-8 flex flex-col gap-6">
                {error && messages[error] && (
                  <p role="alert" className="border border-[#f3c4c4]/70 px-4 py-3 text-base text-[#f3c4c4]">
                    {messages[error]}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={label}>Full name *</label>
                    <input id="name" name="name" required maxLength={120} autoComplete="name" className={field} />
                  </div>
                  <div>
                    <label htmlFor="email" className={label}>Email *</label>
                    <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="course" className={label}>Course and year *</label>
                    <input id="course" name="course" required maxLength={160} placeholder="e.g. War Studies, Year 2" className={field} />
                  </div>
                  <fieldset>
                    <legend className={label}>Union member?</legend>
                    <div className="flex gap-6 py-3">
                      {[
                        ["yes", "Yes"],
                        ["no", "Not yet"],
                      ].map(([v, t]) => (
                        <label key={v} className="flex min-h-11 items-center gap-2 cursor-pointer">
                          <input type="radio" name="member" value={v} defaultChecked={v === "no"} className="h-5 w-5 accent-[#d4af37]" />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="debate" className={label}>Which debate?</label>
                    <select id="debate" name="debate" defaultValue="" className={select}>
                      <option value="">Any debate</option>
                      {debates.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {longDate(d.date)}: {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="side" className={label}>Which side?</label>
                    <select id="side" name="side" defaultValue="either" className={select}>
                      <option value="either">Either side</option>
                      <option value="proposition">Proposition (for)</option>
                      <option value="opposition">Opposition (against)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pitch" className={label}>What would you argue? *</label>
                  <textarea
                    id="pitch"
                    name="pitch"
                    required
                    minLength={20}
                    maxLength={2000}
                    rows={5}
                    className={box}
                    placeholder="Your main points in a few lines."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className={label}>Any speaking experience?</label>
                  <textarea
                    id="experience"
                    name="experience"
                    maxLength={1000}
                    rows={2}
                    className={box}
                    placeholder="Optional: debating, Model UN, mooting, anything. None is fine."
                  />
                </div>

                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <p className="text-sm text-white/55">
                  Your details are only seen by the Union committee and are used to arrange speakers.
                </p>

                <button
                  type="submit"
                  className="self-stretch sm:self-start min-h-12 bg-[#d4af37] text-[#3d0202] px-7 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
                >
                  Send application →
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

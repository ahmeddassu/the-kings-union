import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CONNECTIONS, INTERESTS } from "@/lib/friends";

export const metadata = {
  title: "Friends of the Union",
  description: "Alumni, staff and supporters: stay in touch with the King’s Union, the debating society at King’s College London.",
  alternates: { canonical: "/friends" },
};

const errors = {
  name: "Please add your name.",
  email: "Please check your email address.",
  consent: "Please tick the box to say we can keep in touch.",
  wait: "Too many sign-ups from this connection. Please try again later.",
  send: "That didn’t send. Please try again.",
};
const label = "block text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-2";
const field = "w-full min-h-12 border border-[#d4af37] bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white";

export default async function FriendsPage({ searchParams }) {
  const { joined, error } = (await searchParams) || {};
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-6">Friends of the Union</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Stay in
              <br />
              <em>the House.</em>
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              For King’s alumni, former committee members, staff and anyone who supports what the Union does. Friends
              hear the Union’s news, are invited to special events, and can help the next generation of King’s debaters
              by speaking, mentoring or supporting the society.
            </p>
          </div>
        </section>

        <section id="join" className="scroll-mt-24">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 max-w-3xl">
            {joined ? (
              <div role="status">
                <h2 className="title text-4xl sm:text-5xl font-bold">Welcome, friend.</h2>
                <p className="mt-4 text-lg text-white/85">
                  Thank you for joining. We’ll be in touch with news and invitations. If you ever want to be taken off
                  the list, just email us.
                </p>
                <a href="/" className="mt-8 inline-flex min-h-12 items-center bg-[#d4af37] px-6 font-bold text-[#3d0202] hover:bg-white">
                  Back to the homepage
                </a>
              </div>
            ) : (
              <form action="/api/friends" method="post" className="space-y-7">
                <h2 className="title text-3xl sm:text-4xl font-bold">Join the Friends</h2>
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <input name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="block" htmlFor="f-name">
                    <span className={label}>Your name</span>
                    <input id="f-name" name="name" required maxLength={120} autoComplete="name" className={field} />
                  </label>
                  <label className="block" htmlFor="f-email">
                    <span className={label}>Your email</span>
                    <input id="f-email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
                  </label>
                  <label className="block" htmlFor="f-connection">
                    <span className={label}>Your connection to King’s</span>
                    <select id="f-connection" name="connection" className={`${field} bg-[#3d0202]`} defaultValue={CONNECTIONS[0]}>
                      {CONNECTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block" htmlFor="f-year">
                    <span className={label}>Graduation year (optional)</span>
                    <input id="f-year" name="year" inputMode="numeric" pattern="(19|20)[0-9]{2}" maxLength={4} className={field} />
                  </label>
                </div>
                <fieldset>
                  <legend className={label}>I’m interested in (optional)</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {INTERESTS.map((i, n) => (
                      <label key={i} htmlFor={`f-int-${n}`} className="flex min-h-11 items-center gap-3">
                        <input id={`f-int-${n}`} type="checkbox" name="interests" value={i} className="h-5 w-5 shrink-0 accent-[#d4af37]" />
                        <span>{i}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="f-consent" className="flex items-start gap-3">
                  <input id="f-consent" type="checkbox" name="consent" value="yes" required className="mt-1 h-5 w-5 shrink-0 accent-[#d4af37]" />
                  <span>
                    Keep me in touch with the King’s Union by email. You can ask to be removed at any time, and we’ll
                    never share your details. See our <a href="/privacy" className="underline underline-offset-4 hover:text-[#d4af37]">privacy notice</a>.
                  </span>
                </label>
                {error && errors[error] && (
                  <p role="alert" className="text-[#f3c4c4]">{errors[error]}</p>
                )}
                <button type="submit" className="min-h-12 bg-[#d4af37] px-8 text-lg font-bold text-[#3d0202] hover:bg-white">
                  Join the Friends
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

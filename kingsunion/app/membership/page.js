import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MEMBERSHIP_URL } from "@/lib/nav";

export const metadata = {
  title: "Membership",
  description: "Join the King’s Union for £10: reserved tickets, a vote at the AGM, priority to speak and members-only socials.",
};

const PRICE = "£10";

const benefits = [
  {
    title: "Reserved tickets",
    text: "Every debate has tickets set aside for members only, so you can still get in when a debate is busy.",
  },
  {
    title: "Priority to speak",
    text: "Members get first chance at the student speaking slots in our debates.",
  },
  {
    title: "A vote in the Union",
    text: "Vote at the AGM and in committee elections, and stand for the committee yourself.",
  },
  {
    title: "Members-only socials",
    text: "Socials, screenings and nights out just for members.",
  },
];

const steps = [
  "Open the King’s Union page on the KCLSU website.",
  "Log in with your King’s account.",
  `Buy the membership (${PRICE}), and you’re in.`,
];

const button =
  "inline-flex min-h-12 items-center justify-center bg-[#d4af37] text-[#3d0202] px-7 py-3 text-base sm:text-lg font-bold hover:bg-white transition-colors duration-200";

export default function MembershipPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">Membership</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Join the
              <br />
              Union.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Membership is {PRICE} through KCLSU. Anyone can come to our debates,
              but members get more out of them.
            </p>
            <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" className={`mt-8 ${button}`}>
              Become a member · {PRICE} →
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Member benefits</p>
            <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              What you get.
            </h2>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {benefits.map((b, i) => (
                <li key={b.title} className="border-t border-[#d4af37] pt-4">
                  <p className="text-sm text-[#d4af37] tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How to join */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">How to join</p>
              <h2 className="title text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                It takes two minutes.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ol className="space-y-5">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-5 items-baseline">
                    <span className="title text-3xl font-bold text-[#d4af37] tabular-nums">{i + 1}</span>
                    <span className="text-base sm:text-lg text-white/85 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
              <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" className={`mt-10 ${button}`}>
                Join on KCLSU →
              </a>
              <p className="mt-4 text-sm text-white/50">
                Questions about membership? <a href="/contact#union" className="text-[#d4af37] hover:text-white underline underline-offset-4">Get in touch</a>.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

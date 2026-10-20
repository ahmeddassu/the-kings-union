import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import NextDebate from "@/components/next_debate";
import { MEMBERSHIP_URL, socialLinks } from "@/lib/nav";

export const revalidate = 300;

export const metadata = {
  title: "Welcome",
  description:
    "New to the King’s Union? King’s College London’s debating society in thirty seconds: what we do, the next debate, and how to join.",
};

const steps = [
  {
    n: "1",
    title: "Come to a debate",
    text: "Three speakers a side, questions from the floor, and a vote of the House at the end.",
    href: "/term-card",
    cta: "See what’s on",
  },
  {
    n: "2",
    title: "Join for £10",
    text: "Members get reserved tickets, priority to speak and a vote in Union elections.",
    href: MEMBERSHIP_URL,
    external: true,
    cta: "Join through KCLSU",
  },
  {
    n: "3",
    title: "Have your say",
    text: "Speak from the floor, apply to speak on a motion, or suggest what we debate next.",
    href: "/get-involved",
    cta: "Get involved",
  },
];

export default function WelcomePage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-14 sm:py-20 md:py-24">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">New to King’s?</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Welcome to
              <br />
              the Union.
            </h1>
            <p className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/85">
              The King’s Union is King’s College London’s chamber for public debate. We take on the biggest
              questions of the day with students and notable guests, and then the House votes.
            </p>
          </div>
        </section>

        <PhotoBand src="/gallery/after-the-debate.jpg" alt="Students talk with the speakers after a debate in the College Chapel" position="center 45%" />

        <NextDebate />

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10">Three steps in</h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <li key={s.n} className="border-t border-[#d4af37] pt-4 flex flex-col">
                  <p className="title text-5xl font-bold text-[#d4af37] leading-none">{s.n}</p>
                  <h3 className="mt-3 text-xl sm:text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-base sm:text-lg leading-relaxed text-white/75">{s.text}</p>
                  <a
                    href={s.href}
                    {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-4 inline-flex min-h-11 items-center text-base font-bold text-[#d4af37] hover:text-white transition-colors"
                  >
                    {s.cta} →
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-1">Follow us</p>
              <p className="text-lg sm:text-xl font-bold">@thekingsunion for tickets, speakers and results.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center border border-[#d4af37] px-5 text-base font-bold hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-lg sm:text-xl">Got questions? Dress code, membership, speaking from the floor.</p>
            <a href="/#faq" className="inline-flex min-h-11 items-center text-base font-bold text-[#d4af37] hover:text-white">
              Read the FAQ →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import JoinBand from "@/components/join_band";
import { MEMBERSHIP_URL } from "@/lib/nav";

export const metadata = {
  title: "Get involved",
  description:
    "Ways to get involved with the King’s Union: come to a debate, join, speak, suggest a motion or write for Kingsway.",
};

const ways = [
  {
    eyebrow: "Watch",
    title: "Come to a debate",
    text: "Debates run for about two hours, with a vote of the House at the end. Tickets go on sale before each one.",
    href: "/term-card",
    cta: "See the term card",
  },
  {
    eyebrow: "Join",
    title: "Become a member",
    text: "£10 a year through KCLSU. Reserved tickets, a vote at the AGM and elections, and priority to speak.",
    href: MEMBERSHIP_URL,
    external: true,
    cta: "Join through KCLSU",
  },
  {
    eyebrow: "Speak",
    title: "Apply to speak",
    text: "Make the case for or against a motion alongside our guest speakers. No experience needed.",
    href: "/speak/apply",
    cta: "Apply to speak",
  },
  {
    eyebrow: "Shape the card",
    title: "Suggest a motion",
    text: "Tell us what the Union should debate next, and back the motions you most want to see.",
    href: "/motions",
    cta: "Suggest a motion",
  },
  {
    eyebrow: "Write",
    title: "Write for Kingsway",
    text: "Kingsway is the Union’s magazine. Pitch an op-ed, or a written debate with a partner.",
    href: "/contact#kingsway",
    cta: "Apply to write",
  },
  {
    eyebrow: "Stay in the loop",
    title: "Get ticket alerts",
    text: "One email when tickets for a debate go on sale, so you never miss out.",
    href: "/#mailing-list",
    cta: "Sign up",
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">Get involved</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Find your
              <br />
              place in the House.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Whether you want to watch, argue, write or help run the Union, there’s a way in.
            </p>
          </div>
        </section>

        <PhotoBand src="/gallery/speaker-gesturing.jpg" alt="A guest speaker makes his point to the House as the chair looks on" position="center 45%" />

        <section>
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#d4af37]/50 border border-[#d4af37]/50">
              {ways.map((w) => (
                <li key={w.title} className="bg-[#3d0202]">
                  <a
                    href={w.href}
                    {...(w.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex h-full flex-col p-6 sm:p-8 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs uppercase tracking-widest text-[#d4af37]">{w.eyebrow}</p>
                    <h2 className="title mt-3 text-2xl sm:text-3xl font-bold leading-tight group-hover:text-[#d4af37] transition-colors">
                      {w.title}
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-white/75">{w.text}</p>
                    <span className="mt-auto pt-6 text-base font-bold text-[#d4af37]">{w.cta} →</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>


        <JoinBand />
      </main>

      <Footer />
    </>
  );
}

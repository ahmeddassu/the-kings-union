import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = { title: "Message sent", robots: { index: false } };

const copy = {
  alerts: {
    eyebrow: "Ticket alerts",
    title: "You’re on the list.",
    text: "We’ll email you as soon as tickets for each debate go on sale.",
  },
  default: {
    eyebrow: "Message sent",
    title: "Thank you.",
    text: "Your message is on its way. If you left an email address, we’ll get back to you there.",
  },
};

export default async function SentPage({ searchParams }) {
  const { team } = (await searchParams) || {};
  const c = copy[team] || copy.default;
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif flex-1">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-20 sm:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">{c.eyebrow}</p>
            <h1 className="text-5xl sm:text-7xl font-bold leading-[0.95]">
              {c.title}
            </h1>
            <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              {c.text}
            </p>
            <a
              href="/"
              className="mt-10 inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
            >
              Back to the homepage →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

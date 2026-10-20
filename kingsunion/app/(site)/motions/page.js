import { cookies } from "next/headers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import MotionBoard from "@/components/motion_board";
import ProposeMotion from "@/components/propose_motion";
import { featuredMotions, hasUpvoted, storeConfigured } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suggest a motion",
  description:
    "Suggest a motion for the King’s Union to debate, and back the motions you most want to see on the term card.",
};

async function board() {
  if (!storeConfigured) return { motions: [], voted: [] };
  try {
    const motions = await featuredMotions();
    const visitor = (await cookies()).get("ku_visitor")?.value;
    return { motions, voted: await hasUpvoted(motions.map((m) => m.id), visitor) };
  } catch (err) {
    console.error("Couldn't load the motions board:", err);
    return { motions: [], voted: [] };
  }
}

export default async function MotionsPage({ searchParams }) {
  const { sent, error } = (await searchParams) || {};
  const { motions, voted } = await board();

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">Have your say</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              What should
              <br />
              we debate?
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              The term card starts here. Back the motions you most want to see in the chamber, or suggest
              your own. The committee reads every suggestion.
            </p>
            <a
              href="#suggest"
              className="mt-8 inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
            >
              Suggest a motion ↓
            </a>
          </div>
        </section>

        <PhotoBand src="/gallery/audience-profile.jpg" alt="Members of the audience listen from the front benches" position="center 50%" />

        <section>
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">On the table</h2>
              {motions.length > 0 && <p className="text-sm text-white/60">Tap ▲ to back a motion. One vote each.</p>}
            </div>
            {motions.length > 0 ? (
              <MotionBoard motions={motions} voted={voted} />
            ) : (
              <p className="border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-base sm:text-lg text-white/75">
                No motions up for a vote yet. Be the first to suggest one.
              </p>
            )}
          </div>
        </section>

        <ProposeMotion id="suggest" status={sent ? "sent" : error} />
      </main>

      <Footer />
    </>
  );
}

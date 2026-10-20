import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import MemberPhoto from "@/components/member_photo";
import KingswayPosts from "@/components/kingsway_posts";
import KingswaySubscribe from "@/components/kingsway_subscribe";
import { KINGSWAY_URL } from "@/lib/nav";

const ext = { href: KINGSWAY_URL, target: "_blank", rel: "noopener noreferrer" };

export const metadata = {
  title: "Kingsway",
  description: "Kingsway, the magazine of the King's Union.",
};

const editors = [
  // Add a photo with  image: "/people/guy.jpg"
  { name: "Guy de Basto", title: "Editor-in-Chief" },
];

export default function KingswayPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              The Union’s magazine
            </p>

            <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold tracking-tight leading-[0.9]">
              <em>Kingsway</em>.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              <em>Kingsway</em> is the magazine of the King’s Union, publishing writing
              from across the Union on the questions we debate and the ideas
              behind them.
            </p>
          </div>
        </section>

        {/* Latest */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Latest from <em>Kingsway</em>
              </h2>
              <a {...ext} className="inline-flex items-center min-h-11 text-base sm:text-sm font-bold text-[#d4af37] hover:text-white transition-colors duration-200">
                All articles on Substack →
              </a>
            </div>
            <KingswayPosts />
          </div>
        </section>

        {/* Subscribe */}
        <section className="border-b border-[#d4af37] bg-[#2a0101]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:items-center">
            <div className="md:col-span-5">
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-3 text-[#d4af37]">Newsletter</p>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Read <em>Kingsway</em> first.
              </h2>
            </div>
            <div className="md:col-span-7">
              <KingswaySubscribe />
            </div>
          </div>
        </section>

        <PhotoBand src="/gallery/speaking-to-a-full-house.jpg" alt="A speaker addresses a full House in the College Chapel" position="center 40%" />

        {/* Editorial team */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  2026–27
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Editorial team
                </h2>
              </div>

              <div className="lg:col-span-7 lg:col-start-6 grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
                {editors.map((e) => (
                  <article key={e.title}>
                    <MemberPhoto member={e} className="mb-4 rounded-lg" />
                    <h3 className="text-sm sm:text-base md:text-lg font-bold leading-snug">
                      {e.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 mt-1">{e.title}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Write for us */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  Contribute
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                  Write for
                  <br />
                  <em>Kingsway</em>.
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/contact#kingsway"
                  className="inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-sm font-bold hover:bg-white transition-colors duration-200"
                >
                  Pitch an article →
                </a>
                <a
                  {...ext}
                  className="inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
                >
                  Subscribe on Substack →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

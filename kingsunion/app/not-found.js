import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif flex-1">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-36">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              Error 404
            </p>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[0.95]">
              Out of
              <br />
              order.
            </h1>
            <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              The page you were looking for isn’t on the order paper. It may have
              moved, or the link may be mistyped.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
              >
                Back to the homepage →
              </a>
              <a
                href="/term-card"
                className="inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-base font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
              >
                See the Term Card
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

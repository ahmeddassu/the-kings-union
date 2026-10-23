import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";

export const metadata = { title: "Governance" };



export default function GovernancePage() {
  return (
    <main className="bg-[#3d0202] text-white font-serif">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
          <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
            Governance
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
            The people
            <br />
            behind the Union.
          </h1>

          <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
            The King’s Union is run by a committee of students responsible for
            the Union’s debates, finances, welfare, communications and
            day-to-day affairs.
          </p>
        </div>
      </section>

      <PhotoBand src="/gallery/floor-speech.jpg" alt="A member speaks from the floor of the House" position="center 50%" />

      {/* Governance */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            <div className="lg:col-span-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                How we're governed
              </h2>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-base sm:text-lg leading-relaxed text-white/85">
              <p>
                The Union is administered by its committee, which oversees the
                organisation of debates, social events and outreach, alongside
                the financial and operational responsibilities required to run
                the Society.
              </p>

              <p>
                Each officer has responsibility for a particular area of the
                Union's activities, while major decisions are taken collectively
                in the interests of its members.
              </p>

              <p>
                The committee is accountable to the membership and exists to
                ensure that the Union remains a welcoming, independent and
                effective forum for public debate at King's.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Footer CTA */}
      <section>
        <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

          <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
            Get involved
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
              Have a question?
            </h2>

            <a
              href="/contact"
              className="inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
            >
              Contact the Union →
            </a>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
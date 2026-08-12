import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function TermCardPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-black font-serif">

        {/* Header */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4">
              King's Union
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
              Term Card
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base text-gray-700 leading-relaxed">
              Our programme of debates and events for the term.
            </p>
          </div>
        </section>

        {/* Term Card */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">

            <div className="flex justify-center">
              <img
                src="/assets/term-card.jpg"
                alt="King's Union Term Card"
                className="w-full max-w-5xl h-auto"
              />
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
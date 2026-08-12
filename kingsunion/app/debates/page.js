import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const debates = [
    {
    title: "This House Supports the Ongoing American Intervention In Venezuela",
    date: "20 January 2026",
    description:
      "???",
    proposition: 30,
    opposition: 43
     
  },
    {
    title: "This House Believes that Britain Needs More Immigration",
    date: "9 December 2025",
    description:
      "I dont know what to write as a desc",
    proposition: 30,
    opposition: 43
     
  },
  {
    title: "This House Would Rejoin the European Union",
    date: "26 November 2025",
    description:
      "A tight defeat for the motion",
    proposition: 30,
    opposition: 43
       },
  
];

export default function DebatesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-black font-serif">

        {/* Hero */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6">
              The Archive
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Past
              <br />
              debates.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed">
              A record of motions debated by the King’s Union, from the
              controversial to the constitutional.
            </p>
          </div>
        </section>

        {/* Debate archive */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">

            <div className="flex items-end justify-between border-b border-black pb-4 mb-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Debate Archive
              </h2>

              <span className="text-xs sm:text-sm text-gray-500">
                {debates.length} debates
              </span>
            </div>

            <div>
              {debates.map((debate, index) => (
                <article
                  key={debate.title}
                  className="border-b border-black py-7 sm:py-9"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">

                    {/* Number */}
                    <div className="md:col-span-1">
                      <span className="text-xs text-gray-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Main information */}
                    <div className="md:col-span-7">
                      <a
                        href="#"
                        className="inline-block text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight hover:underline"
                      >
                        {debate.title}
                      </a>

                      <p className="text-xs sm:text-sm text-gray-500 mt-2 mb-4">
                        {debate.date}
                      </p>

                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl">
                        {debate.description}
                      </p>
                    </div>

                    {/* Result */}
                    <div className="md:col-span-4 md:flex md:justify-end md:items-center">
                      <div className="w-full md:w-56">

                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs uppercase tracking-wide">
                            Result
                          </span>

                          <span className="text-xs text-gray-500">
                            {debate.proposition > debate.opposition
                              ? "Proposition"
                              : "Opposition"}
                          </span>
                        </div>

                        <div className="flex h-10 border border-black">
                          <div
                            className="bg-black"
                            style={{
                              width: `${debate.proposition}%`,
                            }}
                          />

                          <div
                            className="bg-white"
                            style={{
                              width: `${debate.opposition}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between mt-2 text-xs sm:text-sm">
                          <span>
                            <strong>{debate.proposition}%</strong> Prop
                          </span>

                          <span>
                            <strong>{debate.opposition}%</strong> Opp
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-black">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4">
                  Next debate
                </p>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                  Come and hear
                  <br />
                  the argument.
                </h2>
              </div>

              <a
                href="term-card"
                className="inline-flex items-center justify-center border border-black px-6 py-3 text-sm font-bold hover:bg-black hover:text-white transition-colors"
              >
                View Term Card →
              </a>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SupportUsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">

            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              Support the Union
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Help keep
              <br />
              debate alive.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              The King’s Union exists to provide a space for open discussion,
              disagreement and intellectual curiosity. Your support helps us
              keep that space thriving.
            </p>

          </div>
        </section>

        {/* Why support us */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

              <div className="lg:col-span-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Why support us?
                </h2>
              </div>

              <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-base sm:text-lg leading-relaxed text-white/85">

                <p>
                  Great debates require more than a room and a motion. They
                  require speakers, organisation, promotion and the resources
                  to create an environment in which people actually want to
                  participate.
                </p>

                <p>
                  Support from members, alumni and friends of the Union allows
                  us to build a stronger programme and create more opportunities
                  for students to engage with public debate.
                </p>

                <p>
                  Whether you are able to make a substantial contribution or
                  simply want to support what we are building, every contribution
                  helps.
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* Main donation CTA */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">

            <div className="max-w-4xl">

              <p className="text-xs sm:text-sm uppercase tracking-widest mb-5 text-[#d4af37]">
                Make a contribution
              </p>

              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]">
                Back the next
                <br />
                generation of debate.
              </h2>

              <p className="mt-7 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed">
                Contributions from supporters help the Union continue to host
                debates, develop its outreach and create a welcoming community
                for students at King's.
              </p>

              <a
                href="#"
                className="mt-8 inline-flex items-center justify-center border border-[#d4af37] px-7 py-4 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
              >
                Support the Union →
              </a>

            </div>

          </div>
        </section>

        {/* Other ways to support */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  Not just money
                </p>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  There are other
                  <br />
                  ways to help.
                </h2>
              </div>

              <div className="space-y-8">

                <div className="border-t border-[#d4af37] pt-4">
                  <h3 className="text-xl font-bold">
                    Join us
                  </h3>

                  <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                    Become a member and help make the Union's events and
                    debates what they are.
                  </p>

                  <a
                    href="contact"
                    className="inline-block mt-3 text-sm font-bold text-[#d4af37] hover:text-white transition-colors"
                  >
                    Join the Union →
                  </a>
                </div>

                <div className="border-t border-[#d4af37] pt-4">
                  <h3 className="text-xl font-bold">
                    Speak at a debate
                  </h3>

                  <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                    Have something worth arguing about? Get involved in one of
                    our debates as a speaker or guest.
                  </p>

                  <a
                    href="contact"
                    className="inline-block mt-3 text-sm font-bold text-[#d4af37] hover:text-white transition-colors"
                  >
                    Get in touch →
                  </a>
                </div>

                <div className="border-t border-[#d4af37] pt-4">
                  <h3 className="text-xl font-bold">
                    Spread the word
                  </h3>

                  <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                    Follow us, share our events and bring someone along to the
                    next debate.
                  </p>

                  <a
                    href="/#follow"
                    className="inline-block mt-3 text-sm font-bold text-[#d4af37] hover:text-white transition-colors"
                  >
                    Follow us →
                  </a>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Final CTA */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

            <div className="text-center max-w-3xl mx-auto">

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                Thank you for
                <br />
                backing the Union.
              </h2>

              <p className="mt-6 text-sm sm:text-base text-white/70 leading-relaxed">
                Every contribution helps us create a stronger culture of debate
                at King's and beyond.
              </p>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
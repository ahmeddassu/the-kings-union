import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const committee = [
  {
    name: "Mustafa Dassu",
    title: "Founder & President",
    image: "/people/mustafa.jpg",
  },
  {
    name: "Archie Johnston",
    title: "Vice President & Treasurer",
    image: "/people/archie.jpg",
  },
  {
    name: "Ethan Khong",
    title: "Chief of Staff",
    image: "/people/ethan.jpg",
  },
  {
    name: "Ryan Wen",
    title: "Bursar",
    image: "/people/ryan.jpg",
  },
  {
    name: "Jarren Ong",
    title: "Legal & Welfare Officer",
    image: "/people/jarren.jpg",
  },
  {
    name: "Isabella Steiner",
    title: "Communications Officer",
    image: "/people/isabella.jpg",
  },
];

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

      {/* Committee */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

          <div className="mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
              2025–26
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Meet the Committee
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-10 sm:gap-y-12">

            {committee.map((member) => (
              <article key={member.name}>

                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover mb-4 rounded-lg border border-[#d4af37]"
                />

                <h3 className="text-sm sm:text-base md:text-lg font-bold leading-snug">
                  {member.name}
                </h3>

                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  {member.title}
                </p>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

          <div className="mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
              Committee roles
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              What we do.
            </h2>
          </div>

          <div className="border-t border-[#d4af37]">

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">01</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  President
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Provides overall leadership to the Union and represents the
                  Society within King's College London and beyond.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">02</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Vice President & Treasurer
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Supports the President while overseeing the Union's finances,
                  budgeting and financial administration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">03</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Chief of Staff
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Coordinates the Union's internal operations and helps ensure
                  that the committee's work runs smoothly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">04</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Bursar
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Assists with the administration and financial management of
                  the Union.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">05</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Legal & Welfare Officer
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Supports members and helps uphold the Union's standards of
                  conduct, welfare and responsible debate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-6 border-b border-[#d4af37] py-6">
              <span className="text-xs text-[#d4af37]">06</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Communications Officer
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                  Oversees the Union's communications, social media and public
                  presence.
                </p>
              </div>
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
              href="contact"
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
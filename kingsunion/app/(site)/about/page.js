import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import PhotoSlot from "@/components/photo_slot";

export const metadata = { title: "About" };

const principles = [
  {
    number: "01",
    title: "Freedom of expression",
    description:
      "We believe that open debate requires the freedom to express, question and challenge ideas. The Union exists to provide a forum where difficult questions can be discussed openly.",
  },
  {
    number: "02",
    title: "Mutual respect",
    description:
      "Strong disagreement does not require personal hostility. We expect our members and speakers to engage with one another with respect, civility and intellectual honesty.",
  },
  {
    number: "03",
    title: "Intellectual curiosity",
    description:
      "Debate is not simply about winning an argument. It is an opportunity to encounter ideas you may never have considered and to leave with a better understanding of the question.",
  },
  {
    number: "04",
    title: "A place for everyone",
    description:
      "Whether you are an experienced debater or have never spoken in front of a room before, the Union is intended to be a place where students, staff and alumni can participate.",
  },
];

const debateFormat = [
  "Three speakers on the proposition",
  "Three speakers on the opposition",
  "Points of information from the floor",
  "Questions from the audience",
  "A final vote on the motion",
];

export default function AboutPage() {
  return (
    <main className="bg-[#3d0202] text-white font-serif">
      <Navbar />

      {/* Hero, with the chamber photo behind it (fades as you scroll away) */}
      <section className="relative isolate overflow-clip border-b border-[#d4af37]">
        <img
          src="/chamber.jpg"
          alt=""
          className="fade-on-scroll absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Darkens the photo so the heading stays easy to read */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#3d0202] via-[#3d0202]/80 to-[#3d0202]/40"
        />
        <div className="px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-36">
          <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
            About the Union
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
            A chamber for
            <br />
            public debate.
          </h1>

          <div className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
            <p>
              The King’s Union was established in November 2025 as a chamber
              for public debate within King’s College London.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            <div className="lg:col-span-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                What is the Union?
              </h2>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-base sm:text-lg leading-relaxed text-white/90">
              <p>
                The King’s Union is a student society dedicated to the practice
                of public debate. We bring together students, staff, alumni and
                visiting speakers to discuss some of the most important and
                controversial questions of our time.
              </p>

              <p>
                Our motions cover an intentionally broad range of subjects.
                Recent debates have considered everything from intervention in
                Venezuela to the abolition of the monarchy, giving members the
                opportunity to engage with political, social, economic and
                cultural questions.
              </p>

              <p>
                At its heart, the Union is a place to think out loud. You do not
                have to arrive with the perfect argument. You simply have to be
                willing to listen, question and contribute.
              </p>
            </div>

          </div>
        </div>
      </section>

      <PhotoBand src="/gallery/two-speakers-before-the-chair.jpg" alt="Two speakers face each other across the House while the chair presides" position="center 45%" />

      {/* How debates work */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                The format
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Six speakers.
                <br />
                One motion.
                <br />
                One vote.
              </h2>

              <p className="mt-6 text-sm sm:text-base text-white/70 leading-relaxed max-w-lg">
                Our debates follow a traditional chamber format designed to
                give both sides of a motion the opportunity to make their case,
                while allowing the audience to challenge and question them.
              </p>
            </div>

            <div>
              <div className="border-t border-[#d4af37]">
                {debateFormat.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-5 border-b border-[#d4af37] py-5"
                  >
                    <span className="text-xs text-[#d4af37] w-6">
                      0{index + 1}
                    </span>

                    <span className="text-base sm:text-lg font-bold">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <PhotoBand src="/gallery/chapel-altar-set.jpg" alt="The despatch tables set for a debate in front of the chapel altar" position="center 60%" />

      {/* Principles */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

          <div className="mb-10 sm:mb-14">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
              What we stand for
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              The principles of the Union.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 border-t border-[#d4af37]">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="border-b border-[#d4af37] py-7 sm:py-8"
              >
                <div className="flex gap-5">
                  <span className="text-xs text-[#d4af37] pt-1">
                    {principle.number}
                  </span>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">
                      {principle.title}
                    </h3>

                    <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* Beyond debate */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                More than
                <br />
                debate.
              </h2>

              {/* Add a social photo: src="/socials/file.jpg" */}
              <PhotoSlot
                alt="Union members at a social"
                aspect="aspect-[4/3]"
                className="mt-8 rounded-lg"
              />
            </div>

            <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-base sm:text-lg leading-relaxed text-white/90">
              <p>
                The Union also serves as a focal point for student social life
                at King’s. Debate is only one part of what we do.
              </p>

              <p>
                Throughout the year, we organise social events including movie
                screenings, pub crawls and other opportunities for members to
                meet outside the debating chamber.
              </p>

              <p>
                Whether you come for the arguments, the people, the speakers,
                or simply because you fancy a night out, there is a place for
                you here.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Founder quote */}
      <section className="border-b border-[#d4af37]">
        <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
          <blockquote className="max-w-5xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              “The Union exists, above all else, to serve the College’s body
              of students, staff, and alumni. It’s a place where you can speak
              your mind and be treated with mutual respect. There’s a place for
              everybody here.”
            </p>

            <footer className="mt-8 text-sm sm:text-base">
              <span className="font-bold">Mustafa Dassu</span>
              <span className="text-white/60">
                {" "}
                — Founder & President
              </span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                Join the conversation
              </p>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                Come and debate.
              </h2>
            </div>

            <a
              href="debates"
              className="inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
            >
              Find an upcoming debate →
            </a>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
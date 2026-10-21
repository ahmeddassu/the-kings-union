export default function WhoWeAre() {
  return (
    <section className="bg-[#3d0202] text-white font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Main content */}
          <div className="reveal">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#d4af37]">Order, order</p>
            <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-10">
              Who we are
            </h2>

            <div className="space-y-5 text-base sm:text-lg leading-relaxed max-w-2xl text-white/90">
              <p>
                The King’s Union was established in November 2025 as a chamber
                for public debate within King’s College London.
              </p>

              <p>
                The Union regularly entertains motions on the most salient
                issues of the day, ranging from intervention in Venezuela to
                the abolition of the monarchy.
              </p>

              <p>
                Debates traditionally feature three speakers each on the
                proposition and opposition, ranging from students to notable
                visiting speakers. Audience members get a chance to pose
                points of information and ask questions to each side before a
                final vote.
              </p>

              <p>
                The Union was founded on the principles of freedom of speech
                and expression, as well as mutual respect in debate. The
                Society upholds the highest standard of civility, which is
                necessary to facilitate the free and constructive exchange of
                ideas.
              </p>

              <p>
                On top of this, the Union serves as a focal point for student
                social life, hosting movie screenings, pub crawls, and more.
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="reveal flex items-center">
            <blockquote className="relative pt-16">
              <span aria-hidden="true" className="title absolute -top-6 -left-2 text-[10rem] sm:text-[13rem] leading-none text-[#d4af37]">“</span>
              <p className="title text-2xl sm:text-3xl md:text-4xl leading-tight font-bold italic">
                The Union exists, above all else, to serve the College’s body
                of students, staff, and alumni. It’s a place where you can
                speak your mind and be treated with mutual respect. There’s a
                place for everybody here.
              </p>

              <footer className="mt-8 border-t-2 border-[#d4af37] pt-4 text-base sm:text-lg">
                <span className="font-bold">— Mustafa Dassu</span>
                <span className="text-white/60">, Founder & President</span>
              </footer>
            </blockquote>
          </div>

        </div>
      </div>
    </section>
  );
}
export default function WhoWeAre() {
  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* Main content */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-8">
              Who we are
            </h2>

            <div className="space-y-5 text-sm sm:text-base leading-relaxed max-w-2xl">
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
          <div className="lg:border-l lg:border-[#d4af37] lg:pl-10 xl:pl-16 flex items-center">
            <blockquote className="border-t border-b border-[#d4af37] py-8">
              <p className="text-xl sm:text-2xl md:text-3xl leading-snug font-bold">
                “The Union exists, above all else, to serve the College’s body
                of students, staff, and alumni. It’s a place where you can
                speak your mind and be treated with mutual respect. There’s a
                place for everybody here.”
              </p>

              <footer className="mt-6 text-sm sm:text-base">
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
const debates = [
  {
    title: "This House Supports the Ongoing American Intervention In Venezuela",
    date: "20 January 2026",
    description: "???",
    score: "30–43",
    href: "#",
  },
  {
    title: "This House Believes that Britain Needs More Immigration",
    date: "9 December 2025",
    description: "I dont know what to write as a desc",
    score: "30–9",
    href: "#",
  },
  {
    title: "This House Would Rejoin the European Union",
    date: "26 November 2025",
    description: "A tight defeat for the motion",
    score: "16–16",
    href: "",
  },
];

const recentDebates = debates.slice(0, 3);

export default function PastDebates() {
  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">

        <a
          href="#"
          className="inline-block text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white hover:text-[#d4af37] mb-6 sm:mb-8 transition-colors duration-200"
        >
          Past Debates
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {recentDebates.map((debate) => (
            <article
              key={debate.title}
              className="border-t border-[#d4af37] pt-4 flex flex-col"
            >
              <a
                href={debate.href}
                className="text-base sm:text-lg font-bold leading-snug text-white hover:text-[#d4af37] transition-colors duration-200"
              >
                {debate.title}
              </a>

              <p className="text-xs sm:text-sm text-white/60 mt-1 mb-3">
                {debate.date}
              </p>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-5">
                {debate.description}
              </p>

              <div className="mt-auto pt-3 border-t border-[#d4af37] flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white">
                  Result
                </span>

                <span className="font-bold tabular-nums text-[#d4af37]">
                  {debate.score}
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
import { getSpeakers } from "@/lib/speakers";

// "Who has spoken at the Union": the names scroll across in a continuous bar.
// Each name links to the debate they spoke in. The bar pauses while hovered or
// focused, and stays still (wrapped onto lines) for people who turn off motion.
function Names({ speakers, hidden = false }) {
  return (
    <ul className="marquee-list flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {speakers.map((s, i) => {
        // Repeats of a name (in short rows) are skipped by keyboards and screen readers.
        const repeat = hidden || speakers.findIndex((x) => x.name === s.name) !== i;
        return (
        <li key={`${s.name}-${i}`} aria-hidden={repeat && !hidden ? true : undefined} className="flex shrink-0 items-center">
          <a
            href={`/events/${s.slug}`}
            title={s.motion}
            tabIndex={repeat ? -1 : undefined}
            className="title-sc inline-flex min-h-11 items-center whitespace-nowrap text-white hover:text-[#d4af37] focus-visible:text-[#d4af37] transition-colors duration-200"
          >
            {s.name}
          </a>
          <span aria-hidden="true" className="mx-4 sm:mx-6 text-[#d4af37]">•</span>
        </li>
        );
      })}
    </ul>
  );
}

// One scrolling row. `reverse` runs it left-to-right instead of right-to-left.
function Row({ label, speakers, reverse = false }) {
  if (!speakers.length) return null;
  // Short lists are repeated so the bar is always full, even on wide screens.
  let names = speakers;
  while (names.length < 12) names = [...names, ...speakers];
  // About 4 seconds per name keeps the pace readable however long the list gets.
  const duration = `${Math.max(24, names.length * 4)}s`;
  return (
    <div className="mt-4 first:mt-0">
      <p className="px-4 sm:px-6 md:px-8 mb-1 text-xs uppercase tracking-widest text-white/50">{label}</p>
      <div
        className={`marquee border-y border-[#d4af37]/60 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl ${reverse ? "marquee-reverse" : ""}`}
        style={{ "--marquee-duration": duration }}
      >
        <div className="marquee-track flex w-max">
          <Names speakers={names} />
          <Names speakers={names} hidden />
        </div>
      </div>
    </div>
  );
}

export default async function Speakers() {
  const speakers = await getSpeakers();
  if (!speakers.length) return null;
  const guests = speakers.filter((s) => !s.student);
  const students = speakers.filter((s) => s.student);

  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37] pb-8 sm:pb-10 md:pb-12">
      <div className="px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-12 mb-5 sm:mb-6">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-3 text-[#d4af37]">
          Speakers
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Who has spoken at the Union
        </h2>
      </div>

      <Row label="Guest speakers" speakers={guests} />
      <Row label="King’s students" speakers={students} reverse />
    </section>
  );
}

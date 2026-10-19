import { getSpeakers } from "@/lib/speakers";

export default async function Speakers() {
  const speakers = await getSpeakers();
  if (!speakers.length) return null;

  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-3 text-[#d4af37]">
          Speakers
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
          Who has spoken at the Union
        </h2>

        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-lg sm:text-xl md:text-2xl leading-snug">
          {speakers.map((s, i) => (
            <li key={s.name} className="flex items-center gap-x-3">
              {i > 0 && <span aria-hidden="true" className="text-[#d4af37] text-sm">◆</span>}
              <a
                href={`/events/${s.slug}`}
                title={s.motion}
                className="title-sc inline-block py-2 text-white hover:text-[#d4af37] transition-colors duration-200"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

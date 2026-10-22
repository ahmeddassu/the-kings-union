// "The House": a wall of the guests who have spoken, with their photos (added in
// admin → Past speakers; initials until then), and the King's students below.
import { getSpeakerDirectory } from "@/lib/speaker_profiles";

const initials = (name) =>
  name
    .replace(/^(Dr|Prof|Professor|Sir|Dame|Lord|Lady|Baroness|Rt Hon)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default async function TheHouse() {
  const all = await getSpeakerDirectory().catch(() => []);
  const guests = all.filter((p) => !p.student).slice(0, 12);
  const students = all.filter((p) => p.student);
  if (!guests.length && !students.length) return null;

  return (
    <section aria-labelledby="the-house" className="bg-[#3d0202] text-white font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
<p aria-hidden="true" className="fleuron mb-12 sm:mb-16 text-2xl sm:text-3xl">{"\u2766\uFE0E"}</p>
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-10 sm:mb-14">
          <div>
            <p className="title-sc text-base sm:text-lg tracking-[0.12em] text-[#e6c766]">The House</p>
            <h2 id="the-house" className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold leading-none">Who has spoken.</h2>
          </div>
          <a href="/speakers" className="inline-flex min-h-11 items-center font-bold text-[#d4af37] underline underline-offset-4 hover:text-white">
            All {all.length} speakers →
          </a>
        </div>

        {guests.length > 0 && (
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] gap-3 sm:gap-4"
            style={{ "--cols": Math.min(8, Math.max(4, guests.length)) }}
          >
            {guests.map((p) => (
              <li key={p.slug}>
                <a href={`/speakers#${p.slug}`} className="group block">
                  {p.photo ? (
                    <img src={p.photo} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover grayscale transition duration-300 group-hover:grayscale-0" />
                  ) : (
                    <span aria-hidden="true" className="flex aspect-[4/5] w-full items-center justify-center border border-[#d4af37]/35 bg-[radial-gradient(circle_at_50%_35%,#4a0606,#220000)] transition-colors group-hover:bg-[#4a0505]">
                      <span className="title text-5xl sm:text-6xl font-bold italic gilt">{initials(p.name)}</span>
                    </span>
                  )}
                  <span className="mt-3 block title text-lg sm:text-xl font-bold leading-tight group-hover:text-[#d4af37]">{p.name}</span>
                  {p.title && <span className="mt-0.5 block text-sm text-white/65">{p.title}</span>}
                </a>
              </li>
            ))}
          </ul>
        )}

        {students.length > 0 && (
          <p className="reveal mt-12 max-w-5xl double-rule pt-6 text-base sm:text-lg leading-relaxed text-white/80">
            <span className="mr-2 text-xs uppercase tracking-[0.25em] text-[#d4af37]">King’s students</span>
            {students.map((p, i) => (
              <span key={p.slug}>
                <a href={`/speakers#${p.slug}`} className="hover:text-[#d4af37]">{p.name}</a>
                {i < students.length - 1 && <span aria-hidden="true" className="mx-2 text-[#d4af37]">·</span>}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}

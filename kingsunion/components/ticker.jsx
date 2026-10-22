import { getPastDebates, verdict, hasCounts } from "@/lib/debates";
import { getEvents } from "@/lib/sheet";

const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
};
const strip = (t) => t.replace(/^This House (would |believes |has )?/i, "");

// The gold strip under the hero: the College motto, the last result and the
// next motion, scrolling slowly. Pauses on hover; still for reduced motion.
export default async function Ticker() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const [past, events] = await Promise.all([getPastDebates(), getEvents()]);
  const last = past.find((d) => hasCounts(d) || d.outcome);
  const next = events.find((e) => e.type === "Debate" && e.date >= today);

  const items = [
    { text: "Sancte et Sapienter", italic: true },
    { text: "The House divides" },
    last && { text: `Last sitting: ${strip(last.title)} — ${verdict(last)}${hasCounts(last) ? ` ${last.proposition}–${last.opposition}` : ""}` },
    { text: "Three speakers a side · Questions from the floor · A vote of the House" },
    next && { text: `Next: ${strip(next.title)} — ${shortDate(next.date)}` },
  ].filter(Boolean);

  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it.text} className="flex shrink-0 items-center">
          <span className={`whitespace-nowrap ${it.italic ? "italic" : ""}`}>{it.text}</span>
          <span aria-hidden="true" className="mx-6 sm:mx-8 text-[#3d0202]/50">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="The Union at a glance" className="ticker mt-10 sm:mt-12 border-y border-[#8a6d12] bg-[linear-gradient(100deg,#b8892b,#e9c964_30%,#d4af37_55%,#f3dc8c_75%,#b8892b)] py-3 sm:py-4 font-serif text-base sm:text-lg md:text-xl font-bold text-[#3d0202]">
      <div className="ticker-track flex w-max" style={{ "--ticker-duration": `${items.length * 12}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}

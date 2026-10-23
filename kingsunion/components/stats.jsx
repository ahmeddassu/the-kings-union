import { getStats } from "@/lib/speakers";
import CountUp from "@/components/count_up";

export default async function Stats() {
  const { label, debates, speakers, votes } = await getStats();
  const items = [
    { value: debates, label: `${debates === 1 ? "debate" : "debates"} this year` },
    { value: speakers, label: "speakers this year" },
    { value: votes, label: "votes cast this year" },
  ];

  return (
    <section className="bg-[#2a0101] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
          The Union in numbers · {label} so far
        </p>
        <dl className="grid grid-cols-3 gap-4 sm:gap-8">
          {items.map((it) => (
            <div key={it.label} className="border-t border-[#d4af37] pt-4 min-w-0">
              <dt className="sr-only">{it.label}</dt>
              <dd className="title text-4xl sm:text-5xl md:text-6xl font-bold tabular-nums leading-none">
                <CountUp value={it.value} />
              </dd>
              <dd className="mt-2 text-sm sm:text-base text-white/70">{it.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

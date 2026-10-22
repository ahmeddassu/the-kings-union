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
    <section className="bg-[#140000] text-white font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-14 sm:py-16 md:py-20">
        <p className="title-sc text-sm sm:text-base tracking-[0.12em] mb-8 text-[#e6c766]">
          The Union in numbers · {label} so far
        </p>
        <dl className="grid grid-cols-3 gap-4 sm:gap-8">
          {items.map((it) => (
            <div key={it.label} className="double-rule pt-5 min-w-0">
              <dt className="sr-only">{it.label}</dt>
              <dd className="title text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-none">
                <CountUp value={it.value} className="gilt" />
              </dd>
              <dd className="mt-3 text-sm sm:text-lg text-white/75">{it.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

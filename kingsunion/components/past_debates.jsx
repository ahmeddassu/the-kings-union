import { getPastDebates, displayDate, verdict, hasCounts } from "@/lib/debates";

// Roman numerals for numbering sittings: I, II, III…
export function roman(n) {
  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}

function Stamp({ debate }) {
  const v = verdict(debate);
  const carried = v === "Carried";
  const plain = v === "Carried" || v === "Defeated";
  return (
    <span
      className={`stamp inline-block -rotate-[8deg] border-[3px] px-3 py-1 font-serif font-bold uppercase tracking-[0.2em] ${
        plain ? "text-lg sm:text-xl" : "text-xs sm:text-sm max-w-[12rem] text-center tracking-[0.12em]"
      } ${carried ? "border-[#1f5c2e] text-[#1f5c2e]" : plain ? "border-[#9b1111] text-[#9b1111]" : "border-[#3d0202] text-[#3d0202]"}`}
    >
      {v}
    </span>
  );
}

// "The Record of the House": the latest debates, numbered from the Union's first.
export default async function PastDebates() {
  const all = await getPastDebates();
  const recent = all.slice(0, 5);

  return (
    <section aria-labelledby="record" className="bg-[#f6efe2] text-[#3d0202] font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
        <div className="reveal flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-10 sm:mb-14">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-[#8a6d12]">The record of the House</p>
            <h2 id="record" className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold leading-none">
              How the House divided.
            </h2>
          </div>
          <div className="flex flex-wrap gap-x-6">
            <a href="/debates" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4 decoration-[#d4af37] decoration-2 hover:text-[#7a0a0a]">
              Every debate →
            </a>
            <a href="/records" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4 decoration-[#d4af37] decoration-2 hover:text-[#7a0a0a]">
              The record book →
            </a>
          </div>
        </div>

        <ol className="border-t-2 border-[#3d0202]">
          {recent.map((debate, i) => {
            const number = all.length - i;
            const title = debate.href ? (
              <a href={debate.href} className="hover:text-[#7a0a0a] transition-colors">{debate.title}</a>
            ) : (
              debate.title
            );
            return (
              <li key={debate.title + debate.date} className="reveal grid grid-cols-[3.5rem_1fr] sm:grid-cols-[6rem_1fr_auto] items-center gap-x-4 sm:gap-x-8 gap-y-3 border-b border-[#3d0202]/25 py-6 sm:py-8">
                <span className="title self-start text-3xl sm:text-5xl font-bold italic text-[#8a6d12]">
                  <span aria-hidden="true">{roman(number)}</span>
                  <span className="sr-only">Sitting {number}</span>
                </span>
                <div className="min-w-0">
                  <p className="title text-xl sm:text-2xl md:text-3xl font-bold leading-tight">“{title}”</p>
                  <p className="mt-2 text-sm sm:text-base text-[#3d0202]/70">
                    {displayDate(debate.date)}
                    {hasCounts(debate) && (
                      <span className="ml-3 font-bold tabular-nums text-[#3d0202]">
                        Ayes {debate.proposition} · Noes {debate.opposition}
                      </span>
                    )}
                  </p>
                </div>
                <div className="col-start-2 sm:col-start-3 sm:pr-4">
                  <Stamp debate={debate} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

import { TOPICS, verdict } from "@/lib/debates";
import ArchiveSearch from "@/components/archive_search";

// Filters for the debate archive on the Debates page. The topic, result and year
// buttons work with CSS alone (they hide debates that don't match), so they work
// on every device even before JavaScript loads. The search box needs JavaScript.

const chip =
  "min-h-11 inline-flex items-center border border-[#d4af37]/70 px-4 py-2 text-sm sm:text-base cursor-pointer select-none transition-colors hover:border-white has-[:checked]:bg-[#d4af37] has-[:checked]:border-[#d4af37] has-[:checked]:text-[#3d0202] has-[:checked]:font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white";

function Group({ name, legend, options }) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-widest mb-3 text-[#d4af37]">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...options].map((o) => (
          <label key={o.value} className={chip}>
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === "all"} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// One CSS rule per option: when that option is picked, hide debates without it.
function rules(name, attr, values) {
  return values
    .map((v) => `.archive:has(input[name="${name}"][value="${v}"]:checked) .arc-item:not([${attr}~="${v}"]){display:none}`)
    .join("\n");
}

export default function ArchiveFilters({ debates }) {
  const topics = TOPICS.filter((t) => debates.some((d) => d.topics.includes(t.id)));
  const results = ["carried", "defeated"].filter((r) =>
    debates.some((d) => resultOf(d) === r)
  );
  const years = [...new Set(debates.map((d) => d.year))].sort().reverse();

  const css = [
    rules("arc-topic", "data-topic", topics.map((t) => t.id)),
    rules("arc-result", "data-result", results),
    rules("arc-year", "data-year", years.map(yearKey)),
  ].join("\n");

  return (
    <section id="find" className="scroll-mt-24 border-b border-[#d4af37]">
      <style>{css}</style>
      <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Find a debate</p>
        <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Search the archive.
        </h2>

        <form className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ArchiveSearch id="arc-search" />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Group name="arc-topic" legend="Topic" options={topics.map((t) => ({ value: t.id, label: t.label }))} />
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
              <Group
                name="arc-result"
                legend="Result"
                options={results.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }))}
              />
              {years.length > 1 && (
                <Group name="arc-year" legend="Year" options={years.map((y) => ({ value: yearKey(y), label: y }))} />
              )}
            </div>
            <div>
              <button type="reset" className="min-h-11 inline-flex items-center text-sm sm:text-base font-bold text-[#d4af37] hover:text-white underline underline-offset-4 transition-colors">
                Clear filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export function resultOf(d) {
  const v = verdict(d).toLowerCase();
  return v === "carried" || v === "defeated" ? v : "other";
}

export const yearKey = (y) => y.replace("/", "-");

// Attributes the archive list puts on each debate so the filters can find it.
export function archiveAttrs(d) {
  return {
    "data-topic": d.topics.join(" "),
    "data-result": resultOf(d),
    "data-year": yearKey(d.year),
    "data-search": [d.title, d.description, ...(d.speakers || [])].join(" ").toLowerCase(),
  };
}

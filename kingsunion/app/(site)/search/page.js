import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { search } from "@/lib/search";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search", robots: { index: false } };

const SUGGESTIONS = ["monarchy", "wealth tax", "Chatham House", "point of information", "membership", "tickets"];

// Shows a short piece of the text around the first word that matched.
function snippet(text, words) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const lower = t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const at = Math.min(...words.map((w) => lower.indexOf(w)).filter((i) => i >= 0), Infinity);
  if (!isFinite(at) || at < 80) return t.length > 180 ? `${t.slice(0, 180).replace(/\s\S*$/, "")}…` : t;
  const start = t.lastIndexOf(" ", at - 60) + 1;
  const piece = t.slice(start, start + 180).replace(/\s\S*$/, "");
  return `…${piece}${start + 180 < t.length ? "…" : ""}`;
}

export default async function SearchPage({ searchParams }) {
  const { q = "" } = (await searchParams) || {};
  const query = String(q).slice(0, 120);
  const { words, total, groups } = query.trim() ? await search(query) : { words: [], total: 0, groups: [] };

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-14 sm:py-20">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95]">Search</h1>
            <form action="/search" method="get" role="search" className="mt-8 flex max-w-3xl flex-col sm:flex-row gap-3">
              <label htmlFor="q" className="sr-only">Search the King’s Union</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                autoFocus={!query}
                placeholder="Debates, speakers, questions…"
                className="flex-1 min-w-0 min-h-12 border border-[#d4af37] bg-transparent px-4 py-3 text-lg text-white placeholder:text-white/45 outline-none focus:border-white"
              />
              <button type="submit" className="min-h-12 bg-[#d4af37] px-8 text-lg font-bold text-[#3d0202] hover:bg-white">
                Search
              </button>
            </form>
            {query.trim() && (
              <p role="status" className="mt-5 text-white/75">
                {total ? `${total} result${total === 1 ? "" : "s"} for “${query}”` : `Nothing found for “${query}”.`}
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 max-w-4xl">
            {!query.trim() || !total ? (
              <div>
                <p className="text-white/80">{query.trim() ? "Try fewer words, or one of these:" : "Try one of these:"}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <a href={`/search?q=${encodeURIComponent(s)}`} className="inline-flex min-h-11 items-center border border-[#d4af37]/70 px-4 hover:bg-white/10">
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-12">
                {groups.map((g) => (
                  <section key={g.group} aria-labelledby={`g-${g.group}`}>
                    <h2 id={`g-${g.group}`} className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]">
                      {g.group}
                    </h2>
                    <ul className="mt-3 border-t border-[#d4af37]/60">
                      {g.items.map((d) => (
                        <li key={d.href + d.title} className="border-b border-[#d4af37]/30 py-4">
                          <a
                            href={d.href}
                            {...(d.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="title text-xl sm:text-2xl font-bold leading-tight hover:text-[#d4af37]"
                          >
                            {d.title}
                            {d.external && <span className="sr-only"> (opens in a new tab)</span>}
                          </a>
                          {d.meta && <p className="mt-1 text-sm text-white/65">{d.meta}</p>}
                          {!d.quiet && snippet(d.text, words) && <p className="mt-1 text-white/80">{snippet(d.text, words)}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

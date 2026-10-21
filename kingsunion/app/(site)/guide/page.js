import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { sections, videos } from "@/lib/guide";
import { socialLinks } from "@/lib/nav";

export const metadata = {
  title: "How to Debate",
  description:
    "A guide to King’s Union debates: your first night, points of information, speaking from the floor, building a case and the words you’ll hear.",
  alternates: { canonical: "/guide" },
};

const eyebrow = "text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]";
const youtube = socialLinks.find((s) => s.label === "YouTube")?.href;

function Section({ s, n }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 border-t border-[#d4af37] py-10 sm:py-14">
      <p className={eyebrow} aria-hidden="true">{String(n).padStart(2, "0")}</p>
      <h2 id={`${s.id}-h`} className="title mt-2 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">{s.title}</h2>
      <div className="mt-6 max-w-2xl space-y-4 text-base sm:text-lg leading-relaxed text-white/85">
        {(s.paras || []).map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      {s.tips && (
        <ul className="mt-6 max-w-2xl space-y-3">
          {s.tips.map((t) => (
            <li key={t.slice(0, 40)} className="flex gap-3 text-base sm:text-lg leading-relaxed">
              <span aria-hidden="true" className="mt-0.5 text-[#d4af37]">✦</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {s.terms && (
        <dl className="mt-6 grid max-w-4xl grid-cols-1 md:grid-cols-2 gap-x-10">
          {s.terms.map(([term, meaning]) => (
            <div key={term} className="border-t border-[#d4af37]/40 py-4">
              <dt className="title text-xl font-bold">{term}</dt>
              <dd className="mt-1 text-white/80">{meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className={`${eyebrow} mb-6`}>A guide</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              How to
              <br />
              <em>debate.</em>
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Everything you need for your first debate at the Union, whether you’re coming to listen, want to make a
              point from the floor, or are preparing a speech.
            </p>
            <nav aria-label="On this page" className="mt-10">
              <ol className="flex flex-wrap gap-x-6 gap-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="inline-flex min-h-11 items-center text-[#d4af37] underline-offset-4 hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
                {videos.length > 0 && (
                  <li>
                    <a href="#videos" className="inline-flex min-h-11 items-center text-[#d4af37] underline-offset-4 hover:underline">Videos</a>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </section>

        <div className="px-4 sm:px-6 md:px-8">
          {sections.map((s, i) => (
            <Section key={s.id} s={s} n={i + 1} />
          ))}

          {videos.length > 0 && (
            <section id="videos" aria-labelledby="videos-h" className="scroll-mt-24 border-t border-[#d4af37] py-10 sm:py-14">
              <h2 id="videos-h" className="title text-3xl sm:text-4xl md:text-5xl font-bold">Videos</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((v) => (
                  <figure key={v.id}>
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?cc_load_policy=1`}
                        title={v.title}
                        loading="lazy"
                        allow="encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    <figcaption className="mt-2 font-bold">{v.title}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="title text-3xl sm:text-4xl font-bold">Ready?</h2>
              <p className="mt-2 max-w-xl text-white/75">
                Find your first debate on the term card
                {youtube && (
                  <>
                    , or{" "}
                    <a href={youtube} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline underline-offset-4 hover:text-white">
                      find us on YouTube<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </>
                )}
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/term-card" className="inline-flex min-h-12 items-center bg-[#d4af37] px-6 font-bold text-[#3d0202] hover:bg-white">
                See the term card
              </a>
              <a href="/speak/apply" className="inline-flex min-h-12 items-center border border-[#d4af37] px-6 font-bold hover:bg-white/10">
                Apply to speak
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

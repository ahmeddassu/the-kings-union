import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getSpeakerDirectory } from "@/lib/speaker_profiles";
import { displayDate } from "@/lib/debates";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata = {
  title: "Speakers",
  description: "Everyone who has spoken at the King’s Union: guest speakers and King’s students, and the debates they spoke in.",
  alternates: { canonical: "/speakers" },
};

const eyebrow = "text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]";
const h2 = "title mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight";

const initials = (name) =>
  name
    .replace(/^(Dr|Prof|Professor|Sir|Dame|Lord|Lady|Baroness|Rt Hon)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Result({ d }) {
  if (!d.result) return null;
  const score = d.votes ? ` ${d.votes.proposition}–${d.votes.opposition}` : "";
  return (
    <span className={d.won ? "text-[#d4af37]" : "text-white/60"}>
      {d.result === "carried" ? "Carried" : "Defeated"}
      {score}
    </span>
  );
}

function Debates({ debates }) {
  return (
    <ul className="mt-4 space-y-3 border-t border-[#d4af37]/40 pt-4">
      {debates.map((d) => (
        <li key={d.slug} className="text-sm leading-snug">
          <a href={`/events/${d.slug}`} className="font-bold text-white hover:text-[#d4af37] transition-colors">
            {d.title}
          </a>
          <span className="mt-0.5 block text-white/65">
            {d.side} · {displayDate(d.date)}
            {d.result && " · "}
            <Result d={d} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Guest({ p }) {
  return (
    <article id={p.slug} className="scroll-mt-24 flex flex-col border border-[#d4af37]/60 bg-[#2a0101]">
      {p.photo ? (
        <img
          src={p.photo}
          alt={p.name}
          loading="lazy"
          className="aspect-square w-full object-cover"
          width={600}
          height={600}
        />
      ) : (
        <div aria-hidden="true" className="flex aspect-square w-full items-center justify-center bg-[#3d0202]">
          <span className="title text-6xl sm:text-7xl font-bold text-[#d4af37]/80">{initials(p.name)}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="title text-2xl font-bold leading-tight">{p.name}</h3>
        {p.title && <p className="mt-1 text-white/75">{p.title}</p>}
        {p.href && (
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center self-start text-sm text-[#d4af37] underline underline-offset-4 hover:text-white"
          >
            More about {p.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        <Debates debates={p.debates} />
      </div>
    </article>
  );
}

function Student({ p }) {
  return (
    <li id={p.slug} className="scroll-mt-24 border-t border-[#d4af37]/60 py-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h3 className="title text-xl sm:text-2xl font-bold">{p.name}</h3>
        {p.title && <p className="text-white/70">{p.title}</p>}
      </div>
      <Debates debates={p.debates} />
    </li>
  );
}

export default async function SpeakersPage() {
  const all = await getSpeakerDirectory();
  const guests = all.filter((p) => !p.student);
  const students = all.filter((p) => p.student);
  const debates = new Set(all.flatMap((p) => p.debates.map((d) => d.slug))).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Speakers at the King’s Union",
    url: new URL("/speakers", siteUrl).toString(),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: all.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.name,
          ...(p.title ? { description: p.title } : {}),
          ...(p.href ? { sameAs: p.href } : {}),
          ...(p.photo ? { image: new URL(p.photo, siteUrl).toString() } : {}),
        },
      })),
    },
  };

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
            <p className={`${eyebrow} mb-6`}>Speakers</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.9] max-w-5xl">
              Who has spoken
              <br />
              <em>at the Union.</em>
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Guest speakers and King’s students who have taken the floor, and the debates they spoke in.
              {all.length > 0 && ` ${all.length} speakers across ${debates} debate${debates === 1 ? "" : "s"}.`}
            </p>
          </div>
        </section>

        {guests.length > 0 && (
          <section>
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
              <p className={eyebrow}>Guest speakers</p>
              <h2 className={h2}>Our guests.</h2>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {guests.map((p) => (
                  <Guest key={p.slug} p={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {students.length > 0 && (
          <section className="border-t border-[#d4af37]">
            <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
              <p className={eyebrow}>King’s students</p>
              <h2 className={h2}>From King’s.</h2>
              <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {students.map((p) => (
                  <Student key={p.slug} p={p} />
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="title text-3xl sm:text-4xl font-bold">Want to be next?</h2>
              <p className="mt-2 text-white/75">King’s students can apply to speak in a debate.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/speak/apply" className="inline-flex min-h-12 items-center bg-[#d4af37] px-6 font-bold text-[#3d0202] hover:bg-white">
                Apply to speak
              </a>
              <a href="/guide" className="inline-flex min-h-12 items-center border border-[#d4af37] px-6 font-bold hover:bg-white/10">
                How to debate
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

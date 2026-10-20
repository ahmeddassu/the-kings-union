import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MemberPhoto from "@/components/member_photo";
import { profiles } from "@/lib/people";
import { getEvents, slugify } from "@/lib/sheet";

export const revalidate = 300;

export function generateStaticParams() {
  return profiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = profiles.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.name}, ${p.role}${p.team === "Kingsway" ? " of Kingsway" : ""} at the King’s Union.`,
  };
}

const linkClass = "hover:text-[#d4af37] underline underline-offset-4 decoration-[#d4af37]/50 transition-colors";

function Row({ label, children }) {
  return (
    <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6">
      <dt className="text-xs uppercase tracking-widest text-[#d4af37] sm:pt-1">{label}</dt>
      <dd className="sm:col-span-2 text-base sm:text-lg">{children}</dd>
    </div>
  );
}

export default async function ProfilePage({ params }) {
  const { slug } = await params;
  const p = profiles.find((x) => x.slug === slug);
  if (!p) notFound();

  let motion = null;
  if (p.favouriteMotion) {
    const events = await getEvents().catch(() => []);
    const e = events.find((x) => slugify(x.title) === slugify(p.favouriteMotion));
    motion = { title: e?.title || p.favouriteMotion, href: e ? `/events/${e.slug}` : null };
  }

  const others = profiles.filter((x) => x.slug !== p.slug);

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20">
            <a href={p.back?.href || "/governance"} className="inline-flex min-h-11 items-center text-sm text-white/60 hover:text-[#d4af37] transition-colors">
              ← {p.back?.label || "The committee"}
            </a>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <MemberPhoto member={p} className="rounded-lg border border-[#d4af37] max-w-sm" />
              </div>

              <div className="md:col-span-8">
                {/* Office first, as the unions list their officers */}
                <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]">
                  {[p.team, p.term].filter(Boolean).join(" · ")}
                </p>
                <p className="title mt-4 text-2xl sm:text-3xl font-bold text-[#d4af37]">{p.role}</p>
                <h1 className="title mt-1 text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95]">{p.name}</h1>

                {p.bio?.length > 0 && (
                  <div className="mt-8 max-w-2xl space-y-4 border-l-2 border-[#d4af37] pl-5 text-lg sm:text-xl leading-relaxed text-white/90">
                    {p.bio.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                )}

                <dl className="mt-10 max-w-2xl divide-y divide-[#d4af37]/40 border-y border-[#d4af37]/40">
                  {p.course && <Row label="Course">{p.course}</Row>}
                  {p.year && <Row label="Year">{p.year}</Row>}
                  {p.offices?.length > 0 && (
                    <Row label="Union offices">
                      <ul className="space-y-1">
                        <li>
                          {p.role}
                          {p.team === "Kingsway" ? ", Kingsway" : ""} <span className="text-white/55">· {p.term}</span>
                        </li>
                        {p.offices.map((o) => (
                          <li key={o.title + o.term}>
                            {o.title} <span className="text-white/55">· {o.term}</span>
                          </li>
                        ))}
                      </ul>
                    </Row>
                  )}
                  {motion && (
                    <Row label="Favourite motion this term">
                      {motion.href ? (
                        <a href={motion.href} className={linkClass}>
                          “{motion.title}”
                        </a>
                      ) : (
                        <>“{motion.title}”</>
                      )}
                    </Row>
                  )}
                  {p.email && (
                    <Row label="Contact">
                      <a href={`mailto:${p.email}`} className={`${linkClass} break-all`}>
                        {p.email}
                      </a>
                    </Row>
                  )}
                  {p.linkedin && (
                    <Row label="LinkedIn">
                      <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        View profile ↗
                      </a>
                    </Row>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {others.length > 0 && (
          <section>
            <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12">
              <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-6">Also on the team</p>
              <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {others.map((o) => (
                  <li key={o.slug}>
                    <a href={`/team/${o.slug}`} className="group block">
                      <MemberPhoto member={o} className="mb-3 rounded-lg" />
                      <p className="text-xs uppercase tracking-widest text-[#d4af37]">{o.role}</p>
                      <p className="font-bold group-hover:text-[#d4af37] transition-colors">{o.name}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

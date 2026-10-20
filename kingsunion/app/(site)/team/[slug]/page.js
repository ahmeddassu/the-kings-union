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
  return { title: p.name, description: `${p.name}, ${p.role} at the King’s Union.` };
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

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20">
            <a href={p.back?.href || "/governance"} className="inline-flex min-h-11 items-center text-sm text-white/60 hover:text-[#d4af37] transition-colors">
              ← {p.back?.label || "The committee"}
            </a>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <MemberPhoto member={p} className="rounded-lg border border-[#d4af37] max-w-sm" />
              </div>
              <div className="md:col-span-8">
                <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37]">{p.role}</p>
                <h1 className="title mt-3 text-4xl sm:text-5xl md:text-6xl font-bold leading-[0.95]">{p.name}</h1>
                {p.course && <p className="mt-4 text-base sm:text-lg text-white/70">{p.course}</p>}

                <div className="mt-8 max-w-2xl space-y-4 text-base sm:text-lg leading-relaxed text-white/85">
                  {(p.bio || []).map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>

                <dl className="mt-10 max-w-2xl divide-y divide-[#d4af37]/40 border-y border-[#d4af37]/40">
                  {motion && (
                    <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6">
                      <dt className="text-xs uppercase tracking-widest text-[#d4af37] sm:pt-1">Favourite motion this term</dt>
                      <dd className="sm:col-span-2 text-lg">
                        {motion.href ? (
                          <a href={motion.href} className="hover:text-[#d4af37] underline underline-offset-4 decoration-[#d4af37]/50">
                            “{motion.title}”
                          </a>
                        ) : (
                          <>“{motion.title}”</>
                        )}
                      </dd>
                    </div>
                  )}
                  {p.linkedin && (
                    <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6">
                      <dt className="text-xs uppercase tracking-widest text-[#d4af37] sm:pt-1">LinkedIn</dt>
                      <dd className="sm:col-span-2 text-lg">
                        <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] underline underline-offset-4 decoration-[#d4af37]/50">
                          View profile ↗
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

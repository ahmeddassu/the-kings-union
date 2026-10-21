import AdminShell from "@/components/voting/admin_shell";
import PastSpeakersAdmin from "@/components/voting/past_speakers_admin";
import { requireAdmin } from "@/lib/admin_page";
import { getSpeakerDirectory } from "@/lib/speaker_profiles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Past speakers · Admin" };

export default async function PastSpeakersPage() {
  const base = await requireAdmin("guests");
  const people = await getSpeakerDirectory({ includeHidden: true, fresh: true }).catch(() => []);
  const list = people.map((p) => ({
    slug: p.slug,
    name: p.name,
    student: p.student,
    title: p.title,
    href: p.href,
    photo: p.photo,
    hidden: p.hidden,
    debates: p.debates.map((d) => d.title),
  }));
  return (
    <AdminShell base={base} current="/past-speakers">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Events and Programming</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Past speakers</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Everyone on the <a href="https://www.kingsunion.org.uk/speakers" className="underline underline-offset-4">Speakers page</a>.
        Names and debates come from the term card automatically once a debate has happened. Here you can add a photo,
        a one-line title and a link for each speaker, or hide someone. Only use photos you have permission to use (for
        example one the speaker sent you, or their official portrait).
      </p>
      <div className="mt-8">
        <PastSpeakersAdmin base={base} initial={list} />
      </div>
    </AdminShell>
  );
}

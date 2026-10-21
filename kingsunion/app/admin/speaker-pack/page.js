import AdminShell from "@/components/voting/admin_shell";
import SpeakerPackAdmin from "@/components/voting/speaker_pack_admin";
import { requireAdmin } from "@/lib/admin_page";
import { getPackForAdmin } from "@/lib/speaker_pack";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Speaker pack · Admin" };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export default async function SpeakerPackAdminPage() {
  const base = await requireAdmin("speakers");
  const [pack, events] = await Promise.all([getPackForAdmin(), getEvents().catch(() => [])]);
  const upcoming = events
    .filter((e) => e.type === "Debate" && e.date >= today())
    .map((e) => ({ slug: e.slug, label: `${e.title} · ${longDate(e.date)}` }));
  return (
    <AdminShell base={base} current="/speaker-pack">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">For guest speakers</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Speaker pack</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        A page for invited speakers with everything they need to know. It isn’t linked from the website’s menus: send
        speakers the link. Choose their debate and the pack also shows its motion, date, time, venue and line-up.
      </p>
      <div className="mt-8">
        <SpeakerPackAdmin base={base} initial={pack} debates={upcoming} site={siteUrl.origin} />
      </div>
    </AdminShell>
  );
}

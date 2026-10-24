import AdminShell from "@/components/voting/admin_shell";
import DoorCheckin from "@/components/voting/door_checkin";
import { requireAdmin } from "@/lib/admin_page";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "Door check-in · Admin" };

const londonDate = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export default async function DoorPage() {
  const base = await requireAdmin("attendance");
  const today = londonDate();
  const from = londonDate(new Date(Date.now() - 7 * 86400000));
  const until = londonDate(new Date(Date.now() + 60 * 86400000));
  const events = (await getEvents().catch(() => []))
    .filter((e) => e.date >= from && e.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ slug: e.slug, label: `${e.date === today ? "Today · " : ""}${e.title} · ${longDate(e.date)}`, date: e.date, upcoming: e.date > today }));
  // Today's event, or the next one, or the most recent.
  const initial = events.find((e) => e.date === today) || events.find((e) => e.date > today) || events[events.length - 1];

  return (
    <AdminShell base={base} current="/door">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">At the door</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Door check-in</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Check people in from your phone, even with no signal. Several people can work the door at once; everyone’s
        check-ins appear on each phone.
      </p>
      <div className="mt-6 max-w-3xl">
        {initial ? (
          <DoorCheckin base={base} events={events} initialSlug={initial.slug} canFinish />
        ) : (
          <p className="text-white/70">There are no events in the last week or the next two months.</p>
        )}
      </div>
    </AdminShell>
  );
}

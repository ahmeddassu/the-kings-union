import AdminShell from "@/components/voting/admin_shell";
import AttendanceAdmin from "@/components/voting/attendance_admin";
import { requireAdmin } from "@/lib/admin_page";
import { getAttendance, getSettings } from "@/lib/attendance";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "Attendance · Admin" };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export default async function AttendancePage() {
  const base = await requireAdmin("attendance");
  const [data, settings, events] = await Promise.all([getAttendance(), getSettings(), getEvents().catch(() => [])]);
  const past = events
    .filter((e) => e.date <= today())
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({ slug: e.slug, label: `${e.title} · ${longDate(e.date)}` }));
  return (
    <AdminShell base={base} current="/attendance">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Events and Programming</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Attendance</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        See who comes most, from the check-ins on Luma, so regulars can be given priority when you approve tickets.
        After each event, open it on Luma, go to <strong>Guests</strong>, choose <strong>Download as CSV</strong>, and
        upload the file here. Only the people who were checked in are kept, with their name and email. Records are
        deleted automatically after two years.
      </p>
      <div className="mt-8">
        <AttendanceAdmin base={base} initial={data} settings={settings} events={past} />
      </div>
    </AdminShell>
  );
}

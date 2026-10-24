import AdminShell from "@/components/voting/admin_shell";
import CommitteeCalendar from "@/components/voting/committee_calendar";
import { requireAdmin } from "@/lib/admin_page";
import { getAdmin } from "@/lib/admin_auth";
import { listItems, combine, isExec } from "@/lib/committee_calendar";
import { listTasks } from "@/lib/tasks";
import { getTeam } from "@/lib/team";
import { getEvents } from "@/lib/sheet";
import { DEPARTMENTS, departmentsOf, rowsFor } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Committee calendar · Admin" };

export default async function CommitteeCalendarPage() {
  const base = await requireAdmin("dashboard");
  const admin = await getAdmin();
  const [items, tasks, events, { team }] = await Promise.all([listItems(), listTasks().catch(() => []), getEvents().catch(() => []), getTeam()]);
  const me = {
    id: admin.id,
    names: [...new Set([admin.name, ...rowsFor(admin, team).map((p) => p.name)])],
    depts: departmentsOf(admin, team),
  };
  return (
    <AdminShell base={base} current="/committee-calendar" wide>
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">The committee</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Committee calendar</h1>
      <p className="mt-3 max-w-3xl text-white/70">
        Meetings, room bookings and deadlines for the committee, alongside every task deadline and debate. Anyone can add
        something; people you invite get a notification. This calendar is private to the committee: the public term
        card is under Debates → Calendar.
      </p>
      <div className="mt-6">
        <CommitteeCalendar
          base={base}
          initial={combine({ items, tasks, events })}
          departments={DEPARTMENTS}
          teamNames={[...new Set(team.map((p) => p.name))].sort((a, b) => a.localeCompare(b))}
          me={me}
          exec={isExec(admin)}
          canSubscribe={!admin.shared}
        />
      </div>
    </AdminShell>
  );
}

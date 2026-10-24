import AdminShell from "@/components/voting/admin_shell";
import TaskBoard from "@/components/voting/task_board";
import TeamDirectory from "@/components/voting/team_directory";
import { requireAdmin } from "@/lib/admin_page";
import { getAdmin } from "@/lib/admin_auth";
import { listPeople } from "@/lib/admin_accounts";
import { contactsFor, rowsFor, sameName, DEPARTMENTS, TEAM_DEPARTMENT } from "@/lib/dashboard";
import { dashboardData, isExec } from "@/lib/tasks";
import { TEAM_DEPARTMENTS } from "@/lib/team";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Admin" };

const eyebrow = "text-xs uppercase tracking-widest text-[#d4af37]";
const sans = "[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]";

export default async function DashboardPage() {
  const base = await requireAdmin("dashboard");
  const admin = await getAdmin();
  const { tasks, team: fullTeam, leaders, myDepts, teamError } = await dashboardData(admin);
  const exec = isExec(admin);
  // Contact details for other departments are removed here, on the server.
  const team = contactsFor(admin, fullTeam);
  const me = rowsFor(admin, fullTeam);
  const myNames = [...new Set([admin.name, ...me.map((p) => p.name)])];
  // The Executive starts on every department; everyone else on their own.
  const homeDept = exec ? "all" : admin.teams.map((t) => TEAM_DEPARTMENT[t]).find(Boolean) || myDepts.find((d) => DEPARTMENTS.includes(d)) || "all";

  // For the Executive: anyone who doesn't line up between admin and the team directory.
  const logins = exec ? await listPeople().catch(() => []) : [];
  const loginsMissing = fullTeam.length ? logins.filter((p) => !p.disabled && !rowsFor({ ...p, teams: [] }, fullTeam).length).map((p) => p.name) : [];
  const ownersMissing = fullTeam.length
    ? [...new Set(tasks.filter((t) => t.status !== "complete").flatMap((t) => [t.owner, t.supervisor]).flatMap((n) => String(n || "").split(",")).map((n) => n.trim()).filter(Boolean))].filter(
        (o) => !fullTeam.some((p) => sameName(p.name, o))
      )
    : [];

  const contactNote = exec
    ? "You can see everyone’s contact details. Other committee members only see the details of people in their own department."
    : myDepts.length
      ? `You can see contact details for ${new Intl.ListFormat("en-GB").format(myDepts)}. You can edit your own number and email.`
      : "Contact details show for people in your own department. Ask the Executive to add you to the team directory.";

  return (
    <AdminShell base={base} current="/dashboard" wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>The committee</p>
          <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Dashboard</h1>
        </div>
        <a href="#team" className="text-sm text-white/70 underline underline-offset-4 hover:text-white">Team directory ↓</a>
      </div>

      {exec && (loginsMissing.length > 0 || ownersMissing.length > 0) && (
        <details className={`mt-4 max-w-4xl border border-[#d4af37]/40 bg-[#2a0101] px-4 py-2 text-sm text-white/80 ${sans}`}>
          <summary className="cursor-pointer py-1 font-semibold text-white">Names that don’t line up with the team directory</summary>
          {loginsMissing.length > 0 && (
            <p className="mt-2">Admin logins not in the team directory: {loginsMissing.join(", ")}. Add them below (with the same name or email) so they get their department’s tasks and contacts.</p>
          )}
          {ownersMissing.length > 0 && <p className="mt-2">Owners or supervisors not in the team directory: {ownersMissing.join(", ")}.</p>}
          <p className="mt-2 pb-1 text-white/60">Only the Executive and super admins see this.</p>
        </details>
      )}
      {teamError && (
        <p role="alert" className={`mt-4 max-w-3xl border border-[#f3c4c4] p-3 text-sm text-[#f3c4c4] ${sans}`}>{teamError}</p>
      )}

      <div className="mt-6">
        <TaskBoard
          base={base}
          initial={{ tasks, leaders, myDepts, exec }}
          departments={DEPARTMENTS}
          homeDept={homeDept}
          myNames={myNames}
          teamNames={[...new Set(fullTeam.map((p) => p.name))]}
        />
      </div>

      <section id="team" className="mt-16 scroll-mt-6" aria-labelledby="team-heading">
        <h2 id="team-heading" className="title mb-4 text-2xl sm:text-3xl font-bold">Team directory</h2>
        <TeamDirectory base={base} initial={team} departments={TEAM_DEPARTMENTS} exec={exec} myIds={me.map((p) => p.id)} note={contactNote} />
      </section>
    </AdminShell>
  );
}

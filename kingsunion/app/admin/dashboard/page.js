import AdminShell from "@/components/voting/admin_shell";
import TaskBoard from "@/components/voting/task_board";
import { requireAdmin } from "@/lib/admin_page";
import { getAdmin } from "@/lib/admin_auth";
import { listPeople } from "@/lib/admin_accounts";
import { contactsFor, rowsFor, sameName, whatsapp, DEPARTMENTS, TEAM_DEPARTMENT } from "@/lib/dashboard";
import { dashboardData, isExec } from "@/lib/tasks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Admin" };

const eyebrow = "text-xs uppercase tracking-widest text-[#d4af37]";

export default async function DashboardPage() {
  const base = await requireAdmin("dashboard");
  const admin = await getAdmin();
  const { tasks, team: fullTeam, leaders, myDepts, teamError } = await dashboardData(admin);
  const team = contactsFor(admin, fullTeam);
  const seesAll = isExec(admin);
  const me = rowsFor(admin, fullTeam);
  const myNames = [...new Set([admin.name, ...me.map((p) => p.name)])];
  // The Executive starts on every department; everyone else on their own.
  const homeDept = seesAll ? "all" : admin.teams.map((t) => TEAM_DEPARTMENT[t]).find(Boolean) || myDepts.find((d) => DEPARTMENTS.includes(d)) || "all";

  // For the Executive: anyone who doesn't line up between admin and the sheet.
  const logins = seesAll ? await listPeople().catch(() => []) : [];
  const loginsNotInSheet = fullTeam.length ? logins.filter((p) => !p.disabled && !rowsFor({ ...p, teams: [] }, fullTeam).length).map((p) => p.name) : [];
  const ownersNotInSheet = fullTeam.length
    ? [...new Set(tasks.filter((t) => t.status !== "complete").flatMap((t) => [t.owner, t.supervisor]).flatMap((n) => String(n || "").split(",")).map((n) => n.trim()).filter(Boolean))].filter(
        (o) => !fullTeam.some((p) => sameName(p.name, o))
      )
    : [];

  // Departments in the sheet's tab order, then any others (e.g. Technology).
  const groups = [...new Set([...DEPARTMENTS, ...team.flatMap((p) => p.departments)])];
  // Most senior first in each department, going by the roles in the sheet. A
  // role naming another department ("Director of Finance") doesn't count here.
  const RANKS = ["president", "vice president", "chief of staff", "deputy chief of staff", "director", "editor-in-chief", "deic", "deputy", "head", "manager", "bursar", "officer", "associate"];
  const rankOf = (part) => {
    const r = part.toLowerCase();
    if (r.includes("deputy chief of staff")) return RANKS.indexOf("deputy chief of staff");
    const i = RANKS.findIndex((k) => (k === "president" ? /^president\b/.test(r) : r.includes(k)));
    return i < 0 ? RANKS.length : i;
  };
  const rankIn = (p, d) => {
    const parts = String(p.role || "").split(",").map((x) => x.trim()).filter(Boolean);
    const here = parts.filter((x) => !groups.some((g) => g !== d && x.toLowerCase().includes(g.toLowerCase())));
    return Math.min(RANKS.length, ...(here.length ? here : parts).map(rankOf));
  };
  const byRank = (people, d) => people.map((p, i) => [p, i]).sort((a, b) => rankIn(a[0], d) - rankIn(b[0], d) || a[1] - b[1]).map(([p]) => p);
  const byDept = groups.map((d) => ({ d, people: byRank(team.filter((p) => p.departments.includes(d)), d) })).filter((g) => g.people.length);
  const elsewhere = team.filter((p) => !p.departments.length);

  return (
    <AdminShell base={base} current="/dashboard" wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>The committee</p>
          <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Dashboard</h1>
        </div>
        <a href="#team" className="text-sm text-white/70 underline underline-offset-4 hover:text-white">Team directory ↓</a>
      </div>

      {seesAll && (loginsNotInSheet.length > 0 || ownersNotInSheet.length > 0) && (
        <details className="mt-4 max-w-4xl border border-[#d4af37]/40 bg-[#2a0101] px-4 py-2 [font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-sm text-white/80">
          <summary className="cursor-pointer py-1 font-semibold text-white">Names that don’t line up with Team Structure</summary>
          {loginsNotInSheet.length > 0 && (
            <p className="mt-2">Admin logins not in Team Structure: {loginsNotInSheet.join(", ")}. Add them to the sheet (or match the name or email) so they get their department’s tasks and contacts.</p>
          )}
          {ownersNotInSheet.length > 0 && <p className="mt-2">Owners or supervisors not in Team Structure: {ownersNotInSheet.join(", ")}.</p>}
          <p className="mt-2 pb-1 text-white/55">Only the Executive and super admins see this.</p>
        </details>
      )}
      {teamError && (
        <p role="alert" className="mt-4 max-w-3xl border border-[#f3c4c4] p-3 [font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-sm text-[#f3c4c4]">
          Team Structure couldn’t be read from the dashboard sheet ({teamError}) so the owner lists and team directory may be incomplete.
        </p>
      )}

      <div className="mt-6">
        <TaskBoard
          base={base}
          initial={{ tasks, leaders, myDepts, exec: seesAll }}
          departments={DEPARTMENTS}
          homeDept={homeDept}
          myNames={myNames}
          teamNames={[...new Set(fullTeam.map((p) => p.name))]}
        />
      </div>

      {team.length > 0 && (
        <section id="team" className="mt-16 max-w-6xl scroll-mt-6" aria-labelledby="team-heading">
          <h2 id="team-heading" className="title text-2xl sm:text-3xl font-bold">Team directory</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            {seesAll
              ? "You can see everyone’s contact details. Other committee members only see the details of people in their own department."
              : myDepts.length
                ? `You can see contact details for ${new Intl.ListFormat("en-GB").format(myDepts)}. For anyone else, ask in the committee group chat.`
                : "Contact details show for people in your own department. Ask the Executive to add you to Team Structure in the sheet."}
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[...byDept, ...(elsewhere.length ? [{ d: "Other roles", people: elsewhere }] : [])].map(({ d, people }) => (
              <div key={d}>
                <h3 className={eyebrow}>{d}</h3>
                <ul className="mt-2">
                  {people.map((p, i) => (
                    <li key={`${p.name}-${i}`} className="border-t border-[#d4af37]/25 py-2">
                      <span className="font-bold">{p.name}</span>
                      {(p.role || p.unit) && (
                        <span className="block text-sm text-white/65">{[p.role, p.unit].filter(Boolean).join(" · ")}</span>
                      )}
                      {(p.whatsapp || p.email) && (
                        <span className="mt-0.5 flex flex-wrap gap-x-4 text-sm">
                          {(() => {
                            const w = whatsapp(p.whatsapp);
                            return w ? (
                              w.href ? (
                                <a href={w.href} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline underline-offset-4 hover:text-white tabular-nums">
                                  {w.text}
                                </a>
                              ) : (
                                <span className="tabular-nums">{w.text}</span>
                              )
                            ) : null;
                          })()}
                          {p.email && (
                            <a href={`mailto:${p.email}`} className="text-[#d4af37] underline underline-offset-4 hover:text-white [overflow-wrap:anywhere]">
                              {p.email}
                            </a>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </AdminShell>
  );
}

import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { getAdmin } from "@/lib/admin_auth";
import { listPeople } from "@/lib/admin_accounts";
import { getDashboard, isOwner, contactsFor, departmentsOf, rowsFor, sameName, whatsapp, DEPARTMENTS, TEAM_DEPARTMENT, DASHBOARD_SHEET_ID } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Admin" };

const STATUS = {
  overdue: { label: "Overdue", cls: "bg-[#f3c4c4] text-[#3d0202]" },
  unassigned: { label: "Needs assigning", cls: "bg-[#d4af37] text-[#3d0202]" },
  doing: { label: "In progress", cls: "border border-white/50 text-white" },
  todo: { label: "Not started", cls: "border border-white/30 text-white/70" },
  done: { label: "Complete", cls: "text-white/55" },
};
const ORDER = ["overdue", "unassigned", "doing", "todo", "done"];

const eyebrow = "text-xs uppercase tracking-widest text-[#d4af37]";
const tab = (on) =>
  `inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm ${
    on ? "border-[#d4af37] text-white font-bold" : "border-transparent text-white/65 hover:text-white"
  }`;

function when(deadline) {
  if (!deadline) return "";
  const d = new Date(`${deadline.date}T12:00:00Z`);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return deadline.time ? `${day}, ${deadline.time}` : day;
}

function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) =>
      ORDER.indexOf(a.status) - ORDER.indexOf(b.status) ||
      (a.status === "done"
        ? String(b.deadline?.date || "").localeCompare(String(a.deadline?.date || ""))
        : String(a.deadline?.date || "9999").localeCompare(String(b.deadline?.date || "9999")))
  );
}

function Task({ t, showDept }) {
  const s = STATUS[t.status];
  return (
    <li className="border-t border-[#d4af37]/30 py-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-6">
      <div className="min-w-0">
        <p className={`leading-snug ${t.status === "done" ? "text-white/60" : "font-bold"}`}>{t.description}</p>
        <p className="mt-1 text-sm text-white/65">
          {[showDept ? t.department : "", t.unit, t.id].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 text-sm text-white/80">
          {t.owners.length ? t.owners.join(", ") : <span className="text-white/55">No owner yet</span>}
          {t.supervisor && <span className="text-white/55"> · supervised by {t.supervisor}</span>}
        </p>
        {(t.link || t.deliverable) && (
          <p className="mt-1 text-sm">
            {t.link ? (
              <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline underline-offset-4 hover:text-white [overflow-wrap:anywhere]">
                Deliverable
              </a>
            ) : (
              <span className="text-white/70">Deliverable: {t.deliverable}</span>
            )}
          </p>
        )}
        {t.comments && <p className="mt-1 text-sm text-white/60">{t.comments}</p>}
      </div>
      <div className="flex sm:flex-col sm:items-end gap-2 sm:gap-1 text-sm">
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${s.cls}`}>{s.label}</span>
        {t.deadline && <span className={`tabular-nums ${t.status !== "done" && t.late ? "text-[#f3c4c4]" : "text-white/70"}`}>{when(t.deadline)}</span>}
      </div>
    </li>
  );
}

function TaskList({ tasks, showDept, empty }) {
  if (!tasks.length) return <p className="mt-4 text-white/65">{empty}</p>;
  return (
    <ul className="mt-2">
      {sortTasks(tasks).map((t) => (
        <Task key={`${t.department}-${t.id}-${t.description}`} t={t} showDept={showDept} />
      ))}
    </ul>
  );
}

export default async function DashboardPage({ searchParams }) {
  const base = await requireAdmin("dashboard");
  const admin = await getAdmin();
  const sp = await searchParams;
  const { departments, team: fullTeam, errors } = await getDashboard();
  const team = contactsFor(admin, fullTeam);
  const seesAll = admin.teams.includes("executive") || admin.teams.includes("super");
  const myDepts = departmentsOf(admin, fullTeam);
  const me = rowsFor(admin, fullTeam);
  const myNames = [...new Set([admin.name, ...me.map((p) => p.name)])];

  // For the Executive: anyone who doesn't line up between admin and the sheet.
  const logins = seesAll ? await listPeople().catch(() => []) : [];
  const loginsNotInSheet = logins.filter((p) => !p.disabled && !rowsFor({ ...p, teams: [] }, fullTeam).length).map((p) => p.name);
  const ownersNotInSheet = fullTeam.length
    ? [...new Set(departments.flatMap((d) => d.tasks.flatMap((t) => t.owners)))].filter((o) => !fullTeam.some((p) => sameName(p.name, o)))
    : [];
  const all = departments.flatMap((d) => d.tasks);

  const home = admin.teams.map((t) => TEAM_DEPARTMENT[t]).find(Boolean) || "all";
  const dept = sp?.dept === "all" || DEPARTMENTS.includes(sp?.dept) ? sp.dept : home;
  const showDone = sp?.done === "1";
  const inDept = dept === "all" ? all : all.filter((t) => t.department === dept);
  const shown = showDone ? inDept : inDept.filter((t) => t.status !== "done");
  const mine = all.filter((t) => t.status !== "done" && isOwner(t, myNames));

  const count = (s) => all.filter((t) => t.status === s).length;
  const href = (d, done = showDone) => `${base}/dashboard?dept=${encodeURIComponent(d)}${done ? "&done=1" : ""}`;
  const doneHere = inDept.length - inDept.filter((t) => t.status !== "done").length;

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
    <AdminShell base={base} current="/dashboard">
      <p className={eyebrow}>The committee</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Every department’s tasks, from the committee dashboard sheet. To add or update a task, edit the{" "}
        <a
          href={`https://docs.google.com/spreadsheets/d/${DASHBOARD_SHEET_ID}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#d4af37] underline underline-offset-4 hover:text-white"
        >
          sheet
        </a>
        . Changes show here within two minutes. A task is marked overdue once its deadline has passed and it isn’t complete.
      </p>

      {errors.length > 0 && (
        <p role="alert" className="mt-6 max-w-2xl border border-[#f3c4c4] p-4 text-[#f3c4c4]">
          Some of the sheet couldn’t be read: {errors.join(" ")}
        </p>
      )}

      {seesAll && (loginsNotInSheet.length > 0 || ownersNotInSheet.length > 0) && (
        <div className="mt-6 max-w-3xl border border-[#d4af37]/60 bg-[#2a0101] p-4 text-sm text-white/80">
          <p className="font-bold text-white">Names that don’t line up</p>
          {loginsNotInSheet.length > 0 && (
            <p className="mt-2">
              Admin logins not in Team Structure: {loginsNotInSheet.join(", ")}. Add them to the sheet (or match the name or
              email) so they get their department’s contacts and their own tasks.
            </p>
          )}
          {ownersNotInSheet.length > 0 && (
            <p className="mt-2">Task owners not in Team Structure: {ownersNotInSheet.join(", ")}. Check the spelling in Owner/s.</p>
          )}
          <p className="mt-2 text-white/60">Only the Executive and super admins see this.</p>
        </div>
      )}

      {!seesAll && !admin.shared && me.length === 0 && fullTeam.length > 0 && (
        <p className="mt-6 max-w-2xl text-sm text-white/70">
          We couldn’t find “{admin.name}” in Team Structure, so only your admin team’s contacts are shown. Ask the
          Executive to add you to the sheet with the same name or email.
        </p>
      )}

      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
        {[
          ["Overdue", count("overdue")],
          ["Needs assigning", count("unassigned")],
          ["In progress", count("doing") + count("todo")],
          ["Complete", count("done")],
        ].map(([label, n]) => (
          <div key={label} className="border border-[#d4af37]/60 bg-[#2a0101] p-4">
            <dt className="text-xs uppercase tracking-widest text-[#d4af37]">{label}</dt>
            <dd className="title mt-1 text-3xl font-bold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12" aria-labelledby="mine">
        <h2 id="mine" className="title text-2xl sm:text-3xl font-bold">Your tasks</h2>
        <TaskList
          tasks={mine}
          showDept
          empty={`Nothing open with your name on it. Tasks show here when your name is in the Owner/s column.`}
        />
      </section>

      <section className="mt-12" aria-labelledby="tasks">
        <h2 id="tasks" className="title text-2xl sm:text-3xl font-bold">Tasks by department</h2>
        <nav aria-label="Departments" className="mt-4 flex gap-1 overflow-x-auto border-b border-[#d4af37]/40">
          {[...DEPARTMENTS, "all"].map((d) => {
            const open = (d === "all" ? all : all.filter((t) => t.department === d)).filter((t) => t.status !== "done").length;
            return (
              <a key={d} href={href(d)} aria-current={dept === d ? "page" : undefined} className={tab(dept === d)}>
                {d === "all" ? "All" : d}
                <span className="ml-1.5 text-white/55 tabular-nums">{open}</span>
              </a>
            );
          })}
        </nav>
        <TaskList
          tasks={shown}
          showDept={dept === "all"}
          empty={showDone || !doneHere ? "No tasks in the sheet yet." : "Nothing open. Everything here is complete."}
        />
        {doneHere > 0 && (
          <p className="mt-4">
            <a href={href(dept, !showDone)} className="text-sm text-[#d4af37] underline underline-offset-4 hover:text-white">
              {showDone ? "Hide completed tasks" : `Show ${doneHere} completed`}
            </a>
          </p>
        )}
      </section>

      {team.length > 0 && (
        <section className="mt-14" aria-labelledby="team">
          <h2 id="team" className="title text-2xl sm:text-3xl font-bold">Who’s who</h2>
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

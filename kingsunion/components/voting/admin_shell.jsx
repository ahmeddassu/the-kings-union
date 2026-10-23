// Header and frame for the admin pages. Shows only the sections the signed-in
// person's team can use.
import { getAdmin } from "@/lib/admin_auth";

const sections = [
  ["", "Debates", ["debates"]],
  ["/dashboard", "Dashboard", ["dashboard"]],
  ["/results", "Result cards", ["results"]],
  ["/calendar", "Calendar", ["calendar"]],
  ["/motions", "Motions", ["motions"]],
  ["/messages", "Messages", ["messages", "kingsway"]],
  ["/alerts", "Ticket alerts", ["alerts"]],
  ["/applications", "Speaker applications", ["applications"]],
  ["/speaker-pack", "Speaker pack", ["speakers"]],
  ["/past-speakers", "Past speakers", ["guests"]],
  ["/attendance", "Attendance", ["attendance"]],
  ["/feedback", "Feedback", ["feedback"]],
  ["/friends", "Friends", ["friends"]],
  ["/posters", "Poster QR codes", ["posters"]],
  ["/sponsors", "Sponsors", ["sponsors"]],
  ["/stats", "Visitor stats", ["stats"]],
  ["/backups", "Backups", ["backups"]],
  ["/status", "Status", ["status"]],
  ["/people", "People", ["people"]],
  ["/activity", "Activity", ["activity"]],
];

export default async function AdminShell({ base, children, wide = false, current = "" }) {
  const admin = await getAdmin();
  const visible = sections.filter(([, , need]) => need.some((s) => admin?.can(s)));
  return (
    <>
      <header className="border-b border-[#d4af37]/60">
        <div className="px-4 sm:px-6 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <a href={base || "/"} className="inline-flex items-center gap-3 min-h-11">
            <img src="/crest-gold.png" alt="" className="h-9 w-auto" />
            <span className="title text-lg sm:text-xl font-bold">
              <em>the</em> King’s Union <span className="font-normal text-[#d4af37]">· Admin</span>
            </span>
          </a>
          <div className="flex flex-wrap items-center gap-2">
            {admin && (
              <span className="text-sm text-white/70 text-right leading-tight">
                {admin.name}
                <span className="block text-xs text-[#d4af37]">{admin.teamLabel}</span>
              </span>
            )}
            {admin?.can("debates") && (
              <a
                href={`${base}/debates/new`}
                className="inline-flex min-h-11 items-center bg-[#d4af37] px-4 text-sm font-bold text-[#3d0202] hover:bg-white"
              >
                + New debate
              </a>
            )}
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="min-h-11 px-3 text-sm text-white/70 hover:text-white underline underline-offset-4">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin sections" className="px-4 sm:px-6 md:px-8 flex gap-1 overflow-x-auto">
          {visible.map(([path, name]) => (
            <a
              key={name}
              href={`${base}${path}` || "/"}
              aria-current={current === path ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm ${
                current === path ? "border-[#d4af37] text-white font-bold" : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              {name}
            </a>
          ))}
        </nav>
      </header>
      {admin?.shared && (
        <p className="border-b border-[#d4af37]/30 bg-[#2a0101] px-4 sm:px-6 md:px-8 py-2 text-sm text-white/75">
          You’re using the shared committee password. Give everyone their own login under{" "}
          <a href={`${base}/people`} className="underline underline-offset-4 hover:text-white">People</a>, then switch the shared password off.
        </p>
      )}
      <main className={`flex-1 w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12 ${wide ? "" : "max-w-6xl mx-auto"}`}>{children}</main>
    </>
  );
}

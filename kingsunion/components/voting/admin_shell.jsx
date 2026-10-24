// Header and frame for the admin pages. Shows only the sections the signed-in
// person's team can use.
import { getAdmin } from "@/lib/admin_auth";
import AdminNav from "@/components/voting/admin_nav";

// Grouped into menus. Each entry: [path, name, sections that can see it].
const groups = [
  { label: "Dashboard", items: [["/dashboard", "Dashboard", ["dashboard"]]] },
  {
    label: "Debates",
    items: [
      ["", "Debates", ["debates"]],
      ["/calendar", "Calendar", ["calendar"]],
      ["/results", "Result cards", ["results"]],
      ["/door", "Door check-in", ["attendance"]],
      ["/attendance", "Attendance", ["attendance"]],
      ["/feedback", "Feedback", ["feedback"]],
      ["/motions", "Motions", ["motions"]],
    ],
  },
  {
    label: "Speakers",
    items: [
      ["/applications", "Speaker applications", ["applications"]],
      ["/speaker-pack", "Speaker pack", ["speakers"]],
      ["/past-speakers", "Past speakers", ["guests"]],
    ],
  },
  {
    label: "Outreach",
    items: [
      ["/messages", "Messages", ["messages", "kingsway"]],
      ["/alerts", "Ticket alerts", ["alerts"]],
      ["/friends", "Friends", ["friends"]],
      ["/posters", "Poster QR codes", ["posters"]],
      ["/sponsors", "Sponsors", ["sponsors"]],
    ],
  },
  {
    label: "Committee",
    items: [
      ["/organigram", "Organigram", ["organigram"]],
      ["/people", "People", ["people"]],
      ["/activity", "Activity", ["activity"]],
    ],
  },
  {
    label: "Website",
    items: [
      ["/stats", "Visitor stats", ["stats"]],
      ["/status", "Status", ["status"]],
      ["/backups", "Backups", ["backups"]],
    ],
  },
];

export default async function AdminShell({ base, children, wide = false, current = "" }) {
  const admin = await getAdmin();
  const visible = groups
    .map((g) => ({ label: g.label, items: g.items.filter(([, , need]) => need.some((s) => admin?.can(s))).map(([path, name]) => [path, name]) }))
    .filter((g) => g.items.length);
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
        <AdminNav base={base} groups={visible} current={current} />
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

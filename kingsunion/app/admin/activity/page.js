import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { listActions } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity · Admin" };

const when = (t) =>
  new Date(t).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ActivityPage({ searchParams }) {
  const base = await requireAdmin("activity");
  const q = (await searchParams) || {};
  const all = await listActions(1000);
  const people = [...new Set(all.map((a) => a.by))].sort();
  const shown = q.by ? all.filter((a) => a.by === q.by) : all;
  return (
    <AdminShell base={base} current="/activity">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Executive only</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Activity</h1>
      <p className="mt-3 max-w-2xl text-white/70">Who did what in admin, newest first. The last 2,000 actions are kept.</p>
      {people.length > 1 && (
        <nav aria-label="Filter by person" className="mt-6 flex flex-wrap gap-2 text-sm">
          {[["", "Everyone"], ...people.map((p) => [p, p])].map(([v, label]) => (
            <a
              key={label}
              href={`${base}/activity${v ? `?by=${encodeURIComponent(v)}` : ""}`}
              aria-current={(q.by || "") === v ? "page" : undefined}
              className={`inline-flex min-h-10 items-center border px-3 ${(q.by || "") === v ? "border-[#d4af37] bg-[#d4af37] text-[#3d0202] font-bold" : "border-[#d4af37]/50 hover:bg-white/10"}`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
      {shown.length === 0 ? (
        <p className="mt-8 border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">Nothing yet.</p>
      ) : (
        <ol className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {shown.map((a, i) => (
            <li key={i} className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-6 gap-y-1 py-3">
              <p className="text-sm text-white/55 tabular-nums">{when(a.at)}</p>
              <p>
                <strong>{a.by}</strong> <span className="text-sm text-[#d4af37]">{a.teamLabel}</span>
                <span className="block text-white/85">{a.action}</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </AdminShell>
  );
}

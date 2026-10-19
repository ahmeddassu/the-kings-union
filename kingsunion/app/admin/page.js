import AdminShell from "@/components/voting/admin_shell";
import AdminLogin from "@/components/voting/admin_login";
import StatusBadge from "@/components/voting/status_badge";
import { isAdmin } from "@/lib/admin_auth";
import { basePath } from "@/lib/hosts";
import { storeConfigured } from "@/lib/store";
import { listDebates, getCounts } from "@/lib/voting";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }) {
  const { error } = (await searchParams) || {};
  if (!storeConfigured) return <AdminLogin error="setup" />;
  if (!(await isAdmin())) return <AdminLogin error={error} />;

  const base = await basePath("admin");
  const debates = await listDebates();
  const counts = await Promise.all(debates.map((d) => getCounts(d.id)));

  return (
    <AdminShell base={base} current="">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#d4af37]">Live voting</p>
          <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Debates</h1>
        </div>
        <a href={`${base}/debates/new`} className="inline-flex min-h-12 items-center bg-[#d4af37] px-6 text-base font-bold text-[#3d0202] hover:bg-white">
          + Add a debate
        </a>
      </div>

      {debates.length === 0 ? (
        <div className="mt-10 border border-dashed border-[#d4af37]/70 px-6 py-14 text-center">
          <p className="title text-2xl font-bold">No debates yet.</p>
          <p className="mt-2 text-white/70">Add one to get its voting code and QR code.</p>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {debates.map((d, i) => (
            <li key={d.id}>
              <a
                href={`${base}/debates/${d.id}`}
                className="group flex h-full flex-col border border-[#d4af37]/70 p-5 hover:border-[#d4af37] hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={d.status} />
                  <span className="title text-xl font-bold tracking-[0.2em] text-[#d4af37] tabular-nums">{d.code}</span>
                </div>
                <p className="title mt-4 text-xl sm:text-2xl font-bold leading-snug group-hover:text-[#d4af37]">“{d.title}”</p>
                <p className="mt-2 text-sm text-white/60">
                  {d.date ? longDate(d.date) : "No date"}
                  {d.time ? `, ${d.time}` : ""}
                  {d.venue ? ` · ${d.venue}` : ""}
                </p>
                <p className="mt-auto pt-4 text-sm text-white/80 tabular-nums">
                  Ayes {counts[i].aye} · Noes {counts[i].no}
                  {d.published && <span className="ml-2 text-[#d4af37]">· On the website</span>}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

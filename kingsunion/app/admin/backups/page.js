import AdminShell from "@/components/voting/admin_shell";
import BackupsAdmin from "@/components/voting/backups_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listBackups, blobConfigured, KEEP } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Backups · Admin" };

export default async function BackupsPage() {
  const base = await requireAdmin();
  const ready = blobConfigured();
  const backups = ready ? await listBackups().catch(() => []) : [];
  return (
    <AdminShell base={base} current="/backups">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Safety net</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Backups</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        A copy of everything in the database: debates and votes, results, the calendar, motions, messages, speaker
        applications, ticket alerts and visitor stats. {ready ? `Made automatically every night; the last ${KEEP} are kept.` : ""}
      </p>
      <div className="mt-8">
        <BackupsAdmin base={base} ready={ready} initial={backups} keep={KEEP} />
      </div>
    </AdminShell>
  );
}

import AdminShell from "@/components/voting/admin_shell";
import AlertsAdmin from "@/components/voting/alerts_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listAlerts } from "@/lib/inbox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ticket alerts · Admin" };

export default async function AlertsPage() {
  const base = await requireAdmin();
  const alerts = await listAlerts();
  return (
    <AdminShell base={base} current="/alerts">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">From the website</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Ticket alerts</h1>
      <p className="mt-3 max-w-2xl text-white/70">People who asked to be emailed when tickets go on sale.</p>
      <div className="mt-8">
        <AlertsAdmin base={base} initial={alerts} />
      </div>
    </AdminShell>
  );
}

import AdminShell from "@/components/voting/admin_shell";
import ApplicationsAdmin from "@/components/voting/applications_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listApplications } from "@/lib/submissions";
import { upcomingDebates } from "@/lib/upcoming";

export const dynamic = "force-dynamic";
export const metadata = { title: "Speaker applications · Admin" };

export default async function ApplicationsAdminPage() {
  const base = await requireAdmin("applications");
  const [applications, debates] = await Promise.all([listApplications(), upcomingDebates().catch(() => [])]);

  return (
    <AdminShell base={base} current="/applications">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">From the website</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Speaker applications</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Students who applied to speak. Shortlist the ones you want and email them; the site doesn’t contact
        applicants itself.
      </p>
      <div className="mt-8">
        <ApplicationsAdmin base={base} initial={applications} debates={debates.map((d) => ({ slug: d.slug, title: d.title }))} />
      </div>
    </AdminShell>
  );
}

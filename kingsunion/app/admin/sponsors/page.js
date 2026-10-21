import AdminShell from "@/components/voting/admin_shell";
import SponsorsAdmin from "@/components/voting/sponsors_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listSponsors, TIERS } from "@/lib/sponsors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sponsors · Admin" };

export default async function SponsorsPage() {
  const base = await requireAdmin("sponsors");
  const sponsors = await listSponsors();
  return (
    <AdminShell base={base} current="/sponsors">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Finance</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Sponsors</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        The sponsors and partners on the Support page, the homepage and the Press page. Changes show on the website
        within a minute. The first one in the list is shown large as the lead partner.
      </p>
      <div className="mt-8">
        <SponsorsAdmin base={base} initial={sponsors} tiers={TIERS} />
      </div>
    </AdminShell>
  );
}

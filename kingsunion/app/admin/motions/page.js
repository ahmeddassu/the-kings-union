import AdminShell from "@/components/voting/admin_shell";
import MotionsAdmin from "@/components/voting/motions_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listMotions } from "@/lib/submissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Motions · Admin" };

export default async function MotionsAdminPage() {
  const base = await requireAdmin("motions");
  const motions = await listMotions();

  return (
    <AdminShell base={base} current="/motions">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">From the website</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Motion suggestions</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Suggestions from the “Suggest a motion” form. Put the good ones on the website so people can back them,
        archive the rest.
      </p>
      <div className="mt-8">
        <MotionsAdmin base={base} initial={motions} />
      </div>
    </AdminShell>
  );
}

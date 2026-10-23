import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { getAdmin } from "@/lib/admin_auth";
import { canEditOrganigram } from "@/lib/organigram";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organigram · Admin" };

// The chart itself is a self-contained page (public/organigram-app.html) shown
// in a frame; it loads its data from /api/admin/organigram with your sign-in.
export default async function OrganigramPage() {
  const base = await requireAdmin("organigram");
  const edit = canEditOrganigram(await getAdmin());
  return (
    <AdminShell base={base} current="/organigram" wide>
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Committee structure</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Organigram</h1>
      <p className="mt-3 max-w-3xl text-white/70">
        Who holds which role and who they report to.{" "}
        {edit
          ? "Click any card to edit it. Changes save as you type and everyone else sees them within a few seconds."
          : "Only the Executive can change it. Ask them if something is out of date."}
      </p>
      <iframe
        src="/organigram-app.html"
        title="Committee organigram"
        className="mt-6 block w-full border border-[#d4af37]/60 bg-[#f2f3f7]"
        style={{ height: "calc(100dvh - 140px)", minHeight: 640 }}
      />
    </AdminShell>
  );
}

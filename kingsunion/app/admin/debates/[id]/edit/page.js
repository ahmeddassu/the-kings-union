import { notFound } from "next/navigation";
import AdminShell from "@/components/voting/admin_shell";
import DebateForm from "@/components/voting/debate_form";
import { requireAdmin } from "@/lib/admin_page";
import { getDebate } from "@/lib/voting";

export const dynamic = "force-dynamic";

export default async function EditDebate({ params }) {
  const base = await requireAdmin();
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) notFound();
  return (
    <AdminShell base={base}>
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Edit debate · code {debate.code}</p>
      <h1 className="title mt-2 mb-8 text-4xl sm:text-5xl font-bold">Edit details</h1>
      <DebateForm base={base} debate={debate} />
    </AdminShell>
  );
}

import { notFound } from "next/navigation";
import AdminShell from "@/components/voting/admin_shell";
import ManageClient from "@/components/voting/manage_client";
import { requireAdmin } from "@/lib/admin_page";
import { getDebate, getCounts, getCountedVotes, votingLink } from "@/lib/voting";
import { qrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function ManageDebate({ params }) {
  const base = await requireAdmin("debates");
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) notFound();
  const counts = await getCounts(debate.id);
  const counted = await getCountedVotes(debate.id);

  return (
    <AdminShell base={base}>
      <a href={base || "/"} className="inline-flex min-h-11 items-center text-sm text-white/70 hover:text-white">
        ← All debates
      </a>
      <div className="mt-4">
        <ManageClient base={base} initial={{ debate, counts, counted }} qrSvg={await qrSvg(debate.code)} link={votingLink(debate.code)} />
      </div>
    </AdminShell>
  );
}

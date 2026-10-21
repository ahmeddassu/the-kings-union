import { notFound } from "next/navigation";
import ViewerClient from "@/components/voting/viewer_client";
import { requireAdmin } from "@/lib/admin_page";
import { getDebate, getCounts, VOTING_URL } from "@/lib/voting";
import { qrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";
export const metadata = { title: "Viewer · The King’s Union" };

export default async function Viewer({ params }) {
  const base = await requireAdmin("debates");
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) notFound();
  return (
    <ViewerClient
      base={base}
      initial={{ debate, counts: await getCounts(debate.id) }}
      qrSvg={await qrSvg(debate.code)}
      votingHost={VOTING_URL.replace(/^https?:\/\//, "")}
    />
  );
}

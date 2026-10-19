import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VoteHeader from "@/components/voting/vote_header";
import VoteClient from "@/components/voting/vote_client";
import { basePath } from "@/lib/hosts";
import { storeConfigured } from "@/lib/store";
import { getDebateByCode, getCounts, getBallot, publicView, isCode } from "@/lib/voting";

export const dynamic = "force-dynamic";

export default async function VotePage({ params }) {
  const { code } = await params;
  const base = await basePath("vote");
  const home = base || "/";

  if (!storeConfigured) {
    return (
      <>
        <VoteHeader home={home} />
        <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
          <p className="title text-2xl">Voting isn’t set up yet. Please ask a committee member.</p>
        </main>
      </>
    );
  }

  const debate = isCode(code) ? await getDebateByCode(code) : null;
  if (!debate) redirect(base ? `${base}?notfound=1` : "/?notfound=1");

  const voterId = (await cookies()).get("ku_voter")?.value;
  const choice = await getBallot(debate.id, voterId);
  const view = publicView(debate, await getCounts(debate.id));

  return (
    <>
      <VoteHeader home={home} />
      <VoteClient code={debate.code} initialView={view} initialChoice={choice} />
    </>
  );
}

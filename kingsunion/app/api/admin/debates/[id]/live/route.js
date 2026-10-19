// Admin: the debate with live vote numbers (always, even when hidden from voters).
import { isAdmin } from "@/lib/admin_auth";
import { getDebate, getCounts, getCountedVotes } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) return Response.json({ error: "That debate no longer exists." }, { status: 404 });
  return Response.json(
    { debate, counts: await getCounts(debate.id), counted: await getCountedVotes(debate.id) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

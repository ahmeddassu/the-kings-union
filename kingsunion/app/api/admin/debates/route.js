// Admin: create a debate.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { createDebate } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = await can("debates");
  if (!admin) return refuse();
  try {
    const debate = await createDebate(await request.json());
    await logAction(admin, `Added a debate: “${debate.title}”`);
    return Response.json({ debate });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't create the debate." }, { status: 400 });
  }
}

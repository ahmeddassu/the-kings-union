// Admin: create a debate.
import { isAdmin } from "@/lib/admin_auth";
import { createDebate } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const debate = await createDebate(await request.json());
    return Response.json({ debate });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't create the debate." }, { status: 400 });
  }
}

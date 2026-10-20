// Admin: how many people are on the site right now (last five minutes).
import { isAdmin } from "@/lib/admin_auth";
import { getLive } from "@/lib/visitor_stats";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  try {
    return Response.json(await getLive(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ count: 0, pages: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

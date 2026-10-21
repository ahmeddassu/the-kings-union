// Admin: how many people are on the site right now (last five minutes).
import { can, refuse } from "@/lib/admin_auth";
import { getLive } from "@/lib/visitor_stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await can("stats");
  if (!admin) return refuse();
  try {
    return Response.json(await getLive(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ count: 0, pages: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

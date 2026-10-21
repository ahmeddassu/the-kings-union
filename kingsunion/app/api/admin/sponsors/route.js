// Finance / Executive: sponsors. GET lists them; POST adds one.
import { can, refuse } from "@/lib/admin_auth";
import { listSponsors, addSponsor } from "@/lib/sponsors";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  return Response.json({ sponsors: await listSponsors() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  try {
    const sponsor = await addSponsor(await request.json().catch(() => ({})));
    await logAction(admin, `Added the sponsor ${sponsor.name} (${sponsor.tier})`);
    return Response.json({ sponsor });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

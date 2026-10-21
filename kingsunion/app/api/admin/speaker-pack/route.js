// Events and Programming: save the speaker pack text ({ sections: [{ title, body }] }).
import { can, refuse } from "@/lib/admin_auth";
import { savePack } from "@/lib/speaker_pack";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(request) {
  const admin = await can("speakers");
  if (!admin) return refuse();
  try {
    const pack = await savePack(await request.json().catch(() => ({})));
    await logAction(admin, "Edited the speaker pack");
    return Response.json({ pack });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

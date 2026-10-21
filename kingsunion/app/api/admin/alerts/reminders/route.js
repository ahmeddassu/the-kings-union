// Admin: switch the automatic day-before reminders on or off ({ on }).
import { can, refuse } from "@/lib/admin_auth";
import { setReminders } from "@/lib/reminders";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = await can("alerts");
  if (!admin) return refuse();
  const { on } = await request.json().catch(() => ({}));
  await setReminders(Boolean(on));
  await logAction(admin, `Switched automatic debate reminders ${on ? "on" : "off"}`);
  return Response.json({ on: Boolean(on) });
}

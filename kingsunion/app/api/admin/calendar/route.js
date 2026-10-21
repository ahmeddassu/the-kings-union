// Admin: add a calendar entry (POST).
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { createEntry } from "@/lib/calendar_entries";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = await can("calendar");
  if (!admin) return refuse();
  try {
    const entry = await createEntry(await request.json());
    await logAction(admin, `Added “${entry.title}” to the calendar (${entry.date})`);
    return Response.json({ entry });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

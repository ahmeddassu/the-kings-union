// Admin: add a calendar entry (POST).
import { isAdmin } from "@/lib/admin_auth";
import { createEntry } from "@/lib/calendar_entries";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const entry = await createEntry(await request.json());
    return Response.json({ entry });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

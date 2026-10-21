// Admin: edit (PUT) or delete (DELETE) a calendar entry.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { updateEntry, deleteEntry } from "@/lib/calendar_entries";

export const dynamic = "force-dynamic";

const missing = () => Response.json({ error: "That entry no longer exists." }, { status: 404 });

export async function PUT(request, { params }) {
  const admin = await can("calendar");
  if (!admin) return refuse();
  const { id } = await params;
  try {
    const entry = await updateEntry(id, await request.json());
    if (entry) await logAction(admin, `Edited “${entry.title}” in the calendar`);
    return entry ? Response.json({ entry }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("calendar");
  if (!admin) return refuse();
  const { id } = await params;
  if (!(await deleteEntry(id))) return missing();
  await logAction(admin, "Deleted a calendar entry");
  return Response.json({ ok: true });
}

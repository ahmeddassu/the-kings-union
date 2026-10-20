// Admin: edit (PUT) or delete (DELETE) a calendar entry.
import { isAdmin } from "@/lib/admin_auth";
import { updateEntry, deleteEntry } from "@/lib/calendar_entries";

export const dynamic = "force-dynamic";

const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });
const missing = () => Response.json({ error: "That entry no longer exists." }, { status: 404 });

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  try {
    const entry = await updateEntry(id, await request.json());
    return entry ? Response.json({ entry }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  return (await deleteEntry(id)) ? Response.json({ ok: true }) : missing();
}

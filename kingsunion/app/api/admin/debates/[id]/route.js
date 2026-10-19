// Admin: edit (PUT), act on (PATCH { action }) or delete (DELETE) one debate.
import { isAdmin } from "@/lib/admin_auth";
import { updateDetails, applyAction, deleteDebate } from "@/lib/voting";

export const dynamic = "force-dynamic";

const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });
const missing = () => Response.json({ error: "That debate no longer exists." }, { status: 404 });

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  try {
    const debate = await updateDetails(id, await request.json());
    return debate ? Response.json({ debate }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  const { action } = await request.json().catch(() => ({}));
  try {
    const debate = await applyAction(id, action);
    return debate ? Response.json({ debate }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  return (await deleteDebate(id)) ? Response.json({ ok: true }) : missing();
}

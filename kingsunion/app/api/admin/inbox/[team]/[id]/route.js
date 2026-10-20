// Admin: mark a message dealt with (PATCH { status }) or delete it.
import { isAdmin } from "@/lib/admin_auth";
import { setMessageStatus, deleteMessage, INBOXES } from "@/lib/inbox";

export const dynamic = "force-dynamic";

const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });
const missing = () => Response.json({ error: "That message no longer exists." }, { status: 404 });

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return denied();
  const { team, id } = await params;
  if (!INBOXES[team]) return missing();
  const { status } = await request.json().catch(() => ({}));
  try {
    const message = await setMessageStatus(team, id, status);
    return message ? Response.json({ message }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { team, id } = await params;
  if (!INBOXES[team]) return missing();
  return (await deleteMessage(team, id)) ? Response.json({ ok: true }) : missing();
}

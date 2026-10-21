// Admin: mark a message dealt with (PATCH { status }) or delete it.
import { can, refuse } from "@/lib/admin_auth";
import { setMessageStatus, deleteMessage, INBOXES } from "@/lib/inbox";

export const dynamic = "force-dynamic";

const missing = () => Response.json({ error: "That message no longer exists." }, { status: 404 });

export async function PATCH(request, { params }) {
  const { team, id } = await params;
  const admin = await can(team === "kingsway" ? "kingsway" : "messages");
  if (!admin) return refuse();
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
  const { team, id } = await params;
  const admin = await can(team === "kingsway" ? "kingsway" : "messages");
  if (!admin) return refuse();
  if (!INBOXES[team]) return missing();
  return (await deleteMessage(team, id)) ? Response.json({ ok: true }) : missing();
}

// Admin: edit (PUT), act on (PATCH { action }) or delete (DELETE) one debate.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { updateDetails, applyAction, deleteDebate, getDebate } from "@/lib/voting";

export const dynamic = "force-dynamic";

// The activity log line for a debate action.
function describe(body, debate) {
  const t = `“${debate.title}”`;
  return (
    {
      open: `Opened voting on ${t}`,
      close: `Closed voting on ${t}`,
      reopen: `Reopened voting on ${t}`,
      hide: `Hid the result of ${t} until close`,
      reveal: `Revealed the result of ${t}`,
      publish: `Published the result of ${t} to the website`,
      unpublish: `Removed the result of ${t} from the website`,
      reset: `Reset all votes for ${t}`,
      setCounts: `Changed the result of ${t} by hand to ${body.aye} Aye, ${body.no} No`,
      restoreCounted: `Put ${t} back to the phone votes counted`,
    }[body.action] || `${body.action} on ${t}`
  );
}

const missing = () => Response.json({ error: "That debate no longer exists." }, { status: 404 });

export async function PUT(request, { params }) {
  const admin = await can("debates");
  if (!admin) return refuse();
  const { id } = await params;
  try {
    const debate = await updateDetails(id, await request.json());
    if (debate) await logAction(admin, `Edited the details of “${debate.title}”`);
    return debate ? Response.json({ debate }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  const admin = await can("debates");
  if (!admin) return refuse();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const debate = await applyAction(id, body.action, body, admin.name);
    if (debate) await logAction(admin, describe(body, debate));
    return debate ? Response.json({ debate }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("debates");
  if (!admin) return refuse();
  const { id } = await params;
  const before = await getDebate(id);
  if (!(await deleteDebate(id))) return missing();
  await logAction(admin, `Deleted the debate “${before?.title || id}” and its votes`);
  return Response.json({ ok: true });
}

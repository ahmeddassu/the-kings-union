// Admin: change a motion suggestion's status (PATCH { status }) or delete it.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { setMotionStatus, deleteMotion } from "@/lib/submissions";

export const dynamic = "force-dynamic";

const missing = () => Response.json({ error: "That suggestion no longer exists." }, { status: 404 });

export async function PATCH(request, { params }) {
  const admin = await can("motions");
  if (!admin) return refuse();
  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  try {
    const motion = await setMotionStatus(id, status);
    if (motion) await logAction(admin, `Marked the motion “This House ${motion.motion}” as ${status === "featured" ? "on the website" : status}`);
    return motion ? Response.json({ motion }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("motions");
  if (!admin) return refuse();
  const { id } = await params;
  if (!(await deleteMotion(id))) return missing();
  await logAction(admin, "Deleted a motion suggestion");
  return Response.json({ ok: true });
}

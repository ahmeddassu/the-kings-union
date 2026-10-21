// Admin: change a speaker application's status (PATCH { status }) or delete it.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { setApplicationStatus, deleteApplication } from "@/lib/submissions";

export const dynamic = "force-dynamic";

const missing = () => Response.json({ error: "That application no longer exists." }, { status: 404 });

export async function PATCH(request, { params }) {
  const admin = await can("applications");
  if (!admin) return refuse();
  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  try {
    const application = await setApplicationStatus(id, status);
    if (application) await logAction(admin, `Marked ${application.name}’s speaker application as ${status}`);
    return application ? Response.json({ application }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("applications");
  if (!admin) return refuse();
  const { id } = await params;
  if (!(await deleteApplication(id))) return missing();
  await logAction(admin, "Deleted a speaker application");
  return Response.json({ ok: true });
}

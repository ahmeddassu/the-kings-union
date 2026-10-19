// Admin: change a speaker application's status (PATCH { status }) or delete it.
import { isAdmin } from "@/lib/admin_auth";
import { setApplicationStatus, deleteApplication } from "@/lib/submissions";

export const dynamic = "force-dynamic";

const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });
const missing = () => Response.json({ error: "That application no longer exists." }, { status: 404 });

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  try {
    const application = await setApplicationStatus(id, status);
    return application ? Response.json({ application }) : missing();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  return (await deleteApplication(id)) ? Response.json({ ok: true }) : missing();
}

// Friends of the Union (Executive, Finance, Growth): DELETE ?email=… removes someone.
import { can, refuse } from "@/lib/admin_auth";
import { removeFriend } from "@/lib/friends";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function DELETE(request) {
  const admin = await can("friends");
  if (!admin) return refuse();
  const email = new URL(request.url).searchParams.get("email");
  if (!(await removeFriend(email))) return Response.json({ error: "They’re not on the list." }, { status: 404 });
  await logAction(admin, "Removed someone from Friends of the Union");
  return Response.json({ ok: true });
}

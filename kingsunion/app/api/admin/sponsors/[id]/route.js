// Finance / Executive: edit a sponsor (PUT), move it up or down (PATCH { move }), or delete it.
import { can, refuse } from "@/lib/admin_auth";
import { updateSponsor, moveSponsor, deleteSponsor, listSponsors } from "@/lib/sponsors";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
const missing = () => Response.json({ error: "That sponsor no longer exists." }, { status: 404 });

export async function PUT(request, { params }) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  const { id } = await params;
  try {
    const sponsor = await updateSponsor(id, await request.json().catch(() => ({})));
    if (!sponsor) return missing();
    await logAction(admin, `Edited the sponsor ${sponsor.name}${sponsor.hidden ? " (hidden from the website)" : ""}`);
    return Response.json({ sponsor });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  const { id } = await params;
  const { move } = await request.json().catch(() => ({}));
  if (move !== "up" && move !== "down") return Response.json({ error: "Unknown change." }, { status: 400 });
  const sponsors = await moveSponsor(id, move);
  await logAction(admin, "Reordered the sponsors");
  return Response.json({ sponsors });
}

export async function DELETE(_request, { params }) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  const { id } = await params;
  const who = (await listSponsors()).find((s) => s.id === id);
  if (!(await deleteSponsor(id))) return missing();
  await logAction(admin, `Removed the sponsor ${who?.name || ""}`.trim());
  return Response.json({ ok: true });
}

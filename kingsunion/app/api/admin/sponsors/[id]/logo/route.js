// Finance / Executive: upload (POST, the image as the request body) or remove (DELETE) a sponsor's logo.
import { can, refuse } from "@/lib/admin_auth";
import { setLogo, removeLogo } from "@/lib/sponsors";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
const missing = () => Response.json({ error: "That sponsor no longer exists." }, { status: 404 });

export async function POST(request, { params }) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  const { id } = await params;
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 450 * 1024) return Response.json({ error: "That logo is too big. Try a smaller image." }, { status: 400 });
  try {
    const sponsor = await setLogo(id, await request.arrayBuffer());
    if (!sponsor) return missing();
    await logAction(admin, `Uploaded a logo for ${sponsor.name}`);
    return Response.json({ sponsor });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("sponsors");
  if (!admin) return refuse();
  const { id } = await params;
  const sponsor = await removeLogo(id);
  if (!sponsor) return missing();
  await logAction(admin, `Removed the logo for ${sponsor.name}`);
  return Response.json({ sponsor });
}

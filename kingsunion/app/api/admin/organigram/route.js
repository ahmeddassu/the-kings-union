// Committee organigram. GET returns every record ({ docs, canEdit }); anyone
// with the Organigram section can read. PUT saves one record ({ path, data })
// and DELETE removes one ({ path }); both are Executive only.
import { can, refuse } from "@/lib/admin_auth";
import { readOrganigram, readRecord, saveRecord, deleteRecord, canEditOrganigram, TooBig } from "@/lib/organigram";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

const noEdit = () => Response.json({ error: "Only the Executive can change the organigram." }, { status: 403 });

export async function GET() {
  const admin = await can("organigram");
  if (!admin) return refuse();
  try {
    return Response.json({ docs: await readOrganigram(), canEdit: canEditOrganigram(admin) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}

export async function PUT(request) {
  const admin = await can("organigram");
  if (!admin) return refuse();
  if (!canEditOrganigram(admin)) return noEdit();
  const { path, data } = await request.json().catch(() => ({}));
  try {
    const isNew = path?.startsWith("people/") && !(await readRecord(path));
    await saveRecord(path, data);
    if (isNew && data?.name) await logAction(admin, `Added ${data.name} (${data.title || "a position"}) to the organigram`);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: err instanceof TooBig ? 413 : 400 });
  }
}

export async function DELETE(request) {
  const admin = await can("organigram");
  if (!admin) return refuse();
  if (!canEditOrganigram(admin)) return noEdit();
  const { path } = await request.json().catch(() => ({}));
  try {
    const old = path?.startsWith("people/") ? await readRecord(path) : null;
    await deleteRecord(path);
    if (old) await logAction(admin, `Removed ${old.title || "a position"}${old.name ? ` (${old.name})` : ""} from the organigram`);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

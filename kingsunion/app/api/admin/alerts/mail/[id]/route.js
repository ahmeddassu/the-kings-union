// Admin: POST sends the next few emails of a send-out; DELETE removes it from the history.
import { isAdmin } from "@/lib/admin_auth";
import { sendBatch, deleteCampaign } from "@/lib/alert_mail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });

export async function POST(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  try {
    return Response.json(await sendBatch(id), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: err.message || "Couldn’t send. Please try again." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return denied();
  const { id } = await params;
  return (await deleteCampaign(id)) ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
}

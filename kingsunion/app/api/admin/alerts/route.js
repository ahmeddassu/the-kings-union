// Admin: ticket-alert sign-ups. GET ?format=csv downloads them; DELETE { email } removes one.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { listAlerts, deleteAlert } from "@/lib/inbox";

export const dynamic = "force-dynamic";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const admin = await can("alerts");
  if (!admin) return refuse();
  const rows = await listAlerts();
  await logAction(admin, "Downloaded the ticket-alerts list");
  const csv = ["email,name,signed_up", ...rows.map((r) => [r.email, r.name, new Date(r.createdAt).toISOString()].map(csvCell).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="kings-union-ticket-alerts.csv"' },
  });
}

export async function DELETE(request) {
  const admin = await can("alerts");
  if (!admin) return refuse();
  const { email } = await request.json().catch(() => ({}));
  if (!(await deleteAlert(email))) return Response.json({ error: "Not found." }, { status: 404 });
  await logAction(admin, "Removed someone from the ticket-alerts list");
  return Response.json({ ok: true });
}

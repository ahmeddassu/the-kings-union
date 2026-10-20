// Admin: ticket-alert sign-ups. GET ?format=csv downloads them; DELETE { email } removes one.
import { isAdmin } from "@/lib/admin_auth";
import { listAlerts, deleteAlert } from "@/lib/inbox";

export const dynamic = "force-dynamic";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Please sign in again.", { status: 401 });
  const rows = await listAlerts();
  const csv = ["email,name,signed_up", ...rows.map((r) => [r.email, r.name, new Date(r.createdAt).toISOString()].map(csvCell).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="kings-union-ticket-alerts.csv"' },
  });
}

export async function DELETE(request) {
  if (!(await isAdmin())) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { email } = await request.json().catch(() => ({}));
  return (await deleteAlert(email)) ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
}

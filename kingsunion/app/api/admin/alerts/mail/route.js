// Admin: emails to the ticket-alerts list. GET lists past emails; POST previews ({ action: "preview" }), sends a
// test ({ action: "test", to, ...email }) or starts sending ({ action: "start", ...email }).
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { listCampaigns, sendTest, startCampaign, cleanCampaign, renderEmail } from "@/lib/alert_mail";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await can("alerts");
  if (!admin) return refuse();
  return Response.json({ campaigns: await listCampaigns() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const admin = await can("alerts");
  if (!admin) return refuse();
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "preview") return Response.json({ html: renderEmail(cleanCampaign(body), "you@example.com").html });
    if (body.action === "test") {
      await sendTest(body, String(body.to || "").trim());
      return Response.json({ ok: true });
    }
    if (body.action === "start") {
      const campaign = await startCampaign(body);
      await logAction(admin, `Started emailing the ticket-alerts list (${campaign.total} people): “${campaign.subject}”`);
      return Response.json({ campaign });
    }
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Ticket alert email:", err);
    return Response.json({ error: err.message || "Couldn’t send. Please try again." }, { status: 400 });
  }
}

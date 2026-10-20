// Admin: emails to the ticket-alerts list. GET lists past emails; POST previews ({ action: "preview" }), sends a
// test ({ action: "test", to, ...email }) or starts sending ({ action: "start", ...email }).
import { isAdmin } from "@/lib/admin_auth";
import { listCampaigns, sendTest, startCampaign, cleanCampaign, renderEmail } from "@/lib/alert_mail";

export const dynamic = "force-dynamic";
const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return denied();
  return Response.json({ campaigns: await listCampaigns() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  if (!(await isAdmin())) return denied();
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "preview") return Response.json({ html: renderEmail(cleanCampaign(body), "you@example.com").html });
    if (body.action === "test") {
      await sendTest(body, String(body.to || "").trim());
      return Response.json({ ok: true });
    }
    if (body.action === "start") return Response.json({ campaign: await startCampaign(body) });
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Ticket alert email:", err);
    return Response.json({ error: err.message || "Couldn’t send. Please try again." }, { status: 400 });
  }
}

// Counts a page view for the admin Visitor stats. No cookies; see lib/visitor_stats.js.
import { clientIp } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";
import { recordView } from "@/lib/visitor_stats";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (storeConfigured) {
    try {
      const body = await request.json().catch(() => ({}));
      await recordView({
        path: body.path,
        referrer: body.referrer,
        ip: clientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        country: request.headers.get("x-vercel-ip-country") || "",
        host: new URL(request.url).hostname,
      });
    } catch (err) {
      console.error("Couldn't record page view:", err);
    }
  }
  return new Response(null, { status: 204 });
}

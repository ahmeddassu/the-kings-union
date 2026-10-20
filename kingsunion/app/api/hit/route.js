// Counts visits for the admin Visitor stats. Nothing here is stored about
// individuals; see lib/visitor_stats.js for exactly what is kept.
import { clientIp } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";
import { recordHit } from "@/lib/visitor_stats";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const h = request.headers;
  // Respect browser privacy signals even if the page script missed them.
  if (storeConfigured && h.get("dnt") !== "1" && h.get("sec-gpc") !== "1") {
    try {
      const text = await request.text();
      if (text.length <= 2000) {
        const hit = JSON.parse(text || "{}");
        if (hit && typeof hit === "object") {
          await recordHit(hit, {
            ip: clientIp(request),
            userAgent: h.get("user-agent") || "",
            country: h.get("x-vercel-ip-country") || "",
            region: h.get("x-vercel-ip-country-region") || "",
            city: h.get("x-vercel-ip-city") || "",
            language: h.get("accept-language") || "",
            host: new URL(request.url).hostname,
          });
        }
      }
    } catch (err) {
      console.error("Couldn't record visit:", err);
    }
  }
  return new Response(null, { status: 204 });
}

// For an uptime monitor (e.g. UptimeRobot): answers 200 when the site and its
// database are working, and 503 when voting and forms are down. "status" is
// "ok", "degraded" (the term card sheet can't be read; the site still works)
// or "down". Nothing private is shown.
import { quickHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await quickHealth();
  return Response.json(health, {
    status: health.status === "down" ? 503 : 200,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function HEAD() {
  const health = await quickHealth();
  return new Response(null, { status: health.status === "down" ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}

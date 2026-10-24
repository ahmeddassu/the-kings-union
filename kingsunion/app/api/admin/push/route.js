// Phone and browser notifications for admin (lib/push.js). Anyone with their own login.
//   GET                                       { publicKey, devices }
//   POST { action: "subscribe", subscription }   turn on for this device
//   POST { action: "unsubscribe", endpoint }     turn off for this device
//   POST { action: "test" }                      send a test to all your devices
import { getAdmin } from "@/lib/admin_auth";
import { publicKey, addDevice, removeDevice, deviceCount, pushTo } from "@/lib/push";

export const dynamic = "force-dynamic";

const bad = (error, status = 400) => Response.json({ error }, { status });

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return bad("Please sign in again.", 401);
  return Response.json({ publicKey: await publicKey(), devices: await deviceCount(admin) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return bad("Please sign in again.", 401);
  if (admin.shared) return bad("Sign in with your own login to turn on notifications.");
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "subscribe") {
      await addDevice(admin, body.subscription, request.headers.get("user-agent") || "");
      return Response.json({ ok: true, devices: await deviceCount(admin) });
    }
    if (body.action === "unsubscribe") {
      await removeDevice(admin, body.endpoint);
      return Response.json({ ok: true, devices: await deviceCount(admin) });
    }
    if (body.action === "test") {
      const sent = await pushTo([admin.id], { title: "Notifications are on", body: "This is how King’s Union admin notifications will look.", href: "/dashboard" });
      return sent ? Response.json({ sent }) : bad("Couldn’t reach your devices. Try turning notifications off and on again.");
    }
  } catch (err) {
    return bad(err?.message || "That didn’t work.");
  }
  return bad("Unknown action.");
}

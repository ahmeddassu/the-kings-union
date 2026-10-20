// Unsubscribes someone from ticket alerts. Used by the button on /unsubscribe
// and by email apps' built-in "Unsubscribe" button (one-click, RFC 8058).
import { unsubscribe } from "@/lib/alert_mail";
import { storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const url = new URL(request.url);
  const type = request.headers.get("content-type") || "";
  const form = type.includes("form") ? await request.formData().catch(() => null) : null;
  const email = String(form?.get("e") || url.searchParams.get("e") || "").trim().toLowerCase();
  const token = String(form?.get("t") || url.searchParams.get("t") || "");
  const fromPage = form?.get("page") === "1";

  let ok = false;
  if (storeConfigured) {
    try {
      ok = await unsubscribe(email, token);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  }
  if (fromPage) return Response.redirect(new URL(`/unsubscribe?${ok ? "done=1" : "error=1"}`, request.url), 303);
  return new Response(ok ? "Unsubscribed" : "Link not valid", { status: ok ? 200 : 400 });
}

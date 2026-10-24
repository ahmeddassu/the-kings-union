// Receives the "Suggest a motion" form (works without JavaScript).
import { clientIp } from "@/lib/admin_auth";
import { addMotion, allowSubmission, storeConfigured } from "@/lib/submissions";
import { notifySections } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const back = (request, query) => Response.redirect(new URL(`/motions?${query}#suggest`, request.url), 303);

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return back(request, "error=missing");
  // Spam trap: real people never see or fill this field.
  if (String(form.get("company") || "").trim()) return back(request, "sent=1");
  if (!storeConfigured) return back(request, "error=send");
  try {
    if (!(await allowSubmission("motion", clientIp(request)))) return back(request, "error=busy");
    await addMotion({
      motion: form.get("motion"),
      why: form.get("why"),
      name: form.get("name"),
      email: form.get("email"),
      speak: form.get("speak") === "yes",
    });
    await notifySections("motions", { kind: "inbox", text: `New motion suggested: This House ${String(form.get("motion") || "").trim().slice(0, 120)}`, href: "/motions" });
    return back(request, "sent=1");
  } catch (err) {
    if (err.message === "missing") return back(request, "error=missing");
    console.error("Motion suggestion failed:", err);
    return back(request, "error=send");
  }
}

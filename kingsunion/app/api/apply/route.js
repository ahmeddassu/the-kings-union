// Receives the "Apply to speak" form (works without JavaScript).
import { clientIp } from "@/lib/admin_auth";
import { addApplication, allowSubmission, storeConfigured } from "@/lib/submissions";
import { upcomingDebates } from "@/lib/upcoming";

export const dynamic = "force-dynamic";

const back = (request, query) => Response.redirect(new URL(`/speak/apply?${query}#apply`, request.url), 303);

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return back(request, "error=missing");
  if (String(form.get("company") || "").trim()) return back(request, "sent=1");
  if (!storeConfigured) return back(request, "error=send");
  const field = (n) => form.get(n);
  try {
    if (!(await allowSubmission("apply", clientIp(request)))) return back(request, "error=busy");
    await addApplication(
      {
        name: field("name"),
        email: field("email"),
        course: field("course"),
        member: field("member"),
        debate: field("debate"),
        side: field("side"),
        experience: field("experience"),
        pitch: field("pitch"),
      },
      await upcomingDebates()
    );
    return back(request, "sent=1");
  } catch (err) {
    if (err.message === "missing") return back(request, "error=missing");
    console.error("Speaker application failed:", err);
    return back(request, "error=send");
  }
}

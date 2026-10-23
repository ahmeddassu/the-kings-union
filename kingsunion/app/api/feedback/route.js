// Receives the feedback form (/feedback). Anonymous: no name or email.
import { clientIp } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";
import { allowSubmission } from "@/lib/submissions";
import { pastDebates, saveFeedback, isSlug } from "@/lib/feedback";

export const dynamic = "force-dynamic";

const back = (request, path) => Response.redirect(new URL(path, request.url), 303);

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("debate") || "");
  const here = `/feedback?debate=${encodeURIComponent(isSlug(slug) ? slug : "")}`;
  if (!form || !isSlug(slug)) return back(request, "/feedback?error=debate");
  if (String(form.get("company") || "")) return back(request, `${here}&sent=1`); // spam trap
  if (!storeConfigured) return back(request, `${here}&error=send`);
  if (!(await pastDebates()).some((e) => e.slug === slug)) return back(request, "/feedback?error=debate");
  if (!(await allowSubmission("feedback", clientIp(request), 120))) return back(request, `${here}&error=wait`);
  try {
    await saveFeedback(slug, {
      rating: form.get("rating"),
      liked: form.get("liked"),
      improve: form.get("improve"),
      again: form.get("again"),
    });
  } catch (err) {
    return back(request, `${here}&error=${err.message === "rating" ? "rating" : "send"}#form`);
  }
  return back(request, `${here}&sent=1`);
}

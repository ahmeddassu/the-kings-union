// Receives the Friends of the Union sign-up (/friends).
import { clientIp } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";
import { allowSubmission } from "@/lib/submissions";
import { addFriend } from "@/lib/friends";

export const dynamic = "force-dynamic";

const back = (request, path) => Response.redirect(new URL(path, request.url), 303);

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return back(request, "/friends?error=send#join");
  if (String(form.get("company") || "")) return back(request, "/friends?joined=1"); // spam trap
  if (!storeConfigured) return back(request, "/friends?error=send#join");
  if (!(await allowSubmission("friends", clientIp(request), 20))) return back(request, "/friends?error=wait#join");
  try {
    await addFriend({
      name: form.get("name"),
      email: form.get("email"),
      connection: form.get("connection"),
      year: form.get("year"),
      interests: form.getAll("interests"),
      consent: form.get("consent") === "yes",
    });
  } catch (err) {
    const known = ["name", "email", "consent"].includes(err.message) ? err.message : "send";
    return back(request, `/friends?error=${known}#join`);
  }
  return back(request, "/friends?joined=1");
}

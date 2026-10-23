// Sets a new committee member's password from their one-off setup link, then signs them in.
import { completeSetup } from "@/lib/admin_accounts";
import { newSession, sessionCookie, allowLoginAttempt, clientIp, teamsOf, teamsLabel } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

function adminUrl(request, path) {
  const host = (request.headers.get("host") || "").toLowerCase();
  return new URL((host.startsWith("admin.") ? "" : "/admin") + path, request.url);
}

export async function POST(request) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const back = (error) => Response.redirect(adminUrl(request, `/setup?token=${encodeURIComponent(token)}&error=${encodeURIComponent(error)}`), 303);
  if (!storeConfigured) return back("db");
  if (!(await allowLoginAttempt(clientIp(request)))) return back("wait");
  const password = String(form.get("password") || "");
  if (password !== String(form.get("confirm") || "")) return back("mismatch");
  try {
    const person = await completeSetup(token, password);
    await logAction({ ...person, team: teamsOf(person)[0], teamLabel: teamsLabel(teamsOf(person)) }, "Set their password");
    const headers = new Headers({ Location: adminUrl(request, "/").toString() });
    headers.append("Set-Cookie", sessionCookie(newSession(person)));
    return new Response(null, { status: 303, headers });
  } catch (err) {
    return back(/characters/.test(err.message) ? "short" : "expired");
  }
}

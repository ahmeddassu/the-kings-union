// Sign in with your own email and password, or (until it's switched off) the
// shared committee password with the email left blank.
import { passwordMatches, newSession, sessionCookie, allowLoginAttempt, clearLoginAttempts, clientIp, sharedAllowed, SHARED, TEAMS } from "@/lib/admin_auth";
import { signIn } from "@/lib/admin_accounts";
import { logAction } from "@/lib/audit";
import { storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

// The admin home, on whichever address the form was sent from.
function adminHome(request, query = "") {
  const host = (request.headers.get("host") || "").toLowerCase();
  const path = host.startsWith("admin.") ? "/" : "/admin";
  return new URL(path + query, request.url);
}

export async function POST(request) {
  const form = await request.formData();
  if (!storeConfigured) return Response.redirect(adminHome(request, "?error=setup"), 303);

  const ip = clientIp(request);
  if (!(await allowLoginAttempt(ip))) return Response.redirect(adminHome(request, "?error=wait"), 303);

  const email = String(form.get("email") || "").trim();
  const password = form.get("password");
  let person = null;
  if (email) {
    person = await signIn(email, password);
    if (!person) return Response.redirect(adminHome(request, "?error=wrong"), 303);
  } else {
    if (!(await sharedAllowed())) return Response.redirect(adminHome(request, "?error=shared"), 303);
    if (!passwordMatches(password)) return Response.redirect(adminHome(request, "?error=wrong"), 303);
  }

  await clearLoginAttempts(ip);
  const who = person || SHARED;
  await logAction({ name: who.name, team: who.team }, `Signed in (${TEAMS[who.team]?.label || who.team})`);
  const headers = new Headers({ Location: adminHome(request).toString() });
  headers.append("Set-Cookie", sessionCookie(newSession(person)));
  return new Response(null, { status: 303, headers });
}

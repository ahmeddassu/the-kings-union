import { passwordMatches, newSession, allowLoginAttempt, clearLoginAttempts, clientIp, ADMIN_COOKIE } from "@/lib/admin_auth";
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
  if (!passwordMatches(form.get("password"))) return Response.redirect(adminHome(request, "?error=wrong"), 303);

  await clearLoginAttempts(ip);
  const session = newSession();
  const response = Response.redirect(adminHome(request), 303);
  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${session.value}; Path=/; Max-Age=${session.maxAge}; HttpOnly; Secure; SameSite=Strict`
  );
  return new Response(null, { status: 303, headers });
}

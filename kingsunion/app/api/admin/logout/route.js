import { ADMIN_COOKIE } from "@/lib/admin_auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const to = new URL(host.startsWith("admin.") ? "/" : "/admin", request.url);
  return new Response(null, {
    status: 303,
    headers: {
      Location: to.toString(),
      "Set-Cookie": `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    },
  });
}

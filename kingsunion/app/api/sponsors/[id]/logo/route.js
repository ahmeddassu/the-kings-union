// A sponsor's logo, as uploaded in admin → Sponsors. The address changes
// whenever the logo does, so browsers can keep it for a long time.
import { getLogo } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const logo = await getLogo(id).catch(() => null);
  if (!logo) return new Response("Not found", { status: 404 });
  return new Response(logo.body, {
    headers: {
      "Content-Type": logo.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

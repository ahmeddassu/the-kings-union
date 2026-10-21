// Admin: a debate's result as an Instagram-ready image.
// ?format=story (1080×1920) or post (1080×1350); add &download=1 to save it.
import { can, refuse } from "@/lib/admin_auth";
import { getDebate, getCounts } from "@/lib/voting";
import { resultCard, CARD_SIZES } from "@/lib/result_card";
import { slugify } from "@/lib/sheet";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const admin = await can("results", "debates");
  if (!admin) return refuse();
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) return Response.json({ error: "That debate no longer exists." }, { status: 404 });
  const counts = await getCounts(debate.id);
  if (!counts.total) return Response.json({ error: "No votes yet, so there’s no result to share." }, { status: 400 });
  const url = new URL(request.url);
  const format = CARD_SIZES[url.searchParams.get("format")] ? url.searchParams.get("format") : "story";
  const image = await resultCard(debate, counts, format);
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "private, no-store");
  if (url.searchParams.get("download")) {
    headers.set("Content-Disposition", `attachment; filename="${slugify(debate.title).slice(0, 60) || "result"}-${format}.png"`);
  }
  return new Response(image.body, { status: 200, headers });
}

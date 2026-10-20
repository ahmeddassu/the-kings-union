// Public: debates whose voting is open right now, for the "live" banner.
import { storeConfigured } from "@/lib/store";
import { listDebates, votingLink } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function GET() {
  let live = [];
  if (storeConfigured) {
    try {
      live = (await listDebates())
        .filter((d) => d.status === "open")
        .map((d) => ({ title: d.title, code: d.code, link: votingLink(d.code) }));
    } catch {
      live = [];
    }
  }
  return Response.json(
    { live },
    // Shared by everyone for a few seconds so a full chamber doesn't hammer the database.
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=20" } }
  );
}

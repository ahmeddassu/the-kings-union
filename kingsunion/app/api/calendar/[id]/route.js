// "Apple Calendar" (.ics) download for one calendar entry added in admin.
import { getCalendarItems } from "@/lib/calendar_entries";
import { icsFile } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export async function GET(_request, { params }) {
  const { id } = await params;
  const item = (await getCalendarItems()).find((i) => i.id === id);
  if (!item) return new Response("Not found", { status: 404 });
  const page = item.href ? new URL(item.href, siteUrl).toString() : new URL("/term-card", siteUrl).toString();
  return new Response(icsFile(item, page), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="kings-union-${id}.ics"`,
    },
  });
}

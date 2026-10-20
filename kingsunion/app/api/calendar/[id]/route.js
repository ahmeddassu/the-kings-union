// One calendar entry added in admin, as a calendar people can subscribe to.
// If the entry is deleted, subscribers get an empty calendar so it disappears
// from their calendar too.
import { getCalendarItems } from "@/lib/calendar_entries";
import { icsFile } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export async function GET(_request, { params }) {
  const { id } = await params;
  const item = (await getCalendarItems()).find((i) => i.id === id);
  if (!/^[\w-]{1,64}$/.test(id)) return new Response("Not found", { status: 404 });
  if (!item) {
    const empty = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//King's Union//Term Card//EN", "METHOD:PUBLISH", "X-WR-CALNAME:King’s Union", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "END:VCALENDAR"].join("\r\n");
    return new Response(empty, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
  }
  const page = item.href ? new URL(item.href, siteUrl).toString() : new URL("/term-card", siteUrl).toString();
  return new Response(icsFile(item, page), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="kings-union-${id}.ics"`,
    },
  });
}

// The whole term card, plus key dates added in admin, as a calendar feed:
// kingsunion.org.uk/calendar.ics
import { getCalendarItems } from "@/lib/calendar_entries";
import { icsCalendar } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  const items = (await getCalendarItems()).map((i) => ({ ...i, tickets: i.ticketsUrl }));
  return new Response(icsCalendar(items, siteUrl), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kings-union.ics"',
    },
  });
}

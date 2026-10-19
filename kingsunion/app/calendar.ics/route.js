// The whole term card as a calendar feed: kingsunion.org.uk/calendar.ics
import { getEvents } from "@/lib/sheet";
import { icsCalendar } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  const events = await getEvents();
  return new Response(icsCalendar(events, siteUrl), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kings-union.ics"',
    },
  });
}

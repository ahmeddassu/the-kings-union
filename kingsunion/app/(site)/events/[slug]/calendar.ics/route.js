import { getEvents } from "@/lib/sheet";
import { icsFile } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function GET(_request, { params }) {
  const { slug } = await params;
  const event = (await getEvents()).find((e) => e.slug === slug);
  if (!event) return new Response("Not found", { status: 404 });
  const pageUrl = new URL(`/events/${slug}`, siteUrl).toString();
  return new Response(icsFile(event, pageUrl), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.ics"`,
    },
  });
}

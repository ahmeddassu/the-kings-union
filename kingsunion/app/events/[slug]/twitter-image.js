// Same picture for X/Twitter.
import { getEvents } from "@/lib/sheet";
import { shareImage } from "@/lib/share_image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "King’s Union event";
export const revalidate = 300;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const event = (await getEvents()).find((e) => e.slug === slug);
  return shareImage(event);
}

import { getEvents } from "@/lib/sheet";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

const pages = [
  "", "about", "debates", "term-card", "governance",
  "kingsway", "speak", "support", "contact", "press", "membership",
];

export default async function sitemap() {
  const url = (path) => new URL(path, siteUrl).toString();
  const events = await getEvents();
  return [
    ...pages.map((p) => ({
      url: url(`/${p}`),
      changeFrequency: p === "" || p === "term-card" || p === "debates" ? "weekly" : "monthly",
      priority: p === "" ? 1 : 0.7,
    })),
    ...events.map((e) => ({
      url: url(`/events/${e.slug}`),
      lastModified: e.date,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ];
}

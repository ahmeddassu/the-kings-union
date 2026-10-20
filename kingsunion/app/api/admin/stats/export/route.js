// Admin: visitor stats as a spreadsheet (CSV). Totals only, like the page.
import { isAdmin } from "@/lib/admin_auth";
import { getStats } from "@/lib/visitor_stats";
import { PAGE_NAMES } from "@/lib/page_names";

export const dynamic = "force-dynamic";

const cell = (v) => {
  const s = String(v ?? "");
  // Quote, and stop spreadsheet apps treating text as a formula.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};
const rows = (title, header, list) => [[title], header, ...list, []];

export async function GET(request) {
  if (!(await isAdmin())) return new Response("Please sign in again.", { status: 401 });
  const asked = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(asked) ? asked : 30;
  const s = await getStats(days);
  const kv = (list) => list.map((r) => [r.key, r.count]);
  const table = [
    [`King's Union visitor stats, last ${days} days`],
    [],
    ...rows("Summary", ["Measure", "Value"], [
      ["Visitors", s.visitors],
      ["Visits", s.visits],
      ["Page views", s.views],
      ["Pages per visit", s.pagesPerVisit == null ? "" : s.pagesPerVisit.toFixed(2)],
      ["Average visit (seconds)", s.avgVisitSecs ?? ""],
      ["Left after one page", s.bounceRate == null ? "" : `${Math.round(s.bounceRate * 100)}%`],
    ]),
    ...rows("Per day", ["Date", "Visitors", "Visits", "Page views"], s.daily.map((d) => [d.day, d.visitors, d.visits, d.views])),
    ...rows(
      "Pages",
      ["Page", "Path", "Views", "Avg seconds on page", "Read to end %", "First page of visit", "Ticket clicks", "Calendar adds"],
      s.pages.map((p) => [PAGE_NAMES[p.path] || "", p.path, p.views, p.avgSecs ?? "", p.readPct ?? "", p.entries, p.tickets, p.calendar])
    ),
    ...rows("How people find us", ["Channel", "Visits"], kv(s.channels)),
    ...rows("Websites", ["Website", "Visits"], kv(s.referrers)),
    ...rows("Campaigns and posters", ["Source / medium / campaign", "Visits"], kv(s.campaigns)),
    ...rows("Clicks", ["Click", "Count"], kv(s.events)),
    ...rows("Page not found", ["Path", "Count"], kv(s.notFound)),
    ...rows("Hour of day (London)", ["Hour", "Page views"], s.hours.map((n, h) => [`${String(h).padStart(2, "0")}:00`, n])),
    ...rows("Visit length", ["Length", "Visits"], kv(s.durations)),
    ...rows("Pages per visit", ["Pages", "Visits"], kv(s.depths)),
    ...rows("Browsers", ["Browser", "Visits"], kv(s.browsers)),
    ...rows("Operating systems", ["System", "Visits"], kv(s.systems)),
    ...rows("Screen sizes", ["Size", "Visits"], kv(s.sizes)),
    ...rows("Countries", ["Country code", "Visits"], kv(s.countries)),
    ...rows("Cities", ["City", "Visits"], kv(s.cities)),
    ...rows("Languages", ["Language", "Visits"], kv(s.languages)),
  ];
  const csv = "﻿" + table.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kings-union-visitors-${days}-days.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

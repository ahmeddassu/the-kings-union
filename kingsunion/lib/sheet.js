// Reads the term card from the King's Union Google Sheet.
//
// Editors fill in the sheet; the site picks up changes within about five minutes.
// The sheet must be shared as "Anyone with the link: Viewer" for this to work.
// If the sheet can't be reached, the site falls back to the list in lib/events.js.

import { events as fallbackEvents, details as fallbackDetails } from "@/lib/events";
import { getPublishedResults } from "@/lib/published";

export const SHEET_ID =
  process.env.TERM_CARD_SHEET_ID || "1JBGICsFV02p-wfAqchynnfdaKHHUf5fd5-c03-JlGTA";

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;

const REFRESH_SECONDS = 300;

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/^this house (would |believes |has )?/, "")
    .normalize("NFKD")
    .replace(/[’'"“”()]/g, "")
    .replace(/£/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const pad = (n) => String(n).padStart(2, "0");

// Google returns dates as "Date(2026,9,6)" (month is 0-based); typed text is kept as is.
function toIsoDate(cell) {
  if (!cell) return null;
  const v = cell.v;
  const m = typeof v === "string" && v.match(/^Date\((\d+),(\d+),(\d+)/);
  if (m) return `${m[1]}-${pad(+m[2] + 1)}-${pad(+m[3])}`;
  const text = String(cell.f ?? v ?? "").trim();
  let p = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (p) return `${p[1]}-${pad(p[2])}-${pad(p[3])}`;
  p = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // UK style dd/mm/yyyy
  if (p) return `${p[3]}-${pad(p[2])}-${pad(p[1])}`;
  return null;
}

// Times come back as [hours, minutes, seconds, ms], or as text.
function toTime(cell) {
  if (!cell) return "";
  if (Array.isArray(cell.v)) return `${pad(cell.v[0])}:${pad(cell.v[1])}`;
  return String(cell.f ?? cell.v ?? "").trim();
}

const text = (cell) => (cell && cell.v != null ? String(cell.f ?? cell.v).trim() : "");
const num = (cell) => (cell && typeof cell.v === "number" ? cell.v : null);
const names = (cell) =>
  text(cell)
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

// Extra details written in lib/events.js, matched by motion title.
function fallbackDetail(title) {
  const e = fallbackEvents.find((f) => slugify(f.title) === slugify(title));
  return (e && fallbackDetails[e.slug]) || {};
}

function fromFallback() {
  return fallbackEvents.map((e) => {
    const d = fallbackDetails[e.slug] || {};
    return {
      ...e,
      slug: slugify(e.title),
      description: d.description || "",
      venue: d.venue || "",
      proposition: d.proposition || [],
      opposition: d.opposition || [],
      result: d.result || null,
      chathamHouse: Boolean(d.chathamHouse),
      photo: d.photo || "",
      tickets: d.tickets || "",
      ticketStatus: d.ticketStatus || "",
      background: d.background || "",
      backgroundCredit: d.backgroundCredit || null,
      backgroundBlur: Boolean(d.backgroundBlur),
      backgroundPosition: d.backgroundPosition || "right",
      poster: d.poster || "",
    };
  });
}

// Every event, with results from live voting filled in where the sheet has none.
export async function getEvents() {
  const events = await loadEvents();
  const published = await getPublishedResults();
  if (!published.length) return events;
  return events.map((e) => {
    if (e.type !== "Debate" || e.result) return e;
    const hit = published.find((p) => slugify(p.title) === slugify(e.title));
    return hit ? { ...e, result: { proposition: hit.proposition, opposition: hit.opposition } } : e;
  });
}

async function loadEvents() {
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: REFRESH_SECONDS } });
    if (!res.ok) throw new Error(`Sheet returned ${res.status}`);
    const raw = await res.text();
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    if (json.status === "error") throw new Error("Sheet is not shared publicly");

    const cols = json.table.cols.map((c) => (c.label || "").trim().toLowerCase());
    const at = (row, label) => row.c?.[cols.indexOf(label)] ?? null;

    const seen = new Set();
    const events = [];
    for (const row of json.table.rows) {
      const title = text(at(row, "title"));
      const date = toIsoDate(at(row, "date"));
      if (!title || !date) continue; // skip blank or half-filled rows

      let slug = slugify(title);
      while (seen.has(slug)) slug += "-2";
      seen.add(slug);

      // Writing "Chatham House" in either speakers column hides the speakers.
      const chathamHouse = /chatham/i.test(
        `${text(at(row, "proposition speakers"))} ${text(at(row, "opposition speakers"))}`
      );
      const votesFor = num(at(row, "votes for"));
      const votesAgainst = num(at(row, "votes against"));

      events.push({
        slug,
        date,
        time: toTime(at(row, "time")),
        type: text(at(row, "type")) || "Debate",
        title,
        description: text(at(row, "description")) || fallbackDetail(title).description || "",
        venue: text(at(row, "venue")) || fallbackDetail(title).venue || "",
        proposition: chathamHouse ? [] : names(at(row, "proposition speakers")),
        opposition: chathamHouse ? [] : names(at(row, "opposition speakers")),
        chathamHouse,
        photo: text(at(row, "photo")),
        // "Tickets" column; falls back to a link set in lib/events.js
        tickets: text(at(row, "tickets")) || fallbackDetail(title).tickets || "",
        topic: text(at(row, "topic")),
        // "Ticket status" column: blank = automatic (see lib/tickets.js)
        ticketStatus: text(at(row, "ticket status")) || fallbackDetail(title).ticketStatus || "",
        background: fallbackDetail(title).background || "",
        backgroundCredit: fallbackDetail(title).backgroundCredit || null,
        backgroundBlur: Boolean(fallbackDetail(title).backgroundBlur),
        backgroundPosition: fallbackDetail(title).backgroundPosition || "right",
        poster: fallbackDetail(title).poster || "",
        result:
          votesFor != null && votesAgainst != null
            ? { proposition: votesFor, opposition: votesAgainst }
            : null,
      });
    }

    if (!events.length) throw new Error("Sheet has no events");
    return events.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  } catch (err) {
    console.warn(`Term card sheet unavailable, using lib/events.js: ${err.message}`);
    return fromFallback();
  }
}

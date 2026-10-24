// Who comes to debates, from Luma's check-ins at the door.
//
// After each event, someone on Events downloads the guest list from Luma
// (Manage event → Guests → Download as CSV) and uploads it under admin →
// Attendance. Only the people marked as checked in are kept, with just their
// name and email: nothing else in the file is stored. From that, admin shows
// who comes most, so regulars can be given priority when tickets are approved.
//
// The website's own pages only ever use the totals (how many came to each
// debate), never who.
//
// Attendance is kept for two years and then deleted automatically.
//
// Keys:
//   ku:attend:index          JSON list: { slug, title, date, registered, checkedIn, importedAt, by }
//   ku:attend:guests:<slug>  JSON list of { e: email, n: name } for people who were checked in
//   ku:attend:settings       JSON { threshold }
import { revalidatePath, revalidateTag } from "next/cache";
import { redis, cachedGet, storeConfigured } from "@/lib/store";

const INDEX = "ku:attend:index";
const SETTINGS = "ku:attend:settings";
const guestsKey = (slug) => `ku:attend:guests:${slug}`;
const KEEP_DAYS = 730;
export const MAX_CSV_BYTES = 3 * 1024 * 1024;
const isSlug = (s) => /^[a-z0-9-]{1,90}$/.test(String(s || ""));

// ---------- Reading Luma's CSV ----------

// A small CSV reader (quoted fields, commas and line breaks inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const s = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const norm = (h) => String(h || "").trim().toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NO = new Set(["", "false", "no", "0", "n", "not checked in", "none", "null"]);

// Picks out the people who were checked in. Throws a plain-English error if the
// file doesn't look like a Luma guest list.
export function readGuestList(text) {
  const rows = parseCsv(text);
  if (rows.length < 1) throw new Error("That file is empty.");
  const head = rows[0].map(norm);
  const col = (...names) => head.findIndex((h) => names.includes(h));
  const email = col("email", "email_address", "user_email");
  const name = col("name", "full_name", "user_name");
  const first = col("first_name");
  const last = col("last_name");
  const checked = head.findIndex((h) => /^checked_in(_at)?$|^check_in(_time|_status)?$|^checked_in_status$/.test(h));
  const approval = col("approval_status", "status");

  if (email < 0) throw new Error("This doesn’t look like a Luma guest list: there’s no email column.");
  if (checked < 0)
    throw new Error(
      "This file has no check-in column. Download the guest list from Luma after the event (Manage event → Guests → Download as CSV)."
    );

  const seen = new Map();
  let registered = 0;
  for (const r of rows.slice(1)) {
    const e = String(r[email] || "").trim().toLowerCase();
    if (!EMAIL.test(e)) continue;
    const status = approval >= 0 ? String(r[approval] || "").trim().toLowerCase() : "approved";
    if (!status || status === "approved" || status === "going" || status === "checked_in") registered++;
    const mark = String(r[checked] || "").trim().toLowerCase();
    if (NO.has(mark)) continue;
    const full =
      (name >= 0 && String(r[name] || "").trim()) ||
      [first >= 0 ? r[first] : "", last >= 0 ? r[last] : ""].join(" ").trim() ||
      "";
    seen.set(e, { e, n: full.replace(/\s+/g, " ").slice(0, 80) });
  }
  return { guests: [...seen.values()], registered };
}

// ---------- Storing ----------

async function readIndex() {
  if (!storeConfigured) return [];
  const raw = await redis("GET", INDEX);
  return raw ? JSON.parse(raw) : [];
}

const cutoff = () => new Date(Date.now() - KEEP_DAYS * 86400000).toISOString().slice(0, 10);

function refresh() {
  try {
    revalidateTag(`store:${INDEX}`, { expire: 0 });
    revalidatePath("/records");
  } catch {
    // outside a request: the site catches up within five minutes
  }
}

// Deletes anything older than two years. Returns the list that's left.
async function prune(index) {
  const old = index.filter((d) => d.date < cutoff());
  if (!old.length) return index;
  const keep = index.filter((d) => d.date >= cutoff());
  await redis("SET", INDEX, JSON.stringify(keep));
  for (const d of old) await redis("DEL", guestsKey(d.slug));
  refresh();
  return keep;
}

export async function saveAttendance(event, text, by = "") {
  const { guests, registered } = readGuestList(text);
  if (!guests.length)
    throw new Error("No one in this file is marked as checked in. Check guests in on Luma at the door, then download the list again.");
  return saveGuests(event, { guests, registered, by });
}

// Stores who came to an event: `guests` is [{ e: email, n: name }]. Used by
// the Luma upload above and by door check-in (lib/door.js), which can also
// count walk-ins who gave no email.
export async function saveGuests({ slug, title, date }, { guests, registered = 0, walkIns = 0, by = "", source = "luma" }) {
  if (!isSlug(slug)) throw new Error("Please choose the event.");
  if (date < cutoff()) throw new Error("That event is more than two years ago, so its attendance isn’t kept.");
  await redis("SET", guestsKey(slug), JSON.stringify(guests));
  const index = (await readIndex()).filter((d) => d.slug !== slug);
  const entry = {
    slug,
    title: String(title || "").slice(0, 200),
    date,
    registered: Math.max(registered, guests.length),
    checkedIn: guests.length + walkIns,
    ...(walkIns ? { walkIns } : {}),
    source,
    importedAt: new Date().toISOString(),
    by: String(by || "").slice(0, 80),
  };
  index.push(entry);
  index.sort((a, b) => b.date.localeCompare(a.date));
  await redis("SET", INDEX, JSON.stringify(index));
  refresh();
  return entry;
}

// How many recorded events each email has come to (for flagging regulars at
// the door), leaving out one event.
export async function visitCounts(exceptSlug = "") {
  const index = await readIndex();
  const counts = new Map();
  for (const d of index) {
    if (d.slug === exceptSlug) continue;
    const raw = await redis("GET", guestsKey(d.slug));
    for (const g of raw ? JSON.parse(raw) : []) counts.set(g.e, (counts.get(g.e) || 0) + 1);
  }
  return counts;
}

export async function deleteAttendance(slug) {
  if (!isSlug(slug)) return false;
  const index = await readIndex();
  if (!index.some((d) => d.slug === slug)) return false;
  await redis("SET", INDEX, JSON.stringify(index.filter((d) => d.slug !== slug)));
  await redis("DEL", guestsKey(slug));
  refresh();
  return true;
}

export async function deleteAllAttendance() {
  const index = await readIndex();
  for (const d of index) await redis("DEL", guestsKey(d.slug));
  await redis("DEL", INDEX);
  refresh();
}

export async function getSettings() {
  const raw = storeConfigured ? await redis("GET", SETTINGS) : null;
  return { threshold: 3, ...(raw ? JSON.parse(raw) : {}) };
}

export async function saveSettings(input) {
  const threshold = Math.min(50, Math.max(2, Math.round(Number(input.threshold) || 3)));
  await redis("SET", SETTINGS, JSON.stringify({ threshold }));
  return { threshold };
}

// The academic year starts on 1 September.
function yearStart(today = new Date()) {
  const [y, m] = today.toLocaleDateString("en-CA", { timeZone: "Europe/London" }).split("-").map(Number);
  return `${m >= 9 ? y : y - 1}-09-01`;
}

// For admin: each event's totals, and everyone who has been checked in, with how
// many events they came to (this academic year, and in all the records kept).
export async function getAttendance() {
  const index = await prune(await readIndex());
  const start = yearStart();
  const people = new Map();
  for (const d of index) {
    const raw = await redis("GET", guestsKey(d.slug));
    const guests = raw ? JSON.parse(raw) : [];
    for (const g of guests) {
      const p = people.get(g.e) || { email: g.e, name: "", year: 0, total: 0, last: "", events: [] };
      if (!p.name || d.date >= p.last) p.name = g.n || p.name;
      p.total++;
      if (d.date >= start) p.year++;
      if (d.date > p.last) p.last = d.date;
      p.events.push(d.title);
      people.set(g.e, p);
    }
  }
  const list = [...people.values()].sort((a, b) => b.year - a.year || b.total - a.total || b.last.localeCompare(a.last));
  return { events: index, people: list, yearStart: start };
}

// For the public Records page: totals only (no names or emails).
export async function getAttendanceTotals() {
  try {
    const raw = await cachedGet(INDEX, 300);
    const index = raw ? JSON.parse(raw) : [];
    return index.map(({ slug, title, date, checkedIn }) => ({ slug, title, date, checkedIn }));
  } catch {
    return [];
  }
}

// The term card calendar: term card events (from the Google Sheet / lib/events.js)
// plus extra entries added in the admin site (key dates, socials, deadlines…).
//
// Keys:
//   ku:calendar        hash id -> entry (JSON)
//   ku:calendar:all    JSON list of every entry, read by the public website
//
// An entry can be linked to a term card event ("eventSlug"). It then shows that
// event's details (speakers, description, banner, debate page) and the entry
// only adds to or overrides them (e.g. a different colour tag or a note).
import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redis, cachedGet } from "@/lib/store";
import { getEvents } from "@/lib/sheet";
import { TAGS, tagForType } from "@/lib/calendar_tags";

const HASH = "ku:calendar";
const ALL = "ku:calendar:all";
const MAX = 500;

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const isTime = (v) => /^\d{2}:\d{2}$/.test(v || "");
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));

// Turns admin form input into a tidy entry. Throws with a message people can act on.
export function entryFields(input) {
  const title = clean(input.title, 160);
  const date = isDate(input.date) ? input.date : "";
  if (!title) throw new Error("Please add a title.");
  if (!date) throw new Error("Please choose a date.");
  const endDate = isDate(input.endDate) && input.endDate > date ? input.endDate : "";
  const allDay = Boolean(input.allDay);
  const time = !allDay && isTime(input.time) ? input.time : "";
  if (!allDay && !time) throw new Error("Please add a start time, or tick “All day”.");
  let endTime = !allDay && isTime(input.endTime) ? input.endTime : "";
  if (endTime && endTime <= time && !endDate) throw new Error("The end time must be after the start time.");
  const tag = TAGS.some((t) => t.key === input.tag) ? input.tag : "other";
  const url = clean(input.url, 400);
  if (url && !/^(https:\/\/|\/)/.test(url)) throw new Error("Links must start with https:// or /.");
  const image = clean(input.image, 400);
  if (image && !/^(https:\/\/|\/)/.test(image)) throw new Error("The banner image must start with https:// or /.");
  return {
    title,
    date,
    endDate,
    allDay,
    time,
    endTime,
    tag,
    venue: clean(input.venue, 160),
    description: String(input.description ?? "").trim().slice(0, 3000),
    eventSlug: clean(input.eventSlug, 160),
    url,
    image,
    ticketsUrl: /^https:\/\//.test(clean(input.ticketsUrl, 400)) ? clean(input.ticketsUrl, 400) : "",
  };
}

async function syncAll() {
  const raw = (await redis("HVALS", HASH)) || [];
  const list = raw.map((r) => JSON.parse(r)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  await redis("SET", ALL, JSON.stringify(list));
  // Show the change on the website straight away.
  try {
    revalidateTag(`store:${ALL}`, { expire: 0 });
    revalidatePath("/term-card");
    revalidatePath("/calendar.ics");
  } catch {
    // Not inside a request (e.g. a script): the site catches up within a minute.
  }
  return list;
}

export async function listEntries() {
  const raw = (await redis("HVALS", HASH)) || [];
  return raw.map((r) => JSON.parse(r)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export async function createEntry(input) {
  const fields = entryFields(input);
  if ((await redis("HLEN", HASH)) >= MAX) throw new Error("The calendar is full. Delete some old entries first.");
  const entry = { id: randomBytes(6).toString("hex"), createdAt: Date.now(), ...fields };
  await redis("HSET", HASH, entry.id, JSON.stringify(entry));
  await syncAll();
  return entry;
}

export async function updateEntry(id, input) {
  if (!isId(id)) return null;
  const raw = await redis("HGET", HASH, id);
  if (!raw) return null;
  const entry = { ...JSON.parse(raw), ...entryFields(input), updatedAt: Date.now() };
  await redis("HSET", HASH, id, JSON.stringify(entry));
  await syncAll();
  return entry;
}

export async function deleteEntry(id) {
  if (!isId(id)) return false;
  const removed = Number(await redis("HDEL", HASH, id)) === 1;
  if (removed) await syncAll();
  return removed;
}

// ---------- What the website shows ----------

async function publicEntries() {
  try {
    const raw = await cachedGet(ALL, 60);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function fromEvent(e) {
  return {
    id: `event-${e.slug}`,
    source: "termcard",
    slug: e.slug,
    title: e.title,
    type: e.type,
    tag: tagForType(e.type),
    date: e.date,
    endDate: "",
    allDay: false,
    time: e.time || "",
    endTime: "",
    venue: e.venue || "",
    description: e.description || "",
    image: e.background || e.photo || e.poster || "",
    imageBlur: Boolean(e.backgroundBlur),
    chathamHouse: Boolean(e.chathamHouse),
    proposition: e.chathamHouse ? [] : e.proposition || [],
    opposition: e.chathamHouse ? [] : e.opposition || [],
    result: e.result || null,
    href: `/events/${e.slug}`,
    ticketsUrl: e.tickets || "",
  };
}

// Everything on the calendar, oldest first, in one shape.
export async function getCalendarItems() {
  const [events, entries] = await Promise.all([getEvents().catch(() => []), publicEntries()]);
  const bySlug = new Map(events.map((e) => [e.slug, fromEvent(e)]));
  const extra = [];
  for (const en of entries) {
    const base = en.eventSlug && bySlug.get(en.eventSlug);
    const own = {
      id: en.id,
      source: "admin",
      title: en.title,
      tag: en.tag,
      date: en.date,
      endDate: en.endDate || "",
      allDay: Boolean(en.allDay),
      time: en.time || "",
      endTime: en.endTime || "",
      venue: en.venue || "",
      description: en.description || "",
      image: en.image || "",
      href: en.url || "",
      ticketsUrl: en.ticketsUrl || "",
    };
    if (base) {
      // Linked to a term card event: keep the event's details, let the entry
      // change the colour tag and fill in anything the event lacks.
      bySlug.set(en.eventSlug, {
        ...base,
        tag: en.tag || base.tag,
        venue: base.venue || own.venue,
        description: base.description || own.description,
        image: own.image || base.image,
        ticketsUrl: base.ticketsUrl || own.ticketsUrl,
        note: own.description && base.description ? own.description : "",
      });
    } else {
      extra.push({ ...own, type: TAGS.find((t) => t.key === own.tag)?.label || "Event", proposition: [], opposition: [], result: null });
    }
  }
  return [...bySlug.values(), ...extra].sort((a, b) => `${a.date}${a.time || "00:00"}`.localeCompare(`${b.date}${b.time || "00:00"}`));
}

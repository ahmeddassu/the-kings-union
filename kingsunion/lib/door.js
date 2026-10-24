// Door check-in (admin → Debates → Door check-in).
//
// Before a debate, someone uploads the guest list from Luma (Manage event →
// Guests → Download as CSV). At the door, committee members check people in
// on their phones; this keeps working with no signal, and each phone sends
// its check-ins when it's back online, so several phones can share a door.
// Walk-ins can be added with just a name. Afterwards "Save attendance" files
// everyone who came under admin → Attendance, the same as a Luma upload.
//
// The door list (registered guests' names and emails) is deleted 30 days after
// it's uploaded, or as soon as attendance is saved and the list is cleared.
//
// Keys (all expire after 30 days):
//   ku:door:list:<slug>     JSON { guests: [{ id, e, n }], registered, uploadedAt, by }
//   ku:door:in:<slug>       hash: guest id → JSON { at, by }   (checked in)
//   ku:door:walk:<slug>     hash: key → JSON { n, at, by }     (walk-ins)
import { createHash } from "node:crypto";
import { redis, pipeline } from "@/lib/store";
import { parseCsv, saveGuests, visitCounts, getSettings } from "@/lib/attendance";

const KEEP_SECONDS = 30 * 86400;
const listKey = (slug) => `ku:door:list:${slug}`;
const inKey = (slug) => `ku:door:in:${slug}`;
const walkKey = (slug) => `ku:door:walk:${slug}`;
export const isSlug = (s) => /^[a-z0-9-]{1,90}$/.test(String(s || ""));
const isKey = (s) => /^[A-Za-z0-9_-]{6,40}$/.test(String(s || ""));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const norm = (h) => String(h || "").trim().toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
const guestId = (email) => createHash("sha256").update(email).digest("hex").slice(0, 12);

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}
const parseAll = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, JSON.parse(v)]));

// Everyone who is going (approved), from a Luma guest list downloaded before
// the event.
export function readDoorList(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("That file has no guests in it.");
  const head = rows[0].map(norm);
  const col = (...names) => head.findIndex((h) => names.includes(h));
  const email = col("email", "email_address", "user_email");
  const name = col("name", "full_name", "user_name");
  const first = col("first_name");
  const last = col("last_name");
  const approval = col("approval_status", "status");
  if (email < 0) throw new Error("This doesn’t look like a Luma guest list: there’s no email column.");
  const seen = new Map();
  for (const r of rows.slice(1)) {
    const e = String(r[email] || "").trim().toLowerCase();
    if (!EMAIL.test(e)) continue;
    const status = approval >= 0 ? String(r[approval] || "").trim().toLowerCase() : "approved";
    if (status && !["approved", "going", "checked_in", "invited"].includes(status)) continue; // declined, waitlist, pending
    const full =
      (name >= 0 && String(r[name] || "").trim()) || [first >= 0 ? r[first] : "", last >= 0 ? r[last] : ""].join(" ").trim() || e.split("@")[0];
    seen.set(e, { id: guestId(e), e, n: full.replace(/\s+/g, " ").slice(0, 80) });
  }
  const guests = [...seen.values()].sort((a, b) => a.n.localeCompare(b.n));
  if (!guests.length) throw new Error("No one in this file is going. Download the guest list from Luma again.");
  return guests;
}

export async function saveDoorList(slug, text, by) {
  if (!isSlug(slug)) throw new Error("Please choose the debate.");
  const guests = readDoorList(text);
  await redis("SET", listKey(slug), JSON.stringify({ guests, registered: guests.length, uploadedAt: Date.now(), by }), "EX", KEEP_SECONDS);
  return guests.length;
}

// Everything a door phone needs: the list, who's checked in, walk-ins, and how
// many past debates each guest has come to (to flag regulars).
export async function getDoor(slug) {
  if (!isSlug(slug)) return null;
  const [listRaw, ins, walks] = await pipeline([
    ["GET", listKey(slug)],
    ["HGETALL", inKey(slug)],
    ["HGETALL", walkKey(slug)],
  ]);
  const list = listRaw ? JSON.parse(listRaw) : null;
  const counts = list ? await visitCounts(slug) : new Map();
  const { threshold } = await getSettings();
  return {
    guests: list ? list.guests.map((g) => ({ ...g, visits: counts.get(g.e) || 0 })) : [],
    hasList: Boolean(list),
    uploadedAt: list?.uploadedAt || null,
    checkedIn: parseAll(toMap(ins)),
    walkIns: parseAll(toMap(walks)),
    regularFrom: threshold,
  };
}

// Just who's checked in, for phones keeping up with each other.
export async function getDoorState(slug) {
  if (!isSlug(slug)) return null;
  const [ins, walks] = await pipeline([["HGETALL", inKey(slug)], ["HGETALL", walkKey(slug)]]);
  return { checkedIn: parseAll(toMap(ins)), walkIns: parseAll(toMap(walks)) };
}

// Applies check-ins sent from a phone. Each action is safe to send twice.
//   { type: "in", id, at }   { type: "out", id }   { type: "walkin", key, n, at }   { type: "walkout", key }
export async function applyActions(slug, actions, by) {
  if (!isSlug(slug)) throw new Error("Please choose the debate.");
  const listRaw = await redis("GET", listKey(slug));
  const ids = new Set(listRaw ? JSON.parse(listRaw).guests.map((g) => g.id) : []);
  const now = Date.now();
  // A phone's clock may be off; keep times within the last two days.
  const when = (at) => (Number(at) > now - 2 * 86400000 && Number(at) <= now + 60000 ? Number(at) : now);
  const commands = [];
  for (const a of (Array.isArray(actions) ? actions : []).slice(0, 500)) {
    if (a?.type === "in" && ids.has(a.id)) commands.push(["HSETNX", inKey(slug), a.id, JSON.stringify({ at: when(a.at), by })]);
    else if (a?.type === "out" && ids.has(a.id)) commands.push(["HDEL", inKey(slug), a.id]);
    else if (a?.type === "walkin" && isKey(a.key))
      commands.push(["HSETNX", walkKey(slug), a.key, JSON.stringify({ n: String(a.n || "").replace(/\s+/g, " ").trim().slice(0, 80), at: when(a.at), by })]);
    else if (a?.type === "walkout" && isKey(a.key)) commands.push(["HDEL", walkKey(slug), a.key]);
  }
  if (commands.length) {
    commands.push(["EXPIRE", inKey(slug), KEEP_SECONDS], ["EXPIRE", walkKey(slug), KEEP_SECONDS]);
    await pipeline(commands);
  }
  return commands.length;
}

// Files everyone who came under admin → Attendance.
export async function finishDoor(event, by) {
  const door = await getDoor(event.slug);
  if (!door) throw new Error("Please choose the debate.");
  const byId = new Map(door.guests.map((g) => [g.id, g]));
  const guests = Object.keys(door.checkedIn).map((id) => byId.get(id)).filter(Boolean).map(({ e, n }) => ({ e, n }));
  const walkIns = Object.keys(door.walkIns).length;
  if (!guests.length && !walkIns) throw new Error("No one has been checked in yet.");
  return saveGuests(event, { guests, registered: door.guests.length, walkIns, by, source: "door" });
}

export async function clearDoor(slug) {
  if (!isSlug(slug)) return;
  await pipeline([["DEL", listKey(slug)], ["DEL", inKey(slug)], ["DEL", walkKey(slug)]]);
}

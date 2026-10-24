// The committee calendar (admin → Committee → Committee calendar): meetings,
// room bookings, deadlines and socials for the committee, shown alongside
// every task deadline and every debate on the term card. It's separate from
// admin → Calendar, which is the public term card.
//
// Anyone with a committee login can add things; the person who added
// something (or the Executive) can change or delete it. People invited are
// notified. Everyone gets a private link to subscribe from their phone's
// calendar (it shows the committee calendar, debates and their own tasks).
//
// Keys:
//   ku:ccal                      hash: id → JSON item
//   ku:ccal-token:<token>        admin id the private calendar link belongs to
//   ku:ccal-token-of:<admin id>  their current token
import { randomBytes } from "node:crypto";
import { redis } from "@/lib/store";
import { DEPARTMENTS } from "@/lib/dashboard";

const KEY = "ku:ccal";
const MAX_ITEMS = 3000;

export const KINDS = {
  meeting: "Meeting",
  booking: "Room or kit booking",
  deadline: "Deadline",
  social: "Social",
  other: "Other",
};

const oneLine = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const clean = (v, max) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const isItemId = (s) => /^[a-f0-9]{12}$/.test(String(s || ""));
export const isExec = (admin) => Boolean(admin?.teams?.some((t) => t === "executive" || t === "super"));

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

export async function listItems() {
  const out = [];
  for (const json of Object.values(toMap(await redis("HGETALL", KEY)))) {
    try {
      out.push(JSON.parse(json));
    } catch {
      // skip a damaged record
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time)));
}

export async function findItem(id) {
  if (!isItemId(id)) return null;
  const json = await redis("HGET", KEY, id);
  return json ? JSON.parse(json) : null;
}

export const canChange = (admin, item) => isExec(admin) || item.createdById === admin.id;

function checked(input) {
  const title = oneLine(input.title, 160);
  if (!title) throw new Error("Give it a title.");
  const date = String(input.date || "");
  if (!isDate(date)) throw new Error("Choose a date.");
  const time = String(input.time || "");
  if (time && !isTime(time)) throw new Error("That start time isn’t valid.");
  const endTime = time ? String(input.endTime || "") : "";
  if (endTime && (!isTime(endTime) || endTime <= time)) throw new Error("The end time must be after the start time.");
  return {
    title,
    kind: KINDS[input.kind] ? input.kind : "meeting",
    date,
    time,
    endTime,
    location: oneLine(input.location, 160),
    notes: clean(input.notes, 2000),
    depts: [...new Set((Array.isArray(input.depts) ? input.depts : []).filter((d) => DEPARTMENTS.includes(d)))],
    attendees: [...new Set((Array.isArray(input.attendees) ? input.attendees : []).map((n) => oneLine(n, 80)).filter(Boolean))].slice(0, 60),
  };
}

export async function saveItem(input, admin) {
  const fields = checked(input || {});
  const now = Date.now();
  if (input?.id) {
    const current = await findItem(input.id);
    if (!current) throw new Error("That has been deleted. Refresh the page.");
    if (!canChange(admin, current)) throw new Error("Only the person who added this, or the Executive, can change it.");
    const next = { ...current, ...fields, updatedAt: now, updatedBy: admin.name };
    await redis("HSET", KEY, current.id, JSON.stringify(next));
    return { before: current, item: next };
  }
  if (Number(await redis("HLEN", KEY)) >= MAX_ITEMS) throw new Error("The calendar is full. Delete some old entries first.");
  const item = { id: randomBytes(6).toString("hex"), ...fields, createdAt: now, createdBy: admin.name, createdById: admin.id, updatedAt: now, updatedBy: admin.name };
  await redis("HSET", KEY, item.id, JSON.stringify(item));
  return { before: null, item };
}

export async function deleteItem(id, admin) {
  const current = await findItem(id);
  if (!current) return null;
  if (!canChange(admin, current)) throw new Error("Only the person who added this, or the Executive, can delete it.");
  await redis("HDEL", KEY, id);
  return current;
}

// ---------- Private subscribe links ----------

export async function feedToken(adminId, { reset = false } = {}) {
  const current = await redis("GET", `ku:ccal-token-of:${adminId}`);
  if (current && !reset) return current;
  if (current) await redis("DEL", `ku:ccal-token:${current}`);
  const token = randomBytes(18).toString("hex");
  await redis("SET", `ku:ccal-token:${token}`, adminId);
  await redis("SET", `ku:ccal-token-of:${adminId}`, token);
  return token;
}

export async function adminForToken(token) {
  if (!/^[a-f0-9]{36}$/.test(String(token || ""))) return null;
  const id = await redis("GET", `ku:ccal-token:${token}`);
  if (!id) return null;
  const raw = await redis("HGET", "ku:admins", id);
  if (!raw) return null;
  const person = JSON.parse(raw);
  return person.disabled ? null : person;
}

// ---------- Everything shown on the calendar ----------

const when = (date, time) => `${new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}${time ? `, ${time}` : ""}`;
export { when as describeWhen };

// Calendar entries, task deadlines and term card events as one list of
// { key, source, title, date, time, endTime, kind, ... }.
export function combine({ items, tasks, events }) {
  const out = [];
  for (const i of items) out.push({ key: `c-${i.id}`, source: "committee", ...i });
  for (const t of tasks) {
    if (!t.deadline || t.status === "complete") continue;
    out.push({
      key: `t-${t.id}`, source: "task", id: t.id, title: `${t.id}: ${t.title}`, kind: "task", date: t.deadline, time: t.time || "", endTime: "",
      depts: [t.dept], owner: t.owner, supervisor: t.supervisor, status: t.status,
    });
  }
  for (const e of events) {
    out.push({
      key: `e-${e.slug}`, source: "event", id: e.slug, title: e.type === "Debate" ? `Debate: ${e.title}` : e.title, kind: "event",
      date: e.date, time: e.time || "", endTime: e.endTime || "", location: e.venue || "", depts: [],
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || String(a.time || "00:00").localeCompare(String(b.time || "00:00")));
}

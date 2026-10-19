// Motion suggestions and speaker applications, kept in the voting database and
// managed from the admin site.
//
// Keys:
//   ku:motions                 hash id -> motion (JSON)
//   ku:motion-upvotes          hash id -> number of upvotes
//   ku:motion-upvoters:<id>    set of visitor ids who upvoted (one each)
//   ku:applications            hash id -> speaker application (JSON)
//   ku:limit:<kind>:<ip>       submissions from one address this hour
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { redis, pipeline, storeConfigured } from "@/lib/store";
import { UNION_EMAIL } from "@/lib/contact";

const MAX_STORED = 2000;
const PER_HOUR = 6;

const k = {
  motions: "ku:motions",
  upvotes: "ku:motion-upvotes",
  upvoters: (id) => `ku:motion-upvoters:${id}`,
  applications: "ku:applications",
  limit: (kind, ip) => `ku:limit:${kind}:${ip || "unknown"}`,
};

export const clean = (v, max) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
export const oneLine = (v, max) => clean(v, max).replace(/\s+/g, " ");
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));
const newId = () => randomBytes(6).toString("hex");

export const MOTION_STATUS = { new: "New", featured: "On the website", archived: "Archived" };
export const APPLICATION_STATUS = { new: "New", shortlisted: "Shortlisted", declined: "Declined" };

export { storeConfigured };

// Slows down spam: a few submissions per address per hour.
export async function allowSubmission(kind, ip) {
  const key = k.limit(kind, ip);
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 3600);
  return n <= PER_HOUR;
}

// Emails the committee a copy if email is set up; never blocks saving.
async function notify(subject, text, replyTo) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    await nodemailer
      .createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      .sendMail({
        from: `"King’s Union website" <${process.env.SMTP_USER}>`,
        to: [UNION_EMAIL],
        replyTo,
        subject,
        text: `${text}\n\n—\nAlso saved in admin.kingsunion.org.uk`,
      });
  } catch (err) {
    console.error("Notification email failed:", err);
  }
}

async function readAll(hashKey) {
  const raw = (await redis("HVALS", hashKey)) || [];
  return raw.map((r) => JSON.parse(r)).sort((a, b) => b.createdAt - a.createdAt);
}

async function readOne(hashKey, id) {
  if (!isId(id)) return null;
  const raw = await redis("HGET", hashKey, id);
  return raw ? JSON.parse(raw) : null;
}

const write = (hashKey, item) => redis("HSET", hashKey, item.id, JSON.stringify(item));

// ---------- Motions ----------

// "This House would…" is added by the form, so it's stripped if typed.
export const motionText = (m) => `This House ${m.motion}`;

export async function addMotion(input) {
  const motion = oneLine(input.motion, 200).replace(/^this house\s*/i, "");
  if (motion.length < 3) throw new Error("missing");
  if ((await redis("HLEN", k.motions)) >= MAX_STORED) throw new Error("full");
  const email = oneLine(input.email, 200);
  const item = {
    id: newId(),
    motion,
    why: clean(input.why, 3000),
    name: oneLine(input.name, 120),
    email: isEmail(email) ? email : "",
    speak: Boolean(input.speak),
    status: "new",
    createdAt: Date.now(),
  };
  await write(k.motions, item);
  await notify(
    `[Motion suggestion] ${motionText(item)}`,
    [
      `Motion: ${motionText(item)}`,
      "",
      "Why it would make a good debate:",
      item.why || "—",
      "",
      `Wants to speak: ${item.speak ? "Yes" : "No"}`,
      `Name: ${item.name || "—"}`,
      `Email: ${item.email || "—"}`,
    ].join("\n"),
    item.email || undefined
  );
  return item;
}

export async function listMotions() {
  const [items, counts] = await Promise.all([readAll(k.motions), redis("HGETALL", k.upvotes)]);
  const votes = toMap(counts);
  return items.map((m) => ({ ...m, upvotes: Number(votes[m.id]) || 0 }));
}

// The motions shown on the website: only ones the committee has put there.
export async function featuredMotions() {
  return (await listMotions())
    .filter((m) => m.status === "featured")
    .sort((a, b) => b.upvotes - a.upvotes || b.createdAt - a.createdAt)
    .map(({ id, motion, upvotes }) => ({ id, motion, upvotes }));
}

// HGETALL comes back as an object (Redis) or a flat list (Upstash).
function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return reply;
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

// One upvote per visitor per motion. Returns the new count, or null if the
// motion isn't on the website.
export async function upvoteMotion(id, visitorId) {
  const m = await readOne(k.motions, id);
  if (!m || m.status !== "featured") return null;
  const added = await redis("SADD", k.upvoters(id), visitorId);
  if (added) return redis("HINCRBY", k.upvotes, id, 1);
  return Number(await redis("HGET", k.upvotes, id)) || 0;
}

export async function hasUpvoted(ids, visitorId) {
  if (!visitorId || !ids.length) return [];
  const replies = await pipeline(ids.map((id) => ["SISMEMBER", k.upvoters(id), visitorId]));
  return ids.filter((_, i) => Number(replies[i]) === 1);
}

export async function setMotionStatus(id, status) {
  if (!MOTION_STATUS[status]) throw new Error("Unknown status.");
  const m = await readOne(k.motions, id);
  if (!m) return null;
  const item = { ...m, status };
  await write(k.motions, item);
  return item;
}

export async function deleteMotion(id) {
  if (!isId(id)) return false;
  const [removed] = await pipeline([
    ["HDEL", k.motions, id],
    ["HDEL", k.upvotes, id],
    ["DEL", k.upvoters(id)],
  ]);
  return Number(removed) === 1;
}

// ---------- Speaker applications ----------

export const SIDES = { proposition: "Proposition", opposition: "Opposition", either: "Either side" };
export const MEMBER = { yes: "Yes", no: "Not yet" };

export async function addApplication(input, debates) {
  const name = oneLine(input.name, 120);
  const email = oneLine(input.email, 200);
  const course = oneLine(input.course, 160);
  const pitch = clean(input.pitch, 2000);
  if (!name || !isEmail(email) || !course || pitch.length < 20) throw new Error("missing");
  if ((await redis("HLEN", k.applications)) >= MAX_STORED) throw new Error("full");
  const debate = debates.find((d) => d.slug === input.debate);
  const item = {
    id: newId(),
    name,
    email,
    course,
    member: MEMBER[input.member] ? input.member : "no",
    debate: debate ? { slug: debate.slug, title: debate.title, date: debate.date } : null,
    side: SIDES[input.side] ? input.side : "either",
    experience: clean(input.experience, 1000),
    pitch,
    status: "new",
    createdAt: Date.now(),
  };
  await write(k.applications, item);
  await notify(
    `[Speaker application] ${name}`,
    [
      `Name: ${name}`,
      `Email: ${email}`,
      `Course and year: ${course}`,
      `Member: ${MEMBER[item.member]}`,
      `Debate: ${item.debate ? `${item.debate.title} (${item.debate.date})` : "Any debate"}`,
      `Side: ${SIDES[item.side]}`,
      "",
      "Speaking experience:",
      item.experience || "—",
      "",
      "Their pitch:",
      pitch,
    ].join("\n"),
    email
  );
  return item;
}

export const listApplications = () => readAll(k.applications);

export async function setApplicationStatus(id, status) {
  if (!APPLICATION_STATUS[status]) throw new Error("Unknown status.");
  const a = await readOne(k.applications, id);
  if (!a) return null;
  const item = { ...a, status };
  await write(k.applications, item);
  return item;
}

export async function deleteApplication(id) {
  if (!isId(id)) return false;
  return Number(await redis("HDEL", k.applications, id)) === 1;
}

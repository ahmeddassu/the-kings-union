// Admin sign-in for admin.kingsunion.org.uk.
//
// Each committee member has their own login (added by the Executive under
// admin → People), and belongs to one team. Each team only sees its own
// sections (TEAMS below). The old shared committee password still works and
// signs in as the Executive until the Executive switches it off under People.
//
// Passwords are never stored: only a salted scrypt fingerprint, which is slow
// to guess. The shared password's fingerprint is below. To change it, run this
// (with your new password) and replace SALT and HASH:
//   node -e "const c=require('crypto'),s=c.randomBytes(16).toString('hex');console.log(s, c.scryptSync('NEW-PASSWORD',s,32,{N:32768,r:8,p:1,maxmem:67108864}).toString('hex'))"
// Changing it signs every admin out.
import { scryptSync, timingSafeEqual, createHmac, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redis, storeConfigured } from "@/lib/store";

const SALT = "fdb80112cb0c051192c86b6253e34f61";
const HASH = "cc697fe1ffd2d3831ab4322c7a25467bbe2de37a7f9de47470296290e7e6d1f4";
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const ADMIN_COOKIE = "ku_admin";
const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 10; // per 15 minutes, per network address

// ---------- Teams and what they can see ----------

// Admin sections, with where they live.
export const SECTIONS = {
  debates: { label: "Debates", path: "" },
  results: { label: "Result cards", path: "/results" },
  calendar: { label: "Calendar", path: "/calendar" },
  motions: { label: "Motions", path: "/motions" },
  messages: { label: "Messages", path: "/messages" },        // messages to the Union
  kingsway: { label: "Messages", path: "/messages" },        // Kingsway writer applications
  alerts: { label: "Ticket alerts", path: "/alerts" },
  applications: { label: "Speaker applications", path: "/applications" },
  speakers: { label: "Speaker pack", path: "/speaker-pack" },
  guests: { label: "Past speakers", path: "/past-speakers" },
  attendance: { label: "Attendance", path: "/attendance" },
  feedback: { label: "Feedback", path: "/feedback" },
  friends: { label: "Friends of the Union", path: "/friends" },
  posters: { label: "Poster QR codes", path: "/posters" },
  sponsors: { label: "Sponsors", path: "/sponsors" },
  stats: { label: "Visitor stats", path: "/stats" },
  backups: { label: "Backups", path: "/backups" },
  status: { label: "Status", path: "/status" },
  people: { label: "People", path: "/people" },
  activity: { label: "Activity", path: "/activity" },
};

export const TEAMS = {
  // Above the Executive: everything, plus the Activity log (who did what).
  // Only set in the code or Vercel (see isSuperEmail), never from inside admin.
  super: { label: "Super admin", can: Object.keys(SECTIONS) },
  executive: { label: "Executive", can: Object.keys(SECTIONS).filter((s) => s !== "activity") },
  events: { label: "Events and Programming", can: ["debates", "results", "calendar", "motions", "applications", "speakers", "guests", "attendance", "feedback", "posters", "messages"] },
  kingsway: { label: "Kingsway", can: ["kingsway", "calendar", "stats"] },
  finance: { label: "Finance", can: ["sponsors", "friends", "messages", "stats"] },
  growth: { label: "Growth and Marketing", can: ["results", "alerts", "feedback", "friends", "posters", "stats", "calendar"] },
};

// ---------- Passwords ----------

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(String(password || ""), salt, 32, SCRYPT).toString("hex") };
}

export function checkPassword(password, salt, hash) {
  const attempt = scryptSync(String(password || ""), salt, 32, SCRYPT);
  return timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}

// The shared committee password.
export function passwordMatches(password) {
  return checkPassword(password, SALT, HASH);
}

// ---------- Sessions ----------

// Sessions are signed with a server-only secret (the database token, which is
// never in the code), so they can't be forged.
function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    ""
  );
}

function sign(value) {
  return createHmac("sha256", secret()).update(`${value}.${HASH}`).digest("hex");
}

// A session for the shared password ("<expires>.<sig>") or for one person
// ("u.<id>.<version>.<expires>.<sig>"; the version changes when their password
// is reset or they're removed, which signs them out everywhere).
export function newSession(user = null) {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const body = user ? `u.${user.id}.${user.sv || 0}.${expires}` : `${expires}`;
  return { value: `${body}.${sign(body)}`, maxAge: SESSION_HOURS * 3600 };
}

export const sessionCookie = (session) =>
  `${ADMIN_COOKIE}=${session.value}; Path=/; Max-Age=${session.maxAge}; HttpOnly; Secure; SameSite=Strict`;

function readToken(token) {
  if (!secret() || typeof token !== "string") return null;
  const parts = token.split(".");
  const sig = parts.pop();
  const body = parts.join(".");
  if (!/^[a-f0-9]{64}$/.test(sig || "")) return null;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(sign(body), "hex"))) return null;
  if (parts.length === 1 && /^\d+$/.test(parts[0])) {
    return Number(parts[0]) < Date.now() ? null : { shared: true };
  }
  if (parts.length === 4 && parts[0] === "u" && /^[a-f0-9]{12}$/.test(parts[1]) && /^\d+$/.test(parts[2]) && /^\d+$/.test(parts[3])) {
    return Number(parts[3]) < Date.now() ? null : { id: parts[1], sv: Number(parts[2]) };
  }
  return null;
}

// Super admins are the people whose login email is listed here, or in the
// Vercel setting SUPER_ADMIN_EMAILS (comma-separated), which replaces this list
// when it's set. Neither can be changed from inside admin.
const DEFAULT_SUPER_ADMINS = "guy.de_basto@kcl.ac.uk, dassuahmed@gmail.com";

export function isSuperEmail(email) {
  const list = String(process.env.SUPER_ADMIN_EMAILS || DEFAULT_SUPER_ADMINS)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && list.includes(String(email).toLowerCase());
}

// The team someone actually has (a super admin email outranks their stored team).
export const effectiveTeam = (person) => (isSuperEmail(person.email) ? "super" : TEAMS[person.team] ? person.team : "events");

export const SHARED = { id: "shared", name: "Shared committee login", email: "", team: "executive" };

// Whether the old shared password may still be used (switched off under People).
export async function sharedAllowed() {
  if (!storeConfigured) return true;
  return (await redis("HGET", "ku:admin-settings", "shared")) !== "off";
}

// Who is signed in: { id, name, team, teamLabel, can(section) } or null.
export const getAdmin = cache(async () => {
  const tok = readToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!tok) return null;
  let user;
  if (tok.shared) {
    if (!(await sharedAllowed())) return null;
    user = SHARED;
  } else {
    const raw = await redis("HGET", "ku:admins", tok.id);
    if (!raw) return null;
    user = JSON.parse(raw);
    if (user.disabled || (user.sv || 0) !== tok.sv || !user.hash) return null;
  }
  const team = user.id === "shared" ? "executive" : effectiveTeam(user);
  const allowed = new Set(TEAMS[team].can);
  return { id: user.id, name: user.name, email: user.email, team, teamLabel: TEAMS[team].label, shared: user.id === "shared", sections: [...allowed], can: (s) => allowed.has(s) };
});

export async function isAdmin() {
  return Boolean(await getAdmin());
}

// For API routes: the signed-in admin if they may use `section` (or any of
// several), otherwise null.
export async function can(...sections) {
  const admin = await getAdmin();
  if (!admin) return null;
  return sections.some((s) => admin.can(s)) ? admin : null;
}

// The right refusal for an API route.
export async function refuse() {
  return (await getAdmin())
    ? Response.json({ error: "Your team doesn’t have access to this." }, { status: 403 })
    : Response.json({ error: "Please sign in again." }, { status: 401 });
}

// ---------- Brute-force protection ----------

// Slows down password guessing. Returns true if this address may try again.
export async function allowLoginAttempt(ip) {
  if (!storeConfigured) return true;
  const key = `ku:login:${ip || "unknown"}`;
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 900);
  return n <= MAX_ATTEMPTS;
}

export async function clearLoginAttempts(ip) {
  if (storeConfigured) await redis("DEL", `ku:login:${ip || "unknown"}`);
}

export function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
